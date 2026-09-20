import { enforcePageRole } from "@/modules/authorization/page-guard";
import { UserRole } from "@prisma/client";
import Link from "next/link";
import { Calendar, CreditCard, DollarSign, Crown, FileText, UserCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PsychologistDashboardPage() {
  const session = await enforcePageRole(UserRole.PSYCHOLOGIST);

  return (
    <div className="min-h-screen bg-serene-50 p-6 sm:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-serene-200 pb-6">
          <div>
            <span className="text-xs font-semibold text-brand-700 uppercase tracking-wider">
              Psychologist Workspace
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-serene-900 mt-1">
              Professional Portal
            </h1>
            <p className="text-xs text-serene-500 mt-1">
              Authenticated as {session.user.email}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-serene-200 hover:bg-white text-serene-700 transition-colors"
              >
                Sign Out
              </button>
            </form>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/app/psychologist/availability"
            className="bg-white p-6 rounded-3xl border border-serene-200 shadow-sm hover:border-brand-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-brand-50 rounded-xl text-brand-600 group-hover:scale-110 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-serene-900">Availability & Schedule</h2>
            </div>
            <p className="text-xs text-serene-500">
              Configure weekly recurring consultation hours and manage holiday date exceptions.
            </p>
          </Link>

          <Link
            href="/app/psychologist/earnings"
            className="bg-white p-6 rounded-3xl border border-serene-200 shadow-sm hover:border-brand-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-green-50 rounded-xl text-green-600 group-hover:scale-110 transition-transform">
                <DollarSign className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-serene-900">Earnings & Financial Ledger</h2>
            </div>
            <p className="text-xs text-serene-500">
              Track session earnings, platform commissions, 7-day settlement holds, and balances.
            </p>
          </Link>

          <Link
            href="/app/psychologist/payouts"
            className="bg-white p-6 rounded-3xl border border-serene-200 shadow-sm hover:border-brand-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-brand-50 rounded-xl text-brand-600 group-hover:scale-110 transition-transform">
                <CreditCard className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-serene-900">Disbursed Payouts</h2>
            </div>
            <p className="text-xs text-serene-500">
              Inspect historical bank transfer disbursements, approval batches, and UTR references.
            </p>
          </Link>

          <Link
            href="/app/psychologist/subscription"
            className="bg-white p-6 rounded-3xl border border-serene-200 shadow-sm hover:border-brand-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600 group-hover:scale-110 transition-transform">
                <Crown className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-serene-900">Practice Plan & Tier</h2>
            </div>
            <p className="text-xs text-serene-500">
              Manage subscription tier, unlock AI portfolio features, and manage billing renewal.
            </p>
          </Link>

          <Link
            href="/app/psychologist/verification"
            className="bg-white p-6 rounded-3xl border border-serene-200 shadow-sm hover:border-brand-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 group-hover:scale-110 transition-transform">
                <UserCheck className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-serene-900">Verification & Credentials</h2>
            </div>
            <p className="text-xs text-serene-500">
              Upload clinical licenses, degree certificates, and track verification review.
            </p>
          </Link>

          <Link
            href="/app/psychologist/portfolio"
            className="bg-white p-6 rounded-3xl border border-serene-200 shadow-sm hover:border-brand-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600 group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-serene-900">AI Portfolio Studio</h2>
            </div>
            <p className="text-xs text-serene-500">
              Generate clinical bio and practice copy with AI, customize design templates, and manage versions.
            </p>
          </Link>

          <Link
            href="/app/psychologist/analytics"
            className="bg-white p-6 rounded-3xl border border-serene-200 shadow-sm hover:border-brand-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-serene-900">Practice Analytics</h2>
            </div>
            <p className="text-xs text-serene-500">
              Review completion rates, patient retention, monthly practice earnings, and content reach.
            </p>
          </Link>

          <Link
            href="/app/psychologist/profile"
            className="bg-white p-6 rounded-3xl border border-serene-200 shadow-sm hover:border-brand-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-serene-100 rounded-xl text-serene-700 group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-serene-900">Basic Profile & Directory</h2>
            </div>
            <p className="text-xs text-serene-500">
              Edit clinical bio, qualifications, languages, modalities, and public slug.
            </p>
          </Link>
        </section>
      </div>
    </div>
  );
}
