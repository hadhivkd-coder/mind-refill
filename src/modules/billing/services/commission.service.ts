import { prisma } from "@/shared/database/prisma";
import { calculateCommission } from "@/shared/types/money";

export class CommissionService {
  // Default fallback platform commission percentage: 10.0% (1000 basis points)
  public static readonly DEFAULT_COMMISSION_PERCENTAGE = 10;

  /**
   * Retrieves active platform commission percentage basis points.
   */
  static async getActiveCommissionPercentage(): Promise<number> {
    try {
      const activeRule = await prisma.commissionRule.findFirst({
        where: { isActive: true },
        orderBy: { effectiveFrom: "desc" },
      });

      if (activeRule) {
        return activeRule.percentageBasis / 100;
      }
    } catch {
      // Fall back to default
    }

    return this.DEFAULT_COMMISSION_PERCENTAGE;
  }

  /**
   * Calculates financial commission snapshot for a transaction.
   * Preserves exact integer minor units. Never uses floating point arithmetic.
   */
  static async calculateSnapshot(grossAmountMinor: bigint): Promise<{
    grossAmountMinor: bigint;
    commissionAmountMinor: bigint;
    netPayableMinor: bigint;
    appliedPercentage: number;
  }> {
    const percentage = await this.getActiveCommissionPercentage();
    const result = calculateCommission(grossAmountMinor, percentage);

    return {
      grossAmountMinor: result.grossMinor,
      commissionAmountMinor: result.commissionMinor,
      netPayableMinor: result.netPayableMinor,
      appliedPercentage: percentage,
    };
  }
}
