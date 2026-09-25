import Link from "next/link";
import { HeartHandshake, Twitter, Instagram, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#122C25] text-[#C9D2BC] pt-16 pb-12 font-sans border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-white/5">
          
          {/* Brand & Statement Col */}
          <div className="md:col-span-5 space-y-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center text-[#F1EBDD]">
                <span className="font-serif text-sm font-medium">Ψ</span>
              </div>
              <span className="font-sans text-xl font-medium text-[#F7F3E9] tracking-wide">
                Mind Refill
              </span>
            </Link>
            
            <p className="font-serif text-xl italic text-[#F1EBDD]/70 tracking-wide font-light">
              A calmer, brighter you.
            </p>
            
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#9CAF91] hover:text-[#F1EBDD] hover:bg-white/10 transition-colors">
                <Instagram className="w-4 h-4" />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#9CAF91] hover:text-[#F1EBDD] hover:bg-white/10 transition-colors">
                <Twitter className="w-4 h-4" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#9CAF91] hover:text-[#F1EBDD] hover:bg-white/10 transition-colors">
                <Linkedin className="w-4 h-4" />
                <span className="sr-only">LinkedIn</span>
              </a>
            </div>
          </div>

          {/* Spacer */}
          <div className="hidden md:block md:col-span-3"></div>

          {/* Navigation */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#F1EBDD]/60">
              Navigation
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-[14px] text-[#C9D2BC] hover:text-[#F7F3E9] transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[14px] text-[#C9D2BC] hover:text-[#F7F3E9] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-[14px] text-[#C9D2BC] hover:text-[#F7F3E9] transition-colors">
                  Practitioner Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#F1EBDD]/60">
              Legal
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/legal/privacy" className="text-[14px] text-[#C9D2BC] hover:text-[#F7F3E9] transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="text-[14px] text-[#C9D2BC] hover:text-[#F7F3E9] transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Crisis Notice & Copyright */}
        <div className="mt-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="p-4 rounded-xl bg-[#173C32]/50 border border-white/5 text-[12px] text-[#9CAF91] flex items-center gap-3">
            <HeartHandshake className="w-4 h-4 text-[#C7A4A0] flex-shrink-0" />
            <p>
              If you are in crisis, please call your local emergency services or the national crisis helpline <strong className="text-[#F1EBDD] font-medium">988</strong> (or 112/911).
            </p>
          </div>

          <p className="text-[12px] text-[#9CAF91]/60">
            &copy; {new Date().getFullYear()} Mind Refill. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}
