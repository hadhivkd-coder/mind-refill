import { enforcePageRole } from "@/modules/authorization/page-guard";
import { UserRole } from "@prisma/client";
import { PayoutService } from "@/modules/payouts/services/payout.service";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PsychologistPayoutsPage() {
  const session = await enforcePageRole(UserRole.PSYCHOLOGIST);

  let payouts: any[] = [];
  try {
    payouts = await PayoutService.listPsychologistPayouts(session.user.id);
  } catch (err) {
    console.error("Error loading payouts data:", err);
    payouts = [];
  }

  return (
    <div className="min-h-screen bg-[#173C32] text-[#F7F3E9] selection:bg-[#3F6855] selection:text-[#F1EBDD] p-6 sm:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link
          href="/app/psychologist/earnings"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9CAF91] hover:text-[#F1EBDD] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Earnings Ledger</span>
        </Link>

        <header className="border-b border-white/10 pb-4">
          <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#F7F3E9]">
            Bank Payout History
          </h1>
          <p className="text-xs text-[#C9D2BC] mt-1 font-light">
            Records of executed and processing disbursements transferred directly to your registered bank account.
          </p>
        </header>

        <div className="atmospheric-card rounded-3xl overflow-hidden">
          {payouts.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#C9D2BC]">
              <Clock className="w-8 h-8 text-[#9CAF91] mx-auto mb-2 opacity-60" />
              <h3 className="font-serif text-base text-[#F7F3E9]">No Disbursements Yet</h3>
              <p className="text-xs text-[#C9D2BC] mt-1 font-light">
                Payout batches are generated weekly for all matured, eligible consultation earnings.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {payouts.map((p) => (
                <div key={p.id} className="p-5 flex items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="font-serif text-lg font-normal text-[#F7F3E9]">₹{p.totalAmountMajor}</div>
                    <div className="text-[#C9D2BC] text-[11px] mt-0.5 font-light">
                      Bank Ref: {p.payoutReference || "Processing transfer..."} • Created:{" "}
                      {new Date(p.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-[10px] uppercase font-semibold ${
                      p.status === "PAID"
                        ? "bg-[#F1EBDD] text-[#173C32]"
                        : "bg-white/10 text-[#C9D2BC]"
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
