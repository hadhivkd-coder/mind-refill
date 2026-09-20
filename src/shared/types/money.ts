/**
 * Immutable representation of monetary values stored strictly in minor units (cents, paise, etc.)
 * Never uses floating-point arithmetic.
 */
export interface Money {
  amountMinor: bigint;
  currency: string; // 3-letter ISO code
}

export function createMoney(amountMinor: bigint | number | string, currency = "INR"): Money {
  return {
    amountMinor: BigInt(amountMinor),
    currency: currency.toUpperCase(),
  };
}

/**
 * Converts standard major currency (e.g. ₹500.50) into minor units (50050n)
 */
export function majorToMinor(amountMajor: number, currency = "INR"): Money {
  // Using integer math via string splitting to avoid floating point precision quirks
  const [whole, decimal = ""] = amountMajor.toFixed(2).split(".");
  const paddedDecimal = (decimal + "00").slice(0, 2);
  const minor = BigInt(whole) * 100n + BigInt(paddedDecimal);
  return {
    amountMinor: minor,
    currency: currency.toUpperCase(),
  };
}

/**
 * Converts minor units to a human-readable major currency string (e.g. "500.50")
 */
export function minorToMajorString(amountMinor: bigint): string {
  const isNegative = amountMinor < 0n;
  const absMinor = isNegative ? -amountMinor : amountMinor;
  const whole = absMinor / 100n;
  const fraction = absMinor % 100n;
  const fractionStr = fraction.toString().padStart(2, "0");
  return `${isNegative ? "-" : ""}${whole.toString()}.${fractionStr}`;
}

/**
 * Calculates platform commission preserving exact integer integer minor units
 * @param grossMinor Gross amount in minor units
 * @param commissionPercentage Commission percentage (e.g. 10 for 10%)
 */
export function calculateCommission(
  grossMinor: bigint,
  commissionPercentage: number
): {
  grossMinor: bigint;
  commissionMinor: bigint;
  netPayableMinor: bigint;
} {
  const percentageBasisPoints = BigInt(Math.round(commissionPercentage * 100)); // 10% = 1000 basis points
  const commissionMinor = (grossMinor * percentageBasisPoints) / 10000n;
  const netPayableMinor = grossMinor - commissionMinor;

  return {
    grossMinor,
    commissionMinor,
    netPayableMinor,
  };
}
