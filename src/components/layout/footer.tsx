import Link from "next/link";
import { HeartHandshake, Twitter, Instagram, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white text-[#62547F] pt-16 pb-12 font-sans border-t border-[#EEEAF5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-[#EEEAF5]">
          
          {/* Brand & Statement Col */}
          <div className="md:col-span-5 space-y-6">
            <Link href="/" className="flex items-center gap-2 group focus:outline-none">
              <div className="w-8 h-8 rounded-lg bg-[#FAF8F2] border border-[#EEEAF5] flex items-center justify-center text-[#62547F]">
                <span className="font-serif text-sm font-medium">Ψ</span>
              </div>
              <span className="font-sans text-[1.1rem] font-medium tracking-tight text-[#29272C]">
                Mind Refill
              </span>
            </Link>
            
            <p className="text-[15px] text-[#62547F] font-light leading-relaxed max-w-sm">
              A safe, simple space to find the right support — at your own pace.
            </p>
            
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-[#FAF8F2] border border-[#EEEAF5] flex items-center justify-center text-[#A99BC7] hover:text-[#62547F] hover:bg-[#F7F5FA] transition-colors">
                <Instagram className="w-4 h-4" />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-[#FAF8F2] border border-[#EEEAF5] flex items-center justify-center text-[#A99BC7] hover:text-[#62547F] hover:bg-[#F7F5FA] transition-colors">
                <Twitter className="w-4 h-4" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-[#FAF8F2] border border-[#EEEAF5] flex items-center justify-center text-[#A99BC7] hover:text-[#62547F] hover:bg-[#F7F5FA] transition-colors">
                <Linkedin className="w-4 h-4" />
                <span className="sr-only">LinkedIn</span>
              </a>
            </div>
          </div>

          {/* Spacer */}
          <div className="hidden md:block md:col-span-3"></div>

          {/* Navigation */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-[12px] font-semibold tracking-wide text-[#29272C] uppercase">
              Platform
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/psychologists" className="text-[14px] text-[#62547F] hover:text-[#29272C] transition-colors">
                  Find Support
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-[14px] text-[#62547F] hover:text-[#29272C] transition-colors">
                  Resources
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-[14px] text-[#62547F] hover:text-[#29272C] transition-colors">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-[12px] font-semibold tracking-wide text-[#29272C] uppercase">
              Legal
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/legal/privacy" className="text-[14px] text-[#62547F] hover:text-[#29272C] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="text-[14px] text-[#62547F] hover:text-[#29272C] transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Crisis Notice & Copyright */}
        <div className="mt-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="p-4 rounded-xl bg-[#FAF8F2] border border-[#EEEAF5] text-[13px] text-[#62547F] flex items-center gap-3">
            <HeartHandshake className="w-4 h-4 text-[#A99BC7] flex-shrink-0" />
            <p>
              If you are in crisis, please call your local emergency services or the national crisis helpline <strong className="text-[#29272C] font-medium">988</strong> (or 112/911).
            </p>
          </div>

          <p className="text-[13px] text-[#A99BC7]">
            &copy; {new Date().getFullYear()} Mind Refill. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}
