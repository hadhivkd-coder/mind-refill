import { enforcePageRole } from "@/modules/authorization/page-guard";
import { UserRole, SettlementStatus, PayoutStatus } from "@prisma/client";
import { PayoutService } from "@/modules/payouts/services/payout.service";
import { prisma } from "@/shared/database/prisma";
import { minorToMajorString } from "@/shared/types/money";
import Link from "next/link";
import { ArrowLeft, Landmark } from "lucide-react";
import { AdminPayoutActions } from "./admin-payout-actions";

export const dynamic = "force-dynamic";

export default async function AdminPayoutsPage() {
  const session = await enforcePageRole(UserRole.ADMIN);
  const payouts = await PayoutService.listAdminPayouts(session);

  // Query eligible psychologists for batching
  const eligibleGroups = await prisma.settlementItem.groupBy({
    by: ["psychologistProfileId"],
    where: {
      status: SettlementStatus.ELIGIBLE,
      payoutId: null,
    },
    _sum: {
      netPayableMinor: true,
    },
    _count: {
      id: true,
    },
  });

  const profileIds = eligibleGroups.map((g) => g.psychologistProfileId);
  const profiles = await prisma.psychologistProfile.findMany({
    where: { id: { in: profileIds } },
    select: { id: true, fullName: true, professionalTitle: true },
  });

  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  const eligiblePsychologists = eligibleGroups.map((g) => {
    const p = profileMap.get(g.psychologistProfileId);
    return {
      psychologistProfileId: g.psychologistProfileId,
      psychologistName: p?.fullName || "Unknown",
      psychologistTitle: p?.professionalTitle || "Psychologist",
      itemCount: g._count.id,
      totalAmountMajor: minorToMajorString(g._sum.netPayableMinor ?? 0n),
    };
  });

  const pendingPayouts = payouts
    .filter((p) => p.status === PayoutStatus.PENDING_APPROVAL)
    .map((p) => ({
      id: p.id,
      psychologistName: p.psychologistName,
      totalAmountMajor: p.totalAmountMajor,
    }));

  return (
    <div className="min-h-screen bg-serene-50 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <Link
          href="/app/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-serene-500 hover:text-serene-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Admin Console
        </Link>

        <header className="border-b border-serene-200 pb-4">
          <div className="flex items-center gap-2">
            <Landmark className="w-6 h-6 text-brand-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-serene-900">
              Psychologist Payout Management
            </h1>
          </div>
          <p className="text-xs text-serene-500 mt-1">
            Bundle matured settlement items into payout batches, track disbursement statuses, and record bank transfer confirmations.
          </p>
        </header>

        {/* Action Controls */}
        <AdminPayoutActions
          eligiblePsychologists={eligiblePsychologists}
          pendingPayouts={pendingPayouts}
        />

        {/* Payouts Table */}
        <div className="bg-white rounded-3xl border border-serene-200 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-serene-100 pb-4">
            <h2 className="text-sm font-bold text-serene-900">All Payout Records ({payouts.length})</h2>
          </div>

          {payouts.length === 0 ? (
            <p className="text-xs text-serene-400 p-8 text-center">
              No payout records generated on the platform yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-serene-200 text-[11px] font-bold uppercase text-serene-400">
                    <th className="py-3 px-2">Batch ID / Created</th>
                    <th className="py-3 px-2">Psychologist</th>
                    <th className="py-3 px-2">Total Amount</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2">Bank Reference</th>
                    <th className="py-3 px-2">Disbursed Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-serene-100">
                  {payouts.map((p) => (
                    <tr key={p.id} className="hover:bg-serene-50/60 transition-colors">
                      <td className="py-3 px-2">
                        <div className="font-mono text-serene-700">{p.id.slice(0, 8)}...</div>
                        <div className="text-[10px] text-serene-400">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="font-bold text-serene-900">{p.psychologistName}</div>
                        <div className="text-[11px] text-serene-500">{p.psychologistTitle}</div>
                      </td>
                      <td className="py-3 px-2 font-mono font-bold text-serene-900">
                        ₹{p.totalAmountMajor}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === "PAID"
                              ? "bg-green-100 text-green-800"
                              : p.status === "PENDING_APPROVAL"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-serene-100 text-serene-700"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-mono text-serene-600">
                        {p.payoutReference || "—"}
                      </td>
                      <td className="py-3 px-2 text-serene-500">
                        {p.processedAt ? new Date(p.processedAt).toLocaleDateString() : "Pending"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
