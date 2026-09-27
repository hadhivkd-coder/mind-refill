import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Search, ShieldCheck, Heart, Sparkles, MoveRight, UserPlus, PlayCircle, Star, Brain, Moon, Leaf, User, MoreHorizontal, MessageCircle, Users, Wind, ChevronLeft, ChevronRight, Globe, Calendar, CheckCircle2, FileText } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { DirectoryService } from "@/modules/directory/services/directory.service";
import { ContentService } from "@/modules/content/services/content.service";
import { EbookService } from "@/modules/content/services/ebook.service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch logic omitted to use high-fidelity design mockups
  try {
    await DirectoryService.search({ limit: 1 });
    await ContentService.listPublicArticles(1, 1);
    await EbookService.listPublicEbooks();
  } catch (err) {
    console.error(err);
  }



  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#FAF8F2] text-[#29272C] selection:bg-[#A99BC7] selection:text-white">
      <Navbar />

      <main className="flex-grow flex flex-col items-center">
        {/* ========================================================================= */}
        {/* 1. HERO SECTION */}
        {/* ========================================================================= */}
        <section className="relative w-full pt-32 pb-20 md:pt-40 md:pb-32 px-4 sm:px-6 lg:px-12 overflow-hidden bg-[#FCFBFA]">
          {/* Organic Background Shape & SVG Definitions */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <svg
              className="absolute right-0 top-0 w-[65vw] h-full"
              viewBox="0 0 1000 800"
              preserveAspectRatio="none"
            >
              <path
                d="M1000,0 L200,0 C200,0 150,200 400,450 C550,600 200,750 200,800 L1000,800 Z"
                fill="#F4EFF9"
              />
            </svg>
            <svg
              className="absolute left-[38%] bottom-[12%] w-12 h-12 text-[#AFA1CE]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M21 3C21 3 20 12 12 12C4 12 3 3 3 3C3 3 12 4 12 12C12 20 3 21 3 21C3 21 12 20 12 12C12 4 21 3 21 3Z" />
            </svg>
          </div>
          
          <svg width="0" height="0" className="absolute">
            <defs>
              <clipPath id="hero-image-mask" clipPathUnits="objectBoundingBox">
                <path d="M 0.25 0 L 1 0 L 1 1 L 0.35 1 C 0.05 0.7 -0.15 0.2 0.25 0 Z" />
              </clipPath>
            </defs>
          </svg>

          <div className="relative z-10 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* LEFT: Typography & CTAs */}
            <div className="lg:pr-10 xl:pr-16 space-y-6">
              
              <div className="inline-flex items-center gap-2 bg-[#F4EFF9] text-[#7856A4] px-4 py-2 rounded-full text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" /> Modern Mental Wellbeing
              </div>

              <h1 className="text-[3rem] sm:text-[4rem] lg:text-[4.5rem] font-bold text-[#0D0D0D] leading-[1.05] tracking-tight">
                You don&apos;t have to<br />
                figure it all out<br />
                <span className="text-[#7856A4]">alone.</span>
              </h1>

              <p className="text-[#666666] text-[1.125rem] md:text-[1.25rem] font-normal leading-relaxed max-w-[420px] pb-2">
                A safe, simple space to find the right support — at your own pace.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link
                  href="/psychologists"
                  className="bg-[#7856A4] hover:bg-[#63458A] text-white rounded-full px-8 py-4 font-semibold text-[15px] flex items-center justify-center gap-2 transition-all"
                >
                  <span>Find support</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/intake"
                  className="bg-white border border-[#E5E5E5] text-[#7856A4] rounded-full px-8 py-4 font-semibold text-[15px] flex items-center justify-center transition-all hover:border-[#7856A4] hover:shadow-sm"
                >
                  <span>I&apos;m not sure where to start</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F4EFF9] flex items-center justify-center text-[#7856A4] shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  </div>
                  <span className="text-[13px] text-[#444] leading-[1.2] font-medium">Verified<br/>professionals</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F4EFF9] flex items-center justify-center text-[#7856A4] shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[13px] text-[#444] leading-[1.2] font-medium">100% private<br/>and secure</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F4EFF9] flex items-center justify-center text-[#7856A4] shrink-0">
                    <Heart className="w-5 h-5" />
                  </div>
                  <span className="text-[13px] text-[#444] leading-[1.2] font-medium">Human care,<br/>not just a platform</span>
                </div>
              </div>
            </div>

            {/* RIGHT: Large Emotional Image with Organic Mask */}
            <div className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[650px]">
              <div 
                className="absolute inset-0 bg-[#EAE6F0] overflow-hidden" 
                style={{ clipPath: 'url(#hero-image-mask)' }}
              >
                <Image
                  src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=1600"
                  alt="Therapy session"
                  fill
                  priority
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>

              {/* Floating Testimonial Card */}
              <div className="absolute -bottom-6 -left-6 sm:left-0 lg:-left-12 bg-white/95 backdrop-blur-md rounded-2xl p-5 flex items-start gap-4 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] w-[280px] sm:w-[320px]">
                <div className="w-12 h-12 rounded-full bg-[#F4EFF9] flex items-center justify-center flex-shrink-0 text-[#7856A4]">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2H4c-1.25 0-2 .75-2 2v8c0 7 4 8 7 8zM14 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2h-4c-1.25 0-2 .75-2 2v8c0 7 4 8 7 8z"/></svg>
                </div>
                <div>
                  <h4 className="font-bold text-[#1A1A1A] text-[13px] sm:text-[14px]">Your well-being matters.</h4>
                  <p className="text-[12px] text-[#666] leading-relaxed mt-1 font-medium">Confidential, compassionate and always at your pace.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. WHAT ARE YOU LOOKING FOR? */}
        {/* ========================================================================= */}
        <section className="relative w-full py-24 bg-[#FCFBFA] overflow-hidden">
          {/* Subtle background blobbly shapes */}
          <div className="absolute top-0 left-0 w-80 h-80 bg-[#F4EFF9] rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#F4EFF9] rounded-full blur-[120px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

          {/* Decorative Arrow & Text (Desktop only) */}
          <div className="hidden lg:flex absolute right-[15%] top-[25%] text-[#AFA1CE] flex-col items-center">
            <span className="font-serif italic text-lg transform -rotate-12 whitespace-nowrap">Take the<br/>first step</span>
            <svg width="40" height="50" viewBox="0 0 40 50" fill="none" className="transform -scale-x-100 rotate-12 -mt-2 ml-8">
              <path d="M5 5 Q 35 25 20 45" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <path d="M15 40 L 20 45 L 25 38" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="h-[1px] w-8 bg-[#D1C4E9]" />
                <span className="text-[11px] font-bold tracking-[0.2em] text-[#AFA1CE] uppercase">A safe place to start</span>
                <div className="h-[1px] w-8 bg-[#D1C4E9]" />
              </div>
              <h2 className="text-[2.5rem] md:text-[3.5rem] font-bold text-[#1A1A1A] tracking-tight">
                What&apos;s on your <span className="text-[#7856A4]">mind?</span>
              </h2>
              <p className="text-[#666666] text-[16px] md:text-[18px] font-normal pt-2">
                Click what feels relevant to you, and we&apos;ll help you find the right path forward.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 max-w-[950px] mx-auto">
              {[
                { title: "Feeling\noverwhelmed", id: "overwhelmed", bg: "bg-[#F3EEFA]", icon: <Brain className="w-5 h-5 text-[#7856A4]" /> },
                { title: "Relationship\ndifficulties", id: "relationships", bg: "bg-[#FCEAEA]", icon: <Heart className="w-5 h-5 text-[#D9534F]" /> },
                { title: "Anxiety &\nstress", id: "anxiety", bg: "bg-[#F3E8FF]", icon: <Wind className="w-5 h-5 text-[#9333EA]" /> },
                { title: "Sleep & rest", id: "sleep", bg: "bg-[#EBF4FF]", icon: <Moon className="w-5 h-5 text-[#3B82F6]" /> },
                { title: "Life changes", id: "changes", bg: "bg-[#EAF5EE]", icon: <Leaf className="w-5 h-5 text-[#10B981]" /> },
                { title: "Understanding\nyourself", id: "self", bg: "bg-[#FDF0E6]", icon: <User className="w-5 h-5 text-[#F97316]" /> },
                { title: "Something else", id: "other", bg: "bg-[#F0EDF5]", icon: <MoreHorizontal className="w-5 h-5 text-[#7856A4]" /> },
              ].map((cat) => (
                <Link
                  key={cat.id}
                  href={`/intake?focus=${cat.id}`}
                  className="group bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(120,86,164,0.12)] p-2 pr-5 flex items-center gap-4 transition-all hover:-translate-y-1"
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${cat.bg}`}>
                    {cat.icon}
                  </div>
                  <span className="text-[14px] font-semibold text-[#1A1A1A] leading-tight whitespace-pre-line pr-2">
                    {cat.title}
                  </span>
                  <div className="w-8 h-8 rounded-full border border-[#EEEAF5] group-hover:border-[#7856A4] group-hover:text-[#7856A4] flex items-center justify-center text-[#AFA1CE] transition-colors shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. HOW MIND REFILL WORKS */}
        {/* ========================================================================= */}
        <section className="relative w-full py-28 bg-[#F8F6FC] overflow-hidden">
          {/* Subtle floral left graphic */}
          <div className="absolute left-[-5%] bottom-0 text-[#EAE6F0] pointer-events-none opacity-50">
            <svg width="300" height="300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5">
              <path d="M12 22C12 22 12 14 18 14C24 14 24 6 24 6C24 6 16 6 16 12C16 12 16 6 12 6M0 14C0 14 0 22 6 22C12 22 12 14 12 14C12 14 4 14 4 20C4 20 4 14 0 14Z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-24 space-y-4">
              <span className="text-[11px] font-bold tracking-[0.2em] text-[#7856A4] uppercase">Simple. Human. Personal.</span>
              <h2 className="text-[2.5rem] md:text-[3.5rem] font-bold text-[#1A1A1A] tracking-tight">
                How it works
              </h2>
              <p className="text-[#666666] text-[16px] md:text-[18px] font-normal">
                A simple path to the support you deserve.
              </p>
            </div>

            <div className="relative">
              {/* Desktop Connecting Wavy Line */}
              <div className="hidden md:block absolute top-[52px] left-[15%] right-[15%] h-[2px] -z-10">
                <svg className="w-full h-[100px] overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 100">
                  <path d="M0,50 C250,-20 250,120 500,50 C750,-20 750,120 1000,50" fill="none" stroke="#D1C4E9" strokeWidth="2" />
                  <circle cx="250" cy="50" r="4" fill="#D1C4E9" />
                  <circle cx="750" cy="50" r="4" fill="#D1C4E9" />
                </svg>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
                {/* Step 1 */}
                <div className="relative text-center flex flex-col items-center">
                  <div className="relative mb-8">
                    <div className="w-[104px] h-[104px] bg-white rounded-full shadow-[0_15px_40px_-10px_rgba(120,86,164,0.12)] flex items-center justify-center text-[#7856A4] z-10 relative">
                      <MessageCircle className="w-8 h-8" strokeWidth={1.5} />
                    </div>
                    <div className="absolute top-0 left-0 -ml-2 -mt-2 w-[34px] h-[34px] bg-[#7856A4] rounded-full flex items-center justify-center text-white text-[13px] font-bold z-20 shadow-sm border-[3px] border-[#F8F6FC]">
                      01
                    </div>
                  </div>
                  <h3 className="text-[1.35rem] font-bold text-[#1A1A1A] mb-3">Tell us what you&apos;re<br/>going through</h3>
                  <p className="text-[15px] text-[#666666] font-normal leading-relaxed max-w-[280px]">
                    Take a moment to share your feelings securely. You set the pace.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="relative text-center flex flex-col items-center">
                  <div className="relative mb-8">
                    <div className="w-[104px] h-[104px] bg-white rounded-full shadow-[0_15px_40px_-10px_rgba(120,86,164,0.12)] flex items-center justify-center text-[#7856A4] z-10 relative">
                      <Users className="w-8 h-8" strokeWidth={1.5} />
                    </div>
                    <div className="absolute top-0 left-0 -ml-2 -mt-2 w-[34px] h-[34px] bg-[#7856A4] rounded-full flex items-center justify-center text-white text-[13px] font-bold z-20 shadow-sm border-[3px] border-[#F8F6FC]">
                      02
                    </div>
                  </div>
                  <h3 className="text-[1.35rem] font-bold text-[#1A1A1A] mb-3">Find the right<br/>psychologist</h3>
                  <p className="text-[15px] text-[#666666] font-normal leading-relaxed max-w-[280px]">
                    We match you with professionals who specialize exactly in your needs.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="relative text-center flex flex-col items-center">
                  <div className="relative mb-8">
                    <div className="w-[104px] h-[104px] bg-white rounded-full shadow-[0_15px_40px_-10px_rgba(120,86,164,0.12)] flex items-center justify-center text-[#7856A4] z-10 relative">
                      <Leaf className="w-8 h-8" strokeWidth={1.5} />
                    </div>
                    <div className="absolute top-0 left-0 -ml-2 -mt-2 w-[34px] h-[34px] bg-[#7856A4] rounded-full flex items-center justify-center text-white text-[13px] font-bold z-20 shadow-sm border-[3px] border-[#F8F6FC]">
                      03
                    </div>
                  </div>
                  <h3 className="text-[1.35rem] font-bold text-[#1A1A1A] mb-3">Take your next step</h3>
                  <p className="text-[15px] text-[#666666] font-normal leading-relaxed max-w-[280px]">
                    Book a session, read resources, or just start a conversation. It&apos;s up to you.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

                {/* ========================================================================= */}
        {/* 4. MEET PEOPLE WHO UNDERSTAND (Psychologists) */}
        {/* ========================================================================= */}
        <section className="relative w-full py-28 bg-[#FCFBFA] overflow-hidden">
          {/* Subtle floral/blob background left */}
          <div className="absolute top-0 left-0 w-80 h-80 bg-[#F4EFF9] rounded-br-[100px] opacity-70 -translate-x-1/4 -translate-y-1/4 pointer-events-none" />

          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-[1px] w-8 bg-[#D1C4E9]" />
                  <span className="text-[11px] font-bold tracking-[0.2em] text-[#AFA1CE] uppercase">Verified � Compassionate � Professional</span>
                  <div className="h-[1px] w-8 bg-[#D1C4E9]" />
                </div>
                <h2 className="text-[2.5rem] md:text-[3.25rem] font-bold text-[#1A1A1A] tracking-tight leading-tight">
                  Meet people who <span className="text-[#7856A4]">understand.</span>
                </h2>
                <p className="text-[#666666] text-[16px] md:text-[18px] font-normal">
                  Our network of verified, licensed psychologists is here to listen.
                </p>
              </div>

              <div className="flex items-center gap-6 pb-2">
                <Link href="/psychologists" className="text-[#7856A4] font-bold text-[14px] hover:text-[#63458A] transition-colors flex items-center gap-1">
                  View all psychologists <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="hidden sm:flex gap-2">
                  <button className="w-10 h-10 rounded-full border border-[#D1C4E9] flex items-center justify-center text-[#AFA1CE] hover:text-[#7856A4] hover:border-[#7856A4] transition-colors bg-white shadow-sm">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button className="w-10 h-10 rounded-full border border-[#D1C4E9] flex items-center justify-center text-[#AFA1CE] hover:text-[#7856A4] hover:border-[#7856A4] transition-colors bg-white shadow-sm">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Carousel */}
            <div className="flex overflow-x-auto gap-6 pb-8 pt-4 -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory">
              {[
                { slug: "dr-roshna", name: "Dr. Roshna K", title: "Clinical Psychologist", rating: "4.9", sessions: "120+", tags: ["Anxiety", "Relationships", "Young Adults"], lang: "Malayalam, English", avail: "Available today", image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=600" },
                { slug: "dr-anjali", name: "Dr. Anjali Menon", title: "Counselling Psychologist", rating: "4.8", sessions: "95+", tags: ["Stress", "Self-esteem", "Life transitions"], lang: "English, Malayalam", avail: "Available today", image: "https://images.unsplash.com/photo-1594824813637-2804b494632b?auto=format&fit=crop&q=80&w=600" },
                { slug: "dr-nikhil", name: "Dr. Nikhil Das", title: "Clinical Psychologist", rating: "4.9", sessions: "150+", tags: ["Anxiety", "Depression", "Men's mental health"], lang: "English, Malayalam", avail: "Available tomorrow", image: "https://images.unsplash.com/photo-1600804889194-e6fbf08ddb39?auto=format&fit=crop&q=80&w=600" },
                { slug: "ms-fathima", name: "Ms. Fathima R", title: "Counselling Psychologist", rating: "4.7", sessions: "80+", tags: ["Relationships", "Family", "Self-growth"], lang: "Malayalam, English", avail: "Available today", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=600" },
                { slug: "dr-meera", name: "Dr. Meera S", title: "Clinical Psychologist", rating: "4.9", sessions: "110+", tags: ["Trauma", "Anxiety", "Personal growth"], lang: "English, Malayalam", avail: "Available this week", image: "https://images.unsplash.com/photo-1618077360395-f3068be8e001?auto=format&fit=crop&q=80&w=600" },
              ].map((psych, i) => (
                <div key={i} className="min-w-[280px] sm:min-w-[310px] flex-shrink-0 snap-start bg-white rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-transparent hover:border-[#F4EFF9] hover:shadow-[0_8px_30px_rgb(120,86,164,0.08)] transition-all flex flex-col group">
                  <div className="relative w-full h-44 rounded-t-[20px] overflow-hidden">
                    <Image src={psych.image} alt={psych.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur rounded-full px-2.5 py-1 flex items-center gap-1 shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#7856A4]" />
                      <span className="text-[11px] font-bold text-[#7856A4]">Verified</span>
                    </div>
                  </div>
                  <div className="p-5 flex-grow flex flex-col">
                    <h3 className="text-[17px] font-bold text-[#1A1A1A] leading-tight">{psych.name}</h3>
                    <p className="text-[13px] text-[#666666] mt-0.5">{psych.title}</p>
                    
                    <div className="flex items-center gap-1 mt-2.5">
                      <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                      <span className="text-[13px] font-bold text-[#1A1A1A]">{psych.rating}</span>
                      <span className="text-[12px] text-[#AFA1CE]">({psych.sessions})</span>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {psych.tags.map(tag => (
                        <span key={tag} className="bg-[#F8F6FC] text-[#7856A4] text-[10px] font-semibold tracking-wide px-2.5 py-1 rounded-full">{tag}</span>
                      ))}
                    </div>

                    <div className="flex flex-col gap-2 mt-5 pt-4 border-t border-[#F0EBF7]">
                      <div className="flex items-center gap-2 text-[12px] text-[#666666]">
                        <Globe className="w-3.5 h-3.5 text-[#AFA1CE]" />
                        <span className="truncate">{psych.lang}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-[#666666]">
                        <Calendar className="w-3.5 h-3.5 text-[#AFA1CE]" />
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                          {psych.avail}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-5">
                      <Link href={`/psychologists/${psych.slug}`} className="flex-1 bg-[#7856A4] hover:bg-[#63458A] text-white text-[13px] font-semibold py-2.5 rounded-full text-center transition-colors shadow-sm">
                        View profile &rarr;
                      </Link>
                      <Link href={`/psychologists/${psych.slug}/book`} className="flex-1 bg-white border border-[#D1C4E9] hover:border-[#7856A4] text-[#7856A4] text-[13px] font-semibold py-2.5 rounded-full text-center transition-colors">
                        Book session
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2 pt-2">
              <div className="w-2 h-2 rounded-full bg-[#7856A4]" />
              <div className="w-2 h-2 rounded-full bg-[#EAE6F0]" />
              <div className="w-2 h-2 rounded-full bg-[#EAE6F0]" />
              <div className="w-2 h-2 rounded-full bg-[#EAE6F0]" />
              <div className="w-2 h-2 rounded-full bg-[#EAE6F0]" />
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. EXPLORE RESOURCES */}
        {/* ========================================================================= */}
        <section className="relative w-full py-28 bg-[#F8F6FC] overflow-hidden">
          {/* Subtle background blob */}
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#F4EFF9] rounded-tl-[100px] opacity-70 translate-x-1/4 translate-y-1/4 pointer-events-none" />

          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-[1px] w-8 bg-[#D1C4E9]" />
                  <span className="text-[11px] font-bold tracking-[0.2em] text-[#AFA1CE] uppercase">Learn � Reflect � Grow</span>
                  <div className="h-[1px] w-8 bg-[#D1C4E9]" />
                </div>
                <h2 className="text-[2.5rem] md:text-[3.25rem] font-bold text-[#1A1A1A] tracking-tight leading-tight">
                  Explore <span className="text-[#7856A4]">resources.</span>
                </h2>
                <p className="text-[#666666] text-[16px] md:text-[18px] font-normal">
                  Articles, insights, and videos created directly by our professionals.
                </p>
              </div>

              <div className="flex items-center gap-6 pb-2">
                <Link href="/resources" className="text-[#7856A4] font-bold text-[14px] hover:text-[#63458A] transition-colors flex items-center gap-1">
                  Browse all resources <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="hidden sm:flex gap-2">
                  <button className="w-10 h-10 rounded-full border border-[#D1C4E9] flex items-center justify-center text-[#AFA1CE] hover:text-[#7856A4] hover:border-[#7856A4] transition-colors bg-white shadow-sm">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button className="w-10 h-10 rounded-full border border-[#D1C4E9] flex items-center justify-center text-[#AFA1CE] hover:text-[#7856A4] hover:border-[#7856A4] transition-colors bg-white shadow-sm">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Carousel */}
            <div className="flex overflow-x-auto gap-6 pb-8 pt-4 -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory">
              {[
                { cat: "ARTICLES", title: "How to manage anxiety during uncertain times", icon: <FileText className="w-4 h-4"/>, image: "https://images.unsplash.com/photo-1517404215738-15263e9f9178?auto=format&fit=crop&q=80&w=600" },
                { cat: "VIDEOS", title: "A gentle guide to self-compassion", icon: <PlayCircle className="w-4 h-4"/>, image: "https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?auto=format&fit=crop&q=80&w=600" },
                { cat: "PRACTICE", title: "5 journaling prompts for emotional clarity", icon: <Leaf className="w-4 h-4"/>, image: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=600" },
                { cat: "E-BOOKS", title: "The Anxiety Workbook", icon: <BookOpen className="w-4 h-4"/>, image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600" },
                { cat: "EVENTS", title: "Live Workshop: Building a calmer you", icon: <Users className="w-4 h-4"/>, image: "https://images.unsplash.com/photo-1528642474498-1af0c17fd8c3?auto=format&fit=crop&q=80&w=600" },
              ].map((res, i) => (
                <Link key={i} href="/resources" className="min-w-[260px] sm:min-w-[280px] flex-shrink-0 snap-start bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-transparent hover:shadow-[0_8px_30px_rgb(120,86,164,0.1)] transition-all flex flex-col group relative">
                  <div className="relative w-full h-36 rounded-t-2xl overflow-hidden bg-gray-100">
                    <Image src={res.image} alt={res.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  
                  {/* Floating Icon Badge */}
                  <div className="absolute top-[120px] left-5 w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-sm z-20">
                    <div className="w-9 h-9 bg-[#F8F6FC] rounded-full flex items-center justify-center text-[#7856A4]">
                      {res.icon}
                    </div>
                  </div>

                  <div className="px-5 pt-8 pb-5 flex-grow flex flex-col">
                    <span className="text-[10px] font-bold tracking-widest text-[#AFA1CE] uppercase mb-1.5">{res.cat}</span>
                    <h3 className="text-[15px] font-bold text-[#1A1A1A] leading-snug">{res.title}</h3>
                    
                    <div className="mt-auto pt-6 flex justify-end">
                      <div className="w-8 h-8 rounded-full border border-[#EEEAF5] group-hover:border-[#7856A4] group-hover:text-[#7856A4] flex items-center justify-center text-[#AFA1CE] transition-colors">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
{/* ========================================================================= */}
        {/* 6. GUIDED WORKBOOKS */}
        {/* ========================================================================= */}
        <section className="relative w-full py-28 bg-[#FCFBFA] overflow-hidden">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-[1px] w-8 bg-[#D1C4E9]" />
                  <span className="text-[11px] font-bold tracking-[0.2em] text-[#AFA1CE] uppercase">Practical Tools For Real Life</span>
                  <div className="h-[1px] w-8 bg-[#D1C4E9]" />
                </div>
                <h2 className="text-[2.5rem] md:text-[3.25rem] font-bold text-[#1A1A1A] tracking-tight leading-tight">
                  Guided <span className="text-[#7856A4]">Workbooks.</span>
                </h2>
                <p className="text-[#666666] text-[16px] md:text-[18px] font-normal">
                  In-depth digital products to help you reflect, process, and grow.
                </p>
              </div>

              <div className="flex items-center gap-6 pb-2">
                <Link href="/ebooks" className="text-[#7856A4] font-bold text-[14px] hover:text-[#63458A] transition-colors flex items-center gap-1">
                  View all workbooks <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="hidden sm:flex gap-2">
                  <button className="w-10 h-10 rounded-full border border-[#D1C4E9] flex items-center justify-center text-[#AFA1CE] hover:text-[#7856A4] hover:border-[#7856A4] transition-colors bg-white shadow-sm">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button className="w-10 h-10 rounded-full border border-[#D1C4E9] flex items-center justify-center text-[#AFA1CE] hover:text-[#7856A4] hover:border-[#7856A4] transition-colors bg-white shadow-sm">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Carousel */}
            <div className="flex overflow-x-auto gap-6 pb-8 pt-4 -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory">
              {[
                { tag: "ANXIETY", title: "A Calmer You", desc: "A 30-day journey to less anxiety", author: "Dr. Roshna K", authorImage: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=150", rating: "4.8", reviews: "320", price: "₹499", image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600" },
                { tag: "RELATIONSHIPS", title: "Healing Relationships", desc: "A guided workbook for healthier connections", author: "Dr. Anjali Menon", authorImage: "https://images.unsplash.com/photo-1594824813637-2804b494632b?auto=format&fit=crop&q=80&w=150", rating: "4.7", reviews: "210", price: "₹399", image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600" },
                { tag: "SELF-GROWTH", title: "Know Yourself Better", desc: "A reflective journal for clarity and self-awareness", author: "Dr. Nikhil Das", authorImage: "https://images.unsplash.com/photo-1600804889194-e6fbf08ddb39?auto=format&fit=crop&q=80&w=150", rating: "4.9", reviews: "180", price: "₹449", image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600" },
                { tag: "SLEEP & WELLNESS", title: "Better Sleep", desc: "Practical tools for restful nights", author: "Ms. Fathima R", authorImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150", rating: "4.8", reviews: "275", price: "₹399", image: "https://images.unsplash.com/photo-1515814588531-10c73335520e?auto=format&fit=crop&q=80&w=600" },
                { tag: "MINDFULNESS", title: "Mindful Living", desc: "Simple practices for a more balanced life", author: "Dr. Meera S", authorImage: "https://images.unsplash.com/photo-1618077360395-f3068be8e001?auto=format&fit=crop&q=80&w=150", rating: "4.7", reviews: "190", price: "₹499", image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&q=80&w=600" },
              ].map((book, i) => (
                <div key={i} className="min-w-[280px] sm:min-w-[320px] flex-shrink-0 snap-start bg-white rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-transparent hover:border-[#F4EFF9] transition-all flex flex-col group p-4">
                  <div className="relative w-full h-56 rounded-[16px] overflow-hidden bg-[#F8F6FC]">
                    <Image src={book.image} alt={book.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="pt-5 flex-grow flex flex-col">
                    <span className="text-[10px] font-bold tracking-widest text-[#AFA1CE] uppercase mb-1.5">{book.tag}</span>
                    <h3 className="text-[17px] font-bold text-[#1A1A1A] leading-tight">{book.title}</h3>
                    <p className="text-[13px] text-[#666666] mt-1 leading-snug">{book.desc}</p>
                    
                    <div className="flex items-center gap-2 mt-4">
                      <Image src={book.authorImage} alt={book.author} width={24} height={24} className="rounded-full object-cover" />
                      <span className="text-[12px] font-semibold text-[#1A1A1A]">{book.author}</span>
                    </div>

                    <div className="flex items-center justify-between mt-5">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                        <span className="text-[13px] font-bold text-[#1A1A1A]">{book.rating}</span>
                        <span className="text-[12px] text-[#AFA1CE]">({book.reviews})</span>
                      </div>
                      <div className="w-8 h-8 rounded-full border border-[#EEEAF5] group-hover:border-[#7856A4] group-hover:text-[#7856A4] flex items-center justify-center text-[#AFA1CE] transition-colors">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-[#F0EBF7]">
                      <span className="text-[16px] font-bold text-[#1A1A1A]">{book.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. TRUST / PRIVACY */}
        {/* ========================================================================= */}
        <section className="relative w-full py-24 bg-[#F8F6FC] overflow-hidden">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Left Image with organic blob mask */}
            <div className="w-full lg:w-[45%] relative flex justify-center">
               <div className="absolute top-0 right-10 text-[#7856A4] opacity-50 rotate-12">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
               </div>
               <div 
                 className="relative w-full max-w-[420px] aspect-square overflow-hidden shadow-sm" 
                 style={{ borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%" }}
               >
                 <Image src="https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&q=80&w=800" alt="Trust" fill className="object-cover" />
                 {/* Dark overlay specifically for this image to make it match the ref */}
                 <div className="absolute inset-0 bg-black/10 mix-blend-multiply" />
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-20 bg-[#AFA1CE] rounded-[20px] rounded-t-[40px] flex items-center justify-center border-[6px] border-[#7856A4] opacity-90 shadow-2xl">
                    <Heart className="w-6 h-6 text-[#7856A4] fill-[#7856A4]" />
                 </div>
               </div>
            </div>

            {/* Content */}
            <div className="w-full lg:w-[55%] space-y-10">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-[1px] w-8 bg-[#D1C4E9]" />
                  <span className="text-[11px] font-bold tracking-[0.2em] text-[#AFA1CE] uppercase">Your trust comes first</span>
                  <div className="h-[1px] w-8 bg-[#D1C4E9]" />
                </div>
                <h2 className="text-[2.5rem] md:text-[3.25rem] font-bold text-[#1A1A1A] tracking-tight leading-tight">
                  Your privacy is <span className="text-[#7856A4]">fundamental.</span>
                </h2>
                <p className="text-[#666666] text-[16px] md:text-[18px] font-normal leading-relaxed max-w-2xl">
                  We employ strict, bank-level encryption and do not sell your personal data. Our professionals are rigorously vetted, verified, and bound by confidentiality agreements. This is a safe space.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 pt-4">
                 <div className="flex gap-5">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#7856A4] shrink-0 shadow-[0_4px_15px_rgb(0,0,0,0.04)]">
                       <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                       <h4 className="text-[15px] font-bold text-[#1A1A1A]">100% confidential</h4>
                       <p className="text-[13px] text-[#666666] mt-1.5 leading-relaxed">Your conversations stay private.</p>
                    </div>
                 </div>
                 <div className="flex gap-5">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#7856A4] shrink-0 shadow-[0_4px_15px_rgb(0,0,0,0.04)]">
                       <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                       <h4 className="text-[15px] font-bold text-[#1A1A1A]">Verified professionals</h4>
                       <p className="text-[13px] text-[#666666] mt-1.5 leading-relaxed">Only qualified and licensed psychologists.</p>
                    </div>
                 </div>
                 <div className="flex gap-5">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#7856A4] shrink-0 shadow-[0_4px_15px_rgb(0,0,0,0.04)]">
                       <FileText className="w-5 h-5" />
                    </div>
                    <div>
                       <h4 className="text-[15px] font-bold text-[#1A1A1A]">Secure platform</h4>
                       <p className="text-[13px] text-[#666666] mt-1.5 leading-relaxed">Bank-level encryption and data protection.</p>
                    </div>
                 </div>
                 <div className="flex gap-5">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#7856A4] shrink-0 shadow-[0_4px_15px_rgb(0,0,0,0.04)]">
                       <User className="w-5 h-5" />
                    </div>
                    <div>
                       <h4 className="text-[15px] font-bold text-[#1A1A1A]">Your control</h4>
                       <p className="text-[13px] text-[#666666] mt-1.5 leading-relaxed">You decide what to share, at your own pace.</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 8. FINAL EMOTIONAL CTA */}
        {/* ========================================================================= */}
        <section className="relative w-full py-32 overflow-hidden bg-[#FAF8F2]">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
             <Image src="https://images.unsplash.com/photo-1542359649-31e03cd4d909?auto=format&fit=crop&q=80&w=2000" alt="Sunrise landscape" fill className="object-cover object-center opacity-80" />
             <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent" />
          </div>

          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-2xl space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-[1px] w-8 bg-[#D1C4E9]" />
                <span className="text-[11px] font-bold tracking-[0.2em] text-[#7856A4] uppercase">Take the next step</span>
                <div className="h-[1px] w-8 bg-[#D1C4E9]" />
              </div>
              <h2 className="text-[3rem] md:text-[4rem] font-bold text-[#1A1A1A] tracking-tight leading-[1.1]">
                You don&apos;t need to have all <span className="text-[#7856A4]">the answers.</span>
              </h2>
              <p className="text-[18px] md:text-[20px] text-[#666666] font-normal">
                You only need a next step.
              </p>
              
              <div className="pt-6 flex flex-col sm:flex-row items-center gap-8 relative">
                <Link
                  href="/intake"
                  className="px-8 py-4 rounded-full bg-[#7856A4] hover:bg-[#63458A] text-white font-bold text-[15px] flex items-center justify-center gap-2 transition-all shadow-[0_8px_20px_rgb(120,86,164,0.3)] hover:shadow-[0_12px_25px_rgb(120,86,164,0.4)] w-full sm:w-auto hover:-translate-y-0.5"
                >
                  <span>Find my next step</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {/* Handwritten text */}
                <div className="hidden md:flex items-center text-[#AFA1CE] ml-2">
                  <svg width="40" height="30" viewBox="0 0 40 30" fill="none" className="transform -scale-y-100 rotate-12 -mt-6 mr-3">
                     <path d="M5 25 Q 20 5 35 15" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                     <path d="M25 10 L 35 15 L 30 22" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  </svg>
                  <span className="font-serif italic text-[18px] leading-tight transform -rotate-6">A kinder,<br/>brighter you<br/>is possible</span>
                </div>
              </div>
            </div>

            {/* Floating Bubble Right */}
            <div className="hidden lg:flex absolute top-10 right-[15%] w-48 h-48 bg-white/95 backdrop-blur-md rounded-full shadow-[0_20px_40px_rgb(0,0,0,0.08)] flex-col items-center justify-center p-8 text-center animate-[float_6s_ease-in-out_infinite]">
               <Heart className="w-5 h-5 text-[#7856A4] mb-3" />
               <span className="text-[15px] font-bold text-[#1A1A1A] leading-snug">Support today for a brighter tomorrow.</span>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 9. NEWSLETTER BANNER */}
        {/* ========================================================================= */}
        <section className="relative w-full bg-[#FCFBFA] pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-t border-b border-[#F0EBF7]">
           <div className="max-w-[1200px] mx-auto bg-[#F4EFF9] rounded-[40px] p-10 md:p-14 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-[#EAE6F0]">
              {/* Decorative florals */}
              <div className="absolute top-0 left-0 w-64 h-full opacity-30 pointer-events-none">
                 <svg viewBox="0 0 100 100" className="w-full h-full text-[#AFA1CE]" fill="currentColor"><path d="M0 100 C 20 80, 40 100, 60 70 C 80 40, 60 20, 100 0 L 0 0 Z" /></svg>
              </div>
              <div className="absolute top-0 right-0 w-64 h-full opacity-30 pointer-events-none">
                 <svg viewBox="0 0 100 100" className="w-full h-full text-[#AFA1CE]" fill="currentColor"><path d="M100 100 C 80 80, 60 100, 40 70 C 20 40, 40 20, 0 0 L 100 0 Z" /></svg>
              </div>

              <div className="relative z-10 max-w-lg space-y-4 text-center md:text-left">
                 <h2 className="text-[2rem] md:text-[2.25rem] font-bold text-[#1A1A1A] tracking-tight leading-[1.2]">
                    Take the next step towards<br/>a <span className="text-[#7856A4]">brighter tomorrow.</span>
                 </h2>
                 <p className="text-[15px] text-[#666666]">
                    Get gentle insights, resources, and updates — no spam, just support.
                 </p>
              </div>

              <div className="relative z-10 w-full max-w-lg">
                 <form className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                       <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 text-[#AFA1CE]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                       </div>
                       <input 
                         type="email" 
                         placeholder="Enter your email address" 
                         className="w-full h-[54px] pl-12 pr-4 rounded-full bg-white border border-transparent focus:border-[#7856A4] focus:ring-1 focus:ring-[#7856A4] outline-none text-[#1A1A1A] placeholder-[#AFA1CE] shadow-[0_4px_15px_rgb(0,0,0,0.03)] transition-all"
                         required 
                       />
                    </div>
                    <button type="submit" className="h-[54px] px-8 rounded-full bg-[#7856A4] hover:bg-[#63458A] text-white font-bold text-[14px] flex items-center justify-center gap-2 transition-all shadow-[0_4px_15px_rgb(120,86,164,0.2)] shrink-0">
                       Stay updated <ArrowRight className="w-4 h-4" />
                    </button>
                 </form>
                 <div className="flex items-center justify-center md:justify-start gap-2 mt-5 text-[12px] font-medium text-[#AFA1CE]">
                    <ShieldCheck className="w-4 h-4" />
                    <span>We respect your privacy. Unsubscribe anytime.</span>
                 </div>
              </div>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}


