import { prisma } from "@/shared/database/prisma";
import { RazorpayProvider } from "../providers/razorpay.provider";
import { CommissionService } from "./commission.service";
import { createMoney, Money } from "@/shared/types/money";
import { ConflictError, NotFoundError, ForbiddenError, ValidationError } from "@/shared/errors";
import { PaymentStatus, AppointmentStatus, SettlementStatus, UserRole } from "@prisma/client";
import { AuditService } from "@/modules/audit/audit.service";
import { SessionWithUser } from "@/modules/identity/session.service";
import crypto from "crypto";

export const SETTLEMENT_HOLD_DAYS = 7;

export class PaymentService {
  private static provider = new RazorpayProvider();

  /**
   * Creates a payment intent for an appointment awaiting payment.
   */
  static async createIntentForAppointment(
    userId: string,
    appointmentId: string
  ): Promise<{
    paymentIntentId: string;
    providerRef: string;
    clientSecret?: string;
    amountMinor: string;
    currency: string;
  }> {
    const client = await prisma.clientProfile.findUnique({ where: { userId } });
    if (!client) throw new NotFoundError("Client profile not found");

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { service: true, client: true },
    });

    if (!appointment) throw new NotFoundError("Appointment not found");
    if (appointment.clientId !== client.id) {
      throw new ForbiddenError("Cannot pay for an appointment belonging to another client");
    }

    if (
      appointment.status !== AppointmentStatus.AWAITING_PAYMENT &&
      appointment.status !== AppointmentStatus.REQUESTED
    ) {
      throw new ValidationError(`Appointment cannot be paid in current status '${appointment.status}'`);
    }

    const grossAmount = createMoney(appointment.service.priceAmountMinor, appointment.service.priceCurrency);
    const idempotencyKey = `apt_pay_${appointment.id}_${Date.now()}`;

    // Call provider
    const providerIntent = await this.provider.createPaymentIntent({
      amount: grossAmount,
      currency: grossAmount.currency,
      idempotencyKey,
      customerEmail: client.userId,
      description: `Counseling session: ${appointment.service.name}`,
      metadata: { appointmentId: appointment.id, clientId: client.id },
    });

    // Save intent in database
    const paymentIntent = await prisma.paymentIntent.create({
      data: {
        provider: "RAZORPAY",
        providerRef: providerIntent.providerIntentId,
        amountMinor: grossAmount.amountMinor,
        currency: grossAmount.currency,
        status: PaymentStatus.CREATED,
        idempotencyKey,
        metadataJson: { appointmentId: appointment.id, clientId: client.id },
      },
    });

    await AuditService.log({
      actorUserId: userId,
      action: "PAYMENT_INTENT_CREATED",
      entityType: "PaymentIntent",
      entityId: paymentIntent.id,
      safeMetadata: {
        amountMinor: grossAmount.amountMinor.toString(),
        currency: grossAmount.currency,
        appointmentId: appointment.id,
      },
    });

    return {
      paymentIntentId: paymentIntent.id,
      providerRef: paymentIntent.providerRef,
      clientSecret: providerIntent.clientSecret,
      amountMinor: grossAmount.amountMinor.toString(),
      currency: grossAmount.currency,
    };
  }

  /**
   * Processes verified payment gateway webhook with strict idempotency.
   */
  static async handleWebhook(
    rawBody: string,
    signature: string
  ): Promise<{ processed: boolean; reason?: string }> {
    const isValid = await this.provider.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      throw new ForbiddenError("Invalid webhook signature verification");
    }

    const event = await this.provider.parseWebhookEvent(rawBody, signature);
    if (event.eventType !== "payment.captured" || !event.providerIntentId) {
      return { processed: false, reason: "Ignored non-capture event" };
    }

    // 1. Locate matching PaymentIntent
    const intent = await prisma.paymentIntent.findUnique({
      where: { providerRef: event.providerIntentId },
    });

    if (!intent) {
      return { processed: false, reason: "No matching payment intent found" };
    }

    // 2. Idempotency Check: if transaction already created for this intent, return early
    const existingTx = await prisma.paymentTransaction.findFirst({
      where: { paymentIntentId: intent.id },
    });

    if (existingTx) {
      return { processed: true, reason: "Already processed (idempotent)" };
    }

    const metadata = (intent.metadataJson as Record<string, string>) || {};
    const appointmentId = metadata.appointmentId;

    const appointment = appointmentId
      ? await prisma.appointment.findUnique({
          where: { id: appointmentId },
          include: { psychologist: true, counselingRequest: true },
        })
      : null;

    // 3. Calculate immutable transaction-time commission snapshot
    const commissionSnapshot = await CommissionService.calculateSnapshot(intent.amountMinor);

    // 4. Atomically commit transaction, settlement item, and confirm appointment
    const eligibleAt = new Date(Date.now() + SETTLEMENT_HOLD_DAYS * 24 * 60 * 60 * 1000);
    const providerTransactionId = `txn_${crypto.randomBytes(8).toString("hex")}`;

    await prisma.$transaction(async (tx) => {
      // Create PaymentTransaction
      const paymentTx = await tx.paymentTransaction.create({
        data: {
          paymentIntentId: intent.id,
          appointmentId: appointmentId ?? null,
          grossAmountMinor: commissionSnapshot.grossAmountMinor,
          commissionAmountMinor: commissionSnapshot.commissionAmountMinor,
          netPayableMinor: commissionSnapshot.netPayableMinor,
          currency: intent.currency,
          status: PaymentStatus.SUCCEEDED,
          providerTransactionId,
        },
      });

      // Update PaymentIntent status
      await tx.paymentIntent.update({
        where: { id: intent.id },
        data: { status: PaymentStatus.SUCCEEDED },
      });

      // If appointment exists, create SettlementItem and confirm appointment
      if (appointment) {
        await tx.settlementItem.create({
          data: {
            transactionId: paymentTx.id,
            psychologistProfileId: appointment.psychologistId,
            appointmentId: appointment.id,
            grossAmountMinor: commissionSnapshot.grossAmountMinor,
            commissionAmountMinor: commissionSnapshot.commissionAmountMinor,
            netPayableMinor: commissionSnapshot.netPayableMinor,
            currency: intent.currency,
            status: SettlementStatus.PENDING_SETTLEMENT,
            eligibleAt,
          },
        });

        // Advance Appointment to CONFIRMED
        await tx.appointment.update({
          where: { id: appointment.id },
          data: { status: AppointmentStatus.CONFIRMED },
        });

        await tx.appointmentStatusHistory.create({
          data: {
            appointmentId: appointment.id,
            oldStatus: appointment.status,
            newStatus: AppointmentStatus.CONFIRMED,
            reason: `Payment confirmed via gateway (${intent.currency} ${(
              Number(intent.amountMinor) / 100
            ).toFixed(2)})`,
          },
        });

        // Advance linked CounselingRequest to BOOKED
        if (appointment.counselingRequestId) {
          await tx.counselingRequest.update({
            where: { id: appointment.counselingRequestId },
            data: { status: "BOOKED" },
          });
        }
      }
    });

    await AuditService.log({
      action: "PAYMENT_CAPTURED",
      entityType: "PaymentTransaction",
      entityId: providerTransactionId,
      safeMetadata: {
        appointmentId,
        grossMinor: commissionSnapshot.grossAmountMinor.toString(),
        commissionMinor: commissionSnapshot.commissionAmountMinor.toString(),
        netMinor: commissionSnapshot.netPayableMinor.toString(),
        eligibleAt: eligibleAt.toISOString(),
      },
    });

    return { processed: true };
  }

  /**
   * Processes a refund for an existing payment transaction (Admin only).
   */
  static async refundTransaction(
    session: SessionWithUser,
    transactionId: string,
    reason: string,
    refundAmountMinor?: bigint
  ) {
    if (!session.user.roles.includes(UserRole.ADMIN)) {
      throw new ForbiddenError("Only platform administrators can issue refunds");
    }

    const tx = await prisma.paymentTransaction.findUnique({
      where: { id: transactionId },
      include: { settlementItem: true, appointment: true },
    });

    if (!tx) throw new NotFoundError("Payment transaction not found");
    if (tx.status !== PaymentStatus.SUCCEEDED) {
      throw new ValidationError(`Cannot refund transaction in '${tx.status}' status`);
    }

    const refundAmount = refundAmountMinor ?? tx.grossAmountMinor;
    if (refundAmount > tx.grossAmountMinor) {
      throw new ValidationError("Refund amount cannot exceed gross transaction amount");
    }

    const isFullRefund = refundAmount === tx.grossAmountMinor;

    // Call payment provider refund
    await this.provider.processRefund({
      providerTransactionId: tx.providerTransactionId,
      amount: createMoney(refundAmount, tx.currency),
      reason,
    });

    await prisma.$transaction(async (dbTx) => {
      // Update transaction status
      await dbTx.paymentTransaction.update({
        where: { id: tx.id },
        data: {
          status: isFullRefund ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED,
        },
      });

      // Update settlement item if present
      if (tx.settlementItem) {
        await dbTx.settlementItem.update({
          where: { id: tx.settlementItem.id },
          data: {
            status: isFullRefund ? SettlementStatus.ADJUSTED : SettlementStatus.ON_HOLD,
          },
        });
      }

      // If full refund on appointment, cancel appointment
      if (isFullRefund && tx.appointment) {
        await dbTx.appointment.update({
          where: { id: tx.appointment.id },
          data: { status: AppointmentStatus.CANCELLED },
        });

        await dbTx.appointmentStatusHistory.create({
          data: {
            appointmentId: tx.appointment.id,
            oldStatus: tx.appointment.status,
            newStatus: AppointmentStatus.CANCELLED,
            actorUserId: session.user.id,
            reason: `Full refund issued: ${reason}`,
          },
        });
      }
    });

    await AuditService.log({
      actorUserId: session.user.id,
      action: "PAYMENT_REFUNDED",
      entityType: "PaymentTransaction",
      entityId: tx.id,
      safeMetadata: {
        refundAmountMinor: refundAmount.toString(),
        isFullRefund,
        reason,
      },
    });
  }

  /**
   * Lists all transactions for Admin inspection.
   */
  static async listAdminTransactions(session: SessionWithUser, page = 1, limit = 20) {
    if (!session.user.roles.includes(UserRole.ADMIN)) {
      throw new ForbiddenError("Admin access required");
    }

    const skip = (page - 1) * limit;
    const [total, transactions] = await Promise.all([
      prisma.paymentTransaction.count(),
      prisma.paymentTransaction.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          paymentIntent: true,
          settlementItem: true,
          appointment: {
            include: {
              client: true,
              psychologist: true,
              service: true,
            },
          },
        },
      }),
    ]);

    return {
      items: transactions.map((t) => ({
        id: t.id,
        status: t.status,
        grossAmountMinor: t.grossAmountMinor.toString(),
        commissionAmountMinor: t.commissionAmountMinor.toString(),
        netPayableMinor: t.netPayableMinor.toString(),
        currency: t.currency,
        providerTransactionId: t.providerTransactionId,
        createdAt: t.createdAt.toISOString(),
        clientName: t.appointment?.client.fullName ?? "Unknown Client",
        psychologistName: t.appointment?.psychologist.fullName ?? "Unknown Psychologist",
        serviceName: t.appointment?.service.name ?? "Platform Service",
        settlementStatus: t.settlementItem?.status ?? null,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
