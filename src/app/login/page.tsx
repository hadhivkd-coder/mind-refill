"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-serene-50">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-serene-200">
        <div className="text-center mb-6">
          <div className="h-10 w-10 mx-auto rounded-xl bg-brand-600 flex items-center justify-center text-white font-bold text-lg mb-2">
            Ψ
          </div>
          <h1 className="text-2xl font-bold text-serene-900">Sign in to your account</h1>
          <p className="text-sm text-serene-500 mt-1">
            Access your secure portal
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

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="password"
                className="text-xs font-semibold text-serene-700 uppercase tracking-wider"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-brand-700 hover:underline font-medium"
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
              className="w-full px-3 py-2 border border-serene-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-brand-700 hover:bg-brand-800 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-serene-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-brand-700 font-semibold hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
