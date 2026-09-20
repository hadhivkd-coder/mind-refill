import { enforcePageRole } from "@/modules/authorization/page-guard";
import { UserRole } from "@prisma/client";
import { SubscriptionService } from "@/modules/subscriptions/services/subscription.service";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminSubscriptionsPage() {
  const session = await enforcePageRole(UserRole.ADMIN);
  const subscriptions = await SubscriptionService.listAdminSubscriptions(session);

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
            <ShieldCheck className="w-6 h-6 text-brand-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-serene-900">
              Platform Subscriptions Audit
            </h1>
          </div>
          <p className="text-xs text-serene-500 mt-1">
            Monitor practitioner subscription tiers, active billing cycles, revenue per tier, and cancellation rates.
          </p>
        </header>

        <div className="bg-white rounded-3xl border border-serene-200 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-serene-100 pb-4">
            <h2 className="text-sm font-bold text-serene-900">
              Active & Historic Subscriptions ({subscriptions.length})
            </h2>
          </div>

          {subscriptions.length === 0 ? (
            <p className="text-xs text-serene-400 p-8 text-center">
              No subscriptions recorded across the platform yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-serene-200 text-[11px] font-bold uppercase text-serene-400">
                    <th className="py-3 px-2">Psychologist</th>
                    <th className="py-3 px-2">Plan</th>
                    <th className="py-3 px-2">Price</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2">Current Period</th>
                    <th className="py-3 px-2">Cancelled Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-serene-100">
                  {subscriptions.map((s) => (
                    <tr key={s.id} className="hover:bg-serene-50/60 transition-colors">
                      <td className="py-3 px-2">
                        <div className="font-bold text-serene-900">{s.psychologistName}</div>
                        <div className="text-[11px] text-serene-500">{s.psychologistTitle}</div>
                      </td>
                      <td className="py-3 px-2">
                        <span className="font-semibold text-brand-700">{s.planName}</span>
                        <span className="text-[10px] text-serene-400 ml-1.5 font-mono">({s.planCode})</span>
                      </td>
                      <td className="py-3 px-2 font-mono font-bold text-serene-900">
                        ₹{s.priceMajor}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            s.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : s.status === "CANCELLING"
                              ? "bg-amber-100 text-amber-800"
                              : s.status === "EXPIRED"
                              ? "bg-slate-100 text-slate-700"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-serene-600">
                        {new Date(s.currentPeriodStart).toLocaleDateString()} — {new Date(s.currentPeriodEnd).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-2 text-serene-500">
                        {s.cancelledAt ? new Date(s.cancelledAt).toLocaleDateString() : "—"}
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
