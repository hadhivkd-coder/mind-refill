import { enforcePageRole } from "@/modules/authorization/page-guard";
import { UserRole } from "@prisma/client";
import { AppointmentService } from "@/modules/scheduling/services/appointment.service";
import Link from "next/link";
import { ArrowLeft, Calendar, Video, MapPin, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CoordinatorAppointmentsPage() {
  const session = await enforcePageRole(UserRole.COORDINATOR);
  const data = await AppointmentService.getCoordinatorAppointments(session);

  return (
    <div className="min-h-screen bg-serene-50 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/app/coordinator"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-serene-500 hover:text-serene-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Operations
          </Link>
          <div className="text-xs text-serene-500">
            Pending Coordination: <strong className="text-serene-900">{data.pendingSchedulingCount}</strong>
          </div>
        </div>

        <header className="border-b border-serene-200 pb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-serene-900">
            Appointments & Calendar Oversight
          </h1>
          <p className="text-xs text-serene-500 mt-1">
            Track daily counseling sessions across all active clients and psychologists.
          </p>
        </header>

        {/* 1. Today's Sessions */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-serene-700 flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-700" />
            Today&apos;s Sessions ({data.today.length})
          </h2>

          <div className="bg-white rounded-3xl border border-serene-200 shadow-sm overflow-hidden divide-y divide-serene-100">
            {data.today.length === 0 ? (
              <p className="text-xs text-serene-400 p-8 text-center">
                No counseling sessions scheduled for today.
              </p>
            ) : (
              data.today.map((apt) => (
                <div key={apt.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-sm text-serene-900">
                      {apt.client.fullName} &harr; {apt.psychologist.fullName}
                    </div>
                    <div className="text-serene-500">
                      {apt.service.name} • {apt.deliveryType === "ONLINE_VIDEO" ? "Video" : "In-Person"}
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-brand-800">
                    {new Date(apt.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} &ndash;{" "}
                    {new Date(apt.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 2. Upcoming Sessions */}
        <section className="space-y-4 pt-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-serene-700 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-700" />
            Upcoming Confirmed Sessions ({data.upcoming.length})
          </h2>

          <div className="bg-white rounded-3xl border border-serene-200 shadow-sm overflow-hidden divide-y divide-serene-100">
            {data.upcoming.length === 0 ? (
              <p className="text-xs text-serene-400 p-8 text-center">
                No future confirmed appointments found.
              </p>
            ) : (
              data.upcoming.map((apt) => (
                <div key={apt.id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-serene-900">
                      {apt.client.fullName} &harr; {apt.psychologist.fullName}
                    </div>
                    <div className="text-serene-500 text-[11px] mt-0.5">
                      {new Date(apt.startTime).toLocaleDateString()} at{" "}
                      {new Date(apt.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {apt.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
