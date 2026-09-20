import { prisma } from "@/shared/database/prisma";
import { PayoutStatus, SettlementStatus, UserRole } from "@prisma/client";
import { ForbiddenError, NotFoundError, ValidationError } from "@/shared/errors";
import { SessionWithUser } from "@/modules/identity/session.service";
import { minorToMajorString } from "@/shared/types/money";
import { AuditService } from "@/modules/audit/audit.service";

export class PayoutService {
  /**
   * Creates a draft/pending payout batch for a psychologist from their ELIGIBLE items (Admin only).
   */
  static async createPayoutBatch(session: SessionWithUser, psychologistProfileId: string) {
    if (!session.user.roles.includes(UserRole.ADMIN)) {
      throw new ForbiddenError("Only platform administrators can create payouts");
    }

    const eligibleItems = await prisma.settlementItem.findMany({
      where: {
        psychologistProfileId,
        status: SettlementStatus.ELIGIBLE,
        payoutId: null,
      },
    });

    if (eligibleItems.length === 0) {
      throw new ValidationError("No eligible settlement items available for payout");
    }

    let totalMinor = 0n;
    const currency = eligibleItems[0].currency;
    for (const item of eligibleItems) {
      totalMinor += item.netPayableMinor;
    }

    return prisma.$transaction(async (tx) => {
      const payout = await tx.payout.create({
        data: {
          psychologistProfileId,
          totalAmountMinor: totalMinor,
          currency,
          status: PayoutStatus.PENDING_APPROVAL,
        },
      });

      // Link items to payout and update status to IN_PAYOUT
      await tx.settlementItem.updateMany({
        where: {
          id: { in: eligibleItems.map((i) => i.id) },
        },
        data: {
          payoutId: payout.id,
          status: SettlementStatus.IN_PAYOUT,
        },
      });

      await AuditService.log({
        actorUserId: session.user.id,
        action: "PAYOUT_BATCH_CREATED",
        entityType: "Payout",
        entityId: payout.id,
        safeMetadata: {
          psychologistProfileId,
          totalAmountMinor: totalMinor.toString(),
          itemCount: eligibleItems.length,
        },
      });

      return payout;
    });
  }

  /**
   * Marks a payout as PAID with external bank reference (Admin only).
   */
  static async processPayout(session: SessionWithUser, payoutId: string, payoutReference: string) {
    if (!session.user.roles.includes(UserRole.ADMIN)) {
      throw new ForbiddenError("Only platform administrators can execute payouts");
    }

    if (!payoutReference || payoutReference.trim().length === 0) {
      throw new ValidationError("Payout reference number is required");
    }

    const payout = await prisma.payout.findUnique({
      where: { id: payoutId },
    });

    if (!payout) throw new NotFoundError("Payout not found");
    if (payout.status === PayoutStatus.PAID) {
      throw new ValidationError("Payout is already marked as paid");
    }

    return prisma.$transaction(async (tx) => {
      const updatedPayout = await tx.payout.update({
        where: { id: payoutId },
        data: {
          status: PayoutStatus.PAID,
          payoutReference: payoutReference.trim(),
          processedAt: new Date(),
        },
      });

      // Mark linked settlement items as PAID
      await tx.settlementItem.updateMany({
        where: { payoutId },
        data: { status: SettlementStatus.PAID },
      });

      await AuditService.log({
        actorUserId: session.user.id,
        action: "PAYOUT_PROCESSED",
        entityType: "Payout",
        entityId: payoutId,
        safeMetadata: {
          payoutReference: payoutReference.trim(),
          totalAmountMinor: payout.totalAmountMinor.toString(),
        },
      });

      return updatedPayout;
    });
  }

  /**
   * Lists payout history for a psychologist.
   */
  static async listPsychologistPayouts(userId: string) {
    const profile = await prisma.psychologistProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError("Psychologist profile not found");

    const payouts = await prisma.payout.findMany({
      where: { psychologistProfileId: profile.id },
      orderBy: { createdAt: "desc" },
    });

    return payouts.map((p) => ({
      id: p.id,
      status: p.status,
      totalAmountMinor: p.totalAmountMinor.toString(),
      totalAmountMajor: minorToMajorString(p.totalAmountMinor),
      currency: p.currency,
      payoutReference: p.payoutReference,
      processedAt: p.processedAt?.toISOString() ?? null,
      createdAt: p.createdAt.toISOString(),
    }));
  }

  /**
   * Lists all payouts across the platform for Admin.
   */
  static async listAdminPayouts(session: SessionWithUser) {
    if (!session.user.roles.includes(UserRole.ADMIN)) {
      throw new ForbiddenError("Admin access required");
    }

    const payouts = await prisma.payout.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        psychologist: {
          select: { id: true, fullName: true, professionalTitle: true },
        },
      },
    });

    return payouts.map((p) => ({
      id: p.id,
      status: p.status,
      totalAmountMinor: p.totalAmountMinor.toString(),
      totalAmountMajor: minorToMajorString(p.totalAmountMinor),
      currency: p.currency,
      payoutReference: p.payoutReference,
      processedAt: p.processedAt?.toISOString() ?? null,
      createdAt: p.createdAt.toISOString(),
      psychologistName: p.psychologist.fullName,
      psychologistTitle: p.psychologist.professionalTitle,
    }));
  }
}
