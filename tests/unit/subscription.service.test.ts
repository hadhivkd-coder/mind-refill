import { describe, it, expect, vi, beforeEach } from "vitest";
import { SubscriptionService } from "@/modules/subscriptions/services/subscription.service";
import { prisma } from "@/shared/database/prisma";
import { SubscriptionStatus, UserRole } from "@prisma/client";
import { ForbiddenError, NotFoundError, ValidationError } from "@/shared/errors";
import { SessionWithUser } from "@/modules/identity/session.service";

vi.mock("@/shared/database/prisma", () => ({
  prisma: {
    subscriptionPlan: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
    subscription: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      create: vi.fn(),
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

describe("SubscriptionService", () => {
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

  describe("listPlans", () => {
    it("returns formatted list of active plans", async () => {
      vi.mocked(prisma.subscriptionPlan.findUnique).mockResolvedValue({ id: "plan-mock" } as any);
      vi.mocked(prisma.subscriptionPlan.findMany).mockResolvedValue([
        {
          id: "plan-1",
          code: "starter",
          name: "Starter",
          description: "Basic",
          priceMinor: 0n,
          currency: "INR",
          intervalDays: 365,
          entitlementsJson: { maxServices: 2, aiPortfolioBuilder: false },
        },
        {
          id: "plan-2",
          code: "pro",
          name: "Pro",
          description: "Full suite",
          priceMinor: 149900n,
          currency: "INR",
          intervalDays: 30,
          entitlementsJson: { maxServices: 10, aiPortfolioBuilder: true },
        },
      ] as any);

      const plans = await SubscriptionService.listPlans();
      expect(plans).toHaveLength(2);
      expect(plans[0].code).toBe("starter");
      expect(plans[0].priceMajor).toBe("0.00");
      expect(plans[1].code).toBe("pro");
      expect(plans[1].priceMajor).toBe("1499.00");
    });
  });

  describe("subscribeToPlan", () => {
    it("throws NotFoundError if psychologist profile does not exist", async () => {
      vi.mocked(prisma.psychologistProfile.findUnique).mockResolvedValue(null);

      await expect(
        SubscriptionService.subscribeToPlan("u-1", "pro")
      ).rejects.toThrow(NotFoundError);
    });

    it("throws NotFoundError if plan code does not exist", async () => {
      vi.mocked(prisma.psychologistProfile.findUnique).mockResolvedValue({ id: "p-1" } as any);
      vi.mocked(prisma.subscriptionPlan.findUnique).mockResolvedValue(null);

      await expect(
        SubscriptionService.subscribeToPlan("u-1", "nonexistent")
      ).rejects.toThrow(NotFoundError);
    });

    it("immediately activates free plans without requiring gateway checkout", async () => {
      vi.mocked(prisma.psychologistProfile.findUnique).mockResolvedValue({ id: "p-1" } as any);
      vi.mocked(prisma.subscriptionPlan.findUnique).mockResolvedValue({
        id: "plan-starter",
        code: "starter",
        name: "Starter",
        priceMinor: 0n,
        intervalDays: 365,
      } as any);

      vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => {
        const tx = {
          subscription: {
            updateMany: vi.fn(),
            create: vi.fn().mockResolvedValue({
              id: "sub-1",
              status: SubscriptionStatus.ACTIVE,
            }),
          },
        };
        return cb(tx);
      });

      const res = await SubscriptionService.subscribeToPlan("u-1", "starter");
      expect(res.subscriptionId).toBe("sub-1");
      expect(res.status).toBe(SubscriptionStatus.ACTIVE);
      expect(res.checkoutRequired).toBe(false);
    });

    it("sets status to PENDING_PAYMENT and requires checkout for paid plans", async () => {
      vi.mocked(prisma.psychologistProfile.findUnique).mockResolvedValue({ id: "p-1" } as any);
      vi.mocked(prisma.subscriptionPlan.findUnique).mockResolvedValue({
        id: "plan-pro",
        code: "pro",
        name: "Pro Practice",
        priceMinor: 149900n,
        intervalDays: 30,
      } as any);

      vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => {
        const tx = {
          subscription: {
            updateMany: vi.fn(),
            create: vi.fn().mockResolvedValue({
              id: "sub-pro-1",
              status: SubscriptionStatus.PENDING_PAYMENT,
            }),
          },
        };
        return cb(tx);
      });

      const res = await SubscriptionService.subscribeToPlan("u-1", "pro");
      expect(res.subscriptionId).toBe("sub-pro-1");
      expect(res.status).toBe(SubscriptionStatus.PENDING_PAYMENT);
      expect(res.checkoutRequired).toBe(true);
    });
  });

  describe("cancelSubscription", () => {
    it("throws ValidationError if no active subscription exists", async () => {
      vi.mocked(prisma.psychologistProfile.findUnique).mockResolvedValue({ id: "p-1" } as any);
      vi.mocked(prisma.subscription.findFirst).mockResolvedValue(null);

      await expect(
        SubscriptionService.cancelSubscription("u-1")
      ).rejects.toThrow(ValidationError);
    });

    it("transitions active subscription to CANCELLING", async () => {
      vi.mocked(prisma.psychologistProfile.findUnique).mockResolvedValue({ id: "p-1" } as any);
      vi.mocked(prisma.subscription.findFirst).mockResolvedValue({
        id: "sub-1",
        status: SubscriptionStatus.ACTIVE,
      } as any);

      vi.mocked(prisma.subscription.update).mockResolvedValue({
        id: "sub-1",
        status: SubscriptionStatus.CANCELLING,
      } as any);

      const res = await SubscriptionService.cancelSubscription("u-1");
      expect(res.status).toBe(SubscriptionStatus.CANCELLING);
    });
  });

  describe("hasEntitlement", () => {
    it("returns correct entitlement for active subscription", async () => {
      vi.mocked(prisma.subscription.findFirst).mockResolvedValue({
        id: "sub-pro",
        status: SubscriptionStatus.ACTIVE,
        plan: {
          entitlementsJson: {
            maxServices: 10,
            aiPortfolioBuilder: true,
            featuredDirectory: false,
            priorityMatching: true,
            analyticsAccess: true,
          },
        },
      } as any);

      const hasAi = await SubscriptionService.hasEntitlement("p-1", "aiPortfolioBuilder");
      expect(hasAi).toBe(true);

      const maxServices = await SubscriptionService.hasEntitlement("p-1", "maxServices");
      expect(maxServices).toBe(10);
    });

    it("falls back to starter entitlements when no active subscription exists", async () => {
      vi.mocked(prisma.subscription.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.subscriptionPlan.findUnique).mockResolvedValue({
        code: "starter",
        entitlementsJson: {
          maxServices: 2,
          aiPortfolioBuilder: false,
          featuredDirectory: false,
          priorityMatching: false,
          analyticsAccess: false,
        },
      } as any);

      const hasAi = await SubscriptionService.hasEntitlement("p-1", "aiPortfolioBuilder");
      expect(hasAi).toBe(false);

      const maxServices = await SubscriptionService.hasEntitlement("p-1", "maxServices");
      expect(maxServices).toBe(2);
    });
  });

  describe("listAdminSubscriptions", () => {
    it("denies access to non-admin users", async () => {
      await expect(
        SubscriptionService.listAdminSubscriptions(mockClientSession)
      ).rejects.toThrow(ForbiddenError);
    });

    it("returns list of subscriptions for admin", async () => {
      vi.mocked(prisma.subscription.findMany).mockResolvedValue([
        {
          id: "sub-1",
          status: SubscriptionStatus.ACTIVE,
          plan: { code: "pro", name: "Pro Practice", priceMinor: 149900n, currency: "INR" },
          psychologist: { fullName: "Dr. Sharma", professionalTitle: "Clinical Psychologist" },
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 86400000),
          cancelledAt: null,
        },
      ] as any);

      const list = await SubscriptionService.listAdminSubscriptions(mockAdminSession);
      expect(list).toHaveLength(1);
      expect(list[0].psychologistName).toBe("Dr. Sharma");
      expect(list[0].planCode).toBe("pro");
    });
  });
});
