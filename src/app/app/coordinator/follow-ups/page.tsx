import { enforcePageRole } from "@/modules/authorization/page-guard";
import { UserRole } from "@prisma/client";
import { CoordinationService } from "@/modules/coordination/services/coordination.service";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ChevronRight, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CoordinatorFollowUpsPage() {
  const session = await enforcePageRole(UserRole.COORDINATOR);
  const followUps = await CoordinationService.getFollowUps(session);

  return (
    <div className="min-h-screen bg-serene-50 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/app/coordinator"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-serene-500 hover:text-serene-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Coordinator Portal
          </Link>
          <div className="text-xs text-serene-500">
            Pending Follow-ups: <strong className="text-serene-900">{followUps.total}</strong>
          </div>
        </div>

        <header className="border-b border-serene-200 pb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-serene-900">
            Client Follow-Up Schedule
          </h1>
          <p className="text-xs text-serene-500 mt-1">
            Completed counseling sessions requiring check-ins, satisfaction review, or continuing care.
          </p>
        </header>

        <div className="bg-white rounded-3xl border border-serene-200 shadow-sm overflow-hidden">
          {followUps.items.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-serene-900">No Pending Follow-ups</h3>
              <p className="text-xs text-serene-500 mt-1">
                All client post-session check-ins are up to date.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-serene-100">
              {followUps.items.map((req) => (
                <div key={req.id} className="p-5 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-bold text-serene-900">{req.clientName}</div>
                    <div className="text-xs text-serene-500 mt-0.5">
                      Completed session • Psychologist: {req.targetPsychologist?.fullName || "Assigned"}
                    </div>
                  </div>
                  <Link
                    href={`/app/coordinator/requests/${req.id}`}
                    className="px-4 py-2 border border-serene-200 hover:border-brand-500 text-serene-700 text-xs font-semibold rounded-xl flex items-center gap-1"
                  >
                    View Ticket <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
