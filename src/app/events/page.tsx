import Link from "next/link";
import { Calendar, Users, Clock, Video, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import { EventService } from "@/modules/events/services/event.service";
import { minorToMajorString } from "@/shared/types/money";

export const metadata = {
  title: "Clinical Workshops & Group Wellbeing Sessions | Mind Refill",
  description:
    "Interactive virtual workshops, clinician-led group discussions, and psychoeducational webinars designed to foster healing and community on Mind Refill.",
};

export const dynamic = "force-dynamic";

const SAMPLE_EVENTS = [
  {
    id: "evt-1",
    slug: "mindful-stress-resilience-workshop",
    title: "Cultivating Nervous System Resilience: A 90-Minute Interactive Workshop",
    description:
      "Join Dr. Sarah Jenkins for a live, highly practical guided workshop exploring the physiology of chronic stress and practical daily somatic stabilization exercises.",
    hostName: "Dr. Sarah Jenkins, Ph.D.",
    hostTitle: "Licensed Clinical Psychologist",
    hostSlug: "dr-sarah-jenkins",
    scheduledAt: "2026-04-12T17:00:00.000Z",
    durationMinutes: 90,
    timezone: "UTC",
    capacity: 25,
    registeredCount: 14,
    priceMajor: "750.00",
    currency: "INR",
    deliveryMode: "Live Video (Zoom Interactive)",
  },
  {
    id: "evt-2",
    slug: "imposter-syndrome-career-burnout-circle",
    title: "Navigating Workplace Imposter Phenomenon & Burnout in Demanding Careers",
    description:
      "A clinician-facilitated group session examining high-achiever perfectionism, boundary setting, and guilt-free downtime with structured peer breakout discussions.",
    hostName: "Dr. Marcus Thorne, Psy.D.",
    hostTitle: "Executive Performance & Clinical Psychologist",
    hostSlug: "dr-marcus-thorne",
    scheduledAt: "2026-04-19T18:00:00.000Z",
    durationMinutes: 75,
    timezone: "UTC",
    capacity: 20,
    registeredCount: 11,
    priceMajor: "850.00",
    currency: "INR",
    deliveryMode: "Live Video (Zoom Interactive)",
  },
  {
    id: "evt-3",
    slug: "communication-for-couples-live-seminar",
    title: "De-escalating Chronic Relationship Conflict: Live Demonstration & Q&A",
    description:
      "An open psychoeducational seminar for individuals and partners exploring non-defensive listening techniques and repair rituals.",
    hostName: "Elena Vance, LMFT",
    hostTitle: "Couples & Family Specialist",
    hostSlug: "elena-vance",
    scheduledAt: "2026-04-26T16:00:00.000Z",
    durationMinutes: 90,
    timezone: "UTC",
    capacity: 30,
    registeredCount: 19,
    priceMajor: "600.00",
    currency: "INR",
    deliveryMode: "Live Video (Zoom Interactive)",
  },
];

export default async function EventsPage() {
  let events: any[] = [];

  try {
    const dbEvents = await EventService.listPublicEvents();
    if (dbEvents && dbEvents.length > 0) {
      events = dbEvents.map((e: any) => {
        return {
          id: e.id,
          slug: e.slug,
          title: e.title,
          description: e.description,
          hostName: e.host?.name || "Verified Specialist",
          hostTitle: e.host?.title || "Licensed Psychologist",
          hostSlug: e.host?.slug || "",
          scheduledAt: e.startDateTimeUtc,
          durationMinutes: 75,
          timezone: e.timezone || "UTC",
          capacity: e.maxCapacity,
          registeredCount: e.registeredCount,
          priceMajor: e.priceMajor,
          currency: e.currency,
          deliveryMode: "Live Interactive Video",
        };
      });
    } else {
      events = SAMPLE_EVENTS;
    }
  } catch {
    events = SAMPLE_EVENTS;
  }

  return (
    <main className="min-h-screen bg-cream-50 flex flex-col justify-between">
      {/* Navigation Header */}
      <header className="border-b border-sage-200/70 bg-white/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="h-9 w-9 rounded-xl bg-forest-700 flex items-center justify-center text-white font-semibold shadow-sm group-hover:bg-forest-800 transition-colors">
              Ψ
            </div>
            <span className="font-semibold text-lg tracking-tight text-forest-950">
              Mind Refill
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-forest-700">
            <Link href="/psychologists" className="hover:text-forest-950 transition-colors">
              Find a Psychologist
            </Link>
            <Link href="/resources" className="hover:text-forest-950 transition-colors">
              Resources
            </Link>
            <Link href="/ebooks" className="hover:text-forest-950 transition-colors">
              E-Books
            </Link>
            <Link href="/events" className="text-forest-950 font-semibold border-b-2 border-forest-600 pb-0.5">
              Workshops & Events
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <Link
              href="/login"
              className="text-sm font-medium text-forest-800 hover:text-forest-950 px-3 py-1.5"
            >
              Sign In
            </Link>
            <Link
              href="/intake"
              className="text-sm font-medium bg-forest-700 hover:bg-forest-800 text-white px-4 py-2 rounded-xl transition-colors shadow-sm"
            >
              Get Matched
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white border-b border-sage-200/70 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sage-100 border border-sage-200 text-forest-800 text-xs font-semibold mb-4">
            <Calendar className="w-3.5 h-3.5 text-forest-600" />
            Live Group Psychoeducation
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-forest-950 leading-tight">
            Learn, reflect, and grow in compassionate company.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-forest-700 max-w-2xl mx-auto leading-relaxed">
            Live interactive workshops and clinical group discussions led by licensed psychologists. Safe, moderated, and focused on practical psychological tools.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cream-100 border border-sage-200/80 text-forest-700 text-xs font-medium">
            <span className="h-2 w-2 rounded-full bg-forest-600 animate-pulse" />
            Preview Launch: Payment processing is on hold. Workshop reservations are facilitated directly without upfront billing.
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        {events.length === 0 ? (
          <div className="bg-white rounded-3xl border border-sage-200 p-12 text-center max-w-md mx-auto my-12 shadow-sm">
            <div className="h-12 w-12 mx-auto rounded-2xl bg-sage-50 flex items-center justify-center text-forest-400 mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-forest-950">No upcoming workshops right now</h2>
            <p className="text-xs text-forest-600 mt-2 leading-relaxed">
              New clinician-led workshops are announced on a bi-weekly basis. Explore individual therapy sessions in our directory in the meantime.
            </p>
            <div className="mt-6">
              <Link
                href="/psychologists"
                className="inline-flex items-center gap-1.5 py-2 px-4 bg-forest-700 text-white text-xs font-semibold rounded-xl hover:bg-forest-800 transition-colors"
              >
                Explore Psychologist Directory
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => {
              const spotsLeft = Math.max(0, event.capacity - event.registeredCount);
              const isNearlyFull = spotsLeft <= 5 && spotsLeft > 0;
              const dateObj = new Date(event.scheduledAt);
              const formattedDate = dateObj.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              });
              const formattedTime = dateObj.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={event.id}
                  className="bg-white rounded-3xl border border-sage-200/80 p-6 sm:p-7 shadow-sm hover:shadow-md hover:border-forest-400 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Event Timing Badge */}
                    <div className="flex items-center justify-between gap-2 text-xs font-semibold text-forest-700 mb-4">
                      <span className="px-3 py-1 rounded-full bg-forest-50 border border-forest-100 text-forest-900">
                        {formattedDate} • {formattedTime} {event.timezone}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-forest-500 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {event.durationMinutes} min
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-forest-950 leading-snug mb-2">
                      {event.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-forest-700 leading-relaxed line-clamp-3 mb-5">
                      {event.description}
                    </p>

                    <div className="space-y-2 mb-6 text-xs text-forest-700">
                      <div className="flex items-center gap-2">
                        <Video className="w-3.5 h-3.5 text-forest-600 shrink-0" />
                        <span>{event.deliveryMode}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-forest-600 shrink-0" />
                        <span>Small cohort (limited to {event.capacity} participants)</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 border-t border-sage-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-lg font-extrabold text-forest-950">
                          ₹{event.priceMajor}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-semibold ${
                          isNearlyFull ? "text-amber-700" : "text-forest-500"
                        }`}
                      >
                        {spotsLeft > 0 ? `${spotsLeft} spots remaining` : "Session Full"}
                      </span>
                    </div>

                    <Link
                      href={`/login?redirect=/app/client/events`}
                      className="inline-flex items-center gap-2 py-2.5 px-5 bg-forest-700 hover:bg-forest-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
                    >
                      <span>Reserve Spot</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Safe Space Reassurance */}
        <div className="mt-16 bg-sage-100/70 border border-sage-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center text-forest-700 shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-forest-950">Confidential & Moderated Spaces</h3>
              <p className="text-xs text-forest-700 mt-0.5">
                Every attendee adheres to strict group privacy agreements. Cameras are encouraged but participation is always voluntary.
              </p>
            </div>
          </div>
          <Link
            href="/intake"
            className="text-xs font-semibold text-forest-800 hover:text-forest-950 shrink-0 underline"
          >
            Prefer 1-on-1 counseling? &rarr;
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-sage-200/60 bg-white py-8 text-center text-xs text-forest-600">
        <p>© {new Date().getFullYear()} Mind Refill. Live clinical workshops and interactive group psychoeducation.</p>
      </footer>
    </main>
  );
}
