import { enforcePageRole } from "@/modules/authorization/page-guard";
import { UserRole } from "@prisma/client";
import { SettlementService } from "@/modules/payouts/services/settlement.service";
import Link from "next/link";
import { ArrowLeft, DollarSign, ArrowUpRight, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PsychologistEarningsPage() {
  const session = await enforcePageRole(UserRole.PSYCHOLOGIST);
  const data = await SettlementService.getPsychologistEarnings(session.user.id);

  return (
    <div className="min-h-screen bg-serene-50 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/app/psychologist"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-serene-500 hover:text-serene-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Workspace
          </Link>

          <Link
            href="/app/psychologist/payouts"
            className="px-4 py-2 border border-serene-200 hover:bg-white text-serene-700 text-xs font-semibold rounded-xl transition-colors shadow-sm"
          >
            View Payout History &rarr;
          </Link>
        </div>

        <header className="border-b border-serene-200 pb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-serene-900">
            Practice Earnings & Revenue Ledger
          </h1>
          <p className="text-xs text-serene-500 mt-1">
            Complete transparent breakdown of gross consultation fees, platform commissions, pending settlements, and paid revenue.
          </p>
        </header>

        {/* Financial Metric Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-serene-200 shadow-sm">
            <span className="text-xs font-bold text-serene-400 uppercase tracking-wider">
              Gross Revenue
            </span>
            <div className="text-2xl font-black text-serene-900 mt-2">
              ₹{data.summary.grossTotalMajor}
            </div>
            <p className="text-[11px] text-serene-500 mt-1">Total billed to clients</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-serene-200 shadow-sm">
            <span className="text-xs font-bold text-serene-400 uppercase tracking-wider">
              Platform Commission
            </span>
            <div className="text-2xl font-black text-serene-900 mt-2">
              ₹{data.summary.commissionTotalMajor}
            </div>
            <p className="text-[11px] text-serene-500 mt-1">Transparent platform fee</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-serene-200 shadow-sm">
            <span className="text-xs font-bold text-brand-700 uppercase tracking-wider">
              Net Earnings
            </span>
            <div className="text-2xl font-black text-brand-900 mt-2">
              ₹{data.summary.netTotalMajor}
            </div>
            <p className="text-[11px] text-serene-500 mt-1">Your total earned income</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-brand-200 shadow-sm bg-brand-50/20">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Available For Payout
            </span>
            <div className="text-2xl font-black text-emerald-900 mt-2">
              ₹{data.summary.eligibleForPayoutMajor}
            </div>
            <p className="text-[11px] text-emerald-700 mt-1">
              Eligible matured balance (7-day window)
            </p>
          </div>
        </section>

        {/* Settlement Status Sub-metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-serene-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-serene-500">Pending Settlement (In 7-day hold)</div>
              <div className="text-lg font-bold text-amber-900 mt-0.5">₹{data.summary.pendingSettlementMajor}</div>
            </div>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>

          <div className="bg-white p-5 rounded-2xl border border-serene-200 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-serene-500">Total Transferred to Bank</div>
              <div className="text-lg font-bold text-serene-900 mt-0.5">₹{data.summary.paidOutMajor}</div>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        {/* Transaction Ledger Table */}
        <section className="bg-white rounded-3xl border border-serene-200 shadow-sm overflow-hidden space-y-4 p-6">
          <div className="flex items-center justify-between border-b border-serene-100 pb-4">
            <h2 className="text-sm font-bold text-serene-900">Settlement Transactions Ledger</h2>
            <span className="text-xs text-serene-500">{data.transactions.length} transactions recorded</span>
          </div>

          {data.transactions.length === 0 ? (
            <div className="p-8 text-center text-xs text-serene-400">
              No session transactions recorded yet. Once counseling appointments are booked and completed, your revenue and settlement balances will appear here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-serene-200 text-[11px] font-bold uppercase text-serene-400">
                    <th className="py-3 px-2">Date</th>
                    <th className="py-3 px-2">Client / Session</th>
                    <th className="py-3 px-2">Gross Fee</th>
                    <th className="py-3 px-2">Commission</th>
                    <th className="py-3 px-2">Net Payable</th>
                    <th className="py-3 px-2">Settlement Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-serene-100">
                  {data.transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-serene-50/60 transition-colors">
                      <td className="py-3 px-2 text-serene-500 font-mono">
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-2">
                        <div className="font-bold text-serene-900">{tx.clientName}</div>
                        <div className="text-[11px] text-serene-500">{tx.serviceName}</div>
                      </td>
                      <td className="py-3 px-2 font-mono text-serene-800">₹{tx.grossAmountMajor}</td>
                      <td className="py-3 px-2 font-mono text-serene-500">-₹{tx.commissionAmountMajor}</td>
                      <td className="py-3 px-2 font-mono font-bold text-brand-900">₹{tx.netPayableMajor}</td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tx.status === "PAID"
                              ? "bg-green-100 text-green-800"
                              : tx.status === "ELIGIBLE"
                              ? "bg-emerald-100 text-emerald-800"
                              : tx.status === "IN_PAYOUT"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {tx.status}
                        </span>
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
