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
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: "Find Support", href: "/intake" },
    { label: "Psychologists", href: "/psychologists" },
    { label: "Resources", href: "/resources" },
    { label: "For Psychologists", href: "/register?role=PSYCHOLOGIST" },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 font-sans ${
          scrolled
            ? "bg-white/80 backdrop-blur-lg border-b border-[#EEEAF5] py-3 sm:py-4 shadow-[0_4px_24px_rgba(98,84,127,0.02)]"
            : "bg-transparent py-5 sm:py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group focus:outline-none">
            <div className="w-8 h-8 rounded-lg bg-[#FAF8F2] border border-[#EEEAF5] flex items-center justify-center text-[#62547F] group-hover:bg-[#F7F5FA] transition-colors">
              <span className="font-serif text-sm font-medium">Ψ</span>
            </div>
            <span className="font-sans text-[1.1rem] font-medium tracking-tight text-[#29272C]">
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
                  className={`text-[14px] font-medium transition-colors ${
                    active
                      ? "text-[#29272C]"
                      : "text-[#62547F] hover:text-[#29272C]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right CTA Area */}
          <div className="hidden lg:flex items-center gap-6">
            <Link
              href="/login"
              className="text-[14px] font-medium text-[#62547F] hover:text-[#29272C] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/intake"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#62547F] hover:bg-[#29272C] text-white font-medium text-[14px] transition-colors"
            >
              <span>Get Support</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-4 lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 -mr-2 text-[#29272C] focus:outline-none bg-[#FAF8F2] rounded-full border border-[#EEEAF5]"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Mobile Navigation Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-white pt-24 px-6 flex flex-col justify-between font-sans overflow-y-auto">
          <nav className="flex flex-col space-y-6">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[1.75rem] font-medium tracking-tight ${
                    active ? "text-[#29272C]" : "text-[#62547F]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/login"
              className="text-[1.75rem] font-medium tracking-tight text-[#62547F]"
            >
              Sign In
            </Link>
          </nav>

          <div className="pt-8 pb-12 mt-8">
            <Link
              href="/intake"
              className="w-full h-14 rounded-full bg-[#62547F] text-white font-medium flex items-center justify-center text-[16px] gap-2"
            >
              <span>Get Support</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
