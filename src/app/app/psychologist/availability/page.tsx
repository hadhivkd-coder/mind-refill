import { enforcePageRole } from "@/modules/authorization/page-guard";
import { UserRole } from "@prisma/client";
import { AvailabilityService } from "@/modules/scheduling/services/availability.service";
import { ProfileService } from "@/modules/profiles/services/profile.service";
import { AvailabilityManager } from "./availability-manager";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PsychologistAvailabilityPage() {
  const session = await enforcePageRole(UserRole.PSYCHOLOGIST);
  const profile = await ProfileService.getPrivateProfileByUserId(session.user.id);
  const { rules, exceptions } = await AvailabilityService.getPsychologistAvailability(profile.id);

  return (
    <div className="min-h-screen bg-serene-50 p-6 sm:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/app/psychologist"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-serene-500 hover:text-serene-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Workspace
        </Link>

        <header className="border-b border-serene-200 pb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-serene-900">
            Availability & Scheduling Rules
          </h1>
          <p className="text-xs text-serene-500 mt-1">
            Configure your active weekly consultation hours and block dates for holidays or personal leave.
          </p>
        </header>

        <AvailabilityManager
          initialRules={rules}
          initialExceptions={exceptions.map((e) => ({
            id: e.id,
            startDateTime: e.startDateTime.toISOString(),
            endDateTime: e.endDateTime.toISOString(),
            isUnavailable: e.isUnavailable,
            reason: e.reason,
          }))}
          initialTimezone={profile.timezone}
        />
      </div>
    </div>
  );
}
