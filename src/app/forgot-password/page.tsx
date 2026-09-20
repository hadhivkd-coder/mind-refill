"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Password reset request failed");
      }

      setSubmitted(true);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-serene-50">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-serene-200">
        <div className="text-center mb-6">
          <div className="h-10 w-10 mx-auto rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold text-lg mb-2">
            🔑
          </div>
          <h1 className="text-2xl font-bold text-serene-900">Reset your password</h1>
          <p className="text-sm text-serene-500 mt-1">
            Enter your email to receive recovery instructions
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg"
          >
            {error}
          </div>
        )}

        {submitted ? (
          <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg text-center">
            <p className="font-semibold mb-2">Instructions Sent</p>
            <p className="text-xs text-green-700 leading-relaxed">
              If an account is associated with <strong>{email}</strong>, we have dispatched a link
              to reset your password.
            </p>
            <div className="mt-4">
              <Link
                href="/login"
                className="inline-block py-2 px-4 bg-brand-700 hover:bg-brand-800 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-serene-700 uppercase tracking-wider mb-1"
              >
                Account Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3 py-2 border border-serene-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-brand-700 hover:bg-brand-800 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-xs text-serene-500">
          Remembered your credentials?{" "}
          <Link href="/login" className="text-brand-700 font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
