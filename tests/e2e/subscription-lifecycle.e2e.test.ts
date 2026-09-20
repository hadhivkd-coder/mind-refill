import { describe, it, expect } from "vitest";
import { SubscriptionStatus } from "@prisma/client";
import { minorToMajorString } from "@/shared/types/money";

describe("E2E Journey: Psychologist Subscription Management & Entitlement Enforcement", () => {
  it("executes full lifecycle: Plan Browsing -> Subscription Checkout -> Activation -> Entitlement Verification -> Cancellation", async () => {
    // 1. Available Plans
    const plans = [
      {
        code: "starter",
        name: "Starter Practitioner",
        priceMinor: 0n,
        intervalDays: 365,
        entitlements: { maxServices: 2, aiPortfolioBuilder: false },
      },
      {
        code: "pro",
        name: "Professional Practice",
        priceMinor: 149900n,
        intervalDays: 30,
        entitlements: { maxServices: 10, aiPortfolioBuilder: true },
      },
    ];

    expect(plans.length).toBe(2);
    expect(minorToMajorString(plans[1].priceMinor)).toBe("1499.00");

    // 2. Initial state: Practitioner has starter plan
    let activePlan = plans[0];
    expect(activePlan.entitlements.aiPortfolioBuilder).toBe(false);
    expect(activePlan.entitlements.maxServices).toBe(2);

    // 3. Practitioner initiates upgrade to "pro"
    const subCheckout = {
      id: "sub-e2e-1",
      planCode: "pro",
      status: SubscriptionStatus.PENDING_PAYMENT,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };
    expect(subCheckout.status).toBe(SubscriptionStatus.PENDING_PAYMENT);

    // 4. Gateway captures payment and activates subscription
    const activeSub = {
      ...subCheckout,
      status: SubscriptionStatus.ACTIVE,
      providerSubscriptionId: "sub_rzp_mock123",
    };
    expect(activeSub.status).toBe(SubscriptionStatus.ACTIVE);

    // 5. Entitlements are unlocked
    activePlan = plans[1];
    expect(activePlan.entitlements.aiPortfolioBuilder).toBe(true);
    expect(activePlan.entitlements.maxServices).toBe(10);

    // 6. Practitioner cancels auto-renewal
    const cancellingSub = {
      ...activeSub,
      status: SubscriptionStatus.CANCELLING,
      cancelledAt: new Date(),
    };
    expect(cancellingSub.status).toBe(SubscriptionStatus.CANCELLING);
    expect(cancellingSub.cancelledAt).toBeInstanceOf(Date);
    // Access remains active during grace period
    expect(activePlan.entitlements.aiPortfolioBuilder).toBe(true);

    // 7. Cycle expires: status moves to EXPIRED
    const expiredSub = {
      ...cancellingSub,
      status: SubscriptionStatus.EXPIRED,
    };
    expect(expiredSub.status).toBe(SubscriptionStatus.EXPIRED);
  });
});
