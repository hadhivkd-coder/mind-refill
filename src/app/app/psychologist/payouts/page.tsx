import { enforcePageRole } from "@/modules/authorization/page-guard";
import { UserRole } from "@prisma/client";
import { PayoutService } from "@/modules/payouts/services/payout.service";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PsychologistPayoutsPage() {
  const session = await enforcePageRole(UserRole.PSYCHOLOGIST);
  const payouts = await PayoutService.listPsychologistPayouts(session.user.id);

  return (
    <div className="min-h-screen bg-serene-50 p-6 sm:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link
          href="/app/psychologist/earnings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-serene-500 hover:text-serene-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Earnings Ledger
        </Link>

        <header className="border-b border-serene-200 pb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-serene-900">
            Bank Payout History
          </h1>
          <p className="text-xs text-serene-500 mt-1">
            Records of all executed and processing disbursements transferred directly to your bank account.
          </p>
        </header>

        <div className="bg-white rounded-3xl border border-serene-200 shadow-sm overflow-hidden">
          {payouts.length === 0 ? (
            <div className="p-12 text-center text-xs text-serene-400">
              <Clock className="w-10 h-10 text-serene-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-serene-900">No Disbursements Yet</h3>
              <p className="text-xs text-serene-500 mt-1">
                Payout batches are generated weekly for all matured, eligible consultation earnings.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-serene-100">
              {payouts.map((p) => (
                <div key={p.id} className="p-5 flex items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="font-bold text-sm text-serene-900">₹{p.totalAmountMajor}</div>
                    <div className="text-serene-500 text-[11px] mt-0.5">
                      Bank Ref: {p.payoutReference || "Processing transfer..."} • Created:{" "}
                      {new Date(p.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      p.status === "PAID"
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
