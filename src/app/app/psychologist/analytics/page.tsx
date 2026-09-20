import { enforcePageRole } from "@/modules/authorization/page-guard";
import { UserRole } from "@prisma/client";
import { AnalyticsService } from "@/modules/analytics/services/analytics.service";
import Link from "next/link";
import { ArrowLeft, TrendingUp, DollarSign, Calendar, BookOpen, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PsychologistAnalyticsPage() {
  const session = await enforcePageRole(UserRole.PSYCHOLOGIST);
  const data = await AnalyticsService.getPsychologistAnalytics(session.user.id);

  return (
    <div className="min-h-screen bg-serene-50 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <Link
          href="/app/psychologist"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-serene-500 hover:text-serene-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Psychologist Portal
        </Link>

        <header className="border-b border-serene-200 pb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-brand-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-serene-900">
              Practice Analytics & Clinical Performance
            </h1>
          </div>
          <p className="text-xs text-serene-500 mt-1">
            Real-time breakdown of consultation volume, session completion rates, financial earnings, and digital content impact.
          </p>
        </header>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl border border-serene-200 p-6 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-serene-400">Total Consultations</span>
            <div className="text-3xl font-extrabold text-serene-900 font-mono">
              {data.appointments.total}
            </div>
            <p className="text-xs text-brand-700 font-semibold">
              {data.appointments.completed} completed sessions
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-serene-200 p-6 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-serene-400">Session Completion Rate</span>
            <div className="text-3xl font-extrabold text-green-700 font-mono">
              {data.appointments.completionRatePercent}%
            </div>
            <p className="text-xs text-serene-500">
              {data.appointments.cancelled} cancellations, {data.appointments.noShow} no-shows
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-serene-200 p-6 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-serene-400">Net Practice Revenue</span>
            <div className="text-3xl font-extrabold text-serene-900 font-mono">
              ₹{data.finances.netTotalMajor}
            </div>
            <p className="text-xs text-serene-500">
              Gross: ₹{data.finances.grossTotalMajor} (₹{data.finances.commissionTotalMajor} platform fees)
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-serene-200 p-6 shadow-sm space-y-1">
            <span className="text-[10px] uppercase font-bold text-serene-400">Digital Reach & Products</span>
            <div className="text-3xl font-extrabold text-purple-700 font-mono">
              {data.contentAndProducts.totalEbookPurchases + data.contentAndProducts.totalEventRegistrations}
            </div>
            <p className="text-xs text-serene-500">
              {data.contentAndProducts.totalEbookPurchases} guides sold, {data.contentAndProducts.totalEventRegistrations} webinar attendees
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-serene-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-serene-100 pb-3">
              <Calendar className="w-4 h-4 text-brand-600" />
              <h2 className="text-sm font-bold text-serene-900">Session Volume Breakdown</h2>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-serene-50">
                <span className="text-serene-600">Upcoming / Confirmed Sessions</span>
                <span className="font-mono font-bold text-serene-900">{data.appointments.upcoming}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-serene-50">
                <span className="text-serene-600">Completed Sessions</span>
                <span className="font-mono font-bold text-green-700">{data.appointments.completed}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-serene-50">
                <span className="text-serene-600">Cancelled Sessions</span>
                <span className="font-mono font-bold text-rose-600">{data.appointments.cancelled}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-serene-600">Client No-Shows</span>
                <span className="font-mono font-bold text-amber-600">{data.appointments.noShow}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-serene-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-serene-100 pb-3">
              <BookOpen className="w-4 h-4 text-purple-600" />
              <h2 className="text-sm font-bold text-serene-900">Knowledge & Product Impact</h2>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-serene-50">
                <span className="text-serene-600">Authored E-books & Guides</span>
                <span className="font-mono font-bold text-serene-900">{data.contentAndProducts.totalEbooksAuthored}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-serene-50">
                <span className="text-serene-600">Total E-book Purchases</span>
                <span className="font-mono font-bold text-purple-700">{data.contentAndProducts.totalEbookPurchases}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-serene-50">
                <span className="text-serene-600">Hosted Webinars & Workshops</span>
                <span className="font-mono font-bold text-serene-900">{data.contentAndProducts.totalEventsHosted}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-serene-600">Published Clinical Articles</span>
                <span className="font-mono font-bold text-brand-700">{data.contentAndProducts.publishedArticlesCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
