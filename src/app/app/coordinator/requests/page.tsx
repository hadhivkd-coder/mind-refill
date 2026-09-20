import { enforcePageRole } from "@/modules/authorization/page-guard";
import { UserRole, CounselingRequestStatus } from "@prisma/client";
import { CoordinationService } from "@/modules/coordination/services/coordination.service";
import Link from "next/link";
import {
  ArrowLeft,
  AlertTriangle,
  UserCheck,
  Clock,
  Filter,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface CoordinatorRequestsPageProps {
  searchParams: {
    tab?: string;
    status?: string;
    page?: string;
  };
}

export default async function CoordinatorRequestsPage({ searchParams }: CoordinatorRequestsPageProps) {
  const session = await enforcePageRole(UserRole.COORDINATOR);
  const tab = searchParams.tab || "all";
  const status = searchParams.status as CounselingRequestStatus | undefined;
  const page = parseInt(searchParams.page || "1", 10);

  const queue = await CoordinationService.getQueue(session, {
    status,
    assignedToMe: tab === "mine",
    unassigned: tab === "unassigned",
    page,
    limit: 25,
  });

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
            Total Requests: <strong className="text-serene-900">{queue.total}</strong>
          </div>
        </div>

        <header className="border-b border-serene-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-serene-900">
              Care Coordination Queue
            </h1>
            <p className="text-xs text-serene-500 mt-1">
              Triage new client intakes, claim requests, assign verified psychologists, and coordinate care.
            </p>
          </div>

          {/* Tab Filters */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-serene-200 text-xs font-medium">
            <Link
              href="/app/coordinator/requests?tab=all"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                tab === "all" ? "bg-brand-700 text-white font-semibold" : "text-serene-600 hover:bg-serene-50"
              }`}
            >
              All Requests
            </Link>
            <Link
              href="/app/coordinator/requests?tab=unassigned"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                tab === "unassigned" ? "bg-brand-700 text-white font-semibold" : "text-serene-600 hover:bg-serene-50"
              }`}
            >
              Unassigned Pool
            </Link>
            <Link
              href="/app/coordinator/requests?tab=mine"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                tab === "mine" ? "bg-brand-700 text-white font-semibold" : "text-serene-600 hover:bg-serene-50"
              }`}
            >
              Assigned to Me
            </Link>
          </div>
        </header>

        {/* Requests Table */}
        <div className="bg-white rounded-3xl border border-serene-200 shadow-sm overflow-hidden">
          {queue.items.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-serene-900">Queue is clear</h3>
              <p className="text-xs text-serene-500 mt-1">No requests match the selected view filters.</p>
            </div>
          ) : (
            <div className="divide-y divide-serene-100">
              {queue.items.map((req) => (
                <div
                  key={req.id}
                  className={`p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors hover:bg-serene-50/60 ${
                    req.isEscalated ? "bg-amber-50/40" : ""
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-serene-900">{req.clientName}</span>
                      <span className="text-xs text-serene-400">({req.clientEmail})</span>
                      {req.isEscalated && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          <ShieldAlert className="w-3 h-3 text-rose-600" />
                          Crisis Priority Escalated
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-serene-100 text-serene-700">
                        {req.isDirectBookingRequest ? "Direct Request" : "Guided Matching"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-serene-500">
                      <span>Language: {req.preferredLanguage || "English"}</span>
                      <span>•</span>
                      <span>
                        Submitted:{" "}
                        {new Date(req.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {req.targetPsychologist && (
                        <>
                          <span>•</span>
                          <span className="text-brand-800 font-medium">
                            Target: {req.targetPsychologist.fullName}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {req.concernCategories.map((c, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-brand-50 text-brand-900 text-[10px] font-medium"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-bold text-serene-800 uppercase tracking-wider">
                        {req.status}
                      </div>
                      <div className="text-[11px] text-serene-500 mt-0.5">
                        {req.assignedCoordinator ? (
                          <span className="text-emerald-700 font-medium flex items-center justify-end gap-1">
                            <UserCheck className="w-3 h-3" />
                            {req.assignedCoordinator.fullName}
                          </span>
                        ) : (
                          <span className="text-amber-700 font-medium flex items-center justify-end gap-1">
                            <Clock className="w-3 h-3" />
                            Unassigned
                          </span>
                        )}
                      </div>
                    </div>

                    <Link
                      href={`/app/coordinator/requests/${req.id}`}
                      className="px-4 py-2 bg-white border border-serene-200 hover:border-brand-500 hover:text-brand-700 text-serene-700 text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-1"
                    >
                      Open Ticket <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
