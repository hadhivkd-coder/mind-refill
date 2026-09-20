"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { HeartHandshake, AlertCircle, ShieldCheck, Sparkles } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const prefillEmail = searchParams?.get("email");
    if (prefillEmail) {
      setEmail(prefillEmail);
      setInfoMessage("Account created successfully. Please enter your password to continue.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid email or password. Please try again.");
      }

      // Redirect based on user's primary role
      const roles: string[] = data.user.roles || [];
      if (roles.includes("ADMIN")) {
        router.push("/app/admin");
      } else if (roles.includes("COORDINATOR")) {
        router.push("/app/coordinator");
      } else if (roles.includes("PSYCHOLOGIST")) {
        router.push("/app/psychologist");
      } else {
        router.push("/app/client");
      }
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoRole: "client" | "psychologist") => {
    if (demoRole === "psychologist") {
      setEmail("psychologist@mindrefill.com");
      setPassword("PsychologistPassword!123");
    } else {
      setEmail("client@mindrefill.com");
      setPassword("ClientPassword!123");
    }
    setError(null);
  };

  return (
    <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-[#E8ECE7]">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#EAF2ED] text-[#244234] mb-3 shadow-inner">
          <HeartHandshake className="w-6 h-6" />
        </div>
        <span className="block text-xs font-semibold tracking-wider text-[#355E3B] uppercase">
          Mind Refill
        </span>
        <h1 className="text-2xl font-serif font-medium text-[#1A2E26] mt-1">
          Welcome back
        </h1>
        <p className="text-xs text-[#526058] mt-1.5 leading-relaxed">
          Sign in to your confidential workspace.
        </p>
      </div>

      {/* Info notice */}
      {infoMessage && (
        <div
          role="status"
          className="mb-4 p-3.5 bg-[#EAF2ED] border border-[#BFD9C8] text-[#1A2E26] text-xs sm:text-sm rounded-xl"
        >
          {infoMessage}
        </div>
      )}

      {/* Error notice */}
      {error && (
        <div
          role="alert"
          className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm rounded-xl flex items-start gap-2"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold text-[#355E3B] uppercase tracking-wider mb-1.5"
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="w-full px-3.5 py-2.5 border border-[#E8ECE7] rounded-xl text-sm focus:outline-none focus:border-[#355E3B] focus:ring-2 focus:ring-[#EAF2ED] transition-all"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="password"
              className="text-xs font-semibold text-[#355E3B] uppercase tracking-wider"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-[#355E3B] hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3.5 py-2.5 border border-[#E8ECE7] rounded-xl text-sm focus:outline-none focus:border-[#355E3B] focus:ring-2 focus:ring-[#EAF2ED] transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-[#244234] hover:bg-[#1A2E26] text-white text-sm font-semibold rounded-2xl transition-all shadow-sm hover:shadow disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      {/* Quick demo sign-in helper for instant test and evaluation */}
      <div className="mt-5 pt-4 border-t border-[#E8ECE7]">
        <div className="flex items-center gap-1.5 text-xs font-medium text-[#526058] mb-2">
          <Sparkles className="w-3.5 h-3.5 text-[#355E3B]" />
          <span>Quick Demo Access:</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickDemo("psychologist")}
            className="py-2 px-2 text-[11px] font-medium text-[#244234] bg-[#F2F7F4] hover:bg-[#EAF2ED] rounded-xl border border-[#D5E3DB] transition-colors text-center"
          >
            Psychologist Demo
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemo("client")}
            className="py-2 px-2 text-[11px] font-medium text-[#244234] bg-[#F2F7F4] hover:bg-[#EAF2ED] rounded-xl border border-[#D5E3DB] transition-colors text-center"
          >
            Client Demo
          </button>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-[#7A8A80]">
        <ShieldCheck className="w-3.5 h-3.5 text-[#355E3B]" />
        <span>End-to-end encrypted session</span>
      </div>

      <div className="mt-3 text-center text-xs text-[#526058]">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-[#244234] font-semibold hover:underline">
          Create one here
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#FAF8F5]">
      <Suspense fallback={<div className="text-sm text-[#526058]">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
