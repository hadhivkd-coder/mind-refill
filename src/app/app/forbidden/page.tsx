import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-serene-50">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-serene-200 text-center">
        <div className="h-12 w-12 mx-auto rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-serene-900 mb-2">403 — Access Denied</h1>
        <p className="text-sm text-serene-600 mb-6 leading-relaxed">
          You do not have the required role or capability to access this section of the platform.
        </p>
        <div className="space-y-2">
          <Link
            href="/"
            className="block w-full py-2.5 px-4 bg-brand-700 hover:bg-brand-800 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Return to Home
          </Link>
          <Link
            href="/login"
            className="block w-full py-2.5 px-4 border border-serene-200 hover:bg-serene-50 text-serene-700 text-xs font-semibold rounded-lg transition-colors"
          >
            Switch Account
          </Link>
        </div>
      </div>
    </div>
  );
}
