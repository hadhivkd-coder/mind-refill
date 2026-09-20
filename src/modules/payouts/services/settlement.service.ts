import { prisma } from "@/shared/database/prisma";
import { SettlementStatus } from "@prisma/client";
import { NotFoundError } from "@/shared/errors";
import { minorToMajorString } from "@/shared/types/money";

export class SettlementService {
  /**
   * Background batch processor: Advances matured settlement items to ELIGIBLE.
   */
  static async processEligibleSettlements(): Promise<number> {
    const result = await prisma.settlementItem.updateMany({
      where: {
        status: SettlementStatus.PENDING_SETTLEMENT,
        eligibleAt: { lte: new Date() },
      },
      data: {
        status: SettlementStatus.ELIGIBLE,
      },
    });

    return result.count;
  }

  /**
   * Computes comprehensive earnings report and ledger for a psychologist.
   */
  static async getPsychologistEarnings(userId: string) {
    const profile = await prisma.psychologistProfile.findUnique({
      where: { userId },
    });

    if (!profile) throw new NotFoundError("Psychologist profile not found");

    // Automatically transition any matured settlements
    await this.processEligibleSettlements();

    const settlementItems = await prisma.settlementItem.findMany({
      where: { psychologistProfileId: profile.id },
      orderBy: { createdAt: "desc" },
      include: {
        appointment: {
          include: { client: true, service: true },
        },
      },
    });

    let grossTotalMinor = 0n;
    let commissionTotalMinor = 0n;
    let netTotalMinor = 0n;
    let pendingSettlementMinor = 0n;
    let eligibleForPayoutMinor = 0n;
    let paidOutMinor = 0n;

    for (const item of settlementItems) {
      if (item.status !== SettlementStatus.ADJUSTED) {
        grossTotalMinor += item.grossAmountMinor;
        commissionTotalMinor += item.commissionAmountMinor;
        netTotalMinor += item.netPayableMinor;

        if (item.status === SettlementStatus.PENDING_SETTLEMENT) {
          pendingSettlementMinor += item.netPayableMinor;
        } else if (item.status === SettlementStatus.ELIGIBLE) {
          eligibleForPayoutMinor += item.netPayableMinor;
        } else if (item.status === SettlementStatus.PAID) {
          paidOutMinor += item.netPayableMinor;
        }
      }
    }

    return {
      summary: {
        grossTotalMinor: grossTotalMinor.toString(),
        grossTotalMajor: minorToMajorString(grossTotalMinor),
        commissionTotalMinor: commissionTotalMinor.toString(),
        commissionTotalMajor: minorToMajorString(commissionTotalMinor),
        netTotalMinor: netTotalMinor.toString(),
        netTotalMajor: minorToMajorString(netTotalMinor),
        pendingSettlementMinor: pendingSettlementMinor.toString(),
        pendingSettlementMajor: minorToMajorString(pendingSettlementMinor),
        eligibleForPayoutMinor: eligibleForPayoutMinor.toString(),
        eligibleForPayoutMajor: minorToMajorString(eligibleForPayoutMinor),
        paidOutMinor: paidOutMinor.toString(),
        paidOutMajor: minorToMajorString(paidOutMinor),
        currency: "INR",
      },
      transactions: settlementItems.map((item) => ({
        id: item.id,
        status: item.status,
        grossAmountMinor: item.grossAmountMinor.toString(),
        grossAmountMajor: minorToMajorString(item.grossAmountMinor),
        commissionAmountMinor: item.commissionAmountMinor.toString(),
        commissionAmountMajor: minorToMajorString(item.commissionAmountMinor),
        netPayableMinor: item.netPayableMinor.toString(),
        netPayableMajor: minorToMajorString(item.netPayableMinor),
        currency: item.currency,
        eligibleAt: item.eligibleAt.toISOString(),
        createdAt: item.createdAt.toISOString(),
        clientName: item.appointment?.client.fullName ?? "Direct Client",
        serviceName: item.appointment?.service.name ?? "Session",
      })),
    };
  }
}
