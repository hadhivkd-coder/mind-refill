import { enforcePageRole } from "@/modules/authorization/page-guard";
import { UserRole } from "@prisma/client";
import { AppointmentService } from "@/modules/scheduling/services/appointment.service";
import Link from "next/link";
import { ArrowLeft, Calendar, Video, MapPin, Clock, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClientAppointmentsPage() {
  const session = await enforcePageRole(UserRole.CLIENT);
  const { upcoming, past } = await AppointmentService.getClientAppointments(session.user.id);

  return (
    <div className="min-h-screen bg-serene-50 p-6 sm:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/app/client"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-serene-500 hover:text-serene-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Client Portal
          </Link>
          <Link
            href="/psychologists"
            className="px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
          >
            Book New Session
          </Link>
        </div>

        <header className="border-b border-serene-200 pb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-serene-900">
            My Appointments
          </h1>
          <p className="text-xs text-serene-500 mt-1">
            Manage your upcoming therapy sessions, view meeting links, or review past consultation history.
          </p>
        </header>

        {/* 1. Upcoming Appointments */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-serene-600">
            Upcoming Sessions ({upcoming.length})
          </h2>

          {upcoming.length === 0 ? (
            <div className="bg-white rounded-3xl border border-serene-200 p-8 text-center shadow-sm">
              <Calendar className="w-10 h-10 text-serene-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-serene-900">No Upcoming Sessions</h3>
              <p className="text-xs text-serene-500 mt-1">
                You do not have any counseling appointments confirmed right now.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-white rounded-2xl border border-serene-200 p-6 shadow-sm hover:border-brand-400 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-brand-700 uppercase tracking-wider">
                        {apt.service.name}
                      </span>
                      <span className="text-xs text-serene-400">•</span>
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        {apt.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-serene-900">
                      Session with {apt.psychologist.fullName}
                    </h3>
                    <p className="text-xs text-serene-500">{apt.psychologist.professionalTitle}</p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-serene-600 pt-1">
                      <span className="flex items-center gap-1 font-semibold text-serene-900">
                        <Calendar className="w-3.5 h-3.5 text-brand-600" />
                        {new Date(apt.startTime).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-serene-400" />
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
                      <span className="flex items-center gap-1">
                        {apt.deliveryType === "ONLINE_VIDEO" ? (
                          <>
                            <Video className="w-3.5 h-3.5 text-brand-600" /> Online Video
                          </>
                        ) : (
                          <>
                            <MapPin className="w-3.5 h-3.5 text-brand-600" /> In-Person Clinic
                          </>
                        )}
                      </span>
                    </div>

                    {apt.meetingDetails && (
                      <div className="mt-3 p-3 rounded-xl bg-brand-50/70 border border-brand-200 text-xs text-brand-900 font-medium">
                        Meeting Link: <a href={apt.meetingDetails} target="_blank" rel="noreferrer" className="underline font-bold">{apt.meetingDetails}</a>
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
          <section className="space-y-4 pt-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-serene-600">
              Past Consultation History ({past.length})
            </h2>

            <div className="bg-white rounded-3xl border border-serene-200 shadow-sm overflow-hidden divide-y divide-serene-100">
              {past.map((apt) => (
                <div key={apt.id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-serene-900">
                      {apt.psychologist.fullName} &mdash; {apt.service.name}
                    </div>
                    <div className="text-serene-500 text-[11px] mt-0.5">
                      {new Date(apt.startTime).toLocaleDateString()} at{" "}
                      {new Date(apt.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full font-semibold bg-serene-100 text-serene-700">
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
