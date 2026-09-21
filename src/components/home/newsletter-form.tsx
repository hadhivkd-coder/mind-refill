"use client";

import React, { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setIsSubmitted(true);
  }

  if (isSubmitted) {
    return (
      <div className="p-4 rounded-2xl bg-[#173C32]/10 border border-[#173C32]/20 text-[#173C32] max-w-md mx-auto flex items-center justify-center gap-2 text-sm font-medium">
        <Check className="w-5 h-5 text-[#173C32]" />
        <span>Thank you for subscribing to Mind Refill Insights.</span>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="pt-2 max-w-lg mx-auto flex flex-col sm:flex-row gap-3"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email address"
        className="flex-grow h-13 px-5 rounded-full bg-white border border-[#173C32]/20 text-sm text-[#173C32] placeholder-[#244F42]/50 focus:outline-none focus:ring-2 focus:ring-[#173C32] shadow-sm"
      />
      <button
        type="submit"
        className="h-13 px-7 rounded-full bg-[#173C32] hover:bg-[#244F42] text-[#F1EBDD] font-semibold text-sm transition-all shadow-md active:scale-95 whitespace-nowrap flex items-center justify-center gap-2"
      >
        <span>Subscribe</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
}
