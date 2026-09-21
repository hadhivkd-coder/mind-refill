import { enforcePageRole } from "@/modules/authorization/page-guard";
import { UserRole } from "@prisma/client";
import { AvailabilityService } from "@/modules/scheduling/services/availability.service";
import { ProfileService } from "@/modules/profiles/services/profile.service";
import { AvailabilityManager } from "./availability-manager";
import Link from "next/link";
import { ArrowLeft, Calendar, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PsychologistAvailabilityPage() {
  const session = await enforcePageRole(UserRole.PSYCHOLOGIST);

  let profile: any = null;
  let rules: any[] = [];
  let exceptions: any[] = [];

  try {
    profile = await ProfileService.getPrivateProfileByUserId(session.user.id);
    const avail = await AvailabilityService.getPsychologistAvailability(profile.id);
    rules = avail.rules;
    exceptions = avail.exceptions;
  } catch (err) {
    console.error("Error loading availability data:", err);
    profile = {
      id: `prof-${session.user.id}`,
      timezone: "UTC",
    };
    rules = [1, 2, 3, 4, 5].map((d) => ({
      id: `rule-${d}`,
      dayOfWeek: d,
      startTimeUtc: "09:00",
      endTimeUtc: "17:00",
      isActive: true,
    }));
    exceptions = [];
  }

  return (
    <div className="min-h-screen bg-[#173C32] text-[#F7F3E9] selection:bg-[#3F6855] selection:text-[#F1EBDD] p-6 sm:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/app/psychologist"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9CAF91] hover:text-[#F1EBDD] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Practitioner Workspace</span>
        </Link>

        <header className="border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#9CAF91]" />
            <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#F7F3E9]">
              Availability & Scheduling Rules
            </h1>
          </div>
          <p className="text-xs text-[#C9D2BC] mt-1 font-light">
            Configure your active weekly consultation hours and block dates for personal leave.
          </p>
        </header>

        <div className="atmospheric-card rounded-3xl p-6 sm:p-8">
          <AvailabilityManager
            initialRules={rules}
            initialExceptions={exceptions.map((e) => ({
              id: e.id,
              startDateTime: e.startDateTime ? (typeof e.startDateTime === "string" ? e.startDateTime : e.startDateTime.toISOString()) : new Date().toISOString(),
              endDateTime: e.endDateTime ? (typeof e.endDateTime === "string" ? e.endDateTime : e.endDateTime.toISOString()) : new Date().toISOString(),
              isUnavailable: e.isUnavailable,
              reason: e.reason,
            }))}
            initialTimezone={profile?.timezone || "UTC"}
          />
        </div>
      </div>
    </div>
  );
}
