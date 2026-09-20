import { describe, it, expect, vi, beforeEach } from "vitest";
import { PaymentService } from "@/modules/billing/services/payment.service";
import { prisma } from "@/shared/database/prisma";
import { AppointmentStatus, PaymentStatus, UserRole } from "@prisma/client";
import { ForbiddenError, NotFoundError, ValidationError } from "@/shared/errors";
import { SessionWithUser } from "@/modules/identity/session.service";

vi.mock("@/shared/database/prisma", () => ({
  prisma: {
    clientProfile: { findUnique: vi.fn() },
    appointment: { findUnique: vi.fn(), update: vi.fn() },
    paymentIntent: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
    paymentTransaction: { findFirst: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), count: vi.fn(), findMany: vi.fn() },
    settlementItem: { create: vi.fn(), update: vi.fn() },
    appointmentStatusHistory: { create: vi.fn() },
    counselingRequest: { update: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/modules/audit/audit.service", () => ({
  AuditService: {
    log: vi.fn().mockResolvedValue({ id: "audit-123" }),
  },
}));

describe("PaymentService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockAdminSession: SessionWithUser = {
    sessionId: "a0000000-0000-0000-0000-000000000001",
    user: {
      id: "a0000000-0000-0000-0000-000000000002",
      email: "admin@mindflow.test",
      isEmailVerified: true,
      isActive: true,
      roles: [UserRole.ADMIN],
    },
    expiresAt: new Date(Date.now() + 86400000),
  };

  const mockClientSession: SessionWithUser = {
    sessionId: "a0000000-0000-0000-0000-000000000003",
    user: {
      id: "a0000000-0000-0000-0000-000000000004",
      email: "client@mindflow.test",
      isEmailVerified: true,
      isActive: true,
      roles: [UserRole.CLIENT],
    },
    expiresAt: new Date(Date.now() + 86400000),
  };

  describe("createIntentForAppointment", () => {
    it("throws NotFoundError if client profile does not exist", async () => {
      vi.mocked(prisma.clientProfile.findUnique).mockResolvedValue(null);

      await expect(
        PaymentService.createIntentForAppointment(mockClientSession.user.id, "apt-1")
      ).rejects.toThrow(NotFoundError);
    });

    it("throws ForbiddenError if appointment belongs to another client", async () => {
      vi.mocked(prisma.clientProfile.findUnique).mockResolvedValue({
        id: "client-1",
        userId: mockClientSession.user.id,
      } as any);

      vi.mocked(prisma.appointment.findUnique).mockResolvedValue({
        id: "apt-1",
        clientId: "other-client",
        status: AppointmentStatus.AWAITING_PAYMENT,
        service: { priceAmountMinor: 150000n, priceCurrency: "INR", name: "Therapy" },
      } as any);

      await expect(
        PaymentService.createIntentForAppointment(mockClientSession.user.id, "apt-1")
      ).rejects.toThrow(ForbiddenError);
    });

    it("creates payment intent for valid appointment awaiting payment", async () => {
      vi.mocked(prisma.clientProfile.findUnique).mockResolvedValue({
        id: "client-1",
        userId: mockClientSession.user.id,
      } as any);

      vi.mocked(prisma.appointment.findUnique).mockResolvedValue({
        id: "apt-1",
        clientId: "client-1",
        status: AppointmentStatus.AWAITING_PAYMENT,
        service: { priceAmountMinor: 200000n, priceCurrency: "INR", name: "Therapy Session" },
      } as any);

      vi.mocked(prisma.paymentIntent.create).mockResolvedValue({
        id: "intent-1",
        providerRef: "order_mock123",
        amountMinor: 200000n,
        currency: "INR",
        status: PaymentStatus.CREATED,
      } as any);

      const intent = await PaymentService.createIntentForAppointment(mockClientSession.user.id, "apt-1");

      expect(intent).toBeDefined();
      expect(intent.paymentIntentId).toBe("intent-1");
      expect(intent.amountMinor).toBe("200000");
      expect(intent.currency).toBe("INR");
    });
  });

  describe("handleWebhook", () => {
    it("rejects invalid webhook signatures", async () => {
      await expect(
        PaymentService.handleWebhook("invalid-body", "bad-sig")
      ).rejects.toThrow(ForbiddenError);
    });

    it("ignores non-capture webhook events gracefully", async () => {
      const payload = JSON.stringify({ event: "payment.failed" });
      const crypto = await import("crypto");
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "mock_webhook_secret_key";
      const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex");

      const result = await PaymentService.handleWebhook(payload, sig);
      expect(result.processed).toBe(false);
      expect(result.reason).toContain("Ignored non-capture event");
    });

    it("handles idempotency: returns processed if transaction already exists", async () => {
      const payload = JSON.stringify({
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: "pay_123",
              order_id: "order_mock123",
              amount: 200000,
              currency: "INR",
              status: "captured",
            },
          },
        },
      });
      const crypto = await import("crypto");
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "mock_webhook_secret_key";
      const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex");

      vi.mocked(prisma.paymentIntent.findUnique).mockResolvedValue({
        id: "intent-1",
        providerRef: "order_mock123",
        amountMinor: 200000n,
        currency: "INR",
        metadataJson: {},
      } as any);

      vi.mocked(prisma.paymentTransaction.findFirst).mockResolvedValue({
        id: "tx-already-done",
      } as any);

      const result = await PaymentService.handleWebhook(payload, sig);
      expect(result.processed).toBe(true);
      expect(result.reason).toContain("Already processed");
    });
  });

  describe("refundTransaction", () => {
    it("denies non-admin refund requests", async () => {
      await expect(
        PaymentService.refundTransaction(mockClientSession, "tx-1", "Client request")
      ).rejects.toThrow(ForbiddenError);
    });

    it("validates that refund amount does not exceed gross amount", async () => {
      vi.mocked(prisma.paymentTransaction.findUnique).mockResolvedValue({
        id: "tx-1",
        grossAmountMinor: 100000n,
        status: PaymentStatus.SUCCEEDED,
        currency: "INR",
        providerTransactionId: "txn_123",
      } as any);

      await expect(
        PaymentService.refundTransaction(mockAdminSession, "tx-1", "Test", 150000n)
      ).rejects.toThrow(ValidationError);
    });
  });
});
