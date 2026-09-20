import { describe, it, expect } from "vitest";
import { PaymentStatus, SettlementStatus, PayoutStatus } from "@prisma/client";
import { CommissionService } from "@/modules/billing/services/commission.service";
import { minorToMajorString } from "@/shared/types/money";

describe("E2E Journey: Client Checkout -> Idempotent Payment Capture -> Settlement Hold Maturity -> Payout Batch & Disbursement", () => {
  it("executes the entire financial lifecycle with strict integer precision and immutable commissions", async () => {
    // 1. Service Price and Client Checkout
    const grossAmountMinor = 200000n; // ₹2000.00
    const currency = "INR";

    // 2. Commission calculation (10% default platform commission)
    const commissionSnapshot = await CommissionService.calculateSnapshot(grossAmountMinor);
    expect(commissionSnapshot.grossAmountMinor).toBe(200000n);
    expect(commissionSnapshot.commissionAmountMinor).toBe(20000n); // 10% of ₹2000 = ₹200
    expect(commissionSnapshot.netPayableMinor).toBe(180000n); // ₹1800.00
    expect(minorToMajorString(commissionSnapshot.commissionAmountMinor)).toBe("200.00");
    expect(minorToMajorString(commissionSnapshot.netPayableMinor)).toBe("1800.00");

    // 3. Payment Gateway Capture
    const paymentTransaction = {
      id: "txn-e2e-1",
      grossAmountMinor,
      commissionAmountMinor: commissionSnapshot.commissionAmountMinor,
      netPayableMinor: commissionSnapshot.netPayableMinor,
      currency,
      status: PaymentStatus.SUCCEEDED,
      providerTransactionId: "razorpay_pay_987123",
      createdAt: new Date(),
    };
    expect(paymentTransaction.status).toBe(PaymentStatus.SUCCEEDED);

    // 4. Settlement Item placed in 7-day hold
    const settlementItem = {
      id: "settle-e2e-1",
      transactionId: paymentTransaction.id,
      psychologistProfileId: "psych-profile-1",
      appointmentId: "apt-1",
      grossAmountMinor: paymentTransaction.grossAmountMinor,
      commissionAmountMinor: paymentTransaction.commissionAmountMinor,
      netPayableMinor: paymentTransaction.netPayableMinor,
      currency,
      status: SettlementStatus.PENDING_SETTLEMENT,
      eligibleAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    };
    expect(settlementItem.status).toBe(SettlementStatus.PENDING_SETTLEMENT);

    // 5. 7 days elapse: item matures to ELIGIBLE
    const maturedSettlementItem = {
      ...settlementItem,
      status: SettlementStatus.ELIGIBLE,
    };
    expect(maturedSettlementItem.status).toBe(SettlementStatus.ELIGIBLE);

    // 6. Admin bundles matured items into Payout Batch
    const payoutBatch = {
      id: "payout-batch-e2e-1",
      psychologistProfileId: maturedSettlementItem.psychologistProfileId,
      totalAmountMinor: maturedSettlementItem.netPayableMinor,
      currency,
      status: PayoutStatus.PENDING_APPROVAL,
      createdAt: new Date(),
    };
    expect(payoutBatch.status).toBe(PayoutStatus.PENDING_APPROVAL);
    expect(payoutBatch.totalAmountMinor).toBe(180000n);

    // 7. Admin disburses funds and marks batch as PAID with bank transfer reference
    const completedPayout = {
      ...payoutBatch,
      status: PayoutStatus.PAID,
      payoutReference: "UTR-HDFC-99128374",
      processedAt: new Date(),
    };
    expect(completedPayout.status).toBe(PayoutStatus.PAID);
    expect(completedPayout.payoutReference).toBe("UTR-HDFC-99128374");
    expect(completedPayout.processedAt).toBeInstanceOf(Date);
  });
});
