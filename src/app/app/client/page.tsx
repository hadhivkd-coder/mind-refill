import { enforcePageRole } from "@/modules/authorization/page-guard";
import { UserRole } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  FileText,
  BookOpen,
  ArrowRight,
  LogOut,
  Home,
  Users,
  Flower2,
  Heart,
  Star,
  Compass,
  CheckCircle2
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClientDashboardPage() {
  // Enforce auth
  let session = null;
  try {
    session = await enforcePageRole(UserRole.CLIENT);
  } catch (err) {
    // If not authenticated, the page-guard will redirect.
  }

  return (
    <div className="min-h-screen bg-[#FCFBFA] text-[#1A1A1A] font-sans flex">
      {/* ========================================================= */}
      {/* SIDEBAR */}
      {/* ========================================================= */}
      <aside className="w-[280px] h-screen sticky top-0 bg-white border-r border-[#F0EBF7] flex flex-col pt-8 pb-6 shadow-[4px_0_24px_rgb(0,0,0,0.01)] z-20">
        <div className="px-8 pb-8">
          <Link href="/app/client" className="flex items-center gap-3 group focus:outline-none mb-1.5">
            <div className="w-9 h-9 rounded-[10px] bg-[#F4EFF9] flex items-center justify-center text-[#7856A4] transition-colors">
              <span className="font-serif text-[18px] font-medium leading-none">Ψ</span>
            </div>
            <span className="font-sans text-[1.2rem] font-bold tracking-tight text-[#1A1A1A]">
              Mind Refill
            </span>
          </Link>
          <p className="text-[9px] font-bold tracking-[0.15em] text-[#AFA1CE] uppercase pl-12">
            Client Wellbeing Sanctuary
          </p>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-2">
          <Link href="/app/client" className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-[#F4EFF9] text-[#7856A4] font-semibold text-[14px] transition-colors shadow-[0_2px_10px_rgb(120,86,164,0.05)]">
            <Home className="w-[18px] h-[18px]" />
            Home
          </Link>
          <Link href="/app/client/appointments" className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-[#666666] hover:bg-[#F8F6FC] hover:text-[#7856A4] font-medium text-[14px] transition-colors">
            <Calendar className="w-[18px] h-[18px]" />
            Appointments
          </Link>
          <Link href="/app/client/requests" className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-[#666666] hover:bg-[#F8F6FC] hover:text-[#7856A4] font-medium text-[14px] transition-colors">
            <Heart className="w-[18px] h-[18px]" />
            Care Requests
          </Link>
          <Link href="/app/client/library" className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-[#666666] hover:bg-[#F8F6FC] hover:text-[#7856A4] font-medium text-[14px] transition-colors">
            <BookOpen className="w-[18px] h-[18px]" />
            Digital Library
          </Link>
          <Link href="/app/client/events" className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-[#666666] hover:bg-[#F8F6FC] hover:text-[#7856A4] font-medium text-[14px] transition-colors">
            <Users className="w-[18px] h-[18px]" />
            Workshops & Events
          </Link>
        </nav>
      </aside>

      {/* ========================================================= */}
      {/* MAIN CONTENT */}
      {/* ========================================================= */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* HEADER */}
        <header className="h-[80px] px-10 flex items-center justify-end border-b border-transparent">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span className="text-[13px] font-medium text-[#666666]">client@mindrefill.com</span>
            </div>
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#EEEAF5] bg-white text-[#1A1A1A] hover:border-[#D1C4E9] hover:bg-[#F8F6FC] text-[13px] font-semibold transition-all shadow-sm">
                <LogOut className="w-4 h-4 text-[#AFA1CE]" />
                Sign Out
              </button>
            </form>
          </div>
        </header>

        {/* DASHBOARD BODY */}
        <div className="flex-1 overflow-y-auto px-10 pb-12">
          <div className="max-w-[1200px] mx-auto space-y-8">
            
            {/* HERO */}
            <div className="relative w-full rounded-[30px] overflow-hidden bg-[#F8F6FC] min-h-[340px] flex items-center shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-[#EAE6F0]">
              <div className="absolute inset-0 z-0">
                 <Image src="https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&q=80&w=1600" alt="Quiet Space" fill className="object-cover object-[50%_70%]" />
              </div>
              <div className="absolute inset-0 z-10 bg-gradient-to-r from-white/95 via-white/90 to-white/10" />
              
              <div className="relative z-20 w-full md:w-[65%] lg:w-[55%] p-10 md:p-14 space-y-6">
                <div className="inline-flex items-center gap-1.5 bg-[#F4EFF9]/80 backdrop-blur-md border border-[#EAE6F0] rounded-full px-3 py-1 mb-2">
                  <Star className="w-3.5 h-3.5 text-[#7856A4] fill-[#7856A4]" />
                  <span className="text-[10px] font-bold tracking-[0.1em] text-[#7856A4] uppercase">Your Safe Space</span>
                </div>
                
                <h1 className="text-[2.5rem] md:text-[3.25rem] font-bold text-[#1A1A1A] tracking-tight leading-[1.1]">
                  Welcome to your<br/>
                  <span className="text-[#7856A4]">quiet space.</span>
                </h1>
                
                <p className="text-[15px] md:text-[16px] text-[#666666] leading-relaxed max-w-md">
                  Healing doesn&apos;t have to be hurried. Here, you can review your appointments, explore clinical reflections, or take a peaceful step toward understanding yourself.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                  <Link href="/app/client/appointments/new" className="px-6 py-3.5 rounded-full bg-[#7856A4] hover:bg-[#63458A] text-white font-bold text-[14px] flex items-center gap-2 transition-all shadow-[0_4px_15px_rgb(120,86,164,0.2)]">
                    <Calendar className="w-4 h-4" /> Book a Consultation <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                  <Link href="/app/client/intake" className="px-6 py-3.5 rounded-full bg-white/80 backdrop-blur-sm border border-[#D1C4E9] text-[#7856A4] hover:bg-white font-bold text-[14px] flex items-center gap-2 transition-all shadow-sm">
                    <Compass className="w-4 h-4" /> Guided Intake Assessment
                  </Link>
                </div>
              </div>

              {/* Decorative elements on Hero */}
              <div className="hidden lg:flex absolute top-[15%] right-[35%] z-20 items-center text-[#7856A4] opacity-80">
                <svg width="40" height="30" viewBox="0 0 40 30" fill="none" className="transform -scale-y-100 rotate-[130deg] -mr-2 mt-12">
                   <path d="M5 25 Q 20 5 35 15" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" />
                   <path d="M25 10 L 35 15 L 30 22" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" />
                </svg>
                <span className="font-serif italic text-[18px] leading-tight transform -rotate-[15deg]">A calmer<br/>and kinder<br/>you is possible.</span>
              </div>

              <div className="hidden md:flex absolute top-6 right-6 z-20 bg-white/90 backdrop-blur-md rounded-2xl p-4 items-center gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white max-w-[200px]">
                <div className="w-10 h-10 rounded-full bg-[#F4EFF9] flex items-center justify-center shrink-0">
                  <Flower2 className="w-5 h-5 text-[#7856A4]" />
                </div>
                <p className="text-[12px] font-bold text-[#1A1A1A] leading-snug">Small steps today, a brighter tomorrow.</p>
              </div>
            </div>

            {/* QUICK LINKS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Appointments */}
              <div className="bg-white rounded-[24px] p-6 flex flex-col relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-[#EEEAF5] hover:border-[#D1C4E9] transition-colors group">
                <div className="absolute top-0 right-0 w-32 h-32 opacity-20 pointer-events-none -mr-4 -mt-4 transform rotate-12">
                  <Image src="https://images.unsplash.com/photo-1618077360395-f3068be8e001?auto=format&fit=crop&q=80&w=300" alt="" fill className="object-cover mix-blend-multiply rounded-full" />
                </div>
                
                <div className="w-12 h-12 rounded-full bg-[#F4EFF9] flex items-center justify-center mb-5 shrink-0 relative z-10 text-[#7856A4]">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-[18px] font-bold text-[#1A1A1A] mb-2 relative z-10">Appointments</h3>
                <p className="text-[13px] text-[#666666] leading-relaxed mb-6 flex-1 relative z-10">
                  Join scheduled video consultation rooms, manage booking times, or review clinician notes.
                </p>
                <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white border border-[#EEEAF5] flex items-center justify-center text-[#AFA1CE] group-hover:text-[#7856A4] group-hover:border-[#7856A4] transition-colors shadow-sm z-10">
                  <ArrowRight className="w-4 h-4" />
                </div>
                
                <div className="w-full bg-[#FCFBFA] rounded-xl p-3.5 border border-[#EEEAF5] flex items-center gap-3 mt-auto relative z-10">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#AFA1CE] border border-[#F0EBF7] shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-wider text-[#AFA1CE] uppercase mb-0.5">Next appointment</p>
                    <p className="text-[12px] font-semibold text-[#1A1A1A]">No upcoming appointments</p>
                  </div>
                </div>
              </div>

              {/* Care Requests */}
              <div className="bg-[#FFFDF9] rounded-[24px] p-6 flex flex-col relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-[#F5F0E6] hover:border-[#E8DFCC] transition-colors group">
                <div className="absolute top-0 right-0 w-32 h-32 opacity-30 pointer-events-none -mr-4 -mt-4">
                  <div className="w-full h-full bg-[#FCECD9] rounded-full blur-2xl" />
                </div>
                
                <div className="w-12 h-12 rounded-full bg-[#FCECD9]/60 flex items-center justify-center mb-5 shrink-0 relative z-10 text-[#D98C4F]">
                  <Heart className="w-5 h-5" />
                </div>
                <h3 className="text-[18px] font-bold text-[#1A1A1A] mb-2 relative z-10">Care Requests</h3>
                <p className="text-[13px] text-[#666666] leading-relaxed mb-6 flex-1 relative z-10">
                  Track coordinator matching, intake review, and personalized psychologist pairing.
                </p>
                <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white border border-[#F5F0E6] flex items-center justify-center text-[#D98C4F]/60 group-hover:text-[#D98C4F] group-hover:border-[#D98C4F] transition-colors shadow-sm z-10">
                  <ArrowRight className="w-4 h-4" />
                </div>
                
                <div className="w-full bg-white rounded-xl p-3.5 border border-[#F5F0E6] flex items-center gap-3 mt-auto relative z-10 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-[#FCFBFA] flex items-center justify-center text-[#D98C4F]/60 border border-[#F5F0E6] shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-wider text-[#D98C4F]/70 uppercase mb-0.5">Active requests</p>
                    <p className="text-[12px] font-semibold text-[#1A1A1A]">No active requests</p>
                  </div>
                </div>
              </div>

              {/* Digital Library */}
              <div className="bg-[#F8FBFF] rounded-[24px] p-6 flex flex-col relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-[#E6F0F5] hover:border-[#CCDDE8] transition-colors group">
                <div className="absolute top-0 right-0 w-32 h-32 opacity-30 pointer-events-none -mr-4 -mt-4 transform rotate-45">
                  <Image src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=300" alt="" fill className="object-cover mix-blend-multiply rounded-full" />
                </div>
                
                <div className="w-12 h-12 rounded-full bg-[#E6F0F5] flex items-center justify-center mb-5 shrink-0 relative z-10 text-[#4F8CD9]">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-[18px] font-bold text-[#1A1A1A] mb-2 relative z-10">Digital Library</h3>
                <p className="text-[13px] text-[#666666] leading-relaxed mb-6 flex-1 relative z-10">
                  Access purchased clinical e-books, somatic grounding exercises, and practical CBT journals.
                </p>
                <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white border border-[#E6F0F5] flex items-center justify-center text-[#4F8CD9]/60 group-hover:text-[#4F8CD9] group-hover:border-[#4F8CD9] transition-colors shadow-sm z-10">
                  <ArrowRight className="w-4 h-4" />
                </div>
                
                <div className="w-full bg-white rounded-xl p-3.5 border border-[#E6F0F5] flex items-center gap-3 mt-auto relative z-10 shadow-sm">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                     <Image src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=100" alt="Book" fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold tracking-wider text-[#4F8CD9]/70 uppercase mb-0.5 truncate">Continue reading</p>
                    <p className="text-[12px] font-semibold text-[#1A1A1A] truncate mb-1">A Calmer You</p>
                    <div className="w-full bg-[#F0F5F9] rounded-full h-1.5 flex overflow-hidden relative">
                       <div className="bg-[#4F8CD9] h-full rounded-full" style={{ width: '40%' }} />
                       <span className="absolute right-0 top-[-10px] text-[8px] font-bold text-[#4F8CD9]">40%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Workshops & Events */}
              <div className="bg-[#FFF8FA] rounded-[24px] p-6 flex flex-col relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-[#F5E6EC] hover:border-[#E8CCD8] transition-colors group">
                <div className="absolute top-0 right-0 w-32 h-32 opacity-30 pointer-events-none -mr-4 -mt-4 transform -rotate-12">
                  <Image src="https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&q=80&w=300" alt="" fill className="object-cover mix-blend-multiply rounded-full" />
                </div>
                
                <div className="w-12 h-12 rounded-full bg-[#F5E6EC] flex items-center justify-center mb-5 shrink-0 relative z-10 text-[#D94F7A]">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-[18px] font-bold text-[#1A1A1A] mb-2 relative z-10">Workshops & Events</h3>
                <p className="text-[13px] text-[#666666] leading-relaxed mb-6 flex-1 relative z-10">
                  Participate in live clinician-led workshops, mindfulness circles, and group cohorts.
                </p>
                <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-white border border-[#F5E6EC] flex items-center justify-center text-[#D94F7A]/60 group-hover:text-[#D94F7A] group-hover:border-[#D94F7A] transition-colors shadow-sm z-10">
                  <ArrowRight className="w-4 h-4" />
                </div>
                
                <div className="w-full bg-white rounded-xl p-3.5 border border-[#F5E6EC] flex items-center gap-3 mt-auto relative z-10 shadow-sm">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                     <Image src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=100" alt="Event" fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold tracking-wider text-[#D94F7A]/70 uppercase mb-0.5 truncate">Upcoming event</p>
                    <p className="text-[12px] font-semibold text-[#1A1A1A] truncate">Mindful Living Workshop</p>
                    <p className="text-[10px] text-[#666666] mt-0.5">12 Oct 2026 • Online</p>
                  </div>
                </div>
              </div>

            </div>

            {/* BOTTOM BANNER (NERVOUS SYSTEM PAUSE) */}
            <div className="w-full rounded-[24px] overflow-hidden relative shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-[#EEEAF5] min-h-[140px] flex items-center">
              <div className="absolute inset-0 z-0">
                 <Image src="https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&q=80&w=1600" alt="Zen stones" fill className="object-cover object-[50%_70%]" />
              </div>
              <div className="absolute inset-0 z-10 bg-gradient-to-r from-white/95 via-white/80 to-transparent" />
              
              <div className="relative z-20 p-8 w-full flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 rounded-full bg-[#F4EFF9]/80 backdrop-blur-sm border border-[#EAE6F0] flex items-center justify-center shrink-0 shadow-sm">
                    <Flower2 className="w-6 h-6 text-[#7856A4]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.2em] text-[#AFA1CE] uppercase mb-1">Gentle Nervous System Pause</p>
                    <p className="text-[18px] md:text-[20px] font-bold text-[#1A1A1A] italic leading-tight">
                      &quot;Inhale for 4 seconds, hold gently for 4, exhale for 6. Let your shoulders soften.&quot;
                    </p>
                    <p className="text-[13px] text-[#666666] mt-2">
                      You do not have to have everything sorted out today. Just one breath at a time.
                    </p>
                  </div>
                </div>
                
                <Link href="/app/client/library" className="bg-white/90 backdrop-blur-sm border border-[#EAE6F0] hover:border-[#D1C4E9] text-[#1A1A1A] px-6 py-3 rounded-full text-[13px] font-bold shadow-sm hover:shadow-md transition-all shrink-0 flex items-center gap-2">
                  Explore Wellbeing Guides <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* CRISIS BANNER */}
            <div className="w-full bg-[#FCECD9]/40 border border-[#F5F0E6] rounded-[16px] px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 mt-8">
               <div className="flex items-center gap-3 text-[#1A1A1A] text-[13px]">
                 <Heart className="w-4 h-4 text-[#D98C4F]" />
                 <span>
                   If you are in immediate emotional distress, free 24/7 confidential support is always available. Dial <strong className="font-bold">988</strong> (or 112 / KIRAN 1800-599-0019).
                 </span>
               </div>
               <Link href="/legal/confidentiality" className="text-[12px] text-[#D98C4F] hover:underline whitespace-nowrap">
                 Clinical Confidentiality Policy
               </Link>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
