import Link from "next/link";
import { Sparkles, ArrowRight, Compass, ShieldCheck, HeartHandshake, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Find the Right Psychological Support | Mind Refill",
  description:
    "Whether you know who you are looking for or want human-assisted matching, Mind Refill guides you to verified psychological care.",
};

export default function FindPsychologistEntryPage() {
  return (
    <main className="min-h-screen bg-cream-50 flex flex-col justify-between">
      {/* Header */}
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

          <nav className="flex items-center space-x-4 text-sm font-medium text-forest-700">
            <Link href="/psychologists" className="hover:text-forest-950 transition-colors">
              Directory
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-forest-800 hover:text-forest-950 px-3 py-1.5"
            >
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center flex-1 flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sage-100 border border-sage-200 text-forest-800 text-xs font-medium self-center mb-6">
          <Sparkles className="w-3.5 h-3.5 text-forest-600" />
          Thoughtfully Guided Care
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-forest-950 leading-tight">
          How would you like to begin?
        </h1>

        <p className="mt-4 text-base sm:text-lg text-forest-700 max-w-2xl mx-auto leading-relaxed">
          Finding the right psychologist is a deeply personal journey. Choose the path that feels most comfortable for where you are today.
        </p>

        {/* Two Clear Choices */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-3xl mx-auto w-full">
          {/* Path 1: Guided Human Matching */}
          <Link
            href="/intake"
            className="p-8 rounded-3xl border-2 border-forest-600 bg-white hover:border-forest-700 hover:shadow-xl transition-all flex flex-col justify-between group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 px-3.5 py-1 rounded-bl-2xl bg-forest-600 text-white text-[11px] font-semibold">
              Recommended
            </div>
            <div>
              <div className="h-12 w-12 rounded-2xl bg-forest-50 flex items-center justify-center text-forest-700 mb-6 group-hover:scale-105 transition-transform">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-forest-600 uppercase tracking-wider block mb-1">
                Guided Matching
              </span>
              <h2 className="text-xl font-bold text-forest-950 mb-2">
                &ldquo;I&apos;m not sure who I need&rdquo;
              </h2>
              <p className="text-xs sm:text-sm text-forest-700 leading-relaxed mb-6">
                Share a few details about what you are experiencing. A human care coordinator will thoughtfully review your context and introduce you to the best-matched verified psychologist.
              </p>

              <ul className="space-y-2 text-xs text-forest-800 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-forest-600 shrink-0" />
                  <span>Confidential, non-clinical 3-minute intake</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-forest-600 shrink-0" />
                  <span>Reviewed personally by experienced care coordinators</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-forest-600 shrink-0" />
                  <span>No obligation to book until you feel ready</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-sage-100 flex items-center justify-between text-sm font-semibold text-forest-800 group-hover:text-forest-950">
              <span>Start Guided Intake</span>
              <ArrowRight className="w-4 h-4 text-forest-600 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Path 2: Direct Directory Exploration */}
          <Link
            href="/psychologists"
            className="p-8 rounded-3xl border border-sage-200 bg-white hover:border-forest-500 hover:shadow-lg transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="h-12 w-12 rounded-2xl bg-sage-50 flex items-center justify-center text-forest-700 mb-6 group-hover:scale-105 transition-transform">
                <Compass className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-forest-600 uppercase tracking-wider block mb-1">
                Direct Selection
              </span>
              <h2 className="text-xl font-bold text-forest-950 mb-2">
                &ldquo;I want to browse practitioners&rdquo;
              </h2>
              <p className="text-xs sm:text-sm text-forest-700 leading-relaxed mb-6">
                Explore our public directory of licensed and rigorously verified psychologists. Filter by clinical specialization, language, approach, and availability.
              </p>

              <ul className="space-y-2 text-xs text-forest-800 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-forest-600 shrink-0" />
                  <span>Verified license & qualification records</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-forest-600 shrink-0" />
                  <span>Detailed bios, therapeutic methods, and fees</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-forest-600 shrink-0" />
                  <span>Transparent schedules and booking holds</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-sage-100 flex items-center justify-between text-sm font-semibold text-forest-800 group-hover:text-forest-950">
              <span>Explore Verified Directory</span>
              <ArrowRight className="w-4 h-4 text-forest-600 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Peace of Mind Guarantee */}
        <div className="mt-14 inline-flex items-center gap-2 text-xs text-forest-600 justify-center">
          <ShieldCheck className="w-4 h-4 text-forest-700" />
          <span>Strict confidentiality. Your personal information is encrypted and protected under healthcare privacy standards.</span>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-sage-200/60 bg-white py-6 text-center text-xs text-forest-600">
        <p>© {new Date().getFullYear()} Mind Refill. Human-guided psychological care.</p>
      </footer>
    </main>
  );
}
