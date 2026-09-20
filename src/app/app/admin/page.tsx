import { enforcePageRole } from "@/modules/authorization/page-guard";
import { UserRole } from "@prisma/client";
import Link from "next/link";
import { ShieldCheck, CreditCard, Landmark, Crown, Tag, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await enforcePageRole(UserRole.ADMIN);

  return (
    <div className="min-h-screen bg-serene-50 p-6 sm:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-serene-200 pb-6">
          <div>
            <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
              System Administration
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-serene-900 mt-1">
              Platform Admin Console
            </h1>
            <p className="text-xs text-serene-500 mt-1">
              Administrator: {session.user.email}
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
            href="/app/admin/verifications"
            className="bg-white p-6 rounded-3xl border border-serene-200 shadow-sm hover:border-brand-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-serene-900">Credential Verifications</h2>
            </div>
            <p className="text-xs text-serene-500">
              Audit and approve submitted clinical licenses, degree certificates, and ID documents.
            </p>
          </Link>

          <Link
            href="/app/admin/payments"
            className="bg-white p-6 rounded-3xl border border-serene-200 shadow-sm hover:border-brand-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-green-50 rounded-xl text-green-600 group-hover:scale-110 transition-transform">
                <CreditCard className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-serene-900">Payment Transactions</h2>
            </div>
            <p className="text-xs text-serene-500">
              Audit gateway transactions, platform commission snapshots, and issue customer refunds.
            </p>
          </Link>

          <Link
            href="/app/admin/payouts"
            className="bg-white p-6 rounded-3xl border border-serene-200 shadow-sm hover:border-brand-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-brand-50 rounded-xl text-brand-600 group-hover:scale-110 transition-transform">
                <Landmark className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-serene-900">Psychologist Payouts</h2>
            </div>
            <p className="text-xs text-serene-500">
              Bundle matured settlements into payout batches, approve, and record bank UTR transfers.
            </p>
          </Link>

          <Link
            href="/app/admin/subscriptions"
            className="bg-white p-6 rounded-3xl border border-serene-200 shadow-sm hover:border-brand-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600 group-hover:scale-110 transition-transform">
                <Crown className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-serene-900">Subscription Plans & Audit</h2>
            </div>
            <p className="text-xs text-serene-500">
              Monitor active practitioner subscriptions, billing cycles, renewals, and tier distribution.
            </p>
          </Link>

          <Link
            href="/app/admin/specializations"
            className="bg-white p-6 rounded-3xl border border-serene-200 shadow-sm hover:border-brand-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600 group-hover:scale-110 transition-transform">
                <Tag className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-serene-900">Taxonomies & Specializations</h2>
            </div>
            <p className="text-xs text-serene-500">
              Manage clinical tags, supported languages, modalities, and concern categories.
            </p>
          </Link>

          <Link
            href="/app/admin/reports"
            className="bg-white p-6 rounded-3xl border border-serene-200 shadow-sm hover:border-brand-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 group-hover:scale-110 transition-transform">
                <Tag className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-serene-900">Reports & Analytics</h2>
            </div>
            <p className="text-xs text-serene-500">
              Executive macro metrics, GMV, commissions, user growth, and care triage throughput.
            </p>
          </Link>
        </section>
      </div>
    </div>
  );
}
