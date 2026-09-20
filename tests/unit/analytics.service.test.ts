import { describe, it, expect, vi, beforeEach } from "vitest";
import { AnalyticsService } from "@/modules/analytics/services/analytics.service";
import { prisma } from "@/shared/database/prisma";
import { AppointmentStatus, SettlementStatus, UserRole } from "@prisma/client";
import { ForbiddenError, NotFoundError } from "@/shared/errors";
import { SessionWithUser } from "@/modules/identity/session.service";

vi.mock("@/shared/database/prisma", () => ({
  prisma: {
    psychologistProfile: {
      findUnique: vi.fn(),
      count: vi.fn(),
    },
    clientProfile: { count: vi.fn() },
    staffProfile: { count: vi.fn() },
    verificationApplication: { count: vi.fn() },
    appointment: {
      findMany: vi.fn(),
      groupBy: vi.fn(),
    },
    settlementItem: { findMany: vi.fn() },
    ebook: { findMany: vi.fn() },
    purchase: { count: vi.fn() },
    event: { findMany: vi.fn() },
    eventRegistration: { count: vi.fn() },
    contentItem: { count: vi.fn() },
    paymentTransaction: { findMany: vi.fn() },
    payout: { findMany: vi.fn() },
    subscription: { findMany: vi.fn() },
    counselingRequest: { groupBy: vi.fn() },
  },
}));

describe("AnalyticsService", () => {
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

  describe("getPsychologistAnalytics", () => {
    it("computes completion rate, financial ledger, and content engagement correctly", async () => {
      vi.mocked(prisma.psychologistProfile.findUnique).mockResolvedValue({ id: "psych-1", userId: "u-1" } as any);

      vi.mocked(prisma.appointment.findMany).mockResolvedValue([
        { status: AppointmentStatus.COMPLETED },
        { status: AppointmentStatus.COMPLETED },
        { status: AppointmentStatus.CANCELLED },
        { status: AppointmentStatus.CONFIRMED },
      ] as any);

      vi.mocked(prisma.settlementItem.findMany).mockResolvedValue([
        {
          grossAmountMinor: 400000n,
          commissionAmountMinor: 40000n,
          netPayableMinor: 360000n,
          status: SettlementStatus.ELIGIBLE,
        },
      ] as any);

      vi.mocked(prisma.ebook.findMany).mockResolvedValue([{ id: "eb-1" }] as any);
      vi.mocked(prisma.purchase.count).mockResolvedValue(12);
      vi.mocked(prisma.event.findMany).mockResolvedValue([{ id: "ev-1" }] as any);
      vi.mocked(prisma.eventRegistration.count).mockResolvedValue(45);
      vi.mocked(prisma.contentItem.count).mockResolvedValue(6);

      const stats = await AnalyticsService.getPsychologistAnalytics("u-1");
      expect(stats.appointments.total).toBe(4);
      expect(stats.appointments.completed).toBe(2);
      expect(stats.appointments.completionRatePercent).toBe(67); // 2 out of (2 completed + 1 cancelled) = ~67%
      expect(stats.finances.grossTotalMajor).toBe("4000.00");
      expect(stats.finances.netTotalMajor).toBe("3600.00");
      expect(stats.contentAndProducts.totalEbookPurchases).toBe(12);
      expect(stats.contentAndProducts.totalEventRegistrations).toBe(45);
    });
  });

  describe("getAdminPlatformAnalytics", () => {
    it("denies access to non-admin users", async () => {
      await expect(
        AnalyticsService.getAdminPlatformAnalytics(mockClientSession)
      ).rejects.toThrow(ForbiddenError);
    });

    it("aggregates platform-wide GMV, users, and subscription tiers for Admin", async () => {
      vi.mocked(prisma.clientProfile.count).mockResolvedValue(150);
      vi.mocked(prisma.psychologistProfile.count).mockResolvedValue(30);
      vi.mocked(prisma.staffProfile.count).mockResolvedValue(5);
      vi.mocked(prisma.verificationApplication.count).mockResolvedValue(4);

      vi.mocked(prisma.paymentTransaction.findMany).mockResolvedValue([
        { grossAmountMinor: 1000000n, commissionAmountMinor: 100000n, netPayableMinor: 900000n },
      ] as any);

      vi.mocked(prisma.payout.findMany).mockResolvedValue([
        { totalAmountMinor: 500000n },
      ] as any);

      vi.mocked(prisma.subscription.findMany).mockResolvedValue([
        { plan: { code: "pro" } },
        { plan: { code: "pro" } },
        { plan: { code: "elite" } },
      ] as any);

      vi.mocked(prisma.counselingRequest.groupBy).mockResolvedValue([
        { status: "NEW", _count: { id: 10 } },
        { status: "BOOKED", _count: { id: 25 } },
      ] as any);

      vi.mocked(prisma.appointment.groupBy).mockResolvedValue([
        { status: AppointmentStatus.COMPLETED, _count: { id: 50 } },
      ] as any);

      const analytics = await AnalyticsService.getAdminPlatformAnalytics(mockAdminSession);
      expect(analytics.users.totalClients).toBe(150);
      expect(analytics.finances.gmvMajor).toBe("10000.00");
      expect(analytics.finances.platformCommissionMajor).toBe("1000.00");
      expect(analytics.subscriptions.totalActive).toBe(3);
      expect(analytics.subscriptions.byPlan["pro"]).toBe(2);
      expect(analytics.subscriptions.byPlan["elite"]).toBe(1);
    });
  });
});
