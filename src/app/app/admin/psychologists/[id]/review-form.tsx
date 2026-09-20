"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AdminReviewFormProps {
  applicationId: string;
  currentStatus: string;
}

export default function AdminReviewForm({ applicationId, currentStatus }: AdminReviewFormProps) {
  const router = useRouter();
  const [outcomeStatus, setOutcomeStatus] = useState<"VERIFIED" | "REJECTED" | "SUSPENDED">(
    currentStatus === "VERIFIED" ? "VERIFIED" : "VERIFIED"
  );
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/verifications/${applicationId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcomeStatus, notes }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit review");

      setFeedback({ type: "success", message: data.message });
      router.refresh();
    } catch (err: unknown) {
      setFeedback({ type: "error", message: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {feedback && (
        <div
          role="alert"
          className={`p-3 rounded-xl text-xs font-medium border ${
            feedback.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <label
          className={`p-3 rounded-xl border text-center cursor-pointer transition-colors ${
            outcomeStatus === "VERIFIED"
              ? "bg-green-50 border-green-500 text-green-900 font-bold"
              : "border-serene-200 text-serene-600 hover:bg-serene-50"
          }`}
        >
          <input
            type="radio"
            name="outcomeStatus"
            value="VERIFIED"
            checked={outcomeStatus === "VERIFIED"}
            onChange={() => setOutcomeStatus("VERIFIED")}
            className="sr-only"
          />
          <span className="text-xs">Approve & Verify</span>
        </label>

        <label
          className={`p-3 rounded-xl border text-center cursor-pointer transition-colors ${
            outcomeStatus === "REJECTED"
              ? "bg-red-50 border-red-500 text-red-900 font-bold"
              : "border-serene-200 text-serene-600 hover:bg-serene-50"
          }`}
        >
          <input
            type="radio"
            name="outcomeStatus"
            value="REJECTED"
            checked={outcomeStatus === "REJECTED"}
            onChange={() => setOutcomeStatus("REJECTED")}
            className="sr-only"
          />
          <span className="text-xs">Reject Application</span>
        </label>

        <label
          className={`p-3 rounded-xl border text-center cursor-pointer transition-colors ${
            outcomeStatus === "SUSPENDED"
              ? "bg-amber-50 border-amber-500 text-amber-900 font-bold"
              : "border-serene-200 text-serene-600 hover:bg-serene-50"
          }`}
        >
          <input
            type="radio"
            name="outcomeStatus"
            value="SUSPENDED"
            checked={outcomeStatus === "SUSPENDED"}
            onChange={() => setOutcomeStatus("SUSPENDED")}
            className="sr-only"
          />
          <span className="text-xs">Suspend Account</span>
        </label>
      </div>

      <div>
        <label htmlFor="notes" className="block text-xs font-semibold text-serene-700 uppercase tracking-wider mb-1">
          Decision Notes / Clinical Feedback
        </label>
        <textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="State reason for decision (visible to psychologist if rejected, archived in audit logs)..."
          className="w-full px-3 py-2 border border-serene-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="py-2.5 px-6 bg-serene-900 hover:bg-serene-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-50"
      >
        {loading ? "Recording decision..." : "Submit Review Decision"}
      </button>
    </form>
  );
}
