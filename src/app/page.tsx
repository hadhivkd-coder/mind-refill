import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  HeartHandshake,
  ArrowRight,
  Sparkles,
  BookOpen,
  Calendar,
  BookMarked,
  CheckCircle2,
  Lock,
  MessageSquare,
  Clock,
  Check,
  Star,
} from "lucide-react";

export const metadata = {
  title: "Mind Refill | You Don't Have to Figure It All Out Alone",
  description:
    "A calm, human space for emotional wellbeing. Connect with licensed, verified psychologists or let our care coordinators guide you thoughtfully.",
};

const FEATURED_PSYCHOLOGISTS = [
  {
    id: "fp-1",
    slug: "dr-sarah-jenkins",
    fullName: "Dr. Sarah Jenkins, Ph.D.",
    professionalTitle: "Licensed Clinical Psychologist & CBT Specialist",
    photoUrl: "https://images.unsplash.com/photo-1594824813637-2804b494632b?auto=format&fit=crop&q=80&w=400",
    quote: "“Therapy isn’t about fixing what is broken; it is about creating enough emotional safety so you can hear what your mind and body have been trying to tell you.”",
    specializations: ["Anxiety & Panic", "Burnout & Perfectionism", "Trauma Recovery"],
    languages: ["English", "French"],
    experience: "12 years clinical practice",
    availability: "Available this week",
    sessionFee: "₹1,800",
  },
  {
    id: "fp-2",
    slug: "elena-vance",
    fullName: "Elena Vance, LMFT",
    professionalTitle: "Licensed Marriage & Family Therapist",
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
    quote: "“Most relationship friction isn’t a lack of love, but the absence of emotional translation. Together, we learn how to express vulnerability without defensiveness.”",
    specializations: ["Couples & Intimacy", "Attachment Wounds", "Family Transitions"],
    languages: ["English"],
    experience: "9 years clinical practice",
    availability: "Next availability Thursday",
    sessionFee: "₹2,200",
  },
  {
    id: "fp-3",
    slug: "dr-marcus-thorne",
    fullName: "Dr. Marcus Thorne, Psy.D.",
    professionalTitle: "Neuropsychologist & Behavioral Health Specialist",
    photoUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
    quote: "“Understanding the biology of your nervous system frees you from self-blame. When you realize how your brain responds to stress, change becomes manageable.”",
    specializations: ["Adult ADHD", "Depressive Episodes", "Sleep & Insomnia"],
    languages: ["English", "Spanish"],
    experience: "15 years clinical practice",
    availability: "Online sessions open",
    sessionFee: "₹2,500",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-cream-50 flex flex-col justify-between text-forest-950 selection:bg-sage-200 selection:text-forest-900">
      {/* Navigation Header */}
      <header className="border-b border-sage-200/70 bg-white/90 backdrop-blur-md sticky top-0 z-50 transition-all">
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

          <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium text-forest-800">
            <Link href="/psychologists" className="hover:text-forest-950 transition-colors">
              Find a Psychologist
            </Link>
            <Link href="/resources" className="hover:text-forest-950 transition-colors">
              Clinical Resources
            </Link>
            <Link href="/ebooks" className="hover:text-forest-950 transition-colors">
              E-Books & Workbooks
            </Link>
            <Link href="/events" className="hover:text-forest-950 transition-colors">
              Workshops & Events
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <Link
              href="/login"
              className="text-sm font-medium text-forest-800 hover:text-forest-950 px-3 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/find-a-psychologist"
              className="text-sm font-semibold bg-forest-800 hover:bg-forest-900 text-white px-5 py-2.5 rounded-2xl transition-all shadow-sm hover:shadow-md"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* SECTION 1: Emotional Hero with Connection Language */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 px-4 sm:px-6 lg:px-8">
        {/* Soft Ambient Radiance */}
        <div className="absolute top-0 left-1/3 w-[800px] h-[500px] bg-gradient-to-b from-sage-100/50 via-cream-100/30 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-blush-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* LEFT: Emotional Promise & Human CTAs */}
          <div className="lg:col-span-7 text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sage-100/90 border border-sage-200 text-forest-800 text-xs font-semibold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-forest-600" />
              <span>A little support can change a lot.</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-forest-950 leading-[1.12]">
              You don&apos;t have to figure it all out{" "}
              <span className="text-forest-700 underline decoration-sage-300 decoration-wavy decoration-2 underline-offset-8">
                alone.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-forest-700 max-w-xl leading-relaxed font-normal">
              Whether you know exactly what you&apos;re looking for or simply feel that life has become heavier lately, Mind Refill connects you with verified psychologists who listen without judgment.
            </p>

            {/* Clear Dual-Path Human CTAs */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
              {/* Primary Path: I know what I want */}
              <Link
                href="/psychologists"
                className="p-5 rounded-2xl bg-forest-800 hover:bg-forest-900 text-white shadow-md hover:shadow-lg transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-sage-300 uppercase tracking-widest">
                      Direct Matching
                    </span>
                    <ArrowRight className="w-4 h-4 text-sage-300 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <span className="text-base font-bold text-white block">
                    Find the right support
                  </span>
                  <p className="text-xs text-sage-200 mt-1 leading-relaxed">
                    Explore psychologists or let us help you find the right match.
                  </p>
                </div>
              </Link>

              {/* Secondary Path: I don't know */}
              <Link
                href="/intake"
                className="p-5 rounded-2xl border-2 border-forest-600/70 bg-white hover:bg-sage-50 text-forest-950 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-forest-600 uppercase tracking-widest">
                      Guided Care
                    </span>
                    <ArrowRight className="w-4 h-4 text-forest-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <span className="text-base font-bold text-forest-950 block">
                    I&apos;m not sure what I need
                  </span>
                  <p className="text-xs text-forest-700 mt-1 leading-relaxed">
                    Talk to a care coordinator and take it one step at a time.
                  </p>
                </div>
              </Link>
            </div>

            {/* Grounding Trust Indicators */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-forest-700">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-forest-600" />
                Verified Clinical Licenses
              </span>
              <span className="flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-forest-600" />
                Human-Led Care Matching
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-forest-600" />
                Medical Confidentiality
              </span>
            </div>
          </div>

          {/* RIGHT: Distinctive Connection Motif & Live Care Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md bg-gradient-to-b from-white/90 to-sage-50/70 border border-sage-200/90 rounded-3xl p-6 sm:p-8 shadow-lg backdrop-blur-sm">
              {/* Connection Visual SVG: Two Paths Meeting & Organic Intersecting Rings */}
              <div className="relative h-44 w-full flex items-center justify-center mb-6 overflow-hidden rounded-2xl bg-cream-100/40 border border-sage-100">
                <svg
                  viewBox="0 0 360 160"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full"
                >
                  {/* Gentle background radiant rings */}
                  <circle cx="120" cy="80" r="60" stroke="#b4cdbd" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
                  <circle cx="240" cy="80" r="60" stroke="#c98282" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />

                  {/* Flowing Path 1: You */}
                  <path
                    d="M 30 110 C 80 110, 110 80, 180 80"
                    stroke="#1e4330"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  {/* Flowing Path 2: Support */}
                  <path
                    d="M 330 50 C 280 50, 250 80, 180 80"
                    stroke="#749f8c"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Node 1: Left (The Client) */}
                  <circle cx="70" cy="100" r="14" fill="#1e4330" />
                  <circle cx="70" cy="100" r="22" stroke="#1e4330" strokeWidth="1.5" opacity="0.3" className="animate-pulse" />
                  <text x="70" y="104" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">You</text>

                  {/* Node 2: Meeting Center (Understanding & Connection) */}
                  <circle cx="180" cy="80" r="16" fill="#122b1e" />
                  <circle cx="180" cy="80" r="26" stroke="#b4cdbd" strokeWidth="2" opacity="0.6" />
                  <text x="180" y="84" fill="#f8eeec" fontSize="12" fontWeight="bold" textAnchor="middle">Ψ</text>

                  {/* Node 3: Right (Psychologist / Guide) */}
                  <circle cx="290" cy="60" r="14" fill="#749f8c" />
                  <circle cx="290" cy="60" r="22" stroke="#749f8c" strokeWidth="1.5" opacity="0.3" className="animate-pulse" />
                  <text x="290" y="64" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">Care</text>
                </svg>

                {/* Subtle Floating Emotional Tag */}
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-forest-700 bg-white/90 backdrop-blur-xs py-1 px-3 rounded-full border border-sage-200">
                  <span className="font-semibold text-forest-900">Meeting at your rhythm</span>
                  <span className="text-forest-600 font-medium">Safe • Unrushed</span>
                </div>
              </div>

              {/* Human Reassurance Card */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-sage-200 shrink-0">
                    <Image
                      src="https://images.unsplash.com/photo-1594824813637-2804b494632b?auto=format&fit=crop&q=80&w=200"
                      alt="Verified Psychologist"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-forest-950">Dr. Sarah Jenkins</span>
                      <ShieldCheck className="w-4 h-4 text-forest-600" />
                    </div>
                    <span className="text-xs text-forest-600 block">Licensed Clinical Psychologist • 12 yrs exp</span>
                  </div>
                </div>

                <p className="text-xs text-forest-700 italic bg-white p-3 rounded-xl border border-sage-100 leading-relaxed">
                  &ldquo;When people come to therapy, they often think they have to present a polished story. You don&apos;t. Bring the messy parts — that&apos;s where we begin.&rdquo;
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-sage-100 text-xs text-forest-700">
                  <span className="flex items-center gap-1 text-forest-600">
                    <Clock className="w-3.5 h-3.5" /> Next slot: Tomorrow
                  </span>
                  <Link
                    href="/psychologists/dr-sarah-jenkins"
                    className="font-semibold text-forest-800 hover:text-forest-950 underline text-xs"
                  >
                    View profile &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: "You might be here because..." (Deeply Human, Non-Diagnostic) */}
      <section className="py-16 md:py-24 bg-white border-y border-sage-200/70 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold text-forest-600 uppercase tracking-widest block mb-2">
              Every Experience Matters
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold text-forest-950 tracking-tight">
              Maybe you&apos;re here because...
            </h2>
            <p className="text-sm sm:text-base text-forest-700 mt-3 leading-relaxed">
              You don&apos;t need a medical diagnosis or a crisis to speak with someone. Support begins wherever life feels a little too heavy to carry alone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Something has been weighing on you.",
                desc: "A persistent tension in your body, chronic overthinking, or waking up already exhausted before the day starts.",
                tag: "Anxiety & Stress",
                link: "/psychologists?specialization=anxiety-stress",
              },
              {
                title: "You can't quite explain how you're feeling.",
                desc: "A lingering numbness, low energy, or a feeling that you're watching your life from the outside without being fully present.",
                tag: "Emotional Numbness",
                link: "/intake",
              },
              {
                title: "A relationship has become difficult.",
                desc: "Repeating the same painful arguments with a partner, boundary fatigue with family, or feeling disconnected.",
                tag: "Relationships & Couples",
                link: "/psychologists?specialization=couples-relationship",
              },
              {
                title: "You're going through a major change.",
                desc: "A career shift, relocation, breakup, grief, or stepping into a new life stage that leaves your footing unsettled.",
                tag: "Life Transitions",
                link: "/psychologists?specialization=career-burnout",
              },
              {
                title: "You want to understand yourself better.",
                desc: "Untangling why certain situations trigger you, identifying emotional patterns, and learning how to protect your peace.",
                tag: "Self-Understanding",
                link: "/resources",
              },
              {
                title: "You simply feel like talking to someone.",
                desc: "A confidential, warm space where you don't have to manage anyone else's expectations or protect their feelings.",
                tag: "Open 1-on-1 Dialogue",
                link: "/psychologists",
              },
            ].map((item, idx) => (
              <Link
                key={idx}
                href={item.link}
                className="p-6 sm:p-7 rounded-3xl border border-sage-200/80 bg-cream-50/40 hover:bg-white hover:border-forest-400 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-forest-600 uppercase tracking-wider px-2.5 py-1 rounded-full bg-sage-100">
                      {item.tag}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-blush-300 group-hover:scale-125 transition-transform" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-forest-950 group-hover:text-forest-800 transition-colors mb-2.5 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-forest-700 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-700 group-hover:text-forest-950 pt-5 mt-4 border-t border-sage-100">
                  <span>Explore this path</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: "How It Works" Connection Journey */}
      <section className="py-20 md:py-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold text-forest-600 uppercase tracking-widest block mb-2">
            The Mind Refill Journey
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-forest-950 tracking-tight">
            A calm, guided path to the right person.
          </h2>
          <p className="text-sm sm:text-base text-forest-700 mt-3 leading-relaxed">
            Therapy shouldn&apos;t begin with a confusing maze of cold medical forms. We guide you step by step.
          </p>
        </div>

        {/* 3-Step Calm Visual Journey with Connecting Bridges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 01 */}
          <div className="bg-white rounded-3xl border border-sage-200/90 p-7 shadow-xs relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-black text-forest-800 font-mono">01</span>
                <span className="h-2.5 w-2.5 rounded-full bg-forest-600" />
              </div>
              <h3 className="text-base font-bold text-forest-950 mb-2">
                Tell us what&apos;s going on
              </h3>
              <p className="text-xs sm:text-sm text-forest-700 leading-relaxed">
                A short, private conversation about what you&apos;re experiencing. You don&apos;t need medical terms — just your authentic words.
              </p>
            </div>
            <div className="pt-6 mt-4 border-t border-sage-100 text-[11px] text-forest-600 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-forest-600" /> 100% confidential & unhurried
            </div>
          </div>

          {/* Step 02 */}
          <div className="bg-white rounded-3xl border border-sage-200/90 p-7 shadow-xs relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-black text-forest-800 font-mono">02</span>
                <span className="h-2.5 w-2.5 rounded-full bg-forest-600" />
              </div>
              <h3 className="text-base font-bold text-forest-950 mb-2">
                We&apos;ll help you find the right direction
              </h3>
              <p className="text-xs sm:text-sm text-forest-700 leading-relaxed">
                If you&apos;re unsure, our human coordinators review your note and connect you with an appropriate psychologist who matches your needs.
              </p>
            </div>
            <div className="pt-6 mt-4 border-t border-sage-100 text-[11px] text-forest-600 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-forest-600" /> Human coordinators, not robots
            </div>
          </div>

          {/* Step 03 */}
          <div className="bg-white rounded-3xl border border-sage-200/90 p-7 shadow-xs relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-black text-forest-800 font-mono">03</span>
                <span className="h-2.5 w-2.5 rounded-full bg-forest-600" />
              </div>
              <h3 className="text-base font-bold text-forest-950 mb-2">
                Meet the person who can help
              </h3>
              <p className="text-xs sm:text-sm text-forest-700 leading-relaxed">
                Explore the psychologist, choose a suitable time slot for video or in-person consultation, and take the next step at your pace.
              </p>
            </div>
            <div className="pt-6 mt-4 border-t border-sage-100 text-[11px] text-forest-600 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-forest-600" /> No commitment pressure
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/intake"
            className="inline-flex items-center gap-2 py-3.5 px-8 bg-forest-800 hover:bg-forest-900 text-white text-xs font-semibold rounded-2xl shadow-sm hover:shadow transition-all"
          >
            <span>Begin Guided Matching</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* SECTION 4: Featured Psychologists (Human Profile Cards) */}
      <section className="py-20 bg-cream-100/50 border-y border-sage-200/70 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-semibold text-forest-600 uppercase tracking-widest block mb-1">
                Verified Practitioners
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-forest-950 tracking-tight">
                Find the right psychologist to walk beside you.
              </h2>
              <p className="text-xs sm:text-sm text-forest-700 mt-2">
                Every practitioner is verified for active licensing, professional ethics, and authentic therapeutic empathy.
              </p>
            </div>
            <Link
              href="/psychologists"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-800 hover:text-forest-950 shrink-0"
            >
              <span>View all verified practitioners</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURED_PSYCHOLOGISTS.map((psychologist) => (
              <div
                key={psychologist.id}
                className="bg-white rounded-3xl border border-sage-200/90 p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-forest-400 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Photo & Identity Header */}
                  <div className="flex items-start gap-4 mb-5">
                    <div className="relative h-18 w-18 rounded-2xl overflow-hidden border-2 border-sage-200 shrink-0 shadow-xs">
                      <Image
                        src={psychologist.photoUrl}
                        alt={psychologist.fullName}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-bold text-forest-950 truncate">
                          {psychologist.fullName}
                        </h3>
                        <ShieldCheck className="w-4 h-4 text-forest-600 shrink-0" />
                      </div>
                      <p className="text-xs text-forest-600 mt-0.5 line-clamp-1">
                        {psychologist.professionalTitle}
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-[11px] text-forest-500">
                        <span>{psychologist.experience}</span>
                        <span>•</span>
                        <span className="text-forest-700 font-medium">{psychologist.languages.join(", ")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Human Introduction Quote */}
                  <p className="text-xs text-forest-700 leading-relaxed italic bg-cream-50/70 p-3.5 rounded-2xl border border-sage-100 mb-5">
                    {psychologist.quote}
                  </p>

                  {/* Specializations Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {psychologist.specializations.map((spec, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-sage-50 text-forest-800 border border-sage-200/80"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-4 border-t border-sage-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-forest-500 block font-semibold">
                      Session Fee
                    </span>
                    <span className="text-base font-extrabold text-forest-950">
                      {psychologist.sessionFee}
                    </span>
                  </div>

                  <Link
                    href={`/psychologists/${psychologist.slug}`}
                    className="inline-flex items-center gap-1.5 py-2 px-4 bg-forest-800 hover:bg-forest-900 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
                  >
                    View Profile &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: Psychoeducational Ecosystem (Articles, E-Books, Events) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-semibold text-forest-600 uppercase tracking-widest block mb-2">
            Beyond 1-on-1 Sessions
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-forest-950 tracking-tight">
            Tools for understanding yourself, one step at a time.
          </h2>
          <p className="text-sm sm:text-base text-forest-700 mt-3 leading-relaxed">
            Support takes many shapes. Explore evidence-based essays, clinician-authored reflection workbooks, and group workshops.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl border border-sage-200/80 p-7 shadow-xs flex flex-col justify-between hover:border-forest-300 transition-colors">
            <div>
              <div className="h-10 w-10 rounded-2xl bg-sage-100 text-forest-700 flex items-center justify-center mb-5">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-forest-950 mb-2">Clinical Articles</h3>
              <p className="text-xs text-forest-700 leading-relaxed mb-6">
                Editorial insights on emotional boundaries, nervous system soothing, and attachment patterns authored by psychologists.
              </p>
            </div>
            <Link
              href="/resources"
              className="inline-flex items-center gap-1 text-xs font-semibold text-forest-800 hover:text-forest-950"
            >
              Browse Articles &rarr;
            </Link>
          </div>

          <div className="bg-white rounded-3xl border border-sage-200/80 p-7 shadow-xs flex flex-col justify-between hover:border-forest-300 transition-colors">
            <div>
              <div className="h-10 w-10 rounded-2xl bg-forest-50 text-forest-700 flex items-center justify-center mb-5">
                <BookMarked className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-forest-950 mb-2">E-Books & Workbooks</h3>
              <p className="text-xs text-forest-700 leading-relaxed mb-6">
                Structured clinical guides, cognitive restructuring worksheets, and somatic practices you can read and work through at your rhythm.
              </p>
            </div>
            <Link
              href="/ebooks"
              className="inline-flex items-center gap-1 text-xs font-semibold text-forest-800 hover:text-forest-950"
            >
              Read Workbooks &rarr;
            </Link>
          </div>

          <div className="bg-white rounded-3xl border border-sage-200/80 p-7 shadow-xs flex flex-col justify-between hover:border-forest-300 transition-colors">
            <div>
              <div className="h-10 w-10 rounded-2xl bg-cream-100 text-forest-700 flex items-center justify-center mb-5">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-forest-950 mb-2">Workshops & Cohorts</h3>
              <p className="text-xs text-forest-700 leading-relaxed mb-6">
                Live, clinician-facilitated group discussions and skill-building sessions in small, confidential cohorts.
              </p>
            </div>
            <Link
              href="/events"
              className="inline-flex items-center gap-1 text-xs font-semibold text-forest-800 hover:text-forest-950"
            >
              See Live Workshops &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 6: Final Emotionally Grounded CTA */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-forest-900 text-white relative overflow-hidden text-center">
        {/* Connection Motif Radiance */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-forest-800/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-40 h-40 rounded-full border border-forest-700/60 pointer-events-none" />
        <div className="absolute bottom-10 left-1/4 w-52 h-52 rounded-full border border-forest-700/60 pointer-events-none" />

        <div className="max-w-3xl mx-auto relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-800/80 border border-forest-700 text-sage-200 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-sage-300 animate-pulse" />
            Mind Refill • Ready when you are
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            You don&apos;t need to have all the answers.{" "}
            <span className="text-sage-300 block sm:inline">You only need a next step.</span>
          </h2>

          <p className="text-sm sm:text-base text-sage-200 max-w-xl mx-auto leading-relaxed font-normal">
            Take a breath. You don&apos;t have to commit to anything today except finding clarity on how to begin.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/intake"
              className="w-full sm:w-auto py-3.5 px-8 bg-white hover:bg-cream-100 text-forest-950 text-xs sm:text-sm font-bold rounded-2xl shadow-md transition-all"
            >
              Find my next step
            </Link>
            <Link
              href="/psychologists"
              className="w-full sm:w-auto py-3.5 px-8 bg-forest-800/80 hover:bg-forest-800 text-sage-100 border border-forest-700 text-xs sm:text-sm font-semibold rounded-2xl transition-all"
            >
              Explore psychologists
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-sage-200 bg-white py-12 px-4 sm:px-6 lg:px-8 text-xs text-forest-600">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-xl bg-forest-800 flex items-center justify-center text-white font-bold text-sm">
                Ψ
              </div>
              <span className="font-bold text-base text-forest-950">
                Mind Refill
              </span>
            </div>
            <p className="max-w-sm text-forest-700 text-xs leading-relaxed">
              A humane, clinically grounded psychology platform connecting individuals with licensed practitioners and psychoeducational resources.
            </p>
            <div className="text-[11px] text-forest-500 pt-2">
              Crisis Disclaimer: If you are in immediate danger or experiencing self-harm urges, please contact national emergency services (112) or call the Kiran helpline (1800-599-0019).
            </div>
          </div>

          <div>
            <h4 className="font-bold text-forest-950 text-xs uppercase tracking-wider mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-forest-700">
              <li>
                <Link href="/psychologists" className="hover:text-forest-950">
                  Find a Psychologist
                </Link>
              </li>
              <li>
                <Link href="/intake" className="hover:text-forest-950">
                  Guided Intake Matching
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-forest-950">
                  Clinical Articles
                </Link>
              </li>
              <li>
                <Link href="/ebooks" className="hover:text-forest-950">
                  E-Books & Workbooks
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-forest-950">
                  Workshops & Events
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-forest-950 text-xs uppercase tracking-wider mb-3">
              For Practitioners
            </h4>
            <ul className="space-y-2 text-forest-700">
              <li>
                <Link href="/register" className="hover:text-forest-950">
                  Apply to Practice
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-forest-950">
                  Practitioner Login
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="hover:text-forest-950">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="hover:text-forest-950">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-sage-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-forest-500 gap-4">
          <p>© {new Date().getFullYear()} Mind Refill. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/legal/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/legal/terms" className="hover:underline">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
