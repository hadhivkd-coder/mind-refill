"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";

interface EligibleSummary {
  psychologistProfileId: string;
  psychologistName: string;
  psychologistTitle: string;
  itemCount: number;
  totalAmountMajor: string;
}

interface PendingPayout {
  id: string;
  psychologistName: string;
  totalAmountMajor: string;
}

export function AdminPayoutActions({
  eligiblePsychologists,
  pendingPayouts,
}: {
  eligiblePsychologists: EligibleSummary[];
  pendingPayouts: PendingPayout[];
}) {
  const router = useRouter();
  const [selectedPsychId, setSelectedPsychId] = useState(
    eligiblePsychologists[0]?.psychologistProfileId || ""
  );
  const [isCreating, setIsCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const [selectedPayoutId, setSelectedPayoutId] = useState(
    pendingPayouts[0]?.id || ""
  );
  const [reference, setReference] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processMsg, setProcessMsg] = useState<{ text: string; error?: boolean } | null>(null);

  async function handleCreateBatch(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPsychId) return;
    setIsCreating(true);
    setCreateMsg(null);

    try {
      const res = await fetch("/api/admin/payouts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ psychologistProfileId: selectedPsychId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to create payout batch");

      setCreateMsg({ text: "Payout batch created successfully!" });
      router.refresh();
    } catch (err: unknown) {
      setCreateMsg({
        text: err instanceof Error ? err.message : "Error creating batch",
        error: true,
      });
    } finally {
      setIsCreating(false);
    }
  }

  async function handleProcessPayout(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPayoutId || !reference.trim()) return;
    setIsProcessing(true);
    setProcessMsg(null);

    try {
      const res = await fetch(`/api/admin/payouts/${selectedPayoutId}/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payoutReference: reference.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to mark payout as paid");

      setProcessMsg({ text: "Payout marked as PAID successfully!" });
      setReference("");
      router.refresh();
    } catch (err: unknown) {
      setProcessMsg({
        text: err instanceof Error ? err.message : "Error processing payout",
        error: true,
      });
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Batch Generator */}
      <div className="bg-white rounded-3xl border border-serene-200 p-6 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-serene-900">Create Payout Batch</h2>
          <p className="text-xs text-serene-500 mt-0.5">
            Bundle matured settlement items into an approved payout batch.
          </p>
        </div>

        {eligiblePsychologists.length === 0 ? (
          <p className="text-xs text-serene-400 bg-serene-50 p-4 rounded-xl">
            No psychologists currently have eligible settlement balances awaiting payout.
          </p>
        ) : (
          <form onSubmit={handleCreateBatch} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-serene-700 mb-1">
                Select Psychologist with Balance
              </label>
              <select
                value={selectedPsychId}
                onChange={(e) => setSelectedPsychId(e.target.value)}
                className="w-full text-xs rounded-xl border border-serene-200 bg-white px-3 py-2 text-serene-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {eligiblePsychologists.map((p) => (
                  <option key={p.psychologistProfileId} value={p.psychologistProfileId}>
                    {p.psychologistName} — ₹{p.totalAmountMajor} ({p.itemCount} items)
                  </option>
                ))}
              </select>
            </div>

            {createMsg && (
              <div
                className={`p-2 rounded-lg text-xs flex items-center gap-1.5 ${
                  createMsg.error ? "bg-rose-50 text-rose-700" : "bg-green-50 text-green-700"
                }`}
              >
                {createMsg.error ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                {createMsg.text}
              </div>
            )}

            <button
              type="submit"
              disabled={isCreating}
              className="w-full py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              {isCreating ? "Creating Batch..." : "Create Payout Batch"}
            </button>
          </form>
        )}
      </div>

      {/* Payout Execution */}
      <div className="bg-white rounded-3xl border border-serene-200 p-6 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-serene-900">Execute & Disburse Payout</h2>
          <p className="text-xs text-serene-500 mt-0.5">
            Record bank transfer reference number and finalize status to PAID.
          </p>
        </div>

        {pendingPayouts.length === 0 ? (
          <p className="text-xs text-serene-400 bg-serene-50 p-4 rounded-xl">
            No pending payout batches awaiting bank disbursement.
          </p>
        ) : (
          <form onSubmit={handleProcessPayout} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-serene-700 mb-1">
                Select Pending Payout
              </label>
              <select
                value={selectedPayoutId}
                onChange={(e) => setSelectedPayoutId(e.target.value)}
                className="w-full text-xs rounded-xl border border-serene-200 bg-white px-3 py-2 text-serene-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {pendingPayouts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.psychologistName} — ₹{p.totalAmountMajor}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-serene-700 mb-1">
                Bank / UTR Transfer Reference
              </label>
              <input
                type="text"
                placeholder="e.g. UTR-98234812398"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                required
                className="w-full text-xs rounded-xl border border-serene-200 px-3 py-2 text-serene-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {processMsg && (
              <div
                className={`p-2 rounded-lg text-xs flex items-center gap-1.5 ${
                  processMsg.error ? "bg-rose-50 text-rose-700" : "bg-green-50 text-green-700"
                }`}
              >
                {processMsg.error ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                {processMsg.text}
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isProcessing ? "Confirming..." : "Confirm Bank Disbursement"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
