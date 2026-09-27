import Link from "next/link";
import { Twitter, Instagram, Linkedin, Youtube, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative bg-[#FCFBFA] pt-20 pb-10 font-sans overflow-hidden border-t border-[#F0EBF7]">
      {/* Subtle floral background elements */}
      <div className="absolute top-0 left-0 w-64 h-full opacity-30 pointer-events-none">
         <svg viewBox="0 0 100 100" className="w-full h-full text-[#AFA1CE]" fill="currentColor"><path d="M0 100 C 20 80, 40 100, 60 70 C 80 40, 60 20, 100 0 L 0 0 Z" /></svg>
      </div>
      <div className="absolute bottom-0 right-0 w-64 h-full opacity-30 pointer-events-none">
         <svg viewBox="0 0 100 100" className="w-full h-full text-[#AFA1CE]" fill="currentColor"><path d="M100 100 C 80 80, 60 100, 40 70 C 20 40, 40 20, 0 0 L 100 0 Z" /></svg>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-[#F0EBF7]">
          
          {/* Brand & Statement Col (col-span-4) */}
          <div className="md:col-span-4 space-y-6">
            <Link href="/" className="flex items-center gap-3 group focus:outline-none">
              <div className="w-10 h-10 rounded-[12px] bg-[#F4EFF9] flex items-center justify-center text-[#7856A4] transition-colors">
                <span className="font-serif text-[20px] font-medium leading-none">Ψ</span>
              </div>
              <span className="font-sans text-[1.25rem] font-bold tracking-tight text-[#1A1A1A]">
                Mind Refill
              </span>
            </Link>
            
            <p className="text-[14px] text-[#666666] font-normal leading-relaxed max-w-[280px]">
              A safe, simple space to find the right support — at your own pace.
            </p>
            
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="w-9 h-9 rounded-full bg-[#F4EFF9] flex items-center justify-center text-[#7856A4] hover:bg-[#EAE6F0] transition-colors">
                <Instagram className="w-4 h-4" />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-[#F4EFF9] flex items-center justify-center text-[#7856A4] hover:bg-[#EAE6F0] transition-colors">
                <Twitter className="w-4 h-4" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-[#F4EFF9] flex items-center justify-center text-[#7856A4] hover:bg-[#EAE6F0] transition-colors">
                <Linkedin className="w-4 h-4" />
                <span className="sr-only">LinkedIn</span>
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-[#F4EFF9] flex items-center justify-center text-[#7856A4] hover:bg-[#EAE6F0] transition-colors">
                <Youtube className="w-4 h-4" />
                <span className="sr-only">YouTube</span>
              </a>
            </div>
          </div>

          {/* Spacer */}
          <div className="hidden lg:block lg:col-span-1"></div>

          {/* Navigation Columns */}
          <div className="md:col-span-7 lg:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-8">
            
            <div className="space-y-5">
              <h4 className="text-[11px] font-bold tracking-widest text-[#AFA1CE] uppercase">
                Platform
              </h4>
              <ul className="space-y-3.5">
                <li><Link href="/intake" className="text-[14px] text-[#444] hover:text-[#7856A4] transition-colors">Find Support</Link></li>
                <li><Link href="/psychologists" className="text-[14px] text-[#444] hover:text-[#7856A4] transition-colors">Psychologists</Link></li>
                <li><Link href="/resources" className="text-[14px] text-[#444] hover:text-[#7856A4] transition-colors">Resources</Link></li>
                <li><Link href="/ebooks" className="text-[14px] text-[#444] hover:text-[#7856A4] transition-colors">E-Books</Link></li>
                <li><Link href="/register?role=PSYCHOLOGIST" className="text-[14px] text-[#444] hover:text-[#7856A4] transition-colors">For Psychologists</Link></li>
              </ul>
            </div>

            <div className="space-y-5">
              <h4 className="text-[11px] font-bold tracking-widest text-[#AFA1CE] uppercase">
                Company
              </h4>
              <ul className="space-y-3.5">
                <li><Link href="/about" className="text-[14px] text-[#444] hover:text-[#7856A4] transition-colors">About Us</Link></li>
                <li><Link href="/mission" className="text-[14px] text-[#444] hover:text-[#7856A4] transition-colors">Our Mission</Link></li>
                <li><Link href="/careers" className="text-[14px] text-[#444] hover:text-[#7856A4] transition-colors">Careers</Link></li>
                <li><Link href="/contact" className="text-[14px] text-[#444] hover:text-[#7856A4] transition-colors">Contact Us</Link></li>
              </ul>
            </div>

            <div className="space-y-5">
              <h4 className="text-[11px] font-bold tracking-widest text-[#AFA1CE] uppercase">
                Legal
              </h4>
              <ul className="space-y-3.5">
                <li><Link href="/legal/privacy" className="text-[14px] text-[#444] hover:text-[#7856A4] transition-colors">Privacy Policy</Link></li>
                <li><Link href="/legal/terms" className="text-[14px] text-[#444] hover:text-[#7856A4] transition-colors">Terms of Service</Link></li>
                <li><Link href="/legal/refund" className="text-[14px] text-[#444] hover:text-[#7856A4] transition-colors">Refund Policy</Link></li>
                <li><Link href="/legal/cookies" className="text-[14px] text-[#444] hover:text-[#7856A4] transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>

            <div className="space-y-5">
              <h4 className="text-[11px] font-bold tracking-widest text-[#AFA1CE] uppercase">
                Support
              </h4>
              <ul className="space-y-3.5">
                <li><Link href="/help" className="text-[14px] text-[#444] hover:text-[#7856A4] transition-colors">Help Center</Link></li>
                <li><Link href="/crisis" className="text-[14px] text-[#444] hover:text-[#7856A4] transition-colors">Safety & Crisis Support</Link></li>
                <li><Link href="/report" className="text-[14px] text-[#444] hover:text-[#7856A4] transition-colors">Report a Concern</Link></li>
              </ul>
            </div>

          </div>
        </div>

        {/* Crisis Notice & Copyright */}
        <div className="mt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="px-5 py-3 rounded-[12px] bg-[#FCEAEA] text-[#666666] text-[13px] flex items-center gap-3 shrink-0 border border-[#F5D5D5]">
            <Heart className="w-4 h-4 text-[#D9534F] flex-shrink-0" />
            <p>
              If you are in crisis, please call your local emergency services or the national crisis helpline <strong className="text-[#1A1A1A] font-semibold">988</strong> (or 112/911).
            </p>
          </div>

          <p className="text-[12px] text-[#AFA1CE]">
            &copy; {new Date().getFullYear()} Mind Refill. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}
