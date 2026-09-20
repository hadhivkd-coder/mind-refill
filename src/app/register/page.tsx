"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"CLIENT" | "PSYCHOLOGIST">("CLIENT");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setSuccessMessage(
        "Account created successfully. A verification link has been sent to your email."
      );
      setTimeout(() => {
        router.push("/login");
      }, 3000);
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
            Ψ
          </div>
          <h1 className="text-2xl font-bold text-serene-900">Create your account</h1>
          <p className="text-sm text-serene-500 mt-1">
            Join the psychology platform
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

        {successMessage && (
          <div
            role="status"
            className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg"
          >
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="fullName"
              className="block text-xs font-semibold text-serene-700 uppercase tracking-wider mb-1"
            >
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Dr. Jane Doe / Alex Smith"
              className="w-full px-3 py-2 border border-serene-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-serene-700 uppercase tracking-wider mb-1"
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
              className="w-full px-3 py-2 border border-serene-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-serene-700 uppercase tracking-wider mb-1"
            >
              Password (minimum 8 characters)
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-serene-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-serene-700 uppercase tracking-wider mb-1">
              I am registering as:
            </label>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <button
                type="button"
                onClick={() => setRole("CLIENT")}
                className={`py-2 text-xs font-semibold rounded-lg border text-center transition-colors ${
                  role === "CLIENT"
                    ? "bg-brand-50 border-brand-500 text-brand-800"
                    : "border-serene-200 text-serene-600 hover:bg-serene-50"
                }`}
              >
                Client seeking care
              </button>
              <button
                type="button"
                onClick={() => setRole("PSYCHOLOGIST")}
                className={`py-2 text-xs font-semibold rounded-lg border text-center transition-colors ${
                  role === "PSYCHOLOGIST"
                    ? "bg-brand-50 border-brand-500 text-brand-800"
                    : "border-serene-200 text-serene-600 hover:bg-serene-50"
                }`}
              >
                Psychologist / Specialist
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 bg-brand-700 hover:bg-brand-800 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-serene-500">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-700 font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
