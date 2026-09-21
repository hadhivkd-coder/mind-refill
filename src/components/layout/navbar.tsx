"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight, Sparkles, HeartHandshake } from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: "Find a Psychologist", href: "/psychologists" },
    { label: "Resources", href: "/resources" },
    { label: "E-Books", href: "/ebooks" },
    { label: "Workshops & Events", href: "/events" },
    { label: "For Psychologists", href: "/register?role=PSYCHOLOGIST" },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "bg-[#173C32]/90 backdrop-blur-md border-b border-[#C9D2BC]/15 py-3.5 shadow-lg shadow-black/10"
            : "bg-[#173C32]/70 backdrop-blur-sm border-b border-white/5 py-4 sm:py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#244F42] border border-[#C9D2BC]/20 flex items-center justify-center text-[#F1EBDD] group-hover:scale-105 group-hover:bg-[#3F6855] transition-all shadow-inner">
              <span className="font-serif text-lg font-medium tracking-tight">Ψ</span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl sm:text-2xl font-medium tracking-wide text-[#F7F3E9] group-hover:text-[#F1EBDD] transition-colors leading-tight">
                Mind Refill
              </span>
              <span className="text-[10px] text-[#9CAF91] tracking-wider uppercase font-sans font-medium -mt-0.5">
                Mental Wellbeing Sanctuary
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    active
                      ? "text-[#F1EBDD] font-semibold"
                      : "text-[#C9D2BC] hover:text-[#F7F3E9]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right CTA Area */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-[#C9D2BC] hover:text-[#F7F3E9] px-3 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/intake"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F1EBDD] hover:bg-white text-[#173C32] font-semibold text-sm transition-all shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 lg:hidden">
            <Link
              href="/login"
              className="text-xs font-medium text-[#C9D2BC] hover:text-[#F7F3E9] px-2 py-1"
            >
              Sign In
            </Link>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              className="w-11 h-11 flex items-center justify-center rounded-2xl bg-[#244F42]/80 border border-[#C9D2BC]/20 text-[#F7F3E9] active:scale-95 transition-all"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Full-Screen Overlay / Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden bg-[#173C32]/98 backdrop-blur-xl pt-24 px-6 pb-10 flex flex-col justify-between overflow-y-auto animate-in fade-in duration-200">
          <div className="space-y-6">
            <div className="border-b border-[#C9D2BC]/15 pb-4">
              <span className="text-xs uppercase tracking-widest text-[#9CAF91] font-semibold">
                Navigation
              </span>
            </div>
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-2xl font-serif font-medium text-[#F7F3E9] hover:text-[#F1EBDD] py-2 flex items-center justify-between border-b border-white/5 transition-colors"
                >
                  <span>{link.label}</span>
                  <ArrowRight className="w-5 h-5 text-[#9CAF91]" />
                </Link>
              ))}
            </div>
          </div>

          {/* Bottom Actions on Mobile */}
          <div className="pt-8 space-y-3">
            <Link
              href="/intake"
              onClick={() => setIsOpen(false)}
              className="w-full py-4 rounded-2xl bg-[#F1EBDD] text-[#173C32] font-semibold text-center text-base flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-transform"
            >
              <span>I&apos;m not sure what I need (Intake)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="w-full py-3.5 rounded-2xl border border-[#C9D2BC]/30 text-[#F7F3E9] font-medium text-center text-sm hover:bg-white/5 block"
            >
              Sign In to Your Account
            </Link>
            <div className="text-center pt-2">
              <span className="text-[11px] text-[#9CAF91]">
                Mind Refill • You don&apos;t have to figure it all out alone.
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
