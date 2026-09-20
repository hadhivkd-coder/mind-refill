import { enforcePageRole } from "@/modules/authorization/page-guard";
import { UserRole } from "@prisma/client";
import Link from "next/link";
import { Calendar, FileText, BookOpen, Video, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClientDashboardPage() {
  const session = await enforcePageRole(UserRole.CLIENT);

  return (
    <div className="min-h-screen bg-serene-50 p-6 sm:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-serene-200 pb-6">
          <div>
            <span className="text-xs font-semibold text-brand-700 uppercase tracking-wider">
              Client Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-serene-900 mt-1">
              Welcome back
            </h1>
            <p className="text-xs text-serene-500 mt-1">
              Authenticated as {session.user.email}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!session.user.isEmailVerified && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                Email Unverified
              </span>
            )}
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

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/app/client/appointments"
            className="bg-white p-6 rounded-3xl border border-serene-200 shadow-sm hover:border-brand-300 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="p-2.5 bg-brand-50 rounded-xl text-brand-600 w-fit group-hover:scale-110 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-serene-900">Appointments</h2>
                <p className="text-xs text-serene-500 mt-1">
                  View scheduled sessions, join video calls, or request rescheduling.
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-brand-700 gap-1">
              View Agenda <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/app/client/requests"
            className="bg-white p-6 rounded-3xl border border-serene-200 shadow-sm hover:border-brand-300 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 w-fit group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-serene-900">Care Requests</h2>
                <p className="text-xs text-serene-500 mt-1">
                  Track coordinator matching, intake review, and psychologist selection.
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-brand-700 gap-1">
              Active Requests <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/app/client/purchases"
            className="bg-white p-6 rounded-3xl border border-serene-200 shadow-sm hover:border-brand-300 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600 w-fit group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-serene-900">Digital Library</h2>
                <p className="text-xs text-serene-500 mt-1">
                  Download purchased clinical e-books, guides, and practical workbooks.
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-brand-700 gap-1">
              Open Library <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          <Link
            href="/app/client/events"
            className="bg-white p-6 rounded-3xl border border-serene-200 shadow-sm hover:border-brand-300 hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600 w-fit group-hover:scale-110 transition-transform">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-serene-900">Workshops & Events</h2>
                <p className="text-xs text-serene-500 mt-1">
                  Registered clinical webinars, psychoeducational groups, and details.
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-brand-700 gap-1">
              My Events <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </section>
      </div>
    </div>
  );
}
