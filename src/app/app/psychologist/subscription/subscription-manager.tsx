"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Sparkles, AlertCircle, ShieldAlert, ArrowRight } from "lucide-react";

interface Plan {
  id: string;
  code: string;
  name: string;
  description: string | null;
  priceMajor: string;
  currency: string;
  intervalDays: number;
  entitlements: {
    maxServices: number;
    aiPortfolioBuilder: boolean;
    featuredDirectory: boolean;
    priorityMatching: boolean;
    analyticsAccess: boolean;
  };
}

interface CurrentSubscription {
  id: string;
  status: string;
  planCode: string;
  planName: string;
  priceMajor: string;
  currency: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelledAt: string | null;
}

export function SubscriptionManager({
  plans,
  currentSub,
  activePlanCode,
}: {
  plans: Plan[];
  currentSub: CurrentSubscription | null;
  activePlanCode: string;
}) {
  const router = useRouter();
  const [loadingCode, setLoadingCode] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; error?: boolean } | null>(null);

  async function handleSelectPlan(code: string) {
    setLoadingCode(code);
    setFeedback(null);

    try {
      const res = await fetch("/api/psychologist/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planCode: code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to update subscription");

      setFeedback({ text: data.message || "Subscription updated successfully!" });
      router.refresh();
    } catch (err: unknown) {
      setFeedback({
        text: err instanceof Error ? err.message : "Error updating subscription",
        error: true,
      });
    } finally {
      setLoadingCode(null);
    }
  }

  async function handleCancelSubscription() {
    if (!confirm("Are you sure you want to cancel automatic renewal? You will retain access until the end of your billing cycle.")) {
      return;
    }

    setIsCancelling(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/psychologist/subscription/cancel", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to cancel renewal");

      setFeedback({ text: "Subscription renewal cancelled." });
      router.refresh();
    } catch (err: unknown) {
      setFeedback({
        text: err instanceof Error ? err.message : "Error cancelling subscription",
        error: true,
      });
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Current Status Card */}
      {currentSub && (
        <div className="bg-white rounded-3xl border border-serene-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-serene-400">Current Plan</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  currentSub.status === "ACTIVE"
                    ? "bg-green-100 text-green-800"
                    : currentSub.status === "CANCELLING"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-serene-100 text-serene-700"
                }`}
              >
                {currentSub.status}
              </span>
            </div>
            <h2 className="text-xl font-bold text-serene-900">{currentSub.planName}</h2>
            <p className="text-xs text-serene-500">
              Valid until {new Date(currentSub.currentPeriodEnd).toLocaleDateString()}
              {currentSub.status === "CANCELLING" && " (will not renew)"}
            </p>
          </div>

          {currentSub.status === "ACTIVE" && (
            <button
              onClick={handleCancelSubscription}
              disabled={isCancelling}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold border border-rose-200 hover:border-rose-300 px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
            >
              {isCancelling ? "Processing..." : "Cancel Auto-Renewal"}
            </button>
          )}
        </div>
      )}

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2 ${
            feedback.error ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-green-50 text-green-700 border border-green-200"
          }`}
        >
          {feedback.error ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Sparkles className="w-4 h-4 shrink-0" />}
          {feedback.text}
        </div>
      )}

      {/* Plan Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrent = activePlanCode === plan.code;
          const isFeatured = plan.code === "pro";

          return (
            <div
              key={plan.code}
              className={`rounded-3xl p-6 flex flex-col justify-between transition-all ${
                isFeatured
                  ? "bg-brand-900 text-white shadow-xl shadow-brand-950/20 ring-2 ring-brand-500"
                  : "bg-white text-serene-900 border border-serene-200 shadow-sm"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                  {isFeatured && (
                    <span className="bg-brand-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      POPULAR
                    </span>
                  )}
                  {isCurrent && !isFeatured && (
                    <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      CURRENT
                    </span>
                  )}
                </div>

                <p className={`text-xs ${isFeatured ? "text-brand-200" : "text-serene-500"}`}>
                  {plan.description}
                </p>

                <div className="pt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold font-mono">₹{plan.priceMajor}</span>
                    <span className={`text-xs ${isFeatured ? "text-brand-300" : "text-serene-400"}`}>
                      /{plan.intervalDays === 365 ? "yr" : "mo"}
                    </span>
                  </div>
                </div>

                <div className="border-t border-serene-100/20 pt-4 space-y-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <Check className={`w-3.5 h-3.5 ${isFeatured ? "text-brand-400" : "text-green-600"}`} />
                    <span>Up to {plan.entitlements.maxServices} clinical services</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check
                      className={`w-3.5 h-3.5 ${
                        plan.entitlements.aiPortfolioBuilder
                          ? isFeatured
                            ? "text-brand-400"
                            : "text-green-600"
                          : "text-serene-300"
                      }`}
                    />
                    <span className={plan.entitlements.aiPortfolioBuilder ? "" : "text-serene-400 line-through"}>
                      AI Portfolio & Bio Generator
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check
                      className={`w-3.5 h-3.5 ${
                        plan.entitlements.priorityMatching
                          ? isFeatured
                            ? "text-brand-400"
                            : "text-green-600"
                          : "text-serene-300"
                      }`}
                    />
                    <span className={plan.entitlements.priorityMatching ? "" : "text-serene-400 line-through"}>
                      Priority Intake Matching
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check
                      className={`w-3.5 h-3.5 ${
                        plan.entitlements.analyticsAccess
                          ? isFeatured
                            ? "text-brand-400"
                            : "text-green-600"
                          : "text-serene-300"
                      }`}
                    />
                    <span className={plan.entitlements.analyticsAccess ? "" : "text-serene-400 line-through"}>
                      Practice Analytics & Reports
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                {isCurrent ? (
                  <button
                    disabled
                    className={`w-full py-2.5 rounded-xl text-xs font-bold cursor-default ${
                      isFeatured ? "bg-white/10 text-brand-200" : "bg-serene-100 text-serene-500"
                    }`}
                  >
                    Active Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleSelectPlan(plan.code)}
                    disabled={loadingCode !== null}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      isFeatured
                        ? "bg-white text-brand-900 hover:bg-brand-50"
                        : "bg-brand-600 text-white hover:bg-brand-700"
                    }`}
                  >
                    {loadingCode === plan.code ? (
                      "Processing..."
                    ) : (
                      <>
                        Select Plan <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
