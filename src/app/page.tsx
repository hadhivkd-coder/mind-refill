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
  Compass,
  Smile,
  Moon,
  Users,
  Feather,
  ChevronRight,
  Mail,
  Check,
} from "lucide-react";
import { NewsletterForm } from "@/components/home/newsletter-form";

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
    quote: "“Therapy isn't about fixing what is broken; it is about creating enough emotional safety so you can hear what your mind and body have been trying to tell you.”",
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
    quote: "“Most relationship friction isn't a lack of love, but the absence of emotional translation. Together, we learn how to express vulnerability without defensiveness.”",
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
        {/* 1. CINEMATIC EDITORIAL HERO SECTION */}
        {/* ========================================================================= */}
        <section className="relative pt-12 pb-24 sm:pt-20 sm:pb-36 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#173C32]">
          {/* Subtle atmospheric ambient glows */}
          <div className="absolute -top-32 -left-32 w-[34rem] h-[34rem] rounded-full bg-[#3F6855]/25 blur-[120px] pointer-events-none" />
          <div className="absolute top-1/3 -right-32 w-[38rem] h-[38rem] rounded-full bg-[#718B73]/20 blur-[130px] pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
              {/* Left Column: Headline, Typography & Human Intent */}
              <div className="lg:col-span-7 space-y-7 sm:space-y-9 text-left">
                {/* Quiet Eyebrow Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-[#C9D2BC]/20 text-[#C9D2BC] text-xs font-semibold tracking-wider uppercase backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9CAF91] animate-pulse" />
                  <span>A little support can change a lot</span>
                </div>

                {/* Main Cormorant Serif Headline */}
                <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-normal text-[#F7F3E9] leading-[1.04] tracking-tight">
                  You don&apos;t have to figure it all out alone.
                </h1>

                {/* Warm Supporting Copy */}
                <p className="text-base sm:text-lg md:text-xl text-[#C9D2BC]/95 font-light max-w-2xl leading-relaxed">
                  A quiet, grounded space to understand, heal, and grow — connecting you with qualified, compassionate psychologists who listen without judgment.
                </p>

                {/* Dual Editorial Action CTAs */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 max-w-xl">
                  <Link
                    href="/psychologists"
                    className="h-14 px-8 rounded-full bg-[#F1EBDD] hover:bg-white text-[#173C32] font-semibold text-base flex items-center justify-center gap-2.5 shadow-xl shadow-black/15 hover:shadow-black/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
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

                {/* Understated Trust Row */}
                <div className="pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#C9D2BC]">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#9CAF91] flex-shrink-0" />
                    <span>Verified Licensed Clinicians</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <HeartHandshake className="w-4 h-4 text-[#9CAF91] flex-shrink-0" />
                    <span>Human-Assisted Matching</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#9CAF91] flex-shrink-0" />
                    <span>Complete Clinical Privacy</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Architectural Photography Blended Seamlessly */}
              <div className="lg:col-span-5 relative flex justify-center">
                <div className="relative w-full max-w-md aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-white/15 shadow-2xl shadow-black/40">
                  {/* Calming natural sunlight / interior / plants image */}
                  <Image
                    src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1000"
                    alt="A calm, warm room with natural sunlight and plants"
                    fill
                    priority
                    className="object-cover object-center brightness-[0.88] contrast-[1.05]"
                  />
                  {/* Multi-directional gentle gradient vignettes */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#173C32]/95 via-[#173C32]/25 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#173C32]/40 via-transparent to-transparent" />

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
        {/* ORGANIC CURVED DIVIDER 1 (From Hero #173C32 into #244F42) */}
        {/* ========================================================================= */}
        <div className="w-full overflow-hidden leading-none -mt-1 pointer-events-none bg-[#173C32]">
          <svg
            viewBox="0 0 1440 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative block w-full h-12 sm:h-20 text-[#244F42]"
            preserveAspectRatio="none"
          >
            <path
              d="M0,32L80,42.7C160,53,320,75,480,80C640,85,800,75,960,58.7C1120,43,1280,21,1360,10.7L1440,0L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"
              fill="currentColor"
            />
          </svg>
        </div>

        {/* ========================================================================= */}
        {/* 2. "WHAT'S ON YOUR MIND?" SECTION */}
        {/* ========================================================================= */}
        <section className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#244F42]">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-semibold tracking-widest text-[#9CAF91] uppercase">
                Explore Support
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-[#F7F3E9]">
                What&apos;s on your mind?
              </h2>
              <p className="text-[#C9D2BC] text-sm sm:text-base font-light leading-relaxed">
                Life can feel heavy at times. Whatever you&apos;re going through right now, you don&apos;t have to carry it by yourself.
              </p>
            </div>

            {/* 6 Elegant Concern Cards */}
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
        {/* ORGANIC CURVED DIVIDER 2 (From #244F42 into #1C473C) */}
        {/* ========================================================================= */}
        <div className="w-full overflow-hidden leading-none -mt-1 pointer-events-none bg-[#244F42]">
          <svg
            viewBox="0 0 1440 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative block w-full h-12 sm:h-20 text-[#1C473C]"
            preserveAspectRatio="none"
          >
            <path
              d="M0,50 C360,100 720,0 1080,70 C1200,90 1360,30 1440,50 L1440,100 L0,100 Z"
              fill="currentColor"
            />
          </svg>
        </div>

        {/* ========================================================================= */}
        {/* 3. HOW IT WORKS (Connected Journey 01 ───── 02 ───── 03) */}
        {/* ========================================================================= */}
        <section className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#1C473C]">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-semibold tracking-widest text-[#9CAF91] uppercase">
                How It Works
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-[#F7F3E9]">
                A simpler way to get the support you need.
              </h2>
              <p className="text-[#C9D2BC] text-sm sm:text-base font-light leading-relaxed">
                From your first thought to your first session, we&apos;re here to make the process feel calm, clear, and reassuring.
              </p>
            </div>

            {/* Desktop Horizontal Connected Steps */}
            <div className="hidden md:grid grid-cols-3 gap-8 relative items-start">
              {/* Connected Organic Line */}
              <div className="absolute top-10 left-[16%] right-[16%] h-[2px] connection-line-h z-0 opacity-60" />

              {/* Step 01 */}
              <div className="relative z-10 text-center space-y-4 px-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-[#173C32] border-2 border-[#9CAF91]/50 flex items-center justify-center shadow-lg shadow-black/20">
                  <span className="font-serif text-2xl font-bold text-[#F1EBDD]">01</span>
                </div>
                <h3 className="font-serif text-2xl font-medium text-[#F7F3E9]">
                  Share what&apos;s on your mind
                </h3>
                <p className="text-sm text-[#C9D2BC]/90 font-light leading-relaxed">
                  Tell us a little about what you&apos;re experiencing through our gentle, pressure-free questions.
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
                  Our clinicians and care team review your preferences to match you with a psychologist who fits your values.
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
                  Choose a consultation time that works for your schedule and meet your clinician in a private, encrypted space.
                </p>
              </div>
            </div>

            {/* Mobile Vertical Connected Steps */}
            <div className="md:hidden space-y-8 relative pl-6">
              <div className="absolute top-4 bottom-4 left-[2.25rem] w-[2px] connection-line-v opacity-60" />

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
        {/* ORGANIC CURVED DIVIDER 3 (From #1C473C into #173C32) */}
        {/* ========================================================================= */}
        <div className="w-full overflow-hidden leading-none -mt-1 pointer-events-none bg-[#1C473C]">
          <svg
            viewBox="0 0 1440 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative block w-full h-12 sm:h-20 text-[#173C32]"
            preserveAspectRatio="none"
          >
            <path
              d="M0,30 C320,80 640,-10 960,60 C1120,90 1280,20 1440,40 L1440,100 L0,100 Z"
              fill="currentColor"
            />
          </svg>
        </div>

        {/* ========================================================================= */}
        {/* 4. VERIFIED PSYCHOLOGISTS ("People who understand.") */}
        {/* ========================================================================= */}
        <section className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#173C32]">
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
                  Connect with qualified clinicians with verified degrees, clinical licenses, and deep human empathy.
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
        {/* ORGANIC CURVED DIVIDER 4 (From #173C32 into Warm Cream #F1EBDD) */}
        {/* ========================================================================= */}
        <div className="w-full overflow-hidden leading-none -mt-1 pointer-events-none bg-[#173C32]">
          <svg
            viewBox="0 0 1440 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative block w-full h-12 sm:h-20 text-[#F1EBDD]"
            preserveAspectRatio="none"
          >
            <path
              d="M0,40 C320,100 420,-10 740,50 C1040,110 1200,10 1440,40 L1440,100 L0,100 Z"
              fill="currentColor"
            />
          </svg>
        </div>

        {/* ========================================================================= */}
        {/* 5. EDITORIAL WARM CREAM NEWSLETTER SECTION */}
        {/* ========================================================================= */}
        <section className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#F1EBDD] text-[#173C32]">
          <div className="max-w-4xl mx-auto text-center space-y-7">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#173C32]/10 border border-[#173C32]/15 text-[#173C32] text-xs font-semibold tracking-wider uppercase">
              <Mail className="w-3.5 h-3.5 text-[#173C32]" />
              <span>Mind Refill Digest</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-normal text-[#173C32] leading-tight">
              Insights for a healthier, calmer you.
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-[#244F42]/85 font-normal max-w-2xl mx-auto leading-relaxed">
              A gentle fortnightly letter on emotional regulation, nervous system balance, and mindful living. Written directly by licensed practitioners.
            </p>

            {/* Inline Email Capture Box */}
            <NewsletterForm />

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#244F42]/70 pt-2">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#173C32]" />
                Fortnightly publication
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#173C32]" />
                Zero spam
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#173C32]" />
                Unsubscribe anytime
              </span>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* ORGANIC CURVED DIVIDER 5 (From Warm Cream into #122C25) */}
        {/* ========================================================================= */}
        <div className="w-full overflow-hidden leading-none -mt-1 pointer-events-none bg-[#F1EBDD]">
          <svg
            viewBox="0 0 1440 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative block w-full h-12 sm:h-20 text-[#122C25]"
            preserveAspectRatio="none"
          >
            <path
              d="M0,60 C360,10 720,90 1080,30 C1200,10 1360,70 1440,50 L1440,100 L0,100 Z"
              fill="currentColor"
            />
          </svg>
        </div>

        {/* ========================================================================= */}
        {/* 6. IMMERSIVE FINAL CTA */}
        {/* ========================================================================= */}
        <section className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#122C25] text-center overflow-hidden">
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
