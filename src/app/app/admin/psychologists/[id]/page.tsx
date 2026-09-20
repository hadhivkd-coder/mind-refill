import { enforcePageRole } from "@/modules/authorization/page-guard";
import { UserRole } from "@prisma/client";
import { prisma } from "@/shared/database/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Download, Award, Briefcase, FileText } from "lucide-react";
import AdminReviewForm from "./review-form";

interface AdminReviewPageProps {
  params: { id: string };
}

export default async function AdminPsychologistReviewPage({ params }: AdminReviewPageProps) {
  await enforcePageRole(UserRole.ADMIN);

  const psychologist = await prisma.psychologistProfile.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { email: true } },
      specializations: { include: { specialization: true } },
      qualifications: { orderBy: { yearObtained: "desc" } },
      experiences: { orderBy: { startDate: "desc" } },
      verificationApps: {
        orderBy: { submittedAt: "desc" },
        include: {
          documents: { include: { file: true } },
          reviews: {
            orderBy: { createdAt: "desc" },
            include: { reviewer: true },
          },
        },
      },
    },
  });

  if (!psychologist) {
    notFound();
  }

  const latestApp = psychologist.verificationApps[0];

  return (
    <div className="min-h-screen bg-serene-50 p-6 sm:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link
          href="/app/admin/verifications"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-serene-500 hover:text-serene-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Verification Queue
        </Link>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-serene-200 p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-xs font-semibold text-red-700 uppercase tracking-wider">
                Credential Inspection
              </span>
              <h1 className="text-2xl font-bold text-serene-950 mt-1">
                {psychologist.fullName}
              </h1>
              <p className="text-xs text-serene-500">
                {psychologist.professionalTitle} • {psychologist.user.email} • {psychologist.yearsOfExperience} yrs exp
              </p>
            </div>
            <div>
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                  psychologist.verificationStatus === "VERIFIED"
                    ? "bg-green-50 text-green-800 border-green-200"
                    : psychologist.verificationStatus === "UNDER_REVIEW"
                    ? "bg-amber-50 text-amber-800 border-amber-200"
                    : psychologist.verificationStatus === "REJECTED"
                    ? "bg-red-50 text-red-800 border-red-200"
                    : "bg-serene-100 text-serene-700 border-serene-200"
                }`}
              >
                Status: {psychologist.verificationStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Verification Review Action Form */}
        {latestApp && (
          <div className="bg-white rounded-3xl border border-serene-200 p-8 shadow-sm">
            <h2 className="text-base font-bold text-serene-900 mb-2">Record Review Decision</h2>
            <p className="text-xs text-serene-500 mb-6">
              Reviewing Application ID: <code className="font-mono">{latestApp.id}</code>
            </p>
            <AdminReviewForm applicationId={latestApp.id} currentStatus={latestApp.status} />
          </div>
        )}

        {/* Attached Verification Documents */}
        <div className="bg-white rounded-3xl border border-serene-200 p-8 shadow-sm">
          <h2 className="text-base font-bold text-serene-900 mb-4">Verification Documents</h2>
          {!latestApp || latestApp.documents.length === 0 ? (
            <p className="text-xs text-serene-400 italic">No verification documents attached to this application.</p>
          ) : (
            <div className="space-y-3">
              {latestApp.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-serene-200 bg-serene-50/50"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-brand-600" />
                    <div>
                      <span className="text-xs font-bold text-serene-900 block">{doc.documentType}</span>
                      <span className="text-[11px] text-serene-500">
                        {doc.file.originalName} ({Math.round(Number(doc.file.sizeBytes) / 1024)} KB)
                      </span>
                    </div>
                  </div>
                  <a
                    href={`/api/psychologist/documents/${doc.id}/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-brand-700 hover:underline font-semibold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Secure Inspection
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Audit History Timeline */}
        {latestApp && latestApp.reviews.length > 0 && (
          <div className="bg-white rounded-3xl border border-serene-200 p-8 shadow-sm">
            <h2 className="text-base font-bold text-serene-900 mb-4">Historical Review Decisions</h2>
            <div className="space-y-3 divide-y divide-serene-100">
              {latestApp.reviews.map((r) => (
                <div key={r.id} className="pt-3 first:pt-0">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold text-serene-900">
                      Outcome: {r.outcomeStatus} by {r.reviewer.fullName}
                    </span>
                    <span className="text-[11px] text-serene-400">
                      {new Date(r.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {r.notes && (
                    <p className="text-xs text-serene-600 mt-1 leading-relaxed bg-serene-50 p-2.5 rounded-lg">
                      {r.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
