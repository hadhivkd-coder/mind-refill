import { enforcePageRole } from "@/modules/authorization/page-guard";
import { UserRole } from "@prisma/client";
import { IntakeService } from "@/modules/intake/services/intake.service";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, User, HeartHandshake, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClientRequestsPage() {
  const session = await enforcePageRole(UserRole.CLIENT);
  const requests = await IntakeService.getClientRequests(session.user.id);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">Received & Awaiting Triage</span>;
      case "CONTACTED":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">Coordinator Contacted</span>;
      case "INTAKE_COMPLETED":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">Intake Completed</span>;
      case "MATCHING":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">Matching with Psychologist</span>;
      case "PSYCHOLOGIST_SELECTED":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">Psychologist Selected</span>;
      case "AVAILABILITY_CONFIRMED":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">Availability Confirmed</span>;
      case "PAYMENT_PENDING":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-800 border border-orange-200">Payment Pending</span>;
      case "BOOKED":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-800 border border-green-200">Session Booked</span>;
      case "COMPLETED":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-serene-100 text-serene-800 border border-serene-200">Completed</span>;
      case "CLOSED":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-serene-100 text-serene-600">Closed</span>;
      case "CANCELLED":
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-serene-100 text-serene-800">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-serene-50 p-6 sm:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/app/client"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-serene-500 hover:text-serene-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Client Portal
          </Link>
          <Link
            href="/intake"
            className="px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
          >
            + New Counseling Request
          </Link>
        </div>

        <header className="border-b border-serene-200 pb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-serene-900">
            My Counseling Requests
          </h1>
          <p className="text-xs text-serene-500 mt-1">
            Track the status of your care coordination and psychologist matching in real-time.
          </p>
        </header>

        {requests.length === 0 ? (
          <div className="bg-white rounded-3xl border border-serene-200 p-12 text-center shadow-sm">
            <HeartHandshake className="w-12 h-12 text-serene-300 mx-auto mb-3" />
            <h2 className="text-base font-bold text-serene-900">No Counseling Requests Yet</h2>
            <p className="text-xs text-serene-500 mt-1 max-w-md mx-auto leading-relaxed">
              When you submit a request directly or ask for guided matching, our care coordination team works with you to schedule the right session.
            </p>
            <div className="mt-6">
              <Link
                href="/intake"
                className="px-5 py-2.5 bg-brand-700 hover:bg-brand-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
              >
                Start Counseling Intake
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl border border-serene-200 p-6 shadow-sm hover:border-brand-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-serene-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-brand-700 uppercase tracking-wider">
                        {req.isDirectBookingRequest ? "Direct Request" : "Guided Matching Request"}
                      </span>
                      <span className="text-xs text-serene-400">•</span>
                      <span className="text-xs text-serene-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(req.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-serene-900">
                      {req.targetPsychologist
                        ? `Target: ${req.targetPsychologist.fullName} (${req.targetPsychologist.professionalTitle})`
                        : "General Care Coordination Pool"}
                    </div>
                  </div>
                  <div>{getStatusBadge(req.status)}</div>
                </div>

                <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-serene-400 font-medium">Areas of Concern:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {req.intakeResponse?.concernCategories.map((cat, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-brand-50 text-brand-800 text-[11px] font-medium"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-serene-400 font-medium">Preferred Delivery & Timing:</span>
                    <p className="text-serene-700 mt-1">
                      {req.intakeResponse?.preferredTimeWindows?.sessionPreference === "IN_PERSON"
                        ? "In-Person Clinic Visit"
                        : "Online Video Consultation"}
                      {req.intakeResponse?.preferredTimeWindows?.times?.length ? (
                        <> • {req.intakeResponse.preferredTimeWindows.times.join(", ")}</>
                      ) : null}
                    </p>
                  </div>
                </div>

                {req.intakeResponse?.isEscalated && (
                  <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2 text-xs text-amber-900">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>This request is flagged for high-priority coordinator contact.</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
