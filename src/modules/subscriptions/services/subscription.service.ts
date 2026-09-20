import { prisma } from "@/shared/database/prisma";
import { SubscriptionStatus, UserRole } from "@prisma/client";
import { ForbiddenError, NotFoundError, ValidationError } from "@/shared/errors";
import { SessionWithUser } from "@/modules/identity/session.service";
import { minorToMajorString } from "@/shared/types/money";
import { AuditService } from "@/modules/audit/audit.service";
import crypto from "crypto";

export interface PlanEntitlements {
  maxServices: number;
  aiPortfolioBuilder: boolean;
  featuredDirectory: boolean;
  priorityMatching: boolean;
  analyticsAccess: boolean;
}

export const DEFAULT_PLANS: Array<{
  code: string;
  name: string;
  description: string;
  priceMinor: bigint;
  currency: string;
  intervalDays: number;
  entitlements: PlanEntitlements;
}> = [
  {
    code: "starter",
    name: "Starter Practitioner",
    description: "Essential presence for solo psychologists starting clinical practice.",
    priceMinor: 0n,
    currency: "INR",
    intervalDays: 365,
    entitlements: {
      maxServices: 2,
      aiPortfolioBuilder: false,
      featuredDirectory: false,
      priorityMatching: false,
      analyticsAccess: false,
    },
  },
  {
    code: "pro",
    name: "Professional Practice",
    description: "Complete clinical suite with AI portfolio builder and advanced scheduling.",
    priceMinor: 149900n, // ₹1,499 / mo
    currency: "INR",
    intervalDays: 30,
    entitlements: {
      maxServices: 10,
      aiPortfolioBuilder: true,
      featuredDirectory: false,
      priorityMatching: true,
      analyticsAccess: true,
    },
  },
  {
    code: "elite",
    name: "Elite Clinical Practice",
    description: "Maximum platform exposure, priority intake triage matching, and featured badge.",
    priceMinor: 349900n, // ₹3,499 / mo
    currency: "INR",
    intervalDays: 30,
    entitlements: {
      maxServices: 50,
      aiPortfolioBuilder: true,
      featuredDirectory: true,
      priorityMatching: true,
      analyticsAccess: true,
    },
  },
];

export class SubscriptionService {
  /**
   * Ensures default plans exist in database (seed helper).
   */
  static async ensureDefaultPlans() {
    for (const plan of DEFAULT_PLANS) {
      const existing = await prisma.subscriptionPlan.findUnique({
        where: { code: plan.code },
      });

      if (!existing) {
        await prisma.subscriptionPlan.create({
          data: {
            code: plan.code,
            name: plan.name,
            description: plan.description,
            priceMinor: plan.priceMinor,
            currency: plan.currency,
            intervalDays: plan.intervalDays,
            entitlementsJson: plan.entitlements as any,
            isActive: true,
          },
        });
      }
    }
  }

  /**
   * Lists all active plans available for subscription.
   */
  static async listPlans() {
    await this.ensureDefaultPlans();

    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { priceMinor: "asc" },
    });

    return plans.map((p) => ({
      id: p.id,
      code: p.code,
      name: p.name,
      description: p.description,
      priceMinor: p.priceMinor.toString(),
      priceMajor: minorToMajorString(p.priceMinor),
      currency: p.currency,
      intervalDays: p.intervalDays,
      entitlements: p.entitlementsJson as unknown as PlanEntitlements,
    }));
  }

  /**
   * Retrieves active subscription for a psychologist.
   */
  static async getPsychologistSubscription(userId: string) {
    const profile = await prisma.psychologistProfile.findUnique({
      where: { userId },
    });
    if (!profile) throw new NotFoundError("Psychologist profile not found");

    // Automatically check for expired subscriptions
    await this.expirePastDueSubscriptions(profile.id);

    const subscription = await prisma.subscription.findFirst({
      where: {
        psychologistProfileId: profile.id,
        status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.CANCELLING, SubscriptionStatus.PENDING_PAYMENT] },
      },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });

    if (!subscription) {
      // Default to Starter plan if no subscription
      const starterPlan = await prisma.subscriptionPlan.findUnique({
        where: { code: "starter" },
      });

      return {
        hasActiveSubscription: false,
        subscription: null,
        effectivePlan: starterPlan
          ? {
              code: starterPlan.code,
              name: starterPlan.name,
              entitlements: starterPlan.entitlementsJson as unknown as PlanEntitlements,
            }
          : null,
      };
    }

    return {
      hasActiveSubscription: subscription.status === SubscriptionStatus.ACTIVE || subscription.status === SubscriptionStatus.CANCELLING,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        planCode: subscription.plan.code,
        planName: subscription.plan.name,
        priceMajor: minorToMajorString(subscription.plan.priceMinor),
        currency: subscription.plan.currency,
        currentPeriodStart: subscription.currentPeriodStart.toISOString(),
        currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
        cancelledAt: subscription.cancelledAt?.toISOString() ?? null,
        entitlements: subscription.plan.entitlementsJson as unknown as PlanEntitlements,
      },
      effectivePlan: {
        code: subscription.plan.code,
        name: subscription.plan.name,
        entitlements: subscription.plan.entitlementsJson as unknown as PlanEntitlements,
      },
    };
  }

  /**
   * Checks if a psychologist has a specific feature entitlement.
   */
  static async hasEntitlement(
    psychologistProfileId: string,
    featureKey: keyof PlanEntitlements
  ): Promise<boolean | number> {
    const sub = await prisma.subscription.findFirst({
      where: {
        psychologistProfileId,
        status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.CANCELLING] },
      },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });

    let entitlements: PlanEntitlements;
    if (sub) {
      entitlements = sub.plan.entitlementsJson as unknown as PlanEntitlements;
    } else {
      // Fallback starter
      const starter = await prisma.subscriptionPlan.findUnique({ where: { code: "starter" } });
      entitlements = (starter?.entitlementsJson as unknown as PlanEntitlements) ?? {
        maxServices: 2,
        aiPortfolioBuilder: false,
        featuredDirectory: false,
        priorityMatching: false,
        analyticsAccess: false,
      };
    }

    return entitlements[featureKey];
  }

  /**
   * Initiates subscription checkout for a plan.
   */
  static async subscribeToPlan(
    userId: string,
    planCode: string
  ): Promise<{
    subscriptionId: string;
    status: SubscriptionStatus;
    planName: string;
    checkoutRequired: boolean;
  }> {
    const profile = await prisma.psychologistProfile.findUnique({
      where: { userId },
    });
    if (!profile) throw new NotFoundError("Psychologist profile not found");

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { code: planCode, isActive: true },
    });
    if (!plan) throw new NotFoundError("Subscription plan not found or inactive");

    const now = new Date();
    const periodEnd = new Date(now.getTime() + plan.intervalDays * 24 * 60 * 60 * 1000);

    // If free/starter plan, activate immediately
    const isFree = plan.priceMinor === 0n;
    const initialStatus = isFree ? SubscriptionStatus.ACTIVE : SubscriptionStatus.PENDING_PAYMENT;
    const providerSubId = `sub_${crypto.randomBytes(8).toString("hex")}`;

    const subscription = await prisma.$transaction(async (tx) => {
      // Deactivate/Cancel any existing active subscriptions
      await tx.subscription.updateMany({
        where: {
          psychologistProfileId: profile.id,
          status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PENDING_PAYMENT] },
        },
        data: {
          status: SubscriptionStatus.CANCELLED,
          cancelledAt: now,
        },
      });

      return tx.subscription.create({
        data: {
          psychologistProfileId: profile.id,
          planId: plan.id,
          status: initialStatus,
          providerSubscriptionId: providerSubId,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      });
    });

    await AuditService.log({
      actorUserId: userId,
      action: "SUBSCRIPTION_INITIATED",
      entityType: "Subscription",
      entityId: subscription.id,
      safeMetadata: {
        planCode: plan.code,
        priceMinor: plan.priceMinor.toString(),
        isFree,
      },
    });

    return {
      subscriptionId: subscription.id,
      status: subscription.status,
      planName: plan.name,
      checkoutRequired: !isFree,
    };
  }

  /**
   * Activates a pending subscription (called after gateway payment confirmation).
   */
  static async activateSubscription(subscriptionId: string, providerRef?: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true },
    });

    if (!subscription) throw new NotFoundError("Subscription not found");

    const now = new Date();
    const periodEnd = new Date(now.getTime() + subscription.plan.intervalDays * 24 * 60 * 60 * 1000);

    const updated = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: SubscriptionStatus.ACTIVE,
        providerSubscriptionId: providerRef || subscription.providerSubscriptionId,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });

    await AuditService.log({
      action: "SUBSCRIPTION_ACTIVATED",
      entityType: "Subscription",
      entityId: subscriptionId,
      safeMetadata: {
        planId: subscription.planId,
        periodEnd: periodEnd.toISOString(),
      },
    });

    return updated;
  }

  /**
   * Cancels subscription renewal at period end.
   */
  static async cancelSubscription(userId: string) {
    const profile = await prisma.psychologistProfile.findUnique({
      where: { userId },
    });
    if (!profile) throw new NotFoundError("Psychologist profile not found");

    const subscription = await prisma.subscription.findFirst({
      where: {
        psychologistProfileId: profile.id,
        status: SubscriptionStatus.ACTIVE,
      },
    });

    if (!subscription) {
      throw new ValidationError("No active subscription to cancel");
    }

    const updated = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: SubscriptionStatus.CANCELLING,
        cancelledAt: new Date(),
      },
    });

    await AuditService.log({
      actorUserId: userId,
      action: "SUBSCRIPTION_CANCELLED",
      entityType: "Subscription",
      entityId: subscription.id,
    });

    return updated;
  }

  /**
   * Advances past-due subscriptions to EXPIRED.
   */
  static async expirePastDueSubscriptions(psychologistProfileId?: string) {
    const now = new Date();
    const where: any = {
      status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.CANCELLING] },
      currentPeriodEnd: { lt: now },
    };

    if (psychologistProfileId) {
      where.psychologistProfileId = psychologistProfileId;
    }

    const result = await prisma.subscription.updateMany({
      where,
      data: {
        status: SubscriptionStatus.EXPIRED,
      },
    });

    return result.count;
  }

  /**
   * Lists all subscriptions across platform for Admin.
   */
  static async listAdminSubscriptions(session: SessionWithUser) {
    if (!session.user.roles.includes(UserRole.ADMIN)) {
      throw new ForbiddenError("Admin access required");
    }

    const subscriptions = await prisma.subscription.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        plan: true,
        psychologist: {
          select: { id: true, fullName: true, professionalTitle: true },
        },
      },
    });

    return subscriptions.map((s) => ({
      id: s.id,
      status: s.status,
      planCode: s.plan.code,
      planName: s.plan.name,
      priceMajor: minorToMajorString(s.plan.priceMinor),
      currency: s.plan.currency,
      currentPeriodStart: s.currentPeriodStart.toISOString(),
      currentPeriodEnd: s.currentPeriodEnd.toISOString(),
      cancelledAt: s.cancelledAt?.toISOString() ?? null,
      psychologistName: s.psychologist.fullName,
      psychologistTitle: s.psychologist.professionalTitle,
    }));
  }
}
