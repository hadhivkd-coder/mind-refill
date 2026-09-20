import { enforcePageRole } from "@/modules/authorization/page-guard";
import { UserRole, VerificationStatus } from "@prisma/client";
import { CoordinationService } from "@/modules/coordination/services/coordination.service";
import { prisma } from "@/shared/database/prisma";
import { CoordinatorRequestDetailView } from "./detail-client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface RequestDetailPageProps {
  params: { id: string };
}

export default async function CoordinatorRequestDetailPage({ params }: RequestDetailPageProps) {
  const session = await enforcePageRole(UserRole.COORDINATOR);

  let details;
  try {
    details = await CoordinationService.getRequestDetails(session, params.id);
  } catch (err: any) {
    if (err.status === 404) notFound();
    throw err;
  }

  const staff = await CoordinationService.getOrCreateStaffProfile(session.user.id, session.user.email);
  const isStaffAssigned = details.activeAssignment?.coordinatorId === staff.id;
  const isAdmin = session.user.roles.includes(UserRole.ADMIN);

  // Fetch list of verified active psychologists for matching selector
  const verifiedPsychologists = await prisma.psychologistProfile.findMany({
    where: {
      verificationStatus: VerificationStatus.VERIFIED,
      profileState: "ACTIVE",
    },
    select: {
      id: true,
      fullName: true,
      professionalTitle: true,
    },
    orderBy: { fullName: "asc" },
  });

  return (
    <div className="min-h-screen bg-serene-50 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/app/coordinator/requests"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-serene-500 hover:text-serene-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Queue
          </Link>
          <div className="text-xs text-serene-500">
            Ticket ID: <span className="font-mono text-serene-700">{details.id}</span>
          </div>
        </div>

        <header className="border-b border-serene-200 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-brand-700 uppercase tracking-wider">
              {details.isDirectBookingRequest ? "Direct Request Ticket" : "Guided Matching Ticket"}
            </span>
            <span className="text-xs text-serene-400">•</span>
            <span className="text-xs text-serene-500">
              Submitted on {new Date(details.createdAt).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-serene-900">
            Care Ticket: {details.client.fullName}
          </h1>
        </header>

        <CoordinatorRequestDetailView
          initialData={details}
          currentUserId={session.user.id}
          isStaffAssigned={isStaffAssigned}
          isAdmin={isAdmin}
          verifiedPsychologists={verifiedPsychologists}
        />
      </div>
    </div>
  );
}
