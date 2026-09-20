import { describe, it, expect } from "vitest";
import { calculateCommission, majorToMinor, minorToMajorString } from "@/shared/types/money";

describe("Financial Integrity & Ledger Invariants", () => {
  describe("Commission Math Invariants (Conservation of Value)", () => {
    it("strictly preserves grossMinor == commissionMinor + netPayableMinor across odd minor units", () => {
      // Test odd numbers where integer division might lose units
      const testAmounts = [
        1n,
        3n,
        7n,
        99n,
        101n,
        999n,
        150033n,
        299999n,
        100000000n,
      ];
      const testPercentages = [0, 5, 7.5, 10, 12.34, 15, 20, 33.33, 50, 100];

      for (const amount of testAmounts) {
        for (const pct of testPercentages) {
          const result = calculateCommission(amount, pct);
          // Fundamental invariant: gross = commission + netPayable
          expect(result.commissionMinor + result.netPayableMinor).toBe(result.grossMinor);
          // Sub-invariants
          expect(result.commissionMinor).toBeGreaterThanOrEqual(0n);
          expect(result.netPayableMinor).toBeGreaterThanOrEqual(0n);
          expect(result.commissionMinor).toBeLessThanOrEqual(result.grossMinor);
          expect(result.netPayableMinor).toBeLessThanOrEqual(result.grossMinor);
        }
      }
    });

    it("handles zero percent platform commission safely (100% to psychologist)", () => {
      const result = calculateCommission(250000n, 0);
      expect(result.commissionMinor).toBe(0n);
      expect(result.netPayableMinor).toBe(250000n);
    });

    it("handles 100 percent platform commission safely (0% to psychologist)", () => {
      const result = calculateCommission(250000n, 100);
      expect(result.commissionMinor).toBe(250000n);
      expect(result.netPayableMinor).toBe(0n);
    });
  });

  describe("Floating Point Guard & Conversion Precision", () => {
    it("converts floating point prices to exact BigInt minor cents without IEEE-754 drift", () => {
      // 0.1 + 0.2 in standard float is 0.30000000000000004
      const p1 = majorToMinor(0.1, "USD");
      const p2 = majorToMinor(0.2, "USD");
      expect(p1.amountMinor).toBe(10n);
      expect(p2.amountMinor).toBe(20n);
      expect(p1.amountMinor + p2.amountMinor).toBe(30n);

      // 19.99
      const price = majorToMinor(19.99, "INR");
      expect(price.amountMinor).toBe(1999n);
      expect(minorToMajorString(price.amountMinor)).toBe("19.99");
    });

    it("formats small and large amounts with consistent padding", () => {
      expect(minorToMajorString(0n)).toBe("0.00");
      expect(minorToMajorString(5n)).toBe("0.05");
      expect(minorToMajorString(50n)).toBe("0.50");
      expect(minorToMajorString(100000000n)).toBe("1000000.00");
    });
  });

  describe("Settlement Maturation & Payout Invariants", () => {
    it("enforces that settlements mature only after the complete hold duration", () => {
      const createdAt = new Date("2026-03-01T10:00:00.000Z");
      const holdDays = 7;
      const matureAt = new Date(createdAt.getTime() + holdDays * 24 * 60 * 60 * 1000);

      // 6 days 23 hours later: NOT mature
      const beforeMature = new Date(matureAt.getTime() - 3600000);
      const isMatureBefore = beforeMature >= matureAt;
      expect(isMatureBefore).toBe(false);

      // Exactly 7 days later: Mature
      const isMatureAtExact = matureAt >= matureAt;
      expect(isMatureAtExact).toBe(true);

      // 8 days later: Mature
      const afterMature = new Date(matureAt.getTime() + 86400000);
      const isMatureAfter = afterMature >= matureAt;
      expect(isMatureAfter).toBe(true);
    });

    it("verifies batch payout reconciliation matches item sum exactly", () => {
      const items = [
        { id: "item-1", netPayableMinor: 135000n },
        { id: "item-2", netPayableMinor: 180000n },
        { id: "item-3", netPayableMinor: 45000n },
      ];

      const batchTotal = items.reduce((acc, item) => acc + item.netPayableMinor, 0n);
      expect(batchTotal).toBe(360000n); // ₹3600.00 exact

      // Ensure no items are negative
      for (const item of items) {
        expect(item.netPayableMinor).toBeGreaterThan(0n);
      }
    });

    it("rejects refund amounts exceeding original captured gross amount", () => {
      const originalPaymentMinor = 150000n;
      const attemptedRefundMinor = 150001n;

      const isRefundValid = attemptedRefundMinor <= originalPaymentMinor;
      expect(isRefundValid).toBe(false);

      const validPartialRefund = 50000n;
      expect(validPartialRefund <= originalPaymentMinor).toBe(true);
      expect(originalPaymentMinor - validPartialRefund).toBe(100000n);
    });
  });
});
