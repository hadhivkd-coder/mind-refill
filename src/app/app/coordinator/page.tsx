import { enforcePageRole } from "@/modules/authorization/page-guard";
import { UserRole } from "@prisma/client";
import { CoordinationService } from "@/modules/coordination/services/coordination.service";
import Link from "next/link";
import { ArrowRight, Inbox, Clock, UserCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CoordinatorDashboardPage() {
  const session = await enforcePageRole(UserRole.COORDINATOR);

  const [assigned, unassigned, followUps] = await Promise.all([
    CoordinationService.getQueue(session, { assignedToMe: true }),
    CoordinationService.getQueue(session, { unassigned: true }),
    CoordinationService.getFollowUps(session),
  ]);

  return (
    <div className="min-h-screen bg-serene-50 p-6 sm:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-serene-200 pb-6">
          <div>
            <span className="text-xs font-semibold text-brand-700 uppercase tracking-wider">
              Operations
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-serene-900 mt-1">
              Care Coordination Dashboard
            </h1>
            <p className="text-xs text-serene-500 mt-1">
              Coordinator: {session.user.email}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/app/coordinator/requests"
              className="px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
            >
              Open Full Queue
            </Link>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-serene-200 hover:bg-white text-serene-700 transition-colors"
              >
                Sign Out
              </button>
            </form>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/app/coordinator/requests?tab=mine"
            className="bg-white p-6 rounded-2xl border border-serene-200 shadow-sm hover:border-brand-500 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-serene-500 uppercase tracking-wider">
                Assigned to Me
              </span>
              <UserCheck className="w-5 h-5 text-brand-600" />
            </div>
            <div className="text-3xl font-black text-serene-900 mt-3">{assigned.total}</div>
            <p className="text-xs text-serene-500 mt-1">
              Active tickets requiring triage or matching
            </p>
            <div className="mt-4 text-xs font-semibold text-brand-700 group-hover:underline flex items-center gap-1">
              View assigned queue <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/app/coordinator/requests?tab=unassigned"
            className="bg-white p-6 rounded-2xl border border-serene-200 shadow-sm hover:border-brand-500 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-serene-500 uppercase tracking-wider">
                Unassigned Pool
              </span>
              <Inbox className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-3xl font-black text-serene-900 mt-3">{unassigned.total}</div>
            <p className="text-xs text-serene-500 mt-1">
              New intakes awaiting coordinator assignment
            </p>
            <div className="mt-4 text-xs font-semibold text-brand-700 group-hover:underline flex items-center gap-1">
              Claim unassigned requests <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/app/coordinator/follow-ups"
            className="bg-white p-6 rounded-2xl border border-serene-200 shadow-sm hover:border-brand-500 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-serene-500 uppercase tracking-wider">
                Follow-Up Schedule
              </span>
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-3xl font-black text-serene-900 mt-3">{followUps.total}</div>
            <p className="text-xs text-serene-500 mt-1">
              Sessions requiring follow-up check-ins
            </p>
            <div className="mt-4 text-xs font-semibold text-brand-700 group-hover:underline flex items-center gap-1">
              Review follow-ups <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </section>
      </div>
    </div>
  );
}
