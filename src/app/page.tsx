import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import {
  ShieldCheck,
  HeartHandshake,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Compass,
  Smile,
  Moon,
  Users,
  Feather,
  ChevronRight,
  BookOpen,
} from "lucide-react";

export const metadata = {
  title: "Mind Refill | You don't have to figure it all out alone",
  description:
    "A calm, immersive sanctuary to understand, heal, and grow — connecting you with qualified, compassionate psychologists.",
};

const FEATURED_PSYCHOLOGISTS = [
  {
    id: "fp-1",
    slug: "dr-sarah-jenkins",
    fullName: "Dr. Sarah Jenkins, Ph.D.",
    professionalTitle: "Licensed Clinical Psychologist",
    photoUrl: "https://images.unsplash.com/photo-1594824813637-2804b494632b?auto=format&fit=crop&q=80&w=600",
    quote: "“Therapy isn’t about fixing what is broken; it is about creating enough emotional safety so you can hear what your mind and body have been trying to tell you.”",
    specializations: ["Anxiety & Panic", "Burnout", "Trauma Recovery"],
    experience: "12 years practice",
    languages: "English, French",
    availability: "Available this week",
    sessionFee: "₹1,800",
  },
  {
    id: "fp-2",
    slug: "elena-vance",
    fullName: "Elena Vance, LMFT",
    professionalTitle: "Licensed Marriage & Family Therapist",
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600",
    quote: "“Most relationship friction isn’t a lack of love, but the absence of emotional translation. Together, we learn how to express vulnerability without defensiveness.”",
    specializations: ["Couples & Intimacy", "Attachment", "Life Transitions"],
    experience: "9 years practice",
    languages: "English",
    availability: "Next availability Thursday",
    sessionFee: "₹2,200",
  },
  {
    id: "fp-3",
    slug: "dr-marcus-thorne",
    fullName: "Dr. Marcus Thorne, Psy.D.",
    professionalTitle: "Neuropsychologist & Behavioral Health Specialist",
    photoUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600",
    quote: "“Understanding the biology of your nervous system frees you from self-blame. When you realize how your brain responds to stress, change becomes manageable.”",
    specializations: ["Adult ADHD", "Depression", "Sleep & Somatic Care"],
    experience: "15 years practice",
    languages: "English, Spanish",
    availability: "Online sessions open",
    sessionFee: "₹2,500",
  },
];

const CONCERN_CARDS = [
  {
    id: "overwhelmed",
    icon: Feather,
    title: "Feeling overwhelmed",
    desc: "When racing thoughts, chronic tension, or panic feel too heavy to carry alone.",
    link: "/psychologists?specialization=anxiety-stress",
  },
  {
    id: "relationships",
    icon: Users,
    title: "Relationship difficulties",
    desc: "Navigating communication breakdowns, attachment patterns, and mutual connection.",
    link: "/psychologists?specialization=couples-relationship",
  },
  {
    id: "transition",
    icon: Compass,
    title: "A major life change",
    desc: "Finding grounding amidst career shifts, heartbreak, relocation, or identity rediscovery.",
    link: "/psychologists",
  },
  {
    id: "self-understanding",
    icon: Smile,
    title: "Want to understand yourself",
    desc: "Exploring personal boundaries, emotional history, and self-compassion without judgment.",
    link: "/intake",
  },
  {
    id: "sleep",
    icon: Moon,
    title: "Struggling with sleep & rest",
    desc: "Restoring natural circadian rhythms and easing bedtime anxiety and physical exhaustion.",
    link: "/ebooks",
  },
  {
    id: "something-else",
    icon: Sparkles,
    title: "Something else",
    desc: "You don't need a formal diagnosis or exact words. Just start where you are.",
    link: "/intake",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#173C32] text-[#F7F3E9] selection:bg-[#3F6855] selection:text-[#F1EBDD] overflow-x-hidden">
      <Navbar />

      <main className="flex-grow">
        {/* ========================================================================= */}
        {/* 1. IMMERSIVE GREEN HERO SECTION */}
        {/* ========================================================================= */}
        <section className="relative pt-8 pb-20 sm:pt-14 sm:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-[#173C32] via-[#1C473C] to-[#244F42]">
          {/* Subtle atmospheric ambient glow */}
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#3F6855]/20 blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 -right-40 w-[30rem] h-[30rem] rounded-full bg-[#718B73]/15 blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left Column: Headline & Human Journey */}
              <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left">
                {/* Eyebrow */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-[#C9D2BC]/20 text-[#C9D2BC] text-xs font-semibold tracking-wider uppercase backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9CAF91] animate-pulse" />
                  <span>A little support can change a lot</span>
                </div>

                {/* Main Editorial Headline */}
                <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal text-[#F7F3E9] leading-[1.08] tracking-tight">
                  You don&apos;t have to figure it all out alone.
                </h1>

                {/* Supporting Copy */}
                <p className="text-base sm:text-lg md:text-xl text-[#C9D2BC]/90 font-light max-w-2xl leading-relaxed">
                  A calm space to understand, heal, and grow — connecting you with qualified, compassionate psychologists who truly listen.
                </p>

                {/* Dual CTAs */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 max-w-xl">
                  <Link
                    href="/psychologists"
                    className="h-14 px-8 rounded-full bg-[#F1EBDD] hover:bg-white text-[#173C32] font-semibold text-base flex items-center justify-center gap-2.5 shadow-xl shadow-black/10 hover:shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <span>Find the right support</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/intake"
                    className="h-14 px-7 rounded-full bg-transparent hover:bg-white/5 border border-[#C9D2BC]/40 text-[#F7F3E9] font-medium text-base flex items-center justify-center gap-2 transition-all hover:border-[#C9D2BC]"
                  >
                    <span>I&apos;m not sure what I need</span>
                  </Link>
                </div>

                {/* Trust Indicators */}
                <div className="pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#C9D2BC]">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#9CAF91] flex-shrink-0" />
                    <span>Verified Licensed Professionals</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <HeartHandshake className="w-4 h-4 text-[#9CAF91] flex-shrink-0" />
                    <span>Human-Assisted Matching</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#9CAF91] flex-shrink-0" />
                    <span>Your Privacy Comes First</span>
                  </div>
                </div>

                {/* Subtle Editorial Tagline */}
                <p className="font-serif italic text-sm text-[#9CAF91]/80 pt-1">
                  A calmer, brighter you. Take one step at a time.
                </p>
              </div>

              {/* Right Column: Atmospheric Visual Window */}
              <div className="lg:col-span-5 relative flex justify-center">
                <div className="relative w-full max-w-md aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-white/15 shadow-2xl shadow-black/30">
                  {/* Calming warm interior / plant / daylight imagery */}
                  <Image
                    src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=900"
                    alt="A calm, warm room with natural light and plants"
                    fill
                    priority
                    className="object-cover object-center brightness-[0.88] contrast-[1.05]"
                  />
                  {/* Atmospheric green gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#173C32]/95 via-[#173C32]/30 to-transparent" />

                  {/* Floating Mind Refill Quiet Card */}
                  <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl bg-[#173C32]/85 backdrop-blur-md border border-white/15 text-left space-y-2">
                    <div className="flex items-center gap-2 text-[#9CAF91] text-xs font-semibold uppercase tracking-wider">
                      <HeartHandshake className="w-4 h-4" />
                      <span>Grounded Care</span>
                    </div>
                    <p className="font-serif text-base text-[#F7F3E9] italic leading-snug">
                      &ldquo;The quiet relief of being understood without having to explain yourself ten times.&rdquo;
                    </p>
                    <span className="text-[11px] text-[#C9D2BC]/75 block">
                      Individual therapy & guided wellbeing
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. "WHAT'S ON YOUR MIND?" SECTION (Immersive Atmospheric Cards) */}
        {/* ========================================================================= */}
        <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#244F42]">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-semibold tracking-widest text-[#9CAF91] uppercase">
                Explore Support
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-[#F7F3E9]">
                What&apos;s on your mind?
              </h2>
              <p className="text-[#C9D2BC] text-sm sm:text-base font-light leading-relaxed">
                Life can be overwhelming sometimes. Whatever you&apos;re experiencing right now, you don&apos;t have to carry it alone.
              </p>
            </div>

            {/* 6 Elegant Non-White Transparent Concern Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {CONCERN_CARDS.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={item.link}
                    className="group atmospheric-card p-7 rounded-3xl hover:bg-[#3F6855]/40 hover:border-[#C9D2BC]/40 transition-all duration-300 flex flex-col justify-between space-y-5 hover:-translate-y-1 shadow-sm hover:shadow-xl hover:shadow-black/10"
                  >
                    <div className="space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#173C32]/80 border border-[#C9D2BC]/20 flex items-center justify-center text-[#F1EBDD] group-hover:scale-105 transition-transform">
                        <IconComponent className="w-6 h-6 text-[#9CAF91]" />
                      </div>
                      <h3 className="font-serif text-xl sm:text-2xl font-medium text-[#F7F3E9] group-hover:text-[#F1EBDD] transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#C9D2BC]/85 font-light leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-[#9CAF91] group-hover:text-[#F1EBDD] transition-colors">
                      <span>Explore this direction</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. HOW IT WORKS (Connected Journey 01 ───── 02 ───── 03) */}
        {/* ========================================================================= */}
        <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#244F42] via-[#1E3A31] to-[#173C32]">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-semibold tracking-widest text-[#9CAF91] uppercase">
                How It Works
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-[#F7F3E9]">
                A simpler way to get the support you need.
              </h2>
              <p className="text-[#C9D2BC] text-sm sm:text-base font-light leading-relaxed">
                From your first step to your first session, we&apos;re here to make the process feel calm, clear, and human.
              </p>
            </div>

            {/* Desktop Horizontal Connected Steps */}
            <div className="hidden md:grid grid-cols-3 gap-8 relative items-start">
              {/* Connected Line in Background */}
              <div className="absolute top-10 left-[16%] right-[16%] h-[2px] connection-line-h z-0" />

              {/* Step 01 */}
              <div className="relative z-10 text-center space-y-4 px-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-[#173C32] border-2 border-[#9CAF91]/50 flex items-center justify-center shadow-lg shadow-black/20">
                  <span className="font-serif text-2xl font-bold text-[#F1EBDD]">01</span>
                </div>
                <h3 className="font-serif text-2xl font-medium text-[#F7F3E9]">
                  Share what&apos;s on your mind
                </h3>
                <p className="text-sm text-[#C9D2BC]/90 font-light leading-relaxed">
                  Tell us a little about what you&apos;re going through with our gentle, guided intake questions.
                </p>
              </div>

              {/* Step 02 */}
              <div className="relative z-10 text-center space-y-4 px-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-[#173C32] border-2 border-[#9CAF91]/50 flex items-center justify-center shadow-lg shadow-black/20">
                  <span className="font-serif text-2xl font-bold text-[#F1EBDD]">02</span>
                </div>
                <h3 className="font-serif text-2xl font-medium text-[#F7F3E9]">
                  Get matched with care
                </h3>
                <p className="text-sm text-[#C9D2BC]/90 font-light leading-relaxed">
                  Our coordinators review your preferences to match you with a psychologist who genuinely fits your needs.
                </p>
              </div>

              {/* Step 03 */}
              <div className="relative z-10 text-center space-y-4 px-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-[#173C32] border-2 border-[#9CAF91]/50 flex items-center justify-center shadow-lg shadow-black/20">
                  <span className="font-serif text-2xl font-bold text-[#F1EBDD]">03</span>
                </div>
                <h3 className="font-serif text-2xl font-medium text-[#F7F3E9]">
                  Take your next step
                </h3>
                <p className="text-sm text-[#C9D2BC]/90 font-light leading-relaxed">
                  Choose a consultation time that fits your life and meet your clinician in a private, encrypted space.
                </p>
              </div>
            </div>

            {/* Mobile Vertical Connected Steps */}
            <div className="md:hidden space-y-8 relative pl-6">
              {/* Vertical line */}
              <div className="absolute top-4 bottom-4 left-[2.25rem] w-[2px] connection-line-v" />

              {/* Step 01 */}
              <div className="relative flex items-start gap-5">
                <div className="w-12 h-12 rounded-full bg-[#173C32] border-2 border-[#9CAF91]/60 flex items-center justify-center flex-shrink-0 text-[#F1EBDD] font-bold text-sm z-10 shadow">
                  01
                </div>
                <div className="space-y-1 pt-1">
                  <h3 className="font-serif text-xl font-medium text-[#F7F3E9]">
                    Share what&apos;s on your mind
                  </h3>
                  <p className="text-xs text-[#C9D2BC]/90 font-light leading-relaxed">
                    Tell us a little about what you&apos;re going through with guided questions.
                  </p>
                </div>
              </div>

              {/* Step 02 */}
              <div className="relative flex items-start gap-5">
                <div className="w-12 h-12 rounded-full bg-[#173C32] border-2 border-[#9CAF91]/60 flex items-center justify-center flex-shrink-0 text-[#F1EBDD] font-bold text-sm z-10 shadow">
                  02
                </div>
                <div className="space-y-1 pt-1">
                  <h3 className="font-serif text-xl font-medium text-[#F7F3E9]">
                    Get matched with care
                  </h3>
                  <p className="text-xs text-[#C9D2BC]/90 font-light leading-relaxed">
                    Our care team helps pair you with the clinician best suited to walk beside you.
                  </p>
                </div>
              </div>

              {/* Step 03 */}
              <div className="relative flex items-start gap-5">
                <div className="w-12 h-12 rounded-full bg-[#173C32] border-2 border-[#9CAF91]/60 flex items-center justify-center flex-shrink-0 text-[#F1EBDD] font-bold text-sm z-10 shadow">
                  03
                </div>
                <div className="space-y-1 pt-1">
                  <h3 className="font-serif text-xl font-medium text-[#F7F3E9]">
                    Take your next step
                  </h3>
                  <p className="text-xs text-[#C9D2BC]/90 font-light leading-relaxed">
                    Select your session time and connect directly in a private, encrypted room.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. VERIFIED PSYCHOLOGISTS ("People who understand.") */}
        {/* ========================================================================= */}
        <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#173C32]">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/10 pb-8">
              <div className="space-y-2">
                <span className="text-xs font-semibold tracking-widest text-[#9CAF91] uppercase">
                  Verified Psychologists
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-[#F7F3E9]">
                  People who understand.
                </h2>
                <p className="text-[#C9D2BC] text-sm sm:text-base font-light max-w-xl">
                  Connect with qualified, compassionate clinicians with verified degrees, clinical licenses, and deep human empathy.
                </p>
              </div>

              <Link
                href="/psychologists"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#F1EBDD] hover:text-white transition-colors"
              >
                <span>View all verified practitioners</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Psychologist Profiles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {FEATURED_PSYCHOLOGISTS.map((psych) => (
                <div
                  key={psych.id}
                  className="atmospheric-card rounded-3xl overflow-hidden flex flex-col justify-between border border-white/10 hover:border-[#C9D2BC]/30 transition-all duration-300 group"
                >
                  <div className="space-y-5">
                    {/* Portrait Photo */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#122C25]">
                      <Image
                        src={psych.photoUrl}
                        alt={psych.fullName}
                        fill
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#173C32] via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full bg-[#173C32]/85 backdrop-blur-md text-[11px] font-medium text-[#9CAF91] border border-white/10">
                          {psych.availability}
                        </span>
                        <span className="text-xs font-serif font-semibold text-[#F1EBDD]">
                          {psych.sessionFee} / session
                        </span>
                      </div>
                    </div>

                    {/* Bio & Details */}
                    <div className="px-6 space-y-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif text-xl font-medium text-[#F7F3E9]">
                            {psych.fullName}
                          </h3>
                          <ShieldCheck className="w-4 h-4 text-[#9CAF91] flex-shrink-0" />
                        </div>
                        <p className="text-xs text-[#9CAF91] font-light mt-0.5">
                          {psych.professionalTitle} • {psych.experience}
                        </p>
                      </div>

                      <p className="font-serif italic text-xs sm:text-sm text-[#C9D2BC]/90 leading-relaxed">
                        {psych.quote}
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {psych.specializations.map((spec) => (
                          <span
                            key={spec}
                            className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-[#C9D2BC]"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Profile Action */}
                  <div className="p-6 pt-4">
                    <Link
                      href={`/psychologists/${psych.slug}`}
                      className="w-full py-3 rounded-2xl bg-[#F1EBDD] hover:bg-white text-[#173C32] font-semibold text-xs text-center flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                      <span>View Profile & Book</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. IMMERSIVE FINAL CTA */}
        {/* ========================================================================= */}
        <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#173C32] to-[#0E241E] text-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(63,104,85,0.2)_0,transparent_70%)] pointer-events-none" />

          <div className="max-w-3xl mx-auto relative z-10 space-y-6">
            <span className="text-xs font-semibold tracking-widest text-[#9CAF91] uppercase">
              Begin Today
            </span>

            <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-normal text-[#F7F3E9] leading-tight">
              You don&apos;t need to have all the answers.
            </h2>

            <p className="font-serif text-xl sm:text-2xl italic text-[#F1EBDD]/90">
              You only need a next step.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/intake"
                className="w-full sm:w-auto h-14 px-8 rounded-full bg-[#F1EBDD] hover:bg-white text-[#173C32] font-semibold text-base flex items-center justify-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                <span>Find my next step</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/psychologists"
                className="w-full sm:w-auto h-14 px-8 rounded-full bg-transparent hover:bg-white/5 border border-[#C9D2BC]/40 text-[#F7F3E9] font-medium text-base flex items-center justify-center transition-all hover:border-[#C9D2BC]"
              >
                <span>Explore psychologists</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
