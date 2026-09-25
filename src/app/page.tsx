import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Users, Compass, Search, Moon, Sparkles, Feather, ShieldCheck, HeartHandshake } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { NewsletterForm } from "@/components/home/newsletter-form";

const CONCERN_CARDS = [
  {
    id: "overwhelmed",
    icon: Feather,
    title: "Feeling overwhelmed",
    desc: "When racing thoughts, chronic tension, or panic feel too heavy to carry alone.",
    link: "/intake",
  },
  {
    id: "relationships",
    icon: Users,
    title: "Relationship difficulties",
    desc: "Navigating communication breakdowns, attachment patterns, and mutual connection.",
    link: "/intake",
  },
  {
    id: "transition",
    icon: Compass,
    title: "A major life change",
    desc: "Finding grounding amidst career shifts, heartbreak, relocation, or identity rediscovery.",
    link: "/intake",
  },
  {
    id: "understanding",
    icon: Search,
    title: "Want to understand yourself better",
    desc: "Exploring your emotional patterns, unconscious behaviors, and inner voice.",
    link: "/intake",
  },
  {
    id: "sleep",
    icon: Moon,
    title: "Struggling with sleep",
    desc: "Restoring natural circadian rhythms and easing bedtime anxiety and physical exhaustion.",
    link: "/intake",
  },
  {
    id: "something-else",
    icon: Sparkles,
    title: "Something else",
    desc: "You don't need a formal diagnosis or exact words. Just start where you are.",
    link: "/intake",
  },
];

const FEATURED_PSYCHOLOGISTS = [
  {
    id: "fp-1",
    slug: "dr-sarah-jenkins",
    fullName: "Dr. Sarah Jenkins, Ph.D.",
    professionalTitle: "Clinical Psychologist",
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600",
    quote: "Therapy isn't about fixing you, because you aren't broken. It's about helping you understand your mind so you can find your way back to yourself.",
    specializations: ["Anxiety", "Trauma & PTSD", "Burnout"],
    experience: "12 years practice",
    languages: "English, French",
    availability: "Accepting new clients",
    sessionFee: "$180",
  },
  {
    id: "fp-2",
    slug: "michael-chang",
    fullName: "Michael Chang, Psy.D.",
    professionalTitle: "Licensed Psychotherapist",
    photoUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=600",
    quote: "True healing happens in connection. Together, we look at the patterns holding you back and learn how to express vulnerability safely.",
    specializations: ["Couples & Intimacy", "Life Transitions", "Depression"],
    experience: "9 years practice",
    languages: "English",
    availability: "Next availability Thursday",
    sessionFee: "$150",
  },
  {
    id: "fp-3",
    slug: "dr-elena-rodriguez",
    fullName: "Dr. Elena Rodriguez, Psy.D.",
    professionalTitle: "Neuropsychologist",
    photoUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=600",
    quote: "Understanding the biology of your nervous system frees you from self-blame. When you realize how your body responds to stress, change becomes possible.",
    specializations: ["Adult ADHD", "Somatic Care", "Stress Management"],
    experience: "15 years practice",
    languages: "English, Spanish",
    availability: "Online sessions open",
    sessionFee: "$200",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#173C32] text-[#F7F3E9] selection:bg-[#3F6855] selection:text-[#F1EBDD] overflow-x-hidden font-sans">
      <Navbar />

      <main className="flex-grow">
        {/* ========================================================================= */}
        {/* 1. HERO SECTION (Minimal Sans-Serif + Integrated Photographic Environment) */}
        {/* ========================================================================= */}
        <section className="relative w-full min-h-[90vh] flex items-center bg-[#173C32] overflow-hidden pt-12 pb-24 lg:py-0">
          
          {/* Edge-Blended Photographic Environment (Right side / Background) */}
          <div className="absolute inset-0 w-full h-full lg:left-[45%] lg:w-[55%] z-0 pointer-events-none">
            <div className="relative w-full h-full opacity-30 lg:opacity-[0.85] transition-all duration-1000">
              <Image
                src="https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&q=80&w=1600"
                alt="A warm, natural interior with sunlight and a calm atmosphere"
                fill
                priority
                className="object-cover object-[70%_center] sm:object-[80%_center]"
              />
              {/* Fade gradients to blend image into the green background seamlessly */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#173C32] via-[#173C32]/40 to-transparent lg:via-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#173C32] via-[#173C32]/80 to-transparent hidden lg:block" />
              <div className="absolute inset-0 bg-gradient-to-l from-[#173C32]/30 via-transparent to-transparent hidden lg:block" />
            </div>
            
            {/* Editorial Secondary Detail */}
            <div className="hidden lg:block absolute bottom-[15%] right-16 z-10 pointer-events-auto">
              <span className="font-serif italic text-xl text-[#F1EBDD]/70 font-light tracking-wide drop-shadow-md">
                A calmer, brighter you.
              </span>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Typography & CTAs */}
              <div className="lg:col-span-7 xl:col-span-6 space-y-8 sm:space-y-10 text-left pt-10 sm:pt-0">
                
                {/* Eyebrow */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-[#C9D2BC]/15 text-[#C9D2BC] text-[11px] font-semibold tracking-[0.15em] uppercase backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9CAF91] animate-pulse" />
                  <span>A LITTLE SUPPORT CAN CHANGE A LOT</span>
                </div>

                {/* Main Headline (Modern Sans-Serif) */}
                <h1 className="font-sans text-[2.75rem] sm:text-6xl lg:text-[4.5rem] font-medium text-[#F7F3E9] leading-[1.05] tracking-tight">
                  You don&apos;t have to <br className="hidden sm:block" />
                  figure it all out alone.
                </h1>

                {/* Supporting Copy */}
                <p className="text-base sm:text-[1.1rem] text-[#C9D2BC] font-light max-w-xl leading-[1.7]">
                  A calm space to understand, heal, and grow â€” connecting you with qualified, compassionate psychologists who truly listen.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-5 pt-2">
                  <Link
                    href="/intake"
                    className="h-[3.5rem] px-8 rounded-full bg-[#F1EBDD] hover:bg-white text-[#173C32] font-medium text-[15px] flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>Find the right support</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/psychologists"
                    className="h-[3.5rem] px-7 rounded-full bg-transparent hover:bg-white/5 border border-[#C9D2BC]/30 text-[#F7F3E9] font-medium text-[15px] flex items-center justify-center transition-all hover:border-white/40"
                  >
                    <span>I&apos;m not sure what I need</span>
                  </Link>
                </div>

                {/* Trust Indicators (Quiet & Understated) */}
                <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row gap-5 text-[13px] text-[#9CAF91] font-medium">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-[18px] h-[18px] opacity-80 stroke-[1.5]" />
                    <span>Verified Professionals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-[18px] h-[18px] opacity-80 stroke-[1.5]" />
                    <span>Human-Assisted Matching</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="w-[18px] h-[18px] opacity-80 stroke-[1.5]" />
                    <span>Your Privacy Comes First</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Organic Terrain Divider 1 */}
        <div className="w-full overflow-hidden leading-none pointer-events-none bg-[#173C32]">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative block w-full h-10 sm:h-16 text-[#244F42]" preserveAspectRatio="none">
            <path d="M0,80 C480,0 960,0 1440,80 Z" fill="currentColor" />
          </svg>
        </div>

        {/* ========================================================================= */}
        {/* 2. "What&apos;s on your mind?" SECTION */}
        {/* ========================================================================= */}
        <section className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#244F42]">
          <div className="max-w-7xl mx-auto space-y-12 sm:space-y-16">
            
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <span className="text-[11px] font-bold tracking-[0.15em] text-[#9CAF91] uppercase">
                MAYBE YOU&apos;RE HERE BECAUSE
              </span>
              <h2 className="font-sans text-[2rem] sm:text-[2.75rem] md:text-[3rem] font-medium text-[#F7F3E9] tracking-tight">
                What&apos;s on your mind?
              </h2>
              <p className="text-[#C9D2BC] text-[15px] sm:text-[17px] font-light leading-relaxed">
                Life can be overwhelming sometimes. Whatever you&apos;re going through, you&apos;re not alone.
              </p>
            </div>

            {/* 6 Soft Minimal Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {CONCERN_CARDS.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={item.link}
                    className="group bg-[#173C32]/20 hover:bg-[#173C32]/40 border border-white/5 hover:border-white/10 rounded-[24px] p-8 sm:p-10 transition-all duration-300 flex flex-col justify-between space-y-6 lg:space-y-8 hover:-translate-y-1"
                  >
                    <div className="space-y-5">
                      <IconComponent className="w-7 h-7 text-[#9CAF91] stroke-[1.5]" />
                      <div className="space-y-3">
                        <h3 className="font-sans text-[1.15rem] font-medium text-[#F7F3E9] group-hover:text-white transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-[14px] text-[#C9D2BC]/90 font-light leading-[1.6]">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Organic Terrain Divider 2 */}
        <div className="w-full overflow-hidden leading-none pointer-events-none bg-[#244F42]">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative block w-full h-10 sm:h-16 text-[#1C473C]" preserveAspectRatio="none">
            <path d="M0,0 C480,80 960,80 1440,0 L1440,80 L0,80 Z" fill="currentColor" />
          </svg>
        </div>

        {/* ========================================================================= */}
        {/* 3. HOW IT WORKS (Connected Journey 01 â”€â”€â”€â”€â”€ 02 â”€â”€â”€â”€â”€ 03) */}
        {/* ========================================================================= */}
        <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-[#1C473C]">
          <div className="max-w-7xl mx-auto space-y-16 lg:space-y-24">
            
            <div className="text-center max-w-3xl mx-auto space-y-5">
              <h2 className="font-sans text-[2rem] sm:text-[2.75rem] md:text-[3rem] font-medium text-[#F7F3E9] tracking-tight leading-[1.1]">
                A simpler way to get the support you need.
              </h2>
              <p className="text-[#C9D2BC] text-[15px] sm:text-[17px] font-light leading-relaxed max-w-lg mx-auto">
                From your first step to your first session, we&apos;re here to make the process feel calm, clear and human.
              </p>
            </div>

            {/* Desktop Horizontal Connected Steps */}
            <div className="hidden md:grid grid-cols-3 gap-8 relative items-start">
              {/* Thin Human Connecting Line */}
              <div className="absolute top-[2rem] left-[16%] right-[16%] h-[1px] bg-[#9CAF91]/30 z-0" />

              {/* Step 01 */}
              <div className="relative z-10 text-center space-y-6 px-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#1C473C] border border-[#9CAF91]/50 flex items-center justify-center text-[#F1EBDD] font-mono text-[15px] tracking-wider">
                  01
                </div>
                <div className="space-y-3">
                  <h3 className="font-sans text-[1.15rem] font-medium text-[#F7F3E9]">
                    Share what&apos;s on your mind
                  </h3>
                  <p className="text-[14px] text-[#C9D2BC] font-light leading-[1.6]">
                    Tell us a bit about what you&apos;re experiencing.
                  </p>
                </div>
              </div>

              {/* Step 02 */}
              <div className="relative z-10 text-center space-y-6 px-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#1C473C] border border-[#9CAF91]/50 flex items-center justify-center text-[#F1EBDD] font-mono text-[15px] tracking-wider">
                  02
                </div>
                <div className="space-y-3">
                  <h3 className="font-sans text-[1.15rem] font-medium text-[#F7F3E9]">
                    Get matched with care
                  </h3>
                  <p className="text-[14px] text-[#C9D2BC] font-light leading-[1.6]">
                    Our coordinators will help you find the right psychologist.
                  </p>
                </div>
              </div>

              {/* Step 03 */}
              <div className="relative z-10 text-center space-y-6 px-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#1C473C] border border-[#9CAF91]/50 flex items-center justify-center text-[#F1EBDD] font-mono text-[15px] tracking-wider">
                  03
                </div>
                <div className="space-y-3">
                  <h3 className="font-sans text-[1.15rem] font-medium text-[#F7F3E9]">
                    Take your next step
                  </h3>
                  <p className="text-[14px] text-[#C9D2BC] font-light leading-[1.6]">
                    Choose a time and begin your journey.
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile Vertical Connected Steps */}
            <div className="md:hidden space-y-10 relative pl-4">
              <div className="absolute top-4 bottom-8 left-[1.95rem] w-[1px] bg-[#9CAF91]/30 z-0" />

              <div className="relative flex items-start gap-6">
                <div className="w-12 h-12 rounded-full bg-[#1C473C] border border-[#9CAF91]/50 flex items-center justify-center flex-shrink-0 text-[#F1EBDD] font-mono text-[13px] tracking-widest z-10">
                  01
                </div>
                <div className="space-y-2 pt-0.5">
                  <h3 className="font-sans text-[1.1rem] font-medium text-[#F7F3E9]">
                    Share what&apos;s on your mind
                  </h3>
                  <p className="text-[14px] text-[#C9D2BC] font-light leading-relaxed">
                    Tell us a bit about what you&apos;re experiencing.
                  </p>
                </div>
              </div>

              <div className="relative flex items-start gap-6">
                <div className="w-12 h-12 rounded-full bg-[#1C473C] border border-[#9CAF91]/50 flex items-center justify-center flex-shrink-0 text-[#F1EBDD] font-mono text-[13px] tracking-widest z-10">
                  02
                </div>
                <div className="space-y-2 pt-0.5">
                  <h3 className="font-sans text-[1.1rem] font-medium text-[#F7F3E9]">
                    Get matched with care
                  </h3>
                  <p className="text-[14px] text-[#C9D2BC] font-light leading-relaxed">
                    Our coordinators will help you find the right psychologist.
                  </p>
                </div>
              </div>

              <div className="relative flex items-start gap-6">
                <div className="w-12 h-12 rounded-full bg-[#1C473C] border border-[#9CAF91]/50 flex items-center justify-center flex-shrink-0 text-[#F1EBDD] font-mono text-[13px] tracking-widest z-10">
                  03
                </div>
                <div className="space-y-2 pt-0.5">
                  <h3 className="font-sans text-[1.1rem] font-medium text-[#F7F3E9]">
                    Take your next step
                  </h3>
                  <p className="text-[14px] text-[#C9D2BC] font-light leading-relaxed">
                    Choose a time and begin your journey.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Organic Terrain Divider 3 */}
        <div className="w-full overflow-hidden leading-none pointer-events-none bg-[#1C473C]">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative block w-full h-10 sm:h-16 text-[#173C32]" preserveAspectRatio="none">
            <path d="M0,80 C480,0 960,0 1440,80 Z" fill="currentColor" />
          </svg>
        </div>

        {/* ========================================================================= */}
        {/* 4. VERIFIED PSYCHOLOGISTS */}
        {/* ========================================================================= */}
        <section className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#173C32]">
          <div className="max-w-7xl mx-auto space-y-12">
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/5 pb-8">
              <div className="space-y-3">
                <span className="text-[11px] font-bold tracking-[0.15em] text-[#9CAF91] uppercase">
                  VERIFIED PSYCHOLOGISTS
                </span>
                <h2 className="font-sans text-[2rem] sm:text-[2.75rem] md:text-[3rem] font-medium text-[#F7F3E9] tracking-tight">
                  People who understand
                </h2>
                <p className="text-[#C9D2BC] text-[15px] sm:text-[17px] font-light max-w-xl">
                  Connect with qualified and compassionate psychologists.
                </p>
              </div>

            </div>

            {/* Psychologist Profiles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {FEATURED_PSYCHOLOGISTS.map((psych) => (
                <div
                  key={psych.id}
                  className="bg-[#244F42]/30 rounded-[24px] overflow-hidden flex flex-col justify-between border border-white/5 hover:border-white/10 transition-all duration-300"
                >
                  <div className="space-y-5 pb-5">
                    {/* Portrait Photo - Clean & Authentic */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#122C25]">
                      <Image
                        src={psych.photoUrl}
                        alt={psych.fullName}
                        fill
                        className="object-cover object-[center_20%]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1C473C]/90 via-[#1C473C]/20 to-transparent" />
                      <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between">
                        <span className="px-3 py-1.5 rounded-full bg-[#173C32]/80 backdrop-blur text-[11px] font-medium text-white/90">
                          {psych.availability}
                        </span>
                      </div>
                    </div>

                    {/* Bio & Details */}
                    <div className="px-6 space-y-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-sans text-[1.25rem] font-medium text-[#F7F3E9]">
                            {psych.fullName}
                          </h3>
                        </div>
                        <p className="text-[13px] text-[#9CAF91] font-light mt-1">
                          {psych.professionalTitle}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {psych.specializations.map((spec) => (
                          <span
                            key={spec}
                            className="text-[12px] font-medium text-[#C9D2BC] flex items-center gap-1.5"
                          >
                            <span className="w-1 h-1 rounded-full bg-[#718B73]" />
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Profile Action */}
                  <div className="p-6 pt-0 mt-auto">
                    <Link
                      href={`/psychologists/${psych.slug}`}
                      className="w-full h-12 rounded-full bg-[#173C32] hover:bg-[#F1EBDD] border border-white/5 text-[#F1EBDD] hover:text-[#173C32] font-medium text-[14px] text-center flex items-center justify-center transition-all"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Organic Terrain Divider 4 (To Newsletter) */}
        <div className="w-full overflow-hidden leading-none pointer-events-none bg-[#173C32]">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative block w-full h-10 sm:h-16 text-[#F1EBDD]" preserveAspectRatio="none">
            <path d="M0,0 C480,80 960,80 1440,0 L1440,80 L0,80 Z" fill="currentColor" />
          </svg>
        </div>

        {/* ========================================================================= */}
        {/* 5. NEWSLETTER SECTION (High Contrast Warm Cream) */}
        {/* ========================================================================= */}
        <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 bg-[#F1EBDD] text-[#173C32]">
          <div className="max-w-3xl mx-auto text-center space-y-6 sm:space-y-8">
            
            <h2 className="font-sans text-[2rem] sm:text-[3rem] font-medium text-[#173C32] leading-[1.1] tracking-tight">
              Insights for a healthier, calmer you.
            </h2>

            <p className="text-[15px] sm:text-[17px] text-[#244F42]/80 font-normal max-w-xl mx-auto leading-relaxed">
              Get helpful resources, event updates, and gentle reminders â€” straight to your inbox.
            </p>

            {/* Inline Email Capture Box */}
            <div className="pt-2 max-w-md mx-auto w-full">
              <NewsletterForm />
            </div>

          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
