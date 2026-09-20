"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  FileText,
  UserCheck,
  Send,
  Loader2,
  Search,
} from "lucide-react";
import { CoordinatorRequestDetailDto } from "@/modules/intake/dto/intake.dto";
import { CounselingRequestStatus } from "@prisma/client";

interface DetailClientProps {
  initialData: CoordinatorRequestDetailDto;
  currentUserId: string;
  isStaffAssigned: boolean;
  isAdmin: boolean;
  verifiedPsychologists: { id: string; fullName: string; professionalTitle: string }[];
}

export function CoordinatorRequestDetailView({
  initialData,
  currentUserId,
  isStaffAssigned,
  isAdmin,
  verifiedPsychologists,
}: DetailClientProps) {
  const router = useRouter();
  const [data, setData] = useState<CoordinatorRequestDetailDto>(initialData);
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Status Change State
  const [newStatus, setNewStatus] = useState<string>(data.status);
  const [statusReason, setStatusReason] = useState("");

  // Psychologist Matcher State
  const [selectedPsychologistId, setSelectedPsychologistId] = useState(
    data.targetPsychologist?.id || ""
  );

  // Note State
  const [noteText, setNoteText] = useState("");

  const refreshData = async () => {
    try {
      const res = await fetch(`/api/coordinator/requests/${data.id}`);
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        setNewStatus(json.data.status);
        if (json.data.targetPsychologist) {
          setSelectedPsychologistId(json.data.targetPsychologist.id);
        }
      }
    } catch {}
  };

  const handleClaim = async () => {
    setError(null);
    setLoadingAction(true);
    try {
      const res = await fetch(`/api/coordinator/requests/${data.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to claim request");
      setSuccessMsg("You have successfully claimed this counseling request.");
      await refreshData();
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRelease = async () => {
    setError(null);
    setLoadingAction(true);
    try {
      const res = await fetch(`/api/coordinator/requests/${data.id}/release`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to release request");
      setSuccessMsg("Request released back to unassigned queue.");
      await refreshData();
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newStatus === data.status) return;

    setError(null);
    setLoadingAction(true);
    try {
      const res = await fetch(`/api/coordinator/requests/${data.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, reason: statusReason || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to update status");
      setSuccessMsg(`Status transitioned to ${newStatus}`);
      setStatusReason("");
      await refreshData();
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleMatchPsychologist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPsychologistId) return;

    setError(null);
    setLoadingAction(true);
    try {
      const res = await fetch(`/api/coordinator/requests/${data.id}/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ psychologistProfileId: selectedPsychologistId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to match psychologist");
      setSuccessMsg("Psychologist successfully matched and assigned.");
      await refreshData();
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    setError(null);
    setLoadingAction(true);
    try {
      const res = await fetch(`/api/coordinator/requests/${data.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteText }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to record note");
      setNoteText("");
      setSuccessMsg("Note logged successfully.");
      await refreshData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Escalation Alert */}
      {data.intakeResponse?.isEscalated && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-900 leading-relaxed">
            <div className="font-bold text-sm text-rose-950">
              High Priority: Crisis Signals Detected
            </div>
            This client self-reported significant distress or triggered automated safety keywords.
            Prioritize direct phone contact and ensure emergency protocol availability.
          </div>
        </div>
      )}

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
          {successMsg}
        </div>
      )}

      {/* Assignment Header Card */}
      <div className="bg-white rounded-3xl border border-serene-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-serene-400 uppercase tracking-wider">
            Assignment Status
          </div>
          <div className="text-base font-bold text-serene-900 mt-1 flex items-center gap-2">
            {data.activeAssignment ? (
              <>
                <UserCheck className="w-4 h-4 text-emerald-600" />
                Assigned to: {data.activeAssignment.coordinatorName}
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Unassigned (Available in Pool)
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!data.activeAssignment ? (
            <button
              onClick={handleClaim}
              disabled={loadingAction}
              className="px-4 py-2 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
            >
              {loadingAction ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              Claim This Request
            </button>
          ) : isStaffAssigned || isAdmin ? (
            <button
              onClick={handleRelease}
              disabled={loadingAction}
              className="px-4 py-2 border border-serene-200 hover:bg-serene-50 text-serene-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Release Assignment
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Intake details & Client Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Details */}
          <div className="bg-white rounded-2xl border border-serene-200 p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-serene-900 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-700" />
              Client Profile & Contact
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-serene-400 font-medium">Full Name:</span>
                <p className="text-serene-900 font-semibold mt-0.5">{data.client.fullName}</p>
              </div>
              <div>
                <span className="text-serene-400 font-medium">Email:</span>
                <p className="text-serene-900 font-semibold mt-0.5">{data.client.email}</p>
              </div>
              <div>
                <span className="text-serene-400 font-medium">Phone Number:</span>
                <p className="text-serene-900 font-semibold mt-0.5">
                  {data.client.phoneNumber || "Not provided"}
                </p>
              </div>
              <div>
                <span className="text-serene-400 font-medium">Preferred Contact:</span>
                <p className="text-serene-900 font-semibold mt-0.5">
                  {data.intakeResponse?.contactPreference || "Email"}
                </p>
              </div>
              <div>
                <span className="text-serene-400 font-medium">Preferred Language:</span>
                <p className="text-serene-900 font-semibold mt-0.5">
                  {data.client.preferredLanguage || "English"}
                </p>
              </div>
              <div>
                <span className="text-serene-400 font-medium">Age Group:</span>
                <p className="text-serene-900 font-semibold mt-0.5">
                  {data.intakeResponse?.ageBand || "Not specified"}
                </p>
              </div>
            </div>
          </div>

          {/* Intake Responses & Clinical Preferences */}
          {data.intakeResponse && (
            <div className="bg-white rounded-2xl border border-serene-200 p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-serene-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-700" />
                Intake Questionnaire & Concern Summary
              </h2>

              <div>
                <span className="text-xs text-serene-400 font-medium">Selected Concern Areas:</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {data.intakeResponse.concernCategories.map((c, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-brand-50 text-brand-900 border border-brand-200 text-xs font-medium"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs text-serene-400 font-medium">Client&apos;s Description:</span>
                <div className="mt-1.5 p-4 rounded-xl bg-serene-50 border border-serene-200 text-xs text-serene-800 whitespace-pre-line leading-relaxed">
                  {data.intakeResponse.rawConcernSummary}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                <div>
                  <span className="text-serene-400 font-medium">Session Preference:</span>
                  <p className="text-serene-900 font-semibold mt-0.5">
                    {data.intakeResponse.preferredTimeWindows?.sessionPreference === "IN_PERSON"
                      ? "In-Person Clinic Visit"
                      : "Online Video Consultation"}
                  </p>
                </div>
                <div>
                  <span className="text-serene-400 font-medium">Preferred Time Windows:</span>
                  <p className="text-serene-900 font-semibold mt-0.5">
                    {data.intakeResponse.preferredTimeWindows?.times?.join(", ") || "Flexible"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Operational Notes Feed */}
          <div className="bg-white rounded-2xl border border-serene-200 p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-serene-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-700" />
              Coordination Notes & Operational Log
            </h2>

            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                rows={3}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Log internal update, phone call notes, psychologist feedback, or scheduling check-in..."
                className="w-full text-xs p-3 rounded-xl border border-serene-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-serene-900"
                required
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loadingAction || !noteText.trim()}
                  className="px-4 py-2 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Post Note
                </button>
              </div>
            </form>

            <div className="divide-y divide-serene-100 pt-2">
              {data.notes.length === 0 ? (
                <p className="text-xs text-serene-400 py-3 text-center">
                  No internal notes recorded for this request yet.
                </p>
              ) : (
                data.notes.map((note) => (
                  <div key={note.id} className="py-3 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-serene-900">{note.authorName}</span>
                      <span className="text-[11px] text-serene-400">
                        {new Date(note.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-serene-700 leading-relaxed whitespace-pre-line">{note.noteText}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Actions & Matching */}
        <div className="space-y-6">
          {/* Status State Machine Controller */}
          <div className="bg-white rounded-2xl border border-serene-200 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-serene-700">
              Update Request Status
            </h3>
            <div className="text-xs text-serene-500">
              Current Status: <strong className="text-brand-800">{data.status}</strong>
            </div>

            <form onSubmit={handleStatusUpdate} className="space-y-3">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-serene-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-serene-900"
              >
                {Object.values(CounselingRequestStatus).map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="Reason for status change (optional)"
                className="w-full text-xs p-2.5 rounded-xl border border-serene-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-serene-900"
              />

              <button
                type="submit"
                disabled={loadingAction || newStatus === data.status}
                className="w-full py-2 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
              >
                Advance Status
              </button>
            </form>
          </div>

          {/* Psychologist Matcher */}
          <div className="bg-white rounded-2xl border border-serene-200 p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-serene-700 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-brand-600" />
              Assign Matched Psychologist
            </h3>

            {data.targetPsychologist && (
              <div className="p-3 bg-brand-50 rounded-xl border border-brand-200 text-xs">
                <div className="text-brand-900 font-bold">Currently Assigned:</div>
                <div className="font-semibold text-brand-800 mt-0.5">{data.targetPsychologist.fullName}</div>
                <div className="text-[11px] text-brand-700">{data.targetPsychologist.professionalTitle}</div>
              </div>
            )}

            <form onSubmit={handleMatchPsychologist} className="space-y-3">
              <select
                value={selectedPsychologistId}
                onChange={(e) => setSelectedPsychologistId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-serene-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-serene-900"
              >
                <option value="">-- Select Verified Psychologist --</option>
                {verifiedPsychologists.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.professionalTitle})
                  </option>
                ))}
              </select>

              <button
                type="submit"
                disabled={loadingAction || !selectedPsychologistId || selectedPsychologistId === data.targetPsychologist?.id}
                className="w-full py-2 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
              >
                Confirm Psychologist Match
              </button>
            </form>
          </div>

          {/* Audit Status History */}
          <div className="bg-white rounded-2xl border border-serene-200 p-6 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-serene-700">
              Audit Status Log
            </h3>
            <div className="space-y-2 text-xs">
              {data.statusHistory.map((h) => (
                <div key={h.id} className="border-l-2 border-brand-200 pl-3 py-1">
                  <div className="font-bold text-serene-800">
                    {h.oldStatus} &rarr; {h.newStatus}
                  </div>
                  {h.reason && <div className="text-serene-600 mt-0.5">{h.reason}</div>}
                  <div className="text-[10px] text-serene-400 mt-0.5">
                    {new Date(h.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
