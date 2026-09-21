import { enforcePageRole } from "@/modules/authorization/page-guard";
import { UserRole } from "@prisma/client";
import Link from "next/link";
import {
  Calendar,
  FileText,
  BookOpen,
  Video,
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
  Sparkles,
  LogOut,
  Clock,
  Compass,
  CheckCircle2,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClientDashboardPage() {
  const session = await enforcePageRole(UserRole.CLIENT);

  return (
    <div className="min-h-screen bg-[#173C32] text-[#F7F3E9] selection:bg-[#3F6855] selection:text-[#F1EBDD] p-4 sm:p-8 lg:p-12 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#3F6855]/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-[32rem] h-[32rem] rounded-full bg-[#718B73]/15 blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        {/* Top Header Bar */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-10 w-10 rounded-2xl bg-[#244F42] border border-white/10 flex items-center justify-center font-bold text-base text-[#F1EBDD] group-hover:border-[#9CAF91]/50 transition-colors">
                Ψ
              </div>
              <div>
                <span className="font-serif text-xl font-normal tracking-tight text-[#F7F3E9] block leading-none">
                  Mind Refill
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[#9CAF91] font-semibold">
                  Client Wellbeing Sanctuary
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-[#C9D2BC] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{session.user.email}</span>
            </div>

            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 text-[#F1EBDD] transition-all active:scale-95"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </form>
          </div>
        </header>

        {/* Welcoming Emotionally-Intelligent Hero Card */}
        <section className="atmospheric-card rounded-3xl p-6 sm:p-10 border border-white/15 shadow-2xl relative overflow-hidden bg-[#122C25]/85 backdrop-blur-md">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-[#9CAF91] text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#F1EBDD]" />
              <span>Your Safe Space</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl font-normal text-[#F7F3E9] leading-tight">
              Welcome to your quiet space.
            </h1>

            <p className="text-sm sm:text-base text-[#C9D2BC] font-light leading-relaxed">
              Healing doesn&apos;t have to be hurried. Here, you can review your appointments, explore clinical reflections, or take a peaceful step toward understanding yourself.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/psychologists"
                className="h-12 px-6 rounded-full bg-[#F1EBDD] hover:bg-white text-[#173C32] font-semibold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95"
              >
                <span>Book a Consultation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/intake"
                className="h-12 px-6 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-[#F7F3E9] font-medium text-xs flex items-center gap-2 transition-all"
              >
                <Compass className="w-3.5 h-3.5 text-[#9CAF91]" />
                <span>Guided Intake Assessment</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 4 Core Sanctuary Portals */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1. Appointments */}
          <Link
            href="/app/client/appointments"
            className="atmospheric-card p-6 rounded-3xl border border-white/10 shadow-lg hover:border-[#9CAF91]/50 transition-all duration-300 group flex flex-col justify-between space-y-6 hover:-translate-y-1 bg-[#122C25]/80"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#173C32] border border-white/10 flex items-center justify-center text-[#F1EBDD] group-hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5 text-[#9CAF91]" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-medium text-[#F7F3E9] group-hover:text-[#F1EBDD] transition-colors">
                  Appointments
                </h2>
                <p className="text-xs text-[#C9D2BC] font-light mt-1.5 leading-relaxed">
                  Join scheduled video consultation rooms, manage booking times, or review clinician notes.
                </p>
              </div>
            </div>
            <div className="pt-2 flex items-center text-xs font-semibold text-[#9CAF91] group-hover:text-[#F1EBDD] transition-colors gap-1.5">
              <span>View Agenda</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 2. Care Requests */}
          <Link
            href="/app/client/requests"
            className="atmospheric-card p-6 rounded-3xl border border-white/10 shadow-lg hover:border-[#9CAF91]/50 transition-all duration-300 group flex flex-col justify-between space-y-6 hover:-translate-y-1 bg-[#122C25]/80"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#173C32] border border-white/10 flex items-center justify-center text-[#F1EBDD] group-hover:scale-105 transition-transform">
                <HeartHandshake className="w-5 h-5 text-[#9CAF91]" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-medium text-[#F7F3E9] group-hover:text-[#F1EBDD] transition-colors">
                  Care Requests
                </h2>
                <p className="text-xs text-[#C9D2BC] font-light mt-1.5 leading-relaxed">
                  Track coordinator matching, intake review, and personalized psychologist pairing.
                </p>
              </div>
            </div>
            <div className="pt-2 flex items-center text-xs font-semibold text-[#9CAF91] group-hover:text-[#F1EBDD] transition-colors gap-1.5">
              <span>Active Requests</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 3. Digital Library */}
          <Link
            href="/app/client/purchases"
            className="atmospheric-card p-6 rounded-3xl border border-white/10 shadow-lg hover:border-[#9CAF91]/50 transition-all duration-300 group flex flex-col justify-between space-y-6 hover:-translate-y-1 bg-[#122C25]/80"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#173C32] border border-white/10 flex items-center justify-center text-[#F1EBDD] group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5 text-[#9CAF91]" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-medium text-[#F7F3E9] group-hover:text-[#F1EBDD] transition-colors">
                  Digital Library
                </h2>
                <p className="text-xs text-[#C9D2BC] font-light mt-1.5 leading-relaxed">
                  Access purchased clinical e-books, somatic grounding exercises, and practical CBT journals.
                </p>
              </div>
            </div>
            <div className="pt-2 flex items-center text-xs font-semibold text-[#9CAF91] group-hover:text-[#F1EBDD] transition-colors gap-1.5">
              <span>Open Library</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* 4. Workshops & Events */}
          <Link
            href="/app/client/events"
            className="atmospheric-card p-6 rounded-3xl border border-white/10 shadow-lg hover:border-[#9CAF91]/50 transition-all duration-300 group flex flex-col justify-between space-y-6 hover:-translate-y-1 bg-[#122C25]/80"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#173C32] border border-white/10 flex items-center justify-center text-[#F1EBDD] group-hover:scale-105 transition-transform">
                <Video className="w-5 h-5 text-[#9CAF91]" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-medium text-[#F7F3E9] group-hover:text-[#F1EBDD] transition-colors">
                  Workshops & Events
                </h2>
                <p className="text-xs text-[#C9D2BC] font-light mt-1.5 leading-relaxed">
                  Participate in live clinician-led workshops, mindfulness circles, and group cohorts.
                </p>
              </div>
            </div>
            <div className="pt-2 flex items-center text-xs font-semibold text-[#9CAF91] group-hover:text-[#F1EBDD] transition-colors gap-1.5">
              <span>My Events</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </section>

        {/* Somatic Check-in / Grounding Note */}
        <section className="atmospheric-card rounded-3xl p-6 sm:p-8 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 bg-[#122C25]/60">
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-[#9CAF91] uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Gentle Nervous System Pause</span>
            </span>
            <p className="font-serif italic text-base sm:text-lg text-[#F1EBDD]">
              &ldquo;Inhale for 4 seconds, hold gently for 4, exhale for 6. Let your shoulders soften.&rdquo;
            </p>
            <p className="text-xs text-[#C9D2BC] font-light">
              You do not have to have everything sorted out today. Just one breath at a time.
            </p>
          </div>

          <Link
            href="/ebooks"
            className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-xs text-[#F1EBDD] font-medium transition-colors shrink-0"
          >
            Explore Wellbeing Guides
          </Link>
        </section>

        {/* Crisis Safety Net Notice */}
        <div className="p-5 rounded-2xl bg-[#122C25]/90 border border-white/10 text-xs text-[#9CAF91] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <HeartHandshake className="w-4 h-4 text-[#C7A4A0] shrink-0" />
            <span>
              If you are in immediate emotional distress, free 24/7 confidential support is always available. Dial <strong className="text-[#F1EBDD]">988</strong> (or 112 / KIRAN 1800-599-0019).
            </span>
          </div>
          <Link
            href="/legal/privacy"
            className="text-[11px] text-[#C9D2BC] hover:underline shrink-0"
          >
            Clinical Confidentiality Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
