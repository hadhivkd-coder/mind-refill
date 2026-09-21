import { enforcePageRole } from "@/modules/authorization/page-guard";
import { UserRole } from "@prisma/client";
import { SettlementService } from "@/modules/payouts/services/settlement.service";
import Link from "next/link";
import { ArrowLeft, DollarSign, ArrowUpRight, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PsychologistEarningsPage() {
  const session = await enforcePageRole(UserRole.PSYCHOLOGIST);

  let data: any = {
    summary: {
      grossTotalMajor: "0.00",
      commissionTotalMajor: "0.00",
      netTotalMajor: "0.00",
      pendingSettlementMajor: "0.00",
      eligibleForPayoutMajor: "0.00",
      paidOutMajor: "0.00",
      currency: "INR",
    },
    transactions: [],
  };

  try {
    const res = await SettlementService.getPsychologistEarnings(session.user.id);
    if (res) data = res;
  } catch (err) {
    console.error("Error loading earnings data:", err);
  }

  return (
    <div className="min-h-screen bg-[#173C32] text-[#F7F3E9] selection:bg-[#3F6855] selection:text-[#F1EBDD] p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/app/psychologist"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9CAF91] hover:text-[#F1EBDD] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Practitioner Workspace</span>
          </Link>

          <Link
            href="/app/psychologist/payouts"
            className="px-4 py-2 border border-white/10 hover:bg-white/5 text-[#F1EBDD] text-xs font-semibold rounded-full transition-colors shadow-sm"
          >
            <span>View Payout History &rarr;</span>
          </Link>
        </div>

        <header className="border-b border-white/10 pb-4">
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#F7F3E9]">
            Practice Earnings & Revenue Ledger
          </h1>
          <p className="text-xs text-[#C9D2BC] mt-1 font-light">
            Transparent breakdown of gross consultation fees, platform commissions, pending settlements, and disbursed revenue.
          </p>
        </header>

        {/* Financial Metric Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="atmospheric-card p-6 rounded-3xl">
            <span className="text-xs font-semibold text-[#9CAF91] uppercase tracking-wider block">
              Gross Consultations
            </span>
            <span className="font-serif text-3xl font-normal text-[#F7F3E9] block mt-1">
              ₹{data.summary.grossTotalMajor}
            </span>
            <p className="text-[11px] text-[#C9D2BC] mt-1 font-light">Total client payments</p>
          </div>

          <div className="atmospheric-card p-6 rounded-3xl">
            <span className="text-xs font-semibold text-[#9CAF91] uppercase tracking-wider block">
              Platform Support (15%)
            </span>
            <span className="font-serif text-3xl font-normal text-[#C9D2BC] block mt-1">
              ₹{data.summary.commissionTotalMajor}
            </span>
            <p className="text-[11px] text-[#9CAF91] mt-1 font-light">Direct clinical platform maintenance</p>
          </div>

          <div className="atmospheric-card p-6 rounded-3xl">
            <span className="text-xs font-semibold text-[#9CAF91] uppercase tracking-wider block">
              7-Day Holding Escrow
            </span>
            <span className="font-serif text-3xl font-normal text-[#F1EBDD] block mt-1">
              ₹{data.summary.pendingSettlementMajor}
            </span>
            <p className="text-[11px] text-[#C9D2BC] mt-1 font-light">Held during dispute/refund window</p>
          </div>

          <div className="atmospheric-card p-6 rounded-3xl border-[#9CAF91]/40">
            <span className="text-xs font-semibold text-[#9CAF91] uppercase tracking-wider block">
              Ready for Payout
            </span>
            <span className="font-serif text-3xl font-normal text-[#F1EBDD] block mt-1">
              ₹{data.summary.eligibleForPayoutMajor}
            </span>
            <p className="text-[11px] text-[#C9D2BC] mt-1 font-light">Disbursed automatically on weekly batch</p>
          </div>
        </section>

        {/* Transactions Table */}
        <section className="atmospheric-card rounded-3xl overflow-hidden p-6 sm:p-8">
          <h2 className="font-serif text-xl font-normal text-[#F7F3E9] mb-4">
            Recent Consultation Settlements
          </h2>

          {data.transactions.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#C9D2BC]">
              <Clock className="w-8 h-8 text-[#9CAF91] mx-auto mb-2 opacity-60" />
              <h3 className="font-serif text-base text-[#F7F3E9]">No settlement items recorded yet</h3>
              <p className="text-xs text-[#C9D2BC] mt-1 font-light">
                Consultation settlements appear automatically when appointments are booked and confirmed.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#F7F3E9]">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-[#9CAF91]">
                    <th className="py-3 px-4">Client / Service</th>
                    <th className="py-3 px-4">Gross</th>
                    <th className="py-3 px-4">Net Payout</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Matures At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.transactions.map((t: any) => (
                    <tr key={t.id}>
                      <td className="py-3 px-4">
                        <span className="font-medium text-[#F7F3E9] block">{t.clientName}</span>
                        <span className="text-[11px] text-[#C9D2BC]">{t.serviceName}</span>
                      </td>
                      <td className="py-3 px-4">₹{t.grossAmountMajor}</td>
                      <td className="py-3 px-4 font-semibold text-[#F1EBDD]">₹{t.netPayableMajor}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase font-semibold text-[#C9D2BC]">
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#C9D2BC]">
                        {new Date(t.eligibleAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
