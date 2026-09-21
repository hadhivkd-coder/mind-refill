import { enforcePageRole } from "@/modules/authorization/page-guard";
import { UserRole } from "@prisma/client";
import { IntakeService } from "@/modules/intake/services/intake.service";
import Link from "next/link";
import { ArrowLeft, Calendar, HeartHandshake, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClientRequestsPage() {
  const session = await enforcePageRole(UserRole.CLIENT);
  const requests = await IntakeService.getClientRequests(session.user.id);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW":
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-200 border border-blue-500/30">Received & Awaiting Triage</span>;
      case "CONTACTED":
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-200 border border-indigo-500/30">Coordinator Contacted</span>;
      case "INTAKE_COMPLETED":
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-200 border border-purple-500/30">Intake Completed</span>;
      case "MATCHING":
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-200 border border-amber-500/30">Matching with Psychologist</span>;
      case "PSYCHOLOGIST_SELECTED":
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-teal-500/20 text-teal-200 border border-teal-500/30">Psychologist Selected</span>;
      case "AVAILABILITY_CONFIRMED":
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-200 border border-emerald-500/30">Availability Confirmed</span>;
      case "PAYMENT_PENDING":
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-200 border border-orange-500/30">Payment Pending</span>;
      case "BOOKED":
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-200 border border-green-500/30">Session Booked</span>;
      case "COMPLETED":
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-[#F1EBDD] border border-white/15">Completed</span>;
      case "CLOSED":
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-[#9CAF91]">Closed</span>;
      case "CANCELLED":
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-rose-500/20 text-rose-200 border border-rose-500/30">Cancelled</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-[#F1EBDD]">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#173C32] text-[#F7F3E9] selection:bg-[#3F6855] selection:text-[#F1EBDD] p-4 sm:p-8 lg:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link
            href="/app/client"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9CAF91] hover:text-[#F1EBDD] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Client Sanctuary</span>
          </Link>
          <Link
            href="/intake"
            className="px-5 py-2.5 bg-[#F1EBDD] hover:bg-white text-[#173C32] text-xs font-semibold rounded-full transition-all shadow-sm active:scale-95"
          >
            + New Care Request
          </Link>
        </div>

        <header className="border-b border-white/10 pb-5">
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#F7F3E9]">
            My Care Requests
          </h1>
          <p className="text-xs text-[#C9D2BC] mt-1 font-light">
            Track the status of your care coordination and psychologist matching in real-time.
          </p>
        </header>

        {requests.length === 0 ? (
          <div className="atmospheric-card rounded-3xl border border-white/10 p-12 text-center shadow-lg bg-[#122C25]/80">
            <HeartHandshake className="w-12 h-12 text-[#9CAF91] mx-auto mb-3 opacity-60" />
            <h2 className="font-serif text-xl text-[#F7F3E9]">No active care requests</h2>
            <p className="text-xs text-[#C9D2BC] mt-1.5 max-w-md mx-auto leading-relaxed font-light">
              When you submit a guided matching request or need assistance selecting a therapist, our care team guides every step.
            </p>
            <div className="mt-6">
              <Link
                href="/intake"
                className="px-6 py-2.5 bg-[#F1EBDD] text-[#173C32] text-xs font-semibold rounded-full shadow-md transition-all active:scale-95 inline-block"
              >
                Start Guided Intake
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="atmospheric-card rounded-2xl border border-white/10 p-6 shadow-md hover:border-[#9CAF91]/50 transition-all bg-[#122C25]/85"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-[#F1EBDD] uppercase tracking-wider">
                        {req.isDirectBookingRequest ? "Direct Booking Request" : "Guided Matching Request"}
                      </span>
                      <span className="text-xs text-white/30">•</span>
                      <span className="text-xs text-[#9CAF91] flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(req.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="font-serif text-lg text-[#F7F3E9]">
                      {req.targetPsychologist
                        ? `Clinician: ${req.targetPsychologist.fullName} (${req.targetPsychologist.professionalTitle})`
                        : "General Clinical Care Coordination Pool"}
                    </div>
                  </div>
                  <div>{getStatusBadge(req.status)}</div>
                </div>

                <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[#9CAF91] font-semibold uppercase tracking-wider text-[10px] block mb-1">
                      Areas of Concern
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {req.intakeResponse?.concernCategories.map((cat, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#C9D2BC] text-[11px]"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[#9CAF91] font-semibold uppercase tracking-wider text-[10px] block mb-1">
                      Preferred Delivery & Format
                    </span>
                    <p className="text-[#C9D2BC] font-light">
                      {req.intakeResponse?.preferredTimeWindows?.sessionPreference === "IN_PERSON"
                        ? "In-Person Clinic Visit"
                        : "Online Video Consultation"}
                      {req.intakeResponse?.preferredTimeWindows?.times?.length ? (
                        <> • {req.intakeResponse.preferredTimeWindows.times.join(", ")}</>
                      ) : null}
                    </p>
                  </div>
                </div>

                {req.intakeResponse?.isEscalated && (
                  <div className="mt-4 bg-amber-500/15 border border-amber-500/30 rounded-xl p-3 flex items-center gap-2 text-xs text-amber-200">
                    <AlertCircle className="w-4 h-4 text-amber-300 shrink-0" />
                    <span>This request is flagged for priority coordinator contact.</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
