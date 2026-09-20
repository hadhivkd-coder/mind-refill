"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, HeartHandshake, ShieldCheck } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"CLIENT" | "PSYCHOLOGIST">("CLIENT");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Validate on the fly when input changes
  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (fieldErrors.email) {
      setFieldErrors((prev) => ({ ...prev, email: "" }));
    }
    if (generalError) setGeneralError(null);
  };

  const handleFullNameChange = (val: string) => {
    setFullName(val);
    if (fieldErrors.fullName) {
      setFieldErrors((prev) => ({ ...prev, fullName: "" }));
    }
    if (generalError) setGeneralError(null);
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (fieldErrors.password) {
      setFieldErrors((prev) => ({ ...prev, password: "" }));
    }
    if (generalError) setGeneralError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});

    // Client-side pre-validation
    const errors: Record<string, string> = {};
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || trimmedName.length < 2) {
      errors.fullName = "Please enter your full name (at least 2 characters).";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail) {
      errors.email = "Email address is required.";
    } else if (!emailRegex.test(trimmedEmail)) {
      errors.email = "Please enter a valid email address with a domain (e.g. name@example.com).";
    }

    if (!password || password.length < 8) {
      errors.password = "Password must be at least 8 characters long.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setGeneralError(
        errors.email
          ? errors.email
          : "Please check the highlighted fields below."
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: trimmedName,
          email: trimmedEmail,
          password,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          const serverFieldErrors: Record<string, string> = {};
          if (data.details.email) serverFieldErrors.email = data.details.email[0];
          if (data.details.fullName) serverFieldErrors.fullName = data.details.fullName[0];
          if (data.details.password) serverFieldErrors.password = data.details.password[0];
          setFieldErrors(serverFieldErrors);
        }
        throw new Error(data.error || "Registration could not be completed. Please try again.");
      }

      setSuccessMessage(
        "Welcome to Mind Refill! Your account has been created. Redirecting you to sign in..."
      );
      setTimeout(() => {
        router.push(`/login?email=${encodeURIComponent(trimmedEmail)}`);
      }, 1800);
    } catch (err: unknown) {
      setGeneralError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#FAF8F5]">
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
            Create your account
          </h1>
          <p className="text-xs text-[#526058] mt-1.5 leading-relaxed">
            A calm, confidential space. You don&apos;t have to figure it all out alone.
          </p>
        </div>

        {/* Top Error Alert */}
        {generalError && (
          <div
            role="alert"
            className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm rounded-xl flex items-start gap-2.5 leading-relaxed"
          >
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{generalError}</p>
              {generalError.toLowerCase().includes("email") && (
                <p className="text-xs text-rose-600 mt-0.5">
                  Make sure there is a &ldquo;.&rdquo; before the domain name (for example:{" "}
                  <span className="font-mono underline">hadhivkd@gmail.com</span>).
                </p>
              )}
            </div>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div
            role="status"
            className="mb-5 p-3.5 bg-[#EAF2ED] border border-[#BFD9C8] text-[#1A2E26] text-xs sm:text-sm rounded-xl flex items-center gap-2.5"
          >
            <CheckCircle2 className="w-4 h-4 text-[#355E3B] flex-shrink-0" />
            <p className="font-medium">{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-xs font-semibold text-[#355E3B] uppercase tracking-wider mb-1.5"
            >
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => handleFullNameChange(e.target.value)}
              placeholder="e.g. Hadhi VKD"
              className={`w-full px-3.5 py-2.5 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
                fieldErrors.fullName
                  ? "border-rose-300 bg-rose-50/20 focus:ring-rose-200"
                  : "border-[#E8ECE7] focus:border-[#355E3B] focus:ring-[#EAF2ED]"
              }`}
            />
            {fieldErrors.fullName && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {fieldErrors.fullName}
              </p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-[#355E3B] uppercase tracking-wider mb-1.5"
            >
              Email Address
            </label>
            <input
              id="email"
              type="text"
              required
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder="name@example.com"
              className={`w-full px-3.5 py-2.5 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
                fieldErrors.email
                  ? "border-rose-400 bg-rose-50/30 focus:ring-rose-200"
                  : "border-[#E8ECE7] focus:border-[#355E3B] focus:ring-[#EAF2ED]"
              }`}
            />
            {fieldErrors.email ? (
              <p className="mt-1.5 text-xs text-rose-600 flex items-start gap-1 font-medium leading-tight">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>{fieldErrors.email}</span>
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-[#7A8A80]">
                We will send your confidential session details here.
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-[#355E3B] uppercase tracking-wider mb-1.5"
            >
              Password (minimum 8 characters)
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              placeholder="••••••••"
              className={`w-full px-3.5 py-2.5 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
                fieldErrors.password
                  ? "border-rose-300 bg-rose-50/20 focus:ring-rose-200"
                  : "border-[#E8ECE7] focus:border-[#355E3B] focus:ring-[#EAF2ED]"
              }`}
            />
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Role selector */}
          <div>
            <label className="block text-xs font-semibold text-[#355E3B] uppercase tracking-wider mb-1.5">
              I am registering as:
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setRole("CLIENT")}
                className={`py-3 px-3 text-xs font-medium rounded-2xl border text-left transition-all ${
                  role === "CLIENT"
                    ? "bg-[#EAF2ED] border-[#355E3B] text-[#1A2E26] shadow-sm ring-1 ring-[#355E3B]"
                    : "border-[#E8ECE7] text-[#526058] hover:bg-[#FAF8F5]"
                }`}
              >
                <div className="font-semibold text-sm">Client</div>
                <div className="text-[11px] text-[#6B7C72] mt-0.5">
                  Seeking care & support
                </div>
              </button>
              <button
                type="button"
                onClick={() => setRole("PSYCHOLOGIST")}
                className={`py-3 px-3 text-xs font-medium rounded-2xl border text-left transition-all ${
                  role === "PSYCHOLOGIST"
                    ? "bg-[#EAF2ED] border-[#355E3B] text-[#1A2E26] shadow-sm ring-1 ring-[#355E3B]"
                    : "border-[#E8ECE7] text-[#526058] hover:bg-[#FAF8F5]"
                }`}
              >
                <div className="font-semibold text-sm">Psychologist</div>
                <div className="text-[11px] text-[#6B7C72] mt-0.5">
                  Specialist practitioner
                </div>
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3 px-4 bg-[#244234] hover:bg-[#1A2E26] text-white text-sm font-semibold rounded-2xl transition-all shadow-sm hover:shadow disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? "Creating your account..." : "Create Account"}
          </button>
        </form>

        {/* Confidentiality reminder */}
        <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] text-[#7A8A80]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#355E3B]" />
          <span>Encrypted, secure, and confidential</span>
        </div>

        <div className="mt-4 pt-4 border-t border-[#E8ECE7] text-center text-xs text-[#526058]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#244234] font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
