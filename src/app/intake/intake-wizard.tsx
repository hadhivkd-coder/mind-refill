"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  HeartHandshake,
  AlertTriangle,
  AlertCircle,
  Calendar,
  Clock,
  Video,
  MapPin,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  PhoneCall,
  Loader2,
  Sparkles,
  ShieldCheck,
  Check,
} from "lucide-react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-1", name: "Anxiety & Panic", slug: "anxiety", description: "Generalized anxiety, panic attacks, and nervous system calming" },
  { id: "cat-2", name: "Depression & Low Mood", slug: "depression", description: "Persistent heaviness, loss of energy, and emotional numbness" },
  { id: "cat-3", name: "Relationships & Couples", slug: "relationships", description: "Communication breakdown, conflict, and intimacy" },
  { id: "cat-4", name: "Family Dynamics", slug: "family", description: "Family boundaries, intergenerational friction, and caregiving" },
  { id: "cat-5", name: "Career & Burnout", slug: "career-burnout", description: "Workplace burnout, imposter syndrome, and chronic exhaustion" },
  { id: "cat-6", name: "Trauma & PTSD", slug: "trauma-ptsd", description: "Past wounds, somatic triggers, and emotional recovery" },
  { id: "cat-7", name: "Grief & Loss", slug: "grief-loss", description: "Bereavement, major life transitions, and navigating loss" },
  { id: "cat-8", name: "Self-Understanding & Identity", slug: "self-esteem", description: "Self-worth, life purpose, and personal growth" },
  { id: "cat-9", name: "Sleep & Restlessness", slug: "sleep", description: "Racing nighttime thoughts, insomnia, and nervous exhaustion" },
];

export function IntakeWizard({ initialPsychologistSlug }: { initialPsychologistSlug?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetSlug = initialPsychologistSlug || searchParams.get("psychologist") || "";

  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [step1Error, setStep1Error] = useState<string | null>(null);
  const [targetPsychologist, setTargetPsychologist] = useState<{ id: string; fullName: string; professionalTitle: string } | null>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [ageBand, setAgeBand] = useState<string>("25_34");
  const [contactPreference, setContactPreference] = useState<"EMAIL" | "PHONE" | "WHATSAPP">("EMAIL");
  const [preferredLanguage, setPreferredLanguage] = useState("English");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [rawConcernSummary, setRawConcernSummary] = useState("");
  const [preferredDays, setPreferredDays] = useState<string[]>(["MONDAY", "WEDNESDAY"]);
  const [preferredTimes, setPreferredTimes] = useState<string[]>(["EVENING"]);
  const [sessionPreference, setSessionPreference] = useState<"ONLINE_VIDEO" | "IN_PERSON">("ONLINE_VIDEO");
  const [hasCrisisConcerns, setHasCrisisConcerns] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedResult, setSubmittedResult] = useState<{ requestId: string; isEscalated: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/intake")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setCategories(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingCategories(false));

    if (targetSlug) {
      fetch(`/api/psychologists/${targetSlug}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setTargetPsychologist({
              id: data.data.id,
              fullName: data.data.fullName,
              professionalTitle: data.data.professionalTitle,
            });
          }
        })
        .catch(() => {});
    }
  }, [targetSlug]);

  const toggleCategory = (name: string) => {
    if (step1Error) setStep1Error(null);
    setSelectedCategories((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };

  const toggleDay = (day: string) => {
    setPreferredDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleTime = (time: string) => {
    setPreferredTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phoneNumber: phoneNumber || null,
          ageBand,
          contactPreference,
          preferredLanguage,
          concernCategories: selectedCategories,
          rawConcernSummary,
          preferredDays,
          preferredTimes,
          sessionPreference,
          targetPsychologistId: targetPsychologist?.id || null,
          isDirectBookingRequest: Boolean(targetPsychologist),
          hasCrisisConcerns,
        }),
      });

      const data = await res.json();
      if (!res.ok && !data.success) {
        throw new Error(data.error?.message || "Failed to submit intake request.");
      }

      setSubmittedResult({
        requestId: data.data?.requestId || `req-${Date.now()}`,
        isEscalated: Boolean(data.data?.isEscalated),
      });
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedResult) {
    return (
      <div className="bg-white rounded-3xl border border-sage-200/80 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm">
        <div className="w-16 h-16 bg-forest-50 border border-forest-200 rounded-full flex items-center justify-center mx-auto mb-6 text-forest-700">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <span className="text-[11px] font-bold text-forest-600 uppercase tracking-widest block mb-2">
          Request Received
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-forest-950 tracking-tight">
          You took an important step today.
        </h2>
        <p className="text-sm text-forest-700 mt-3 leading-relaxed">
          {submittedResult.isEscalated
            ? "Your request has been prioritized with clinical urgency. A dedicated care team member will connect with you via your preferred contact channel shortly."
            : "A human care coordinator has received your notes. We will review your preferences thoughtfully and reach out to help connect you with the right psychologist."}
        </p>

        {submittedResult.isEscalated && (
          <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 text-left">
            <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              Immediate Crisis Helplines
            </div>
            If you are in acute distress, please reach out right now:
            <ul className="list-disc ml-5 mt-1.5 space-y-1">
              <li><strong>KIRAN Mental Health Line (24/7):</strong> 1800-599-0019</li>
              <li><strong>Tele-MANAS (24/7):</strong> 14416 or 1800-891-4416</li>
              <li><strong>National Emergency:</strong> 112</li>
            </ul>
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/app/client/requests"
            className="w-full sm:w-auto px-6 py-3 bg-forest-700 hover:bg-forest-800 text-white text-xs font-semibold rounded-2xl shadow-sm transition-colors text-center"
          >
            Track in Client Portal &rarr;
          </Link>
          <Link
            href="/psychologists"
            className="w-full sm:w-auto px-6 py-3 border border-sage-300 hover:bg-sage-50 text-forest-800 text-xs font-semibold rounded-2xl transition-colors text-center"
          >
            Browse Psychologists
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Crisis Warning Banner */}
      <div className="mb-6 bg-sage-50/80 border border-sage-200/90 rounded-2xl p-4 flex items-start gap-3 text-xs text-forest-900 shadow-2xs">
        <AlertTriangle className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-forest-950">Urgent Support Notice:</span> Mind Refill intake is for scheduled outpatient therapy. If you are experiencing acute thoughts of self-harm, please call{" "}
          <strong className="underline decoration-forest-400">1800-599-0019</strong> (Kiran 24/7) or <strong>112</strong> immediately.
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-sage-200/80 p-6 sm:p-10 shadow-sm relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-sage-100/40 via-cream-100/20 to-transparent rounded-full blur-2xl pointer-events-none -z-0" />

        {/* Header */}
        <div className="mb-8 border-b border-sage-100 pb-6 relative z-10">
          <div className="flex items-center gap-2 text-xs font-bold text-forest-700 uppercase tracking-widest mb-1.5">
            <HeartHandshake className="w-4 h-4 text-forest-600" />
            {targetPsychologist ? "Direct Practitioner Consultation" : "Guided Matching Intake"}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-forest-950 tracking-tight">
            {targetPsychologist
              ? `Session Request for ${targetPsychologist.fullName}`
              : "Let's take this one step at a time."}
          </h1>
          <p className="text-xs sm:text-sm text-forest-700 mt-2 leading-relaxed">
            {targetPsychologist
              ? `You are requesting an appointment with ${targetPsychologist.fullName}, ${targetPsychologist.professionalTitle}. Tell us a little about your schedule and focus.`
              : "Share what's been on your mind. A dedicated human care coordinator will match you with a verified psychologist who fits your needs, budget, and rhythm."}
          </p>
        </div>

        {/* Connection-Themed Stepper: 01 ───── 02 ───── 03 */}
        <div className="mb-10 relative z-10">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {/* Step 01 */}
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                  step === 1
                    ? "bg-forest-800 text-white ring-4 ring-forest-100"
                    : step > 1
                    ? "bg-forest-600 text-white"
                    : "bg-sage-100 text-forest-400"
                }`}
              >
                {step > 1 ? <Check className="w-4 h-4" /> : "01"}
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-[10px] uppercase tracking-wider block font-semibold text-forest-500">Step 01</span>
                <span className={`text-xs font-bold ${step === 1 ? "text-forest-950" : "text-forest-700"}`}>
                  Your Thoughts
                </span>
              </div>
            </div>

            {/* Connecting Bridge 1 */}
            <div className={`flex-1 mx-3 h-0.5 rounded-full transition-colors ${step >= 2 ? "bg-forest-600" : "bg-sage-200"}`} />

            {/* Step 02 */}
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                  step === 2
                    ? "bg-forest-800 text-white ring-4 ring-forest-100"
                    : step > 2
                    ? "bg-forest-600 text-white"
                    : "bg-sage-100 text-forest-400"
                }`}
              >
                {step > 2 ? <Check className="w-4 h-4" /> : "02"}
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-[10px] uppercase tracking-wider block font-semibold text-forest-500">Step 02</span>
                <span className={`text-xs font-bold ${step === 2 ? "text-forest-950" : "text-forest-700"}`}>
                  Preferences
                </span>
              </div>
            </div>

            {/* Connecting Bridge 2 */}
            <div className={`flex-1 mx-3 h-0.5 rounded-full transition-colors ${step >= 3 ? "bg-forest-600" : "bg-sage-200"}`} />

            {/* Step 03 */}
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                  step === 3
                    ? "bg-forest-800 text-white ring-4 ring-forest-100"
                    : "bg-sage-100 text-forest-400"
                }`}
              >
                03
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-[10px] uppercase tracking-wider block font-semibold text-forest-500">Step 03</span>
                <span className={`text-xs font-bold ${step === 3 ? "text-forest-950" : "text-forest-700"}`}>
                  Contact Details
                </span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          {/* STEP 1: Conversational Guided Experience */}
          {step === 1 && (
            <div className="space-y-8 animate-fade-in">
              {/* Emotional Primary: What's on your mind */}
              <div>
                <div className="mb-3">
                  <h2 className="text-base sm:text-lg font-bold text-forest-950">
                    Let&apos;s start with what&apos;s been on your mind.
                  </h2>
                  <p className="text-xs sm:text-sm text-forest-700 mt-1 leading-relaxed">
                    You don&apos;t need to have the right words. Just tell us what feels important right now.
                  </p>
                </div>

                <div className="relative">
                  <textarea
                    rows={5}
                    value={rawConcernSummary}
                    onChange={(e) => {
                      setRawConcernSummary(e.target.value);
                      if (step1Error) setStep1Error(null);
                    }}
                    placeholder="For example: Lately I've been feeling drained and overwhelmed. Even small tasks feel heavy, and I find myself overthinking every interaction. I'm hoping to find someone who can help me regain my grounding..."
                    className="w-full text-xs sm:text-sm p-4 rounded-2xl border border-sage-300 focus:outline-none focus:ring-2 focus:ring-forest-600 text-forest-950 placeholder:text-forest-400/80 bg-cream-50/40 leading-relaxed shadow-inner"
                    required
                  />
                  <div className="flex justify-between items-center mt-2 px-1 text-[11px] text-forest-500">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-forest-600" />
                      Everything you share is strictly confidential between you and your care team.
                    </span>
                    <span className={rawConcernSummary.trim().length >= 10 ? "text-forest-700 font-semibold" : "text-forest-400"}>
                      {rawConcernSummary.trim().length} characters
                    </span>
                  </div>
                </div>
              </div>

              {/* Approachable Selectable Options */}
              <div>
                <div className="mb-3">
                  <h3 className="text-sm font-bold text-forest-950">
                    What are you hoping to get support with? <span className="text-forest-500 font-normal text-xs">(Select all that resonate)</span>
                  </h3>
                  <p className="text-xs text-forest-600 mt-0.5">
                    Choose any areas that touch on your experience. You can always refine this later.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {categories.map((cat) => {
                    const isSelected = selectedCategories.includes(cat.name);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategory(cat.name)}
                        className={`p-3.5 text-left rounded-2xl border transition-all flex items-start justify-between gap-2 group cursor-pointer ${
                          isSelected
                            ? "bg-forest-50 border-forest-600 text-forest-950 ring-1 ring-forest-600 shadow-2xs"
                            : "border-sage-200 hover:border-forest-300 text-forest-800 bg-white hover:bg-cream-50/50"
                        }`}
                      >
                        <div>
                          <span className="block text-xs font-semibold">{cat.name}</span>
                          {cat.description && (
                            <span className="block text-[10px] text-forest-600 mt-0.5 line-clamp-1">
                              {cat.description}
                            </span>
                          )}
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 border transition-colors ${
                            isSelected
                              ? "bg-forest-700 border-forest-700 text-white"
                              : "border-sage-300 group-hover:border-forest-400"
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Safety Self-Report */}
              <div className="pt-2 border-t border-sage-100">
                <label className="flex items-start gap-3 cursor-pointer p-3 rounded-2xl hover:bg-sage-50/60 transition-colors">
                  <input
                    type="checkbox"
                    checked={hasCrisisConcerns}
                    onChange={(e) => setHasCrisisConcerns(e.target.checked)}
                    className="mt-0.5 rounded text-forest-700 focus:ring-forest-500 w-4 h-4"
                  />
                  <span className="text-xs text-forest-700 leading-relaxed">
                    I am experiencing intense emotional distress, panic, or thoughts of self-harm, and would appreciate prioritized outreach.
                  </span>
                </label>
              </div>

              {/* Error feedback & Continue button */}
              <div className="flex flex-col items-end pt-2 space-y-3">
                {step1Error && (
                  <div className="w-full p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5 animate-fade-in shadow-2xs">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{step1Error}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (rawConcernSummary.trim().length < 5) {
                      setStep1Error("Please write a few words about what you're experiencing so we can understand how to support you.");
                      return;
                    }
                    if (selectedCategories.length === 0) {
                      setStep1Error("Please select at least one topic above that resonates with your current situation.");
                      return;
                    }
                    setStep1Error(null);
                    setStep(2);
                  }}
                  className="w-full sm:w-auto px-8 py-3.5 bg-forest-800 hover:bg-forest-900 text-white text-xs font-semibold rounded-2xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Continue to Preferences <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Scheduling & Delivery Preferences */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest-800 mb-2">
                  Session Delivery Preference
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSessionPreference("ONLINE_VIDEO")}
                    className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      sessionPreference === "ONLINE_VIDEO"
                        ? "bg-forest-50 border-forest-600 text-forest-950 shadow-2xs ring-1 ring-forest-600"
                        : "border-sage-200 hover:border-forest-300 text-forest-800 bg-white"
                    }`}
                  >
                    <Video className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-forest-950">Online Video Consultation</div>
                      <div className="text-[11px] text-forest-600 mt-0.5">Secure, confidential video from the comfort of your home</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSessionPreference("IN_PERSON")}
                    className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      sessionPreference === "IN_PERSON"
                        ? "bg-forest-50 border-forest-600 text-forest-950 shadow-2xs ring-1 ring-forest-600"
                        : "border-sage-200 hover:border-forest-300 text-forest-800 bg-white"
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-forest-950">In-Person Session</div>
                      <div className="text-[11px] text-forest-600 mt-0.5">Clinic appointment based on practitioner location</div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest-800 mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-forest-600" />
                  Preferred Days of the Week
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"].map((day) => {
                    const isSelected = preferredDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`p-3 text-center rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? "bg-forest-50 border-forest-600 text-forest-950 font-bold"
                            : "border-sage-200 hover:border-forest-300 text-forest-700 bg-white"
                        }`}
                      >
                        {day.charAt(0) + day.slice(1).toLowerCase()}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest-800 mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-forest-600" />
                  Preferred Time Windows
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { key: "MORNING", label: "Morning", desc: "09:00 – 12:00" },
                    { key: "AFTERNOON", label: "Afternoon", desc: "12:00 – 17:00" },
                    { key: "EVENING", label: "Evening", desc: "17:00 – 21:00" },
                  ].map((t) => {
                    const isSelected = preferredTimes.includes(t.key);
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => toggleTime(t.key)}
                        className={`p-3.5 text-left rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-forest-50 border-forest-600 text-forest-950 ring-1 ring-forest-600"
                            : "border-sage-200 hover:border-forest-300 text-forest-800 bg-white"
                        }`}
                      >
                        <div className="text-xs font-bold text-forest-950">{t.label}</div>
                        <div className="text-[11px] text-forest-600 mt-0.5">{t.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-sage-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 border border-sage-300 hover:bg-sage-50 text-forest-700 text-xs font-semibold rounded-2xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-7 py-3 bg-forest-800 hover:bg-forest-900 text-white text-xs font-semibold rounded-2xl shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  Continue to Contact Details <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Client Details */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-forest-800 mb-1.5">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your name"
                    required
                    className="w-full text-xs p-3.5 rounded-2xl border border-sage-300 focus:outline-none focus:ring-2 focus:ring-forest-600 text-forest-950 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-forest-800 mb-1.5">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full text-xs p-3.5 rounded-2xl border border-sage-300 focus:outline-none focus:ring-2 focus:ring-forest-600 text-forest-950 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-forest-800 mb-1.5">
                    Age Group
                  </label>
                  <select
                    value={ageBand}
                    onChange={(e) => setAgeBand(e.target.value)}
                    className="w-full text-xs p-3.5 rounded-2xl border border-sage-300 bg-white focus:outline-none focus:ring-2 focus:ring-forest-600 text-forest-950"
                  >
                    <option value="UNDER_18">Under 18</option>
                    <option value="18_24">18–24 years</option>
                    <option value="25_34">25–34 years</option>
                    <option value="35_44">35–44 years</option>
                    <option value="45_54">45–54 years</option>
                    <option value="55_PLUS">55+ years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-forest-800 mb-1.5">
                    Preferred Language
                  </label>
                  <input
                    type="text"
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    placeholder="English, Hindi, etc."
                    className="w-full text-xs p-3.5 rounded-2xl border border-sage-300 focus:outline-none focus:ring-2 focus:ring-forest-600 text-forest-950 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-forest-800 mb-1.5">
                    Preferred Contact
                  </label>
                  <select
                    value={contactPreference}
                    onChange={(e) => setContactPreference(e.target.value as any)}
                    className="w-full text-xs p-3.5 rounded-2xl border border-sage-300 bg-white focus:outline-none focus:ring-2 focus:ring-forest-600 text-forest-950"
                  >
                    <option value="EMAIL">Email</option>
                    <option value="PHONE">Phone Call</option>
                    <option value="WHATSAPP">WhatsApp</option>
                  </select>
                </div>
              </div>

              <div className="bg-cream-50 rounded-2xl p-5 border border-sage-200/80 text-xs text-forest-700 leading-relaxed">
                <div className="font-bold text-forest-950 mb-1 flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-forest-700" />
                  What happens after this?
                </div>
                Your care coordinator personally reviews your note, matches your schedule with an appropriate clinician, and reaches out via your preferred channel with clear next steps. There is no pressure or obligation.
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-sage-100">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 border border-sage-300 hover:bg-sage-50 text-forest-700 text-xs font-semibold rounded-2xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="submit"
                  disabled={submitting || !fullName.trim()}
                  className="px-8 py-3 bg-forest-800 hover:bg-forest-900 disabled:opacity-50 text-white text-xs font-semibold rounded-2xl shadow-sm hover:shadow transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    "Confirm & Submit Note"
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
