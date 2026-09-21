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
            href="/events"
            className="px-5 py-2.5 bg-[#F1EBDD] hover:bg-white text-[#173C32] text-xs font-semibold rounded-full transition-all shadow-sm active:scale-95"
          >
            Browse Workshops
          </Link>
        </div>

        <header className="border-b border-white/10 pb-5">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-[#9CAF91]" />
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#F7F3E9]">
              Registered Workshops & Circles
            </h1>
          </div>
          <p className="text-xs text-[#C9D2BC] mt-1 font-light">
            Track your upcoming psychoeducational workshops, group counseling webinars, and access join details.
          </p>
        </header>

        {registrations.length === 0 ? (
          <div className="atmospheric-card rounded-3xl border border-white/10 p-12 text-center space-y-3 bg-[#122C25]/80 shadow-lg">
            <Calendar className="w-10 h-10 text-[#9CAF91] mx-auto opacity-60" />
            <h2 className="font-serif text-xl text-[#F7F3E9]">No active workshop registrations</h2>
            <p className="text-xs text-[#C9D2BC] max-w-sm mx-auto font-light leading-relaxed">
              You have not registered for any group workshops or clinical webinars yet.
            </p>
            <div className="pt-3">
              <Link
                href="/events"
                className="px-6 py-2.5 bg-[#F1EBDD] text-[#173C32] text-xs font-semibold rounded-full shadow-md transition-all active:scale-95 inline-block"
              >
                Browse Upcoming Cohorts
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {registrations.map((r) => (
              <div
                key={r.registrationId}
                className="atmospheric-card rounded-3xl border border-white/10 p-6 shadow-md flex flex-col justify-between space-y-4 bg-[#122C25]/85 hover:border-[#9CAF91]/50 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-[#9CAF91]">
                      Hosted by {r.event.hostName}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      CONFIRMED
                    </span>
                  </div>
                  <h3 className="font-serif text-xl font-normal text-[#F7F3E9]">{r.event.title}</h3>
                  <p className="text-xs text-[#C9D2BC] font-light line-clamp-3 leading-relaxed">
                    {r.event.description}
                  </p>
                </div>

                <div className="border-t border-white/10 pt-4 space-y-2 text-xs text-[#C9D2BC] font-light">
                  <div className="flex items-center gap-2 text-[#F7F3E9]">
                    <Clock className="w-4 h-4 text-[#9CAF91]" />
                    <span>
                      {new Date(r.event.startDateTimeUtc).toLocaleDateString()} at{" "}
                      {new Date(r.event.startDateTimeUtc).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      ({r.event.timezone})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[#F1EBDD]">
                    <Video className="w-4 h-4 text-[#9CAF91]" />
                    <span>Encrypted video link sent to email prior to circle</span>
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
