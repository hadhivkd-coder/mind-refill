import Link from "next/link";
import { HeartHandshake, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#122C25] border-t border-[#C9D2BC]/10 text-[#C9D2BC] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/5">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#244F42] border border-[#C9D2BC]/20 flex items-center justify-center text-[#F1EBDD]">
                <span className="font-serif text-xl">Ψ</span>
              </div>
              <span className="font-serif text-2xl font-medium text-[#F7F3E9] tracking-wide">
                Mind Refill
              </span>
            </Link>
            <p className="font-serif text-xl italic text-[#F1EBDD]/90 max-w-md leading-relaxed">
              &ldquo;A calmer, brighter you. You don&apos;t have to figure it all out alone.&rdquo;
            </p>
            <p className="text-xs text-[#9CAF91] max-w-md leading-relaxed">
              Mind Refill is a grounded sanctuary connecting individuals with verified psychologists, guided intake, and thoughtful therapeutic resources.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#9CAF91] pt-1">
              <ShieldCheck className="w-4 h-4 text-[#9CAF91]" />
              <span>Strict clinical confidentiality & privacy first.</span>
            </div>
          </div>

          {/* Navigation links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#F1EBDD]">
              Explore
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/psychologists" className="hover:text-[#F7F3E9] transition-colors">
                  Find a Psychologist
                </Link>
              </li>
              <li>
                <Link href="/intake" className="hover:text-[#F7F3E9] transition-colors">
                  Guided Matching Intake
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-[#F7F3E9] transition-colors">
                  Insights & Articles
                </Link>
              </li>
              <li>
                <Link href="/ebooks" className="hover:text-[#F7F3E9] transition-colors">
                  Wellbeing Workbooks & Books
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-[#F7F3E9] transition-colors">
                  Workshops & Cohorts
                </Link>
              </li>
            </ul>
          </div>

          {/* Professionals & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#F1EBDD]">
              Professionals & Trust
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/register?role=PSYCHOLOGIST" className="hover:text-[#F7F3E9] transition-colors">
                  Join as a Psychologist
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#F7F3E9] transition-colors">
                  Practitioner Sign In
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="hover:text-[#F7F3E9] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="hover:text-[#F7F3E9] transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Crisis Notice */}
        <div className="mt-8 p-4 rounded-2xl bg-[#173C32]/80 border border-[#C9D2BC]/15 text-xs text-[#9CAF91] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-[#C7A4A0] flex-shrink-0" />
            <span>
              If you are in acute crisis, distress, or require emergency psychiatric care, please contact local emergency services or call national crisis helpline <strong className="text-[#F1EBDD]">988</strong> (or 112/911).
            </span>
          </div>
          <span className="text-[11px] text-[#C9D2BC]/70 whitespace-nowrap">
            Care when you need it
          </span>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9CAF91]/70">
          <p>© {new Date().getFullYear()} Mind Refill. All rights reserved.</p>
          <p>Crafted with care for psychological healing and human connection.</p>
        </div>
      </div>
    </footer>
  );
}
