import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Calendar, Users, Clock, ShieldCheck, ArrowRight, Radio, Sparkles } from "lucide-react";
import { EventService } from "@/modules/events/services/event.service";

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
      "Join Dr. Sarah Jenkins for a live, practical guided workshop exploring the physiology of chronic stress and actionable somatic stabilization rituals.",
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
      "An open psychoeducational seminar for individuals and partners exploring non-defensive listening techniques, repair rituals, and attachment attunement.",
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
    <div className="min-h-screen flex flex-col bg-[#173C32] text-[#F7F3E9] selection:bg-[#3F6855] selection:text-[#F1EBDD]">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="pt-14 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#173C32] via-[#1C473C] to-[#244F42] border-b border-white/5 text-center">
          <div className="max-w-4xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#C9D2BC]">
              <Users className="w-3.5 h-3.5 text-[#9CAF91]" />
              <span>Community Cohorts & Guided Groups</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-normal text-[#F7F3E9] leading-tight">
              Learn, reflect, and grow — together.
            </h1>

            <p className="text-sm sm:text-base text-[#C9D2BC] max-w-2xl mx-auto font-light leading-relaxed">
              Clinician-facilitated group cohorts, reflective seminars, and live skill-building workshops held in confidential, safe spaces.
            </p>

            <div className="pt-2 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#C9D2BC] text-xs font-medium">
              <span className="h-2 w-2 rounded-full bg-[#9CAF91] animate-pulse" />
              <span>Intimate cohorts strictly capped under 30 participants.</span>
            </div>
          </div>
        </section>

        {/* Events Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 flex-1 w-full">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1 rounded-full bg-[#F1EBDD] text-[#173C32] text-xs font-semibold">
                Upcoming Cohorts
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#C9D2BC] text-xs font-medium">
                Live Interactive Zoom
              </span>
            </div>
            <span className="text-xs text-[#9CAF91] font-medium">
              {events.length} sessions open for enrollment
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <div
                key={event.id}
                className="atmospheric-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between group hover:border-[#9CAF91]/50 transition-all"
              >
                <div>
                  {/* Event Timing & Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3F6855]/30 text-[#F1EBDD] border border-white/10 text-[10px] font-semibold uppercase tracking-wider">
                      <Radio className="w-3 h-3 text-[#9CAF91] animate-pulse" />
                      Live Virtual Cohort
                    </span>
                    <span className="text-[11px] text-[#C9D2BC] font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#9CAF91]" />
                      {event.durationMinutes} mins
                    </span>
                  </div>

                  <h2 className="font-serif text-xl font-normal text-[#F7F3E9] leading-snug mb-3 group-hover:text-[#F1EBDD] transition-colors">
                    {event.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-[#C9D2BC] leading-relaxed mb-6 font-light line-clamp-3">
                    {event.description}
                  </p>

                  {/* Facilitator & Date Box */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 mb-6 text-xs text-[#C9D2BC]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#9CAF91] shrink-0" />
                      <span className="font-medium text-[#F7F3E9]">{event.scheduledAt}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-[#9CAF91] shrink-0" />
                      <span>Facilitated by <strong className="text-[#F7F3E9] font-medium">{event.hostName}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="pt-5 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#9CAF91] font-semibold block">
                      Cohort Fee
                    </span>
                    <span className="text-base font-serif font-normal text-[#F7F3E9]">
                      ₹{event.priceMajor}
                    </span>
                  </div>

                  <Link
                    href="/intake"
                    className="py-2.5 px-5 bg-[#F1EBDD] hover:bg-white text-[#173C32] text-xs font-semibold rounded-full shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <span>Reserve Seat</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Safety & Confidentiality Banner */}
          <div className="mt-16 atmospheric-card rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#F1EBDD] shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#F7F3E9]">Psychologically Safe & Strictly Confidential</h3>
                <p className="text-xs text-[#C9D2BC] mt-0.5 font-light">
                  Cohort sizes are limited so every participant has room to listen, reflect, or share in comfort.
                </p>
              </div>
            </div>
            <Link
              href="/psychologists"
              className="text-xs font-semibold text-[#F1EBDD] hover:text-white shrink-0 underline underline-offset-4 flex items-center gap-1"
            >
              <span>Meet Facilitators</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
