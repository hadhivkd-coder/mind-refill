import { describe, it, expect, vi, beforeEach } from "vitest";
import { SettlementService } from "@/modules/payouts/services/settlement.service";
import { prisma } from "@/shared/database/prisma";
import { SettlementStatus } from "@prisma/client";
import { NotFoundError } from "@/shared/errors";

vi.mock("@/shared/database/prisma", () => ({
  prisma: {
    settlementItem: {
      updateMany: vi.fn(),
      findMany: vi.fn(),
    },
    psychologistProfile: {
      findUnique: vi.fn(),
    },
  },
}));

describe("SettlementService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("processEligibleSettlements", () => {
    it("updates matured settlement items from PENDING_SETTLEMENT to ELIGIBLE", async () => {
      vi.mocked(prisma.settlementItem.updateMany).mockResolvedValue({ count: 5 });

      const count = await SettlementService.processEligibleSettlements();
      expect(count).toBe(5);
      expect(prisma.settlementItem.updateMany).toHaveBeenCalledWith({
        where: {
          status: SettlementStatus.PENDING_SETTLEMENT,
          eligibleAt: { lte: expect.any(Date) },
        },
        data: {
          status: SettlementStatus.ELIGIBLE,
        },
      });
    });
  });

  describe("getPsychologistEarnings", () => {
    it("throws NotFoundError if psychologist profile does not exist", async () => {
      vi.mocked(prisma.psychologistProfile.findUnique).mockResolvedValue(null);

      await expect(
        SettlementService.getPsychologistEarnings("nonexistent-user")
      ).rejects.toThrow(NotFoundError);
    });

    it("correctly aggregates gross, commission, net, pending, eligible and paid-out balances", async () => {
      vi.mocked(prisma.psychologistProfile.findUnique).mockResolvedValue({
        id: "psych-1",
        userId: "user-1",
      } as any);

      vi.mocked(prisma.settlementItem.updateMany).mockResolvedValue({ count: 0 });

      const mockItems = [
        {
          id: "item-1",
          grossAmountMinor: 200000n,
          commissionAmountMinor: 30000n,
          netPayableMinor: 170000n,
          status: SettlementStatus.PENDING_SETTLEMENT,
          currency: "INR",
          eligibleAt: new Date(),
          createdAt: new Date(),
          appointment: { client: { fullName: "Client A" }, service: { name: "Therapy" } },
        },
        {
          id: "item-2",
          grossAmountMinor: 150000n,
          commissionAmountMinor: 22500n,
          netPayableMinor: 127500n,
          status: SettlementStatus.ELIGIBLE,
          currency: "INR",
          eligibleAt: new Date(),
          createdAt: new Date(),
          appointment: { client: { fullName: "Client B" }, service: { name: "Therapy" } },
        },
        {
          id: "item-3",
          grossAmountMinor: 100000n,
          commissionAmountMinor: 15000n,
          netPayableMinor: 85000n,
          status: SettlementStatus.PAID,
          currency: "INR",
          eligibleAt: new Date(),
          createdAt: new Date(),
          appointment: { client: { fullName: "Client C" }, service: { name: "Therapy" } },
        },
      ];

      vi.mocked(prisma.settlementItem.findMany).mockResolvedValue(mockItems as any);

      const earnings = await SettlementService.getPsychologistEarnings("user-1");

      expect(earnings.summary.grossTotalMinor).toBe("450000"); // 200000 + 150000 + 100000
      expect(earnings.summary.commissionTotalMinor).toBe("67500");
      expect(earnings.summary.netTotalMinor).toBe("382500");
      expect(earnings.summary.pendingSettlementMinor).toBe("170000");
      expect(earnings.summary.eligibleForPayoutMinor).toBe("127500");
      expect(earnings.summary.paidOutMinor).toBe("85000");
      expect(earnings.transactions).toHaveLength(3);
    });
  });
});
