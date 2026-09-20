import { enforcePageRole } from "@/modules/authorization/page-guard";
import { UserRole } from "@prisma/client";
import { AnalyticsService } from "@/modules/analytics/services/analytics.service";
import Link from "next/link";
import { ArrowLeft, BarChart3, Users, DollarSign, Activity, Crown } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const session = await enforcePageRole(UserRole.ADMIN);
  const data = await AnalyticsService.getAdminPlatformAnalytics(session);

  return (
    <div className="min-h-screen bg-serene-50 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <Link
          href="/app/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-serene-500 hover:text-serene-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Admin Console
        </Link>

        <header className="border-b border-serene-200 pb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-brand-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-serene-900">
              Platform Executive Intelligence & Financial Reports
            </h1>
          </div>
          <p className="text-xs text-serene-500 mt-1">
            Macro metrics across total clients, practitioner verification throughput, platform GMV, commissions, and care coordination.
          </p>
        </header>

        {/* Executive KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl border border-serene-200 p-6 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-serene-400">Total Users</span>
            <div className="text-3xl font-extrabold text-serene-900 font-mono">
              {data.users.totalClients + data.users.totalPsychologists}
            </div>
            <p className="text-xs text-serene-500">
              {data.users.totalClients} clients, {data.users.verifiedPsychologists} verified psychologists
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-serene-200 p-6 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-serene-400">Gross Merchandise Value (GMV)</span>
            <div className="text-3xl font-extrabold text-brand-700 font-mono">
              ₹{data.finances.gmvMajor}
            </div>
            <p className="text-xs text-serene-500">
              Across {data.finances.transactionCount} gateway transactions
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-serene-200 p-6 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-serene-400">Platform Commission Earned</span>
            <div className="text-3xl font-extrabold text-green-700 font-mono">
              ₹{data.finances.platformCommissionMajor}
            </div>
            <p className="text-xs text-serene-500">
              Disbursed payouts: ₹{data.finances.disbursedPayoutsMajor}
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-serene-200 p-6 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-serene-400">Active Subscriptions</span>
            <div className="text-3xl font-extrabold text-amber-700 font-mono">
              {data.subscriptions.totalActive}
            </div>
            <p className="text-xs text-serene-500">
              Practitioners on paid recurring tiers
            </p>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User & Verification Pipeline */}
          <div className="bg-white rounded-3xl border border-serene-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-serene-100 pb-3">
              <Users className="w-4 h-4 text-brand-600" />
              <h2 className="text-sm font-bold text-serene-900">User Network & Verification</h2>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-serene-50">
                <span className="text-serene-600">Registered Clients</span>
                <span className="font-mono font-bold text-serene-900">{data.users.totalClients}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-serene-50">
                <span className="text-serene-600">Verified Psychologists</span>
                <span className="font-mono font-bold text-green-700">{data.users.verifiedPsychologists}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-serene-50">
                <span className="text-serene-600">Pending Credential Applications</span>
                <span className="font-mono font-bold text-amber-600">{data.users.pendingVerifications}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-serene-600">Care Coordinators & Staff</span>
                <span className="font-mono font-bold text-serene-900">{data.users.totalStaff}</span>
              </div>
            </div>
          </div>

          {/* Subscriptions & Tiers */}
          <div className="bg-white rounded-3xl border border-serene-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-serene-100 pb-3">
              <Crown className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-bold text-serene-900">Subscription Tier Distribution</h2>
            </div>
            <div className="space-y-3 text-xs">
              {Object.keys(data.subscriptions.byPlan).length === 0 ? (
                <p className="text-serene-400 py-4 text-center">No paid tier subscriptions active yet.</p>
              ) : (
                Object.entries(data.subscriptions.byPlan).map(([plan, count]) => (
                  <div key={plan} className="flex justify-between items-center py-2 border-b border-serene-50">
                    <span className="text-serene-600 uppercase font-bold">{plan} Plan</span>
                    <span className="font-mono font-bold text-serene-900">{count}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
