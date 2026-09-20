import { describe, it, expect, vi, beforeEach } from "vitest";
import { PayoutService } from "@/modules/payouts/services/payout.service";
import { prisma } from "@/shared/database/prisma";
import { PayoutStatus, SettlementStatus, UserRole } from "@prisma/client";
import { ForbiddenError, NotFoundError, ValidationError } from "@/shared/errors";
import { SessionWithUser } from "@/modules/identity/session.service";

vi.mock("@/shared/database/prisma", () => ({
  prisma: {
    settlementItem: {
      findMany: vi.fn(),
      updateMany: vi.fn(),
    },
    payout: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
    },
    psychologistProfile: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/modules/audit/audit.service", () => ({
  AuditService: {
    log: vi.fn().mockResolvedValue({ id: "audit-123" }),
  },
}));

describe("PayoutService", () => {
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

  describe("createPayoutBatch", () => {
    it("throws ForbiddenError if caller is not an admin", async () => {
      await expect(
        PayoutService.createPayoutBatch(mockClientSession, "psych-1")
      ).rejects.toThrow(ForbiddenError);
    });

    it("throws ValidationError if no eligible settlement items exist", async () => {
      vi.mocked(prisma.settlementItem.findMany).mockResolvedValue([]);

      await expect(
        PayoutService.createPayoutBatch(mockAdminSession, "psych-1")
      ).rejects.toThrow(ValidationError);
    });

    it("creates payout batch and marks eligible items as IN_PAYOUT", async () => {
      const eligibleItems = [
        { id: "item-1", netPayableMinor: 170000n, currency: "INR" },
        { id: "item-2", netPayableMinor: 127500n, currency: "INR" },
      ];

      vi.mocked(prisma.settlementItem.findMany).mockResolvedValue(eligibleItems as any);

      vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => {
        const tx = {
          payout: {
            create: vi.fn().mockResolvedValue({
              id: "payout-batch-1",
              psychologistProfileId: "psych-1",
              totalAmountMinor: 297500n,
              currency: "INR",
              status: PayoutStatus.PENDING_APPROVAL,
            }),
          },
          settlementItem: {
            updateMany: vi.fn(),
          },
        };
        return cb(tx);
      });

      const batch = await PayoutService.createPayoutBatch(mockAdminSession, "psych-1");
      expect(batch.id).toBe("payout-batch-1");
      expect(batch.totalAmountMinor).toBe(297500n);
      expect(batch.status).toBe(PayoutStatus.PENDING_APPROVAL);
    });
  });

  describe("processPayout", () => {
    it("throws ForbiddenError if caller is not an admin", async () => {
      await expect(
        PayoutService.processPayout(mockClientSession, "payout-1", "UTR-12345")
      ).rejects.toThrow(ForbiddenError);
    });

    it("throws ValidationError if reference number is missing", async () => {
      await expect(
        PayoutService.processPayout(mockAdminSession, "payout-1", "   ")
      ).rejects.toThrow(ValidationError);
    });

    it("throws NotFoundError if payout does not exist", async () => {
      vi.mocked(prisma.payout.findUnique).mockResolvedValue(null);

      await expect(
        PayoutService.processPayout(mockAdminSession, "nonexistent-payout", "UTR-12345")
      ).rejects.toThrow(NotFoundError);
    });

    it("processes payout and updates status to PAID", async () => {
      vi.mocked(prisma.payout.findUnique).mockResolvedValue({
        id: "payout-1",
        status: PayoutStatus.PENDING_APPROVAL,
        totalAmountMinor: 297500n,
      } as any);

      vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => {
        const tx = {
          payout: {
            update: vi.fn().mockResolvedValue({
              id: "payout-1",
              status: PayoutStatus.PAID,
              payoutReference: "UTR-12345",
            }),
          },
          settlementItem: {
            updateMany: vi.fn(),
          },
        };
        return cb(tx);
      });

      const processed = await PayoutService.processPayout(mockAdminSession, "payout-1", "UTR-12345");
      expect(processed.status).toBe(PayoutStatus.PAID);
      expect(processed.payoutReference).toBe("UTR-12345");
    });
  });
});
