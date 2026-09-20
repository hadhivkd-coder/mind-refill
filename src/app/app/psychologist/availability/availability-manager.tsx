"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Globe,
} from "lucide-react";

interface Rule {
  id?: string;
  dayOfWeek: number;
  startTimeUtc: string;
  endTimeUtc: string;
  isActive: boolean;
}

interface Exception {
  id: string;
  startDateTime: string;
  endDateTime: string;
  isUnavailable: boolean;
  reason: string | null;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function AvailabilityManager({
  initialRules,
  initialExceptions,
  initialTimezone,
}: {
  initialRules: Rule[];
  initialExceptions: Exception[];
  initialTimezone: string;
}) {
  const [rules, setRules] = useState<Rule[]>(
    initialRules.length > 0
      ? initialRules
      : [
          { dayOfWeek: 1, startTimeUtc: "09:00", endTimeUtc: "17:00", isActive: true },
          { dayOfWeek: 2, startTimeUtc: "09:00", endTimeUtc: "17:00", isActive: true },
          { dayOfWeek: 3, startTimeUtc: "09:00", endTimeUtc: "17:00", isActive: true },
          { dayOfWeek: 4, startTimeUtc: "09:00", endTimeUtc: "17:00", isActive: true },
          { dayOfWeek: 5, startTimeUtc: "09:00", endTimeUtc: "17:00", isActive: true },
        ]
  );
  const [exceptions, setExceptions] = useState<Exception[]>(initialExceptions);
  const [timezone, setTimezone] = useState(initialTimezone || "UTC");

  const [savingRules, setSavingRules] = useState(false);
  const [rulesSuccess, setRulesSuccess] = useState(false);

  // New Exception form state
  const [exStart, setExStart] = useState("");
  const [exEnd, setExEnd] = useState("");
  const [exReason, setExReason] = useState("");
  const [addingEx, setAddingEx] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddRule = () => {
    setRules([...rules, { dayOfWeek: 1, startTimeUtc: "09:00", endTimeUtc: "17:00", isActive: true }]);
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleUpdateRule = (index: number, field: keyof Rule, val: any) => {
    const updated = [...rules];
    updated[index] = { ...updated[index], [field]: val };
    setRules(updated);
  };

  const handleSaveRules = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSavingRules(true);
    setRulesSuccess(false);

    try {
      const res = await fetch("/api/psychologist/availability/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rules, timezone }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to update availability");

      setRulesSuccess(true);
      setTimeout(() => setRulesSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingRules(false);
    }
  };

  const handleAddException = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exStart || !exEnd) return;

    setError(null);
    setAddingEx(true);

    try {
      const res = await fetch("/api/psychologist/availability/exceptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDateTime: new Date(exStart).toISOString(),
          endDateTime: new Date(exEnd).toISOString(),
          isUnavailable: true,
          reason: exReason || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to add date exception");

      setExceptions([...exceptions, json.data]);
      setExStart("");
      setExEnd("");
      setExReason("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAddingEx(false);
    }
  };

  const handleRemoveException = async (id: string) => {
    try {
      const res = await fetch(`/api/psychologist/availability/exceptions/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setExceptions(exceptions.filter((e) => e.id !== id));
      }
    } catch {}
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          {error}
        </div>
      )}

      {rulesSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          Weekly availability schedule successfully updated.
        </div>
      )}

      {/* 1. Weekly Schedule Builder */}
      <div className="bg-white rounded-3xl border border-serene-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-serene-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-serene-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-700" />
              Weekly Recurring Schedule
            </h2>
            <p className="text-xs text-serene-500 mt-0.5">
              Set the standard days and time windows you are open for counseling sessions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-serene-400" />
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="text-xs p-2 rounded-xl border border-serene-300 bg-white text-serene-800 focus:ring-brand-500"
            >
              <option value="UTC">UTC</option>
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="Europe/London">Europe/London (GMT/BST)</option>
            </select>
          </div>
        </div>

        <form onSubmit={handleSaveRules} className="space-y-4">
          <div className="space-y-3">
            {rules.map((rule, idx) => (
              <div
                key={idx}
                className="flex flex-wrap items-center gap-3 p-3 rounded-2xl bg-serene-50/70 border border-serene-200 text-xs"
              >
                <div className="w-32">
                  <select
                    value={rule.dayOfWeek}
                    onChange={(e) => handleUpdateRule(idx, "dayOfWeek", parseInt(e.target.value, 10))}
                    className="w-full p-2 rounded-lg border border-serene-300 bg-white font-medium text-serene-800"
                  >
                    {DAYS.map((d, dayIndex) => (
                      <option key={dayIndex} value={dayIndex}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-serene-500">From</span>
                  <input
                    type="time"
                    value={rule.startTimeUtc}
                    onChange={(e) => handleUpdateRule(idx, "startTimeUtc", e.target.value)}
                    className="p-1.5 rounded-lg border border-serene-300 bg-white font-medium"
                    required
                  />
                  <span className="text-serene-500">To</span>
                  <input
                    type="time"
                    value={rule.endTimeUtc}
                    onChange={(e) => handleUpdateRule(idx, "endTimeUtc", e.target.value)}
                    className="p-1.5 rounded-lg border border-serene-300 bg-white font-medium"
                    required
                  />
                </div>

                <label className="flex items-center gap-1.5 ml-auto cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rule.isActive}
                    onChange={(e) => handleUpdateRule(idx, "isActive", e.target.checked)}
                    className="rounded text-brand-700"
                  />
                  <span className="text-serene-600 font-medium">Active</span>
                </label>

                <button
                  type="button"
                  onClick={() => handleRemoveRule(idx)}
                  className="p-2 text-serene-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={handleAddRule}
              className="px-3 py-1.5 border border-dashed border-serene-300 hover:border-brand-500 text-serene-700 text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Time Window
            </button>

            <button
              type="submit"
              disabled={savingRules}
              className="px-5 py-2 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
            >
              {savingRules ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Weekly Schedule
            </button>
          </div>
        </form>
      </div>

      {/* 2. Date Exceptions (Holidays & Blocks) */}
      <div className="bg-white rounded-3xl border border-serene-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="border-b border-serene-100 pb-4">
          <h2 className="text-base font-bold text-serene-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-700" />
            Date Exceptions & Manual Blocks
          </h2>
          <p className="text-xs text-serene-500 mt-0.5">
            Block specific dates for holidays, vacations, or personal commitments.
          </p>
        </div>

        {/* Add Exception Form */}
        <form onSubmit={handleAddException} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-bold uppercase text-serene-500 mb-1">
              Start Datetime
            </label>
            <input
              type="datetime-local"
              value={exStart}
              onChange={(e) => setExStart(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-serene-300"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase text-serene-500 mb-1">
              End Datetime
            </label>
            <input
              type="datetime-local"
              value={exEnd}
              onChange={(e) => setExEnd(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-serene-300"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase text-serene-500 mb-1">
              Reason (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Annual Leave"
              value={exReason}
              onChange={(e) => setExReason(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-serene-300"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={addingEx || !exStart || !exEnd}
              className="w-full py-2.5 bg-serene-900 hover:bg-black disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-1"
            >
              {addingEx ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Block Dates
            </button>
          </div>
        </form>

        {/* Exceptions List */}
        <div className="divide-y divide-serene-100 pt-2">
          {exceptions.length === 0 ? (
            <p className="text-xs text-serene-400 py-3 text-center">
              No upcoming date exceptions or vacation blocks set.
            </p>
          ) : (
            exceptions.map((ex) => (
              <div key={ex.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-serene-900">
                    {new Date(ex.startDateTime).toLocaleString()} &mdash;{" "}
                    {new Date(ex.endDateTime).toLocaleString()}
                  </div>
                  <div className="text-serene-500 text-[11px] mt-0.5">
                    {ex.reason || "Unavailable slot"}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveException(ex.id)}
                  className="text-serene-400 hover:text-red-600 transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
