"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight } from "lucide-react";

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
        className={`sticky top-0 z-50 w-full transition-all duration-300 font-sans ${
          scrolled
            ? "bg-[#173C32]/85 backdrop-blur-md border-b border-[#C9D2BC]/10 py-3 sm:py-4 shadow-sm"
            : "bg-transparent py-5 sm:py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group focus:outline-none">
            <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center text-[#F1EBDD] group-hover:bg-white/10 transition-all">
              <span className="font-serif text-sm font-medium">Ψ</span>
            </div>
            <span className="font-sans text-[1.1rem] font-medium tracking-wide text-[#F7F3E9] group-hover:text-white transition-colors">
              Mind Refill
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[13.5px] font-medium transition-colors tracking-wide ${
                    active
                      ? "text-[#F1EBDD]"
                      : "text-[#C9D2BC] hover:text-[#F7F3E9]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right CTA Area */}
          <div className="hidden lg:flex items-center gap-5">
            <Link
              href="/login"
              className="text-[13.5px] font-medium text-[#C9D2BC] hover:text-[#F7F3E9] transition-colors tracking-wide"
            >
              Sign In
            </Link>
            <Link
              href="/intake"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F1EBDD] hover:bg-white text-[#173C32] font-medium text-[13.5px] transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-4 lg:hidden">
            <Link
              href="/login"
              className="text-[13px] font-medium text-[#C9D2BC] hover:text-[#F7F3E9]"
            >
              Sign In
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 -mr-2 text-[#C9D2BC] hover:text-[#F7F3E9] transition-colors focus:outline-none"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Mobile Navigation Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-[#173C32] pt-24 px-6 flex flex-col justify-between font-sans overflow-y-auto">
          <nav className="flex flex-col space-y-6">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-2xl font-medium tracking-tight ${
                    active ? "text-[#F1EBDD]" : "text-[#C9D2BC]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-8 pb-12 border-t border-white/10 mt-8 flex flex-col gap-4">
            <Link
              href="/intake"
              className="w-full py-4 rounded-full bg-[#F1EBDD] text-[#173C32] font-medium text-center text-[15px]"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
