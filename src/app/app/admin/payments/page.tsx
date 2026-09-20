import { enforcePageRole } from "@/modules/authorization/page-guard";
import { UserRole } from "@prisma/client";
import { PaymentService } from "@/modules/billing/services/payment.service";
import Link from "next/link";
import { ArrowLeft, RefreshCcw } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage() {
  const session = await enforcePageRole(UserRole.ADMIN);
  const data = await PaymentService.listAdminTransactions(session, 1, 30);

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
          <h1 className="text-2xl sm:text-3xl font-bold text-serene-900">
            Payment Transactions & Financial Operations
          </h1>
          <p className="text-xs text-serene-500 mt-1">
            Audit gateway charges, commission breakdowns, settlement item statuses, and refund controls.
          </p>
        </header>

        <div className="bg-white rounded-3xl border border-serene-200 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-serene-100 pb-4">
            <h2 className="text-sm font-bold text-serene-900">All Transactions ({data.total})</h2>
          </div>

          {data.items.length === 0 ? (
            <p className="text-xs text-serene-400 p-8 text-center">
              No transactions recorded on the platform yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-serene-200 text-[11px] font-bold uppercase text-serene-400">
                    <th className="py-3 px-2">Date</th>
                    <th className="py-3 px-2">Client / Psychologist</th>
                    <th className="py-3 px-2">Gross</th>
                    <th className="py-3 px-2">Commission</th>
                    <th className="py-3 px-2">Net Payable</th>
                    <th className="py-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-serene-100">
                  {data.items.map((t) => (
                    <tr key={t.id} className="hover:bg-serene-50/60 transition-colors">
                      <td className="py-3 px-2 text-serene-500 font-mono">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-2">
                        <div className="font-bold text-serene-900">{t.clientName}</div>
                        <div className="text-[11px] text-serene-500">with {t.psychologistName}</div>
                      </td>
                      <td className="py-3 px-2 font-mono">
                        ₹{(Number(t.grossAmountMinor) / 100).toFixed(2)}
                      </td>
                      <td className="py-3 px-2 font-mono text-brand-700">
                        ₹{(Number(t.commissionAmountMinor) / 100).toFixed(2)}
                      </td>
                      <td className="py-3 px-2 font-mono font-bold text-serene-900">
                        ₹{(Number(t.netPayableMinor) / 100).toFixed(2)}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            t.status === "SUCCEEDED"
                              ? "bg-green-100 text-green-800"
                              : t.status === "REFUNDED"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {t.status}
                        </span>
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
