import { enforcePageRole } from "@/modules/authorization/page-guard";
import { UserRole } from "@prisma/client";
import { EventService } from "@/modules/events/services/event.service";
import Link from "next/link";
import { ArrowLeft, Calendar, Video, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClientEventsPage() {
  const session = await enforcePageRole(UserRole.CLIENT);
  const registrations = await EventService.getClientEvents(session.user.id);

  return (
    <div className="min-h-screen bg-serene-50 p-6 sm:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link
          href="/app/client"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-serene-500 hover:text-serene-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Client Portal
        </Link>

        <header className="border-b border-serene-200 pb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-brand-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-serene-900">
              Registered Workshops & Events
            </h1>
          </div>
          <p className="text-xs text-serene-500 mt-1">
            Track your upcoming psychoeducational workshops, group counseling webinars, and access join details.
          </p>
        </header>

        {registrations.length === 0 ? (
          <div className="bg-white rounded-3xl border border-serene-200 p-12 text-center space-y-3">
            <Calendar className="w-8 h-8 text-serene-300 mx-auto" />
            <h2 className="text-sm font-bold text-serene-800">No active workshop registrations</h2>
            <p className="text-xs text-serene-500 max-w-sm mx-auto">
              You have not registered for any group workshops or clinical webinars yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {registrations.map((r) => (
              <div
                key={r.registrationId}
                className="bg-white rounded-3xl border border-serene-200 p-6 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-brand-700">
                      Hosted by {r.event.hostName}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">
                      CONFIRMED
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-serene-900">{r.event.title}</h3>
                  <p className="text-xs text-serene-500 line-clamp-3">{r.event.description}</p>
                </div>

                <div className="border-t border-serene-100 pt-4 space-y-2 text-xs text-serene-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-serene-400" />
                    <span>
                      {new Date(r.event.startDateTimeUtc).toLocaleDateString()} at{" "}
                      {new Date(r.event.startDateTimeUtc).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      ({r.event.timezone})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-brand-700 font-medium">
                    <Video className="w-3.5 h-3.5" />
                    <span>Online Video Room details sent to email prior to event</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
