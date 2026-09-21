import { enforcePageRole } from "@/modules/authorization/page-guard";
import { UserRole } from "@prisma/client";
import { AppointmentService } from "@/modules/scheduling/services/appointment.service";
import Link from "next/link";
import { ArrowLeft, Calendar, Video, MapPin, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClientAppointmentsPage() {
  const session = await enforcePageRole(UserRole.CLIENT);
  const { upcoming, past } = await AppointmentService.getClientAppointments(session.user.id);

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
            href="/psychologists"
            className="px-5 py-2.5 bg-[#F1EBDD] hover:bg-white text-[#173C32] text-xs font-semibold rounded-full transition-all shadow-sm active:scale-95"
          >
            Book New Session
          </Link>
        </div>

        <header className="border-b border-white/10 pb-5">
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#F7F3E9]">
            My Scheduled Appointments
          </h1>
          <p className="text-xs text-[#C9D2BC] mt-1 font-light">
            Manage your therapy sessions, join private encrypted video rooms, or review past consultation history.
          </p>
        </header>

        {/* 1. Upcoming Appointments */}
        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#9CAF91]">
            Upcoming Sessions ({upcoming.length})
          </h2>

          {upcoming.length === 0 ? (
            <div className="atmospheric-card rounded-3xl border border-white/10 p-10 text-center shadow-lg bg-[#122C25]/80">
              <Calendar className="w-10 h-10 text-[#9CAF91] mx-auto mb-3 opacity-60" />
              <h3 className="font-serif text-lg text-[#F7F3E9]">No upcoming sessions scheduled</h3>
              <p className="text-xs text-[#C9D2BC] mt-1 font-light max-w-sm mx-auto">
                When you feel ready to speak with a licensed psychologist, our care team is here to support you.
              </p>
              <Link
                href="/psychologists"
                className="inline-block mt-4 px-5 py-2 rounded-full bg-[#F1EBDD] text-[#173C32] text-xs font-semibold"
              >
                Find a Clinician
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {upcoming.map((apt) => (
                <div
                  key={apt.id}
                  className="atmospheric-card rounded-2xl border border-white/10 p-6 shadow-md hover:border-[#9CAF91]/50 transition-all bg-[#122C25]/85"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#F1EBDD] uppercase tracking-wider">
                        {apt.service.name}
                      </span>
                      <span className="text-xs text-white/30">•</span>
                      <span className="text-xs font-semibold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                        {apt.status}
                      </span>
                    </div>

                    <h3 className="font-serif text-xl font-normal text-[#F7F3E9]">
                      Session with {apt.psychologist.fullName}
                    </h3>
                    <p className="text-xs text-[#C9D2BC] font-light">{apt.psychologist.professionalTitle}</p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-[#C9D2BC] pt-2">
                      <span className="flex items-center gap-1.5 font-medium text-[#F7F3E9]">
                        <Calendar className="w-4 h-4 text-[#9CAF91]" />
                        {new Date(apt.startTime).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-[#9CAF91]" />
                        {new Date(apt.startTime).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        &ndash;{" "}
                        {new Date(apt.endTime).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        {apt.deliveryType === "ONLINE_VIDEO" ? (
                          <>
                            <Video className="w-4 h-4 text-[#9CAF91]" /> Encrypted Video Room
                          </>
                        ) : (
                          <>
                            <MapPin className="w-4 h-4 text-[#9CAF91]" /> In-Person Consultation
                          </>
                        )}
                      </span>
                    </div>

                    {apt.meetingDetails && (
                      <div className="mt-3 p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-[#F1EBDD]">
                        Video Room Link:{" "}
                        <a
                          href={apt.meetingDetails}
                          target="_blank"
                          rel="noreferrer"
                          className="underline font-semibold text-[#F1EBDD] hover:text-white"
                        >
                          {apt.meetingDetails}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 2. Past Appointments */}
        {past.length > 0 && (
          <section className="space-y-4 pt-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#9CAF91]">
              Past Consultation History ({past.length})
            </h2>

            <div className="atmospheric-card rounded-3xl border border-white/10 shadow-sm divide-y divide-white/10 bg-[#122C25]/80">
              {past.map((apt) => (
                <div key={apt.id} className="p-4 sm:p-5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-serif text-base text-[#F7F3E9]">
                      {apt.psychologist.fullName} &mdash; {apt.service.name}
                    </div>
                    <div className="text-[#9CAF91] text-[11px] mt-0.5">
                      {new Date(apt.startTime).toLocaleDateString()} at{" "}
                      {new Date(apt.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full font-medium text-xs bg-white/5 border border-white/10 text-[#C9D2BC]">
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
