"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const initialToken = searchParams.get("token") || "";

  const [token, setToken] = useState(initialToken);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    initialToken ? "loading" : "idle"
  );
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialToken) {
      handleVerification(initialToken);
    }
  }, [initialToken]);

  const handleVerification = async (tokenToVerify: string) => {
    setStatus("loading");
    setMessage(null);

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenToVerify }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      setStatus("success");
      setMessage(data.message || "Email verified successfully.");
    } catch (err: unknown) {
      setStatus("error");
      setMessage((err as Error).message);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token) {
      handleVerification(token);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-serene-50">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-serene-200 text-center">
        <div className="h-10 w-10 mx-auto rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold text-lg mb-4">
          ✓
        </div>
        <h1 className="text-2xl font-bold text-serene-900 mb-2">Verify your email</h1>
        <p className="text-sm text-serene-500 mb-6">
          Confirm your email address to activate your full account access.
        </p>

        {status === "loading" && (
          <div className="p-4 bg-serene-100 text-serene-700 text-sm rounded-lg mb-4">
            Verifying your token...
          </div>
        )}

        {status === "success" && (
          <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg mb-6">
            <p className="font-semibold">{message}</p>
            <div className="mt-4">
              <Link
                href="/login"
                className="inline-block py-2 px-4 bg-brand-700 hover:bg-brand-800 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Proceed to Sign In
              </Link>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg mb-6">
            {message}
          </div>
        )}

        {status !== "success" && (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label
                htmlFor="token"
                className="block text-xs font-semibold text-serene-700 uppercase tracking-wider mb-1"
              >
                Verification Token
              </label>
              <input
                id="token"
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste token from email"
                className="w-full px-3 py-2 border border-serene-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-2.5 px-4 bg-brand-700 hover:bg-brand-800 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              Verify Account
            </button>
          </form>
        )}

        <div className="mt-6 text-xs text-serene-500">
          <Link href="/login" className="text-brand-700 font-semibold hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
