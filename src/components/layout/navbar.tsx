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
    { label: "E-Books", href: "/ebooks" },
    { label: "For Psychologists", href: "/register?role=PSYCHOLOGIST" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 w-full transition-all duration-300 font-sans ${
          scrolled
            ? "bg-[#FCFBFA]/90 backdrop-blur-md border-b border-[#EEEAF5] py-4 shadow-sm"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="w-10 h-10 rounded-[12px] bg-white border border-[#F0EBF7] flex items-center justify-center text-[#7856A4] group-hover:bg-[#F4EFF9] transition-colors shadow-sm">
              <span className="font-serif text-[20px] font-medium leading-none">Ψ</span>
            </div>
            <span className="font-sans text-[1.25rem] font-bold tracking-tight text-[#1A1A1A]">
              Mind Refill
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href) && !link.href.includes('?'));
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-[14px] font-semibold transition-colors ${
                    active
                      ? "text-[#1A1A1A]"
                      : "text-[#666666] hover:text-[#7856A4]"
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
              className="text-[14px] font-semibold text-[#666666] hover:text-[#7856A4] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/intake"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#7856A4] hover:bg-[#63458A] text-white font-medium text-[14px] transition-colors shadow-sm"
            >
              <span>Get Support</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-4 lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 -mr-2 text-[#1A1A1A] focus:outline-none bg-white rounded-full border border-[#EEEAF5] shadow-sm"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Mobile Navigation Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-[#FCFBFA] pt-24 px-6 flex flex-col justify-between font-sans overflow-y-auto">
          <nav className="flex flex-col space-y-6">
            {navLinks.map((link) => {
              const active = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href) && !link.href.includes('?'));
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`text-[1.75rem] font-bold tracking-tight ${
                    active ? "text-[#1A1A1A]" : "text-[#7856A4]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/login"
              className="text-[1.75rem] font-bold tracking-tight text-[#666666]"
            >
              Sign In
            </Link>
          </nav>

          <div className="pt-8 pb-12 mt-8">
            <Link
              href="/intake"
              className="w-full h-14 rounded-full bg-[#7856A4] hover:bg-[#63458A] text-white font-medium flex items-center justify-center text-[16px] gap-2 shadow-md transition-colors"
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
