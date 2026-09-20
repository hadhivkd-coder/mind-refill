import { describe, it, expect } from "vitest";
import {
  createMoney,
  majorToMinor,
  minorToMajorString,
  calculateCommission,
} from "@/shared/types/money";

describe("Money and Financial Precision", () => {
  it("converts major amount to minor units without floating point quirks", () => {
    const money = majorToMinor(500.5, "INR");
    expect(money.amountMinor).toBe(50050n);
    expect(money.currency).toBe("INR");

    const zeroMoney = majorToMinor(0, "INR");
    expect(zeroMoney.amountMinor).toBe(0n);
  });

  it("converts minor units back to major string representation", () => {
    expect(minorToMajorString(50050n)).toBe("500.50");
    expect(minorToMajorString(50000n)).toBe("500.00");
    expect(minorToMajorString(75n)).toBe("0.75");
    expect(minorToMajorString(-2500n)).toBe("-25.00");
  });

  it("calculates platform commission preserving exact minor unit snapshots", () => {
    // Gross: ₹1500 (150000 minor)
    // Commission: 10% -> ₹150 (15000 minor)
    // Net Payable: ₹1350 (135000 minor)
    const result = calculateCommission(150000n, 10);
    expect(result.grossMinor).toBe(150000n);
    expect(result.commissionMinor).toBe(15000n);
    expect(result.netPayableMinor).toBe(135000n);
    expect(result.commissionMinor + result.netPayableMinor).toBe(result.grossMinor);
  });

  it("handles non-integer commission percentages accurately", () => {
    // Gross: ₹1000 (100000 minor), Commission: 7.5% -> ₹75 (7500 minor)
    const result = calculateCommission(100000n, 7.5);
    expect(result.commissionMinor).toBe(7500n);
    expect(result.netPayableMinor).toBe(92500n);
  });

  it("creates custom money instances safely", () => {
    const custom = createMoney(250000n, "usd");
    expect(custom.amountMinor).toBe(250000n);
    expect(custom.currency).toBe("USD");
  });
});
