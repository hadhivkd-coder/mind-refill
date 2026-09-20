import Link from "next/link";
import { Calendar, Users, Clock, Video, ShieldCheck, ArrowRight, CheckCircle2, Sparkles, Radio } from "lucide-react";
import { EventService } from "@/modules/events/services/event.service";
import { minorToMajorString } from "@/shared/types/money";

export const metadata = {
  title: "Clinical Workshops & Group Wellbeing Sessions | Mind Refill",
  description:
    "Interactive virtual workshops, clinician-led group discussions, and psychoeducational webinars designed to foster healing and connection on Mind Refill.",
};

export const dynamic = "force-dynamic";

const SAMPLE_EVENTS = [
  {
    id: "evt-1",
    slug: "mindful-stress-resilience-workshop",
    title: "Cultivating Nervous System Resilience: A Guided Interactive Workshop",
    description:
      "Join Dr. Sarah Jenkins for a live, highly practical guided workshop exploring the physiology of chronic stress and practical daily somatic stabilization exercises.",
    hostName: "Dr. Sarah Jenkins, Ph.D.",
    hostTitle: "Licensed Clinical Psychologist",
    hostSlug: "dr-sarah-jenkins",
    scheduledAt: "April 12, 2026 • 5:00 PM UTC",
    durationMinutes: 90,
    timezone: "UTC",
    capacity: 25,
    registeredCount: 14,
    priceMajor: "750.00",
    currency: "INR",
    status: "UPCOMING",
    deliveryMode: "Live Interactive Video (Zoom Cohort)",
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
    scheduledAt: "April 19, 2026 • 6:00 PM UTC",
    durationMinutes: 75,
    timezone: "UTC",
    capacity: 20,
    registeredCount: 11,
    priceMajor: "850.00",
    currency: "INR",
    status: "UPCOMING",
    deliveryMode: "Live Interactive Video (Zoom Cohort)",
  },
  {
    id: "evt-3",
    slug: "communication-for-couples-live-seminar",
    title: "De-escalating Chronic Relationship Conflict: Live Clinical Demonstration",
    description:
      "An open psychoeducational seminar for individuals and partners exploring non-defensive listening techniques, repair rituals, and attachment needs.",
    hostName: "Elena Vance, LMFT",
    hostTitle: "Couples & Family Specialist",
    hostSlug: "elena-vance",
    scheduledAt: "April 26, 2026 • 4:00 PM UTC",
    durationMinutes: 90,
    timezone: "UTC",
    capacity: 30,
    registeredCount: 19,
    priceMajor: "600.00",
    currency: "INR",
    status: "UPCOMING",
    deliveryMode: "Live Interactive Video (Zoom Cohort)",
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
          scheduledAt: new Date(e.startDateTimeUtc).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }),
          durationMinutes: 75,
          timezone: e.timezone || "UTC",
          capacity: e.maxCapacity,
          registeredCount: e.registeredCount,
          priceMajor: e.priceMajor,
          currency: e.currency,
          status: "UPCOMING",
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
    <main className="min-h-screen bg-cream-50 flex flex-col justify-between text-forest-950">
      {/* Navigation Header */}
      <header className="border-b border-sage-200/70 bg-white/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="h-10 w-10 rounded-2xl bg-forest-800 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:bg-forest-900 transition-colors">
              Ψ
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-forest-950 block leading-tight">
                Mind Refill
              </span>
              <span className="text-[10px] uppercase tracking-widest text-forest-600 font-semibold block">
                Psychology & Well-Being
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-forest-700">
            <Link href="/psychologists" className="hover:text-forest-950 transition-colors">
              Find a Psychologist
            </Link>
            <Link href="/resources" className="hover:text-forest-950 transition-colors">
              Clinical Resources
            </Link>
            <Link href="/ebooks" className="hover:text-forest-950 transition-colors">
              E-Books & Workbooks
            </Link>
            <Link href="/events" className="text-forest-950 font-bold border-b-2 border-forest-700 pb-1">
              Workshops & Events
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <Link
              href="/login"
              className="text-sm font-medium text-forest-800 hover:text-forest-950 px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/intake"
              className="text-xs sm:text-sm font-semibold bg-forest-800 hover:bg-forest-900 text-white px-5 py-2.5 rounded-2xl transition-all shadow-sm"
            >
              Get Guided Help
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white border-b border-sage-200/70 py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sage-100 border border-sage-200 text-forest-800 text-xs font-semibold shadow-2xs">
            <Users className="w-3.5 h-3.5 text-forest-600" />
            Community & Group Growth
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-forest-950 leading-tight">
            Learn, reflect, and grow — together.
          </h1>

          <p className="text-base sm:text-lg text-forest-700 max-w-2xl mx-auto leading-relaxed font-normal">
            Clinician-facilitated group cohorts, reflective seminars, and live skill-building workshops held in safe, confidential environments.
          </p>

          <div className="pt-2 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cream-100 border border-sage-200/80 text-forest-700 text-xs font-medium">
            <span className="h-2 w-2 rounded-full bg-forest-600 animate-pulse" />
            Preview Mode: Workshop seats are coordinated directly with facilitators.
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 flex-1 w-full">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-forest-800 text-white text-xs font-bold">
              Upcoming Workshops
            </span>
            <span className="px-3 py-1 rounded-xl bg-sage-100 text-forest-800 text-xs font-medium">
              Small Cohorts (Under 30 Participants)
            </span>
          </div>
          <span className="text-xs text-forest-600 font-medium">
            {events.length} sessions open for enrollment
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-3xl border border-sage-200/90 p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-forest-400 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Event Timing & Status Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage-50 text-forest-800 border border-sage-200 text-[10px] font-bold uppercase tracking-wider">
                    <Radio className="w-3 h-3 text-forest-600 animate-pulse" />
                    Live Virtual Cohort
                  </span>
                  <span className="text-[11px] text-forest-500 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {event.durationMinutes} mins
                  </span>
                </div>

                <h2 className="text-lg font-bold text-forest-950 leading-snug mb-2 group-hover:text-forest-800 transition-colors">
                  {event.title}
                </h2>

                <p className="text-xs sm:text-sm text-forest-700 leading-relaxed mb-6 line-clamp-3">
                  {event.description}
                </p>

                {/* Facilitator & Date Box */}
                <div className="p-4 rounded-2xl bg-cream-50/70 border border-sage-100 space-y-2 mb-6 text-xs text-forest-800">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-forest-600 shrink-0" />
                    <span className="font-semibold text-forest-950">{event.scheduledAt}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-forest-600 shrink-0" />
                    <span>Facilitated by {event.hostName}</span>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-4 border-t border-sage-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-forest-500 font-semibold block">
                    Cohort Fee
                  </span>
                  <span className="text-base font-extrabold text-forest-950">
                    ₹{event.priceMajor}
                  </span>
                </div>

                <Link
                  href="/intake"
                  className="py-2.5 px-5 bg-forest-800 hover:bg-forest-900 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                >
                  Reserve Cohort Seat &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Community Cohort Guarantee Banner */}
        <div className="mt-16 bg-sage-100/70 border border-sage-200/80 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-xs">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-white flex items-center justify-center text-forest-700 shrink-0 shadow-2xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-forest-950">Psychologically Safe & Confidential</h3>
              <p className="text-xs text-forest-700 mt-0.5">
                Cohort sizes are strictly capped so every attendee has room to listen, reflect, or share without feeling lost in a crowd.
              </p>
            </div>
          </div>
          <Link
            href="/psychologists"
            className="text-xs font-semibold text-forest-800 hover:text-forest-950 shrink-0 underline"
          >
            Meet Workshop Facilitators &rarr;
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-sage-200/60 bg-white py-8 text-center text-xs text-forest-600">
        <p>© {new Date().getFullYear()} Mind Refill. Clinical workshops and group growth.</p>
      </footer>
    </main>
  );
}
