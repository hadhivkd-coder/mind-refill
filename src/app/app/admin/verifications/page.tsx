import { enforcePageRole } from "@/modules/authorization/page-guard";
import { UserRole, VerificationStatus } from "@prisma/client";
import { VerificationService } from "@/modules/verification/services/verification.service";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Clock, AlertTriangle, FileText, ArrowRight } from "lucide-react";

interface VerificationsPageProps {
  searchParams: {
    status?: string;
  };
}

export const dynamic = "force-dynamic";

export default async function AdminVerificationsPage({ searchParams }: VerificationsPageProps) {
  await enforcePageRole(UserRole.ADMIN);

  const statusFilter = searchParams.status ? (searchParams.status as VerificationStatus) : undefined;
  const applications = await VerificationService.listApplications(statusFilter);

  return (
    <div className="min-h-screen bg-serene-50 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/app/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-serene-500 hover:text-serene-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Admin Console
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-serene-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-xs font-semibold text-red-700 uppercase tracking-wider">
                Clinical Administration
              </span>
              <h1 className="text-2xl font-bold text-serene-950 mt-1">
                Psychologist Verification Queue
              </h1>
              <p className="text-xs text-serene-500 mt-1">
                Inspect uploaded credentials and decide on public directory verification status.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <Link
                href="/app/admin/verifications"
                className={`px-3 py-1.5 rounded-lg border font-semibold ${
                  !statusFilter ? "bg-serene-900 text-white" : "bg-white text-serene-700 border-serene-200"
                }`}
              >
                All
              </Link>
              <Link
                href="/app/admin/verifications?status=UNDER_REVIEW"
                className={`px-3 py-1.5 rounded-lg border font-semibold ${
                  statusFilter === "UNDER_REVIEW"
                    ? "bg-amber-600 text-white"
                    : "bg-white text-serene-700 border-serene-200"
                }`}
              >
                Under Review
              </Link>
              <Link
                href="/app/admin/verifications?status=VERIFIED"
                className={`px-3 py-1.5 rounded-lg border font-semibold ${
                  statusFilter === "VERIFIED"
                    ? "bg-green-700 text-white"
                    : "bg-white text-serene-700 border-serene-200"
                }`}
              >
                Verified
              </Link>
              <Link
                href="/app/admin/verifications?status=REJECTED"
                className={`px-3 py-1.5 rounded-lg border font-semibold ${
                  statusFilter === "REJECTED"
                    ? "bg-red-700 text-white"
                    : "bg-white text-serene-700 border-serene-200"
                }`}
              >
                Rejected
              </Link>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-3xl border border-serene-200 shadow-sm overflow-hidden">
          {applications.length === 0 ? (
            <div className="p-12 text-center text-xs text-serene-400 italic">
              No verification applications found under this status filter.
            </div>
          ) : (
            <div className="divide-y divide-serene-100">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-serene-50/50 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-sm font-bold text-serene-900">
                        {app.psychologist.fullName}
                      </h2>
                      <span className="text-xs text-serene-500">
                        ({app.psychologist.professionalTitle})
                      </span>
                    </div>
                    <p className="text-xs text-serene-400">
                      User: {app.psychologist.user.email} • Submitted:{" "}
                      {new Date(app.submittedAt).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-[11px] text-serene-500">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3 text-brand-600" />
                        {app.documents.length} Document(s) Attached
                      </span>
                      {app.reviews.length > 0 && (
                        <span>
                          Last Review: {app.reviews[0].outcomeStatus} by{" "}
                          {app.reviews[0].reviewer.fullName}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        app.status === "VERIFIED"
                          ? "bg-green-50 text-green-800 border-green-200"
                          : app.status === "UNDER_REVIEW"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : app.status === "REJECTED"
                          ? "bg-red-50 text-red-800 border-red-200"
                          : "bg-serene-100 text-serene-700 border-serene-200"
                      }`}
                    >
                      {app.status}
                    </span>

                    <Link
                      href={`/app/admin/psychologists/${app.psychologist.id}`}
                      className="inline-flex items-center gap-1.5 py-2 px-4 bg-serene-900 hover:bg-serene-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
                    >
                      Review
                      <ArrowRight className="w-3.5 h-3.5" />
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
