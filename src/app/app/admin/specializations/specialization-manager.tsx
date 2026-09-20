"use client";

import { useState } from "react";
import { Plus, Check, X, ShieldAlert } from "lucide-react";

interface SpecializationItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isHighRisk: boolean;
  isActive: boolean;
  displayOrder: number;
}

export default function AdminSpecializationManager({
  initialSpecializations,
}: {
  initialSpecializations: any[];
}) {
  const [specializations, setSpecializations] = useState<SpecializationItem[]>(initialSpecializations);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isHighRisk, setIsHighRisk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/taxonomies/specializations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || undefined,
          isHighRisk,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create specialization");

      setSpecializations((prev) => [...prev, data]);
      setFeedback({ type: "success", text: `Specialization '${data.name}' created` });
      setName("");
      setDescription("");
      setIsHighRisk(false);
    } catch (err: unknown) {
      setFeedback({ type: "error", text: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Create New Form */}
      <form onSubmit={handleCreate} className="bg-white rounded-3xl border border-serene-200 p-8 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-serene-900">Add Clinical Specialization</h2>

        {feedback && (
          <div
            role="alert"
            className={`p-3 rounded-xl text-xs font-medium border ${
              feedback.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {feedback.text}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-serene-700 uppercase tracking-wider mb-1">
              Specialization Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Eating Disorders & Body Image"
              className="w-full px-3 py-2 border border-serene-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-serene-700 uppercase tracking-wider mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief context..."
              className="w-full px-3 py-2 border border-serene-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="isHighRisk"
            checked={isHighRisk}
            onChange={(e) => setIsHighRisk(e.target.checked)}
            className="w-4 h-4 text-red-600 rounded border-serene-300 focus:ring-red-500"
          />
          <label htmlFor="isHighRisk" className="text-xs font-semibold text-serene-700 cursor-pointer">
            Mark as High-Risk Category (requires mandatory clinical escalation safeguards)
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !name}
          className="inline-flex items-center gap-2 py-2 px-5 bg-serene-900 hover:bg-serene-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" />
          {loading ? "Adding..." : "Add Specialization"}
        </button>
      </form>

      {/* Specializations List */}
      <div className="bg-white rounded-3xl border border-serene-200 shadow-sm overflow-hidden divide-y divide-serene-100">
        {specializations.map((spec) => (
          <div key={spec.id} className="p-4 sm:p-6 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-serene-900">{spec.name}</h3>
                {spec.isHighRisk && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-800 border border-red-200 text-[10px] font-bold">
                    <ShieldAlert className="w-3 h-3" />
                    HIGH RISK
                  </span>
                )}
              </div>
              <span className="text-[11px] text-serene-400 font-mono block mt-0.5">
                slug: {spec.slug}
              </span>
              {spec.description && (
                <p className="text-xs text-serene-500 mt-1">{spec.description}</p>
              )}
            </div>

            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                spec.isActive
                  ? "bg-green-50 text-green-800 border-green-200"
                  : "bg-serene-100 text-serene-600 border-serene-200"
              }`}
            >
              {spec.isActive ? "ACTIVE" : "INACTIVE"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
