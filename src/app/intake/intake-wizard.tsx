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
      <div className="atmospheric-card rounded-3xl border border-white/15 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-2xl text-[#F7F3E9]">
        <div className="w-16 h-16 bg-[#244F42] border border-[#C9D2BC]/20 rounded-full flex items-center justify-center mx-auto mb-6 text-[#F1EBDD] shadow-inner">
          <CheckCircle2 className="w-8 h-8 text-[#9CAF91]" />
        </div>

        <span className="text-[11px] font-semibold text-[#9CAF91] uppercase tracking-widest block mb-2">
          Request Received
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#F7F3E9] tracking-tight">
          You took an important step today.
        </h2>
        <p className="text-sm text-[#C9D2BC] mt-3 leading-relaxed font-light">
          {submittedResult.isEscalated
            ? "Your request has been prioritized with clinical urgency. A dedicated care team member will connect with you via your preferred contact channel shortly."
            : "A human care coordinator has received your notes. We will review your preferences thoughtfully and reach out to help connect you with the right psychologist."}
        </p>

        {submittedResult.isEscalated && (
          <div className="mt-6 p-4 rounded-2xl bg-amber-950/70 border border-amber-800 text-xs text-amber-200 text-left">
            <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-100">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Immediate Crisis Helplines
            </div>
            If you are in acute distress, please reach out right now:
            <ul className="list-disc ml-5 mt-1.5 space-y-1">
              <li><strong>KIRAN Mental Health Line (24/7):</strong> 1800-599-0019</li>
              <li><strong>Tele-MANAS (24/7):</strong> 14416 or 1800-891-4416</li>
              <li><strong>National Emergency:</strong> 112 / 911</li>
            </ul>
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/app/client/requests"
            className="w-full sm:w-auto px-7 py-3.5 bg-[#F1EBDD] hover:bg-white text-[#173C32] text-xs font-semibold rounded-full shadow-md transition-all text-center"
          >
            Track in Client Portal &rarr;
          </Link>
          <Link
            href="/psychologists"
            className="w-full sm:w-auto px-7 py-3.5 border border-white/20 hover:bg-white/5 text-[#F7F3E9] text-xs font-semibold rounded-full transition-colors text-center"
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
      <div className="mb-6 bg-[#122C25]/90 border border-[#C9D2BC]/20 rounded-2xl p-4 flex items-start gap-3 text-xs text-[#C9D2BC] shadow-sm">
        <AlertTriangle className="w-4 h-4 text-[#C7A4A0] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-[#F1EBDD]">Urgent Support Notice:</span> Mind Refill intake is for scheduled outpatient psychological care. If you are experiencing acute thoughts of self-harm or need emergency help, please call{" "}
          <strong className="underline text-[#F1EBDD]">1800-599-0019</strong> (KIRAN 24/7) or <strong>112 / 911</strong> immediately.
        </div>
      </div>

      <div className="atmospheric-card rounded-3xl border border-white/15 p-6 sm:p-10 shadow-2xl relative overflow-hidden text-[#F7F3E9]">
        {/* Header */}
        <div className="mb-8 border-b border-white/10 pb-6 relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#9CAF91] uppercase tracking-widest mb-1.5">
            <HeartHandshake className="w-4 h-4 text-[#9CAF91]" />
            {targetPsychologist ? "Direct Practitioner Consultation" : "Guided Matching Intake"}
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-normal text-[#F7F3E9] tracking-tight">
            {targetPsychologist
              ? `Session Request for ${targetPsychologist.fullName}`
              : "Let's start with what's on your mind."}
          </h1>
          <p className="text-xs sm:text-sm text-[#C9D2BC] mt-2 leading-relaxed font-light">
            {targetPsychologist
              ? `You are requesting an appointment with ${targetPsychologist.fullName}. Tell us a little about your schedule and focus.`
              : "You don't need the perfect words. Just tell us what feels important right now. A dedicated human care coordinator will match you with a verified psychologist who fits your needs."}
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
                    ? "bg-[#F1EBDD] text-[#173C32] ring-4 ring-[#9CAF91]/30"
                    : step > 1
                    ? "bg-[#3F6855] text-white"
                    : "bg-white/5 text-[#9CAF91]"
                }`}
              >
                {step > 1 ? <Check className="w-4 h-4" /> : "01"}
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-[10px] uppercase tracking-wider block font-semibold text-[#9CAF91]">Step 01</span>
                <span className={`text-xs font-medium ${step === 1 ? "text-[#F1EBDD]" : "text-[#C9D2BC]"}`}>
                  Your Focus
                </span>
              </div>
            </div>

            {/* Connecting Bridge 1 */}
            <div className={`flex-1 mx-3 h-0.5 rounded-full transition-colors ${step >= 2 ? "bg-[#9CAF91]" : "bg-white/10"}`} />

            {/* Step 02 */}
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                  step === 2
                    ? "bg-[#F1EBDD] text-[#173C32] ring-4 ring-[#9CAF91]/30"
                    : step > 2
                    ? "bg-[#3F6855] text-white"
                    : "bg-white/5 text-[#9CAF91]"
                }`}
              >
                {step > 2 ? <Check className="w-4 h-4" /> : "02"}
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-[10px] uppercase tracking-wider block font-semibold text-[#9CAF91]">Step 02</span>
                <span className={`text-xs font-medium ${step === 2 ? "text-[#F1EBDD]" : "text-[#C9D2BC]"}`}>
                  Preferences
                </span>
              </div>
            </div>

            {/* Connecting Bridge 2 */}
            <div className={`flex-1 mx-3 h-0.5 rounded-full transition-colors ${step >= 3 ? "bg-[#9CAF91]" : "bg-white/10"}`} />

            {/* Step 03 */}
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                  step === 3
                    ? "bg-[#F1EBDD] text-[#173C32] ring-4 ring-[#9CAF91]/30"
                    : "bg-white/5 text-[#9CAF91]"
                }`}
              >
                03
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-[10px] uppercase tracking-wider block font-semibold text-[#9CAF91]">Step 03</span>
                <span className={`text-xs font-medium ${step === 3 ? "text-[#F1EBDD]" : "text-[#C9D2BC]"}`}>
                  Contact
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
                  <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#F7F3E9]">
                    Let&apos;s start with what&apos;s been on your mind.
                  </h2>
                  <p className="text-xs sm:text-sm text-[#C9D2BC] mt-1 font-light leading-relaxed">
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
                    className="w-full text-xs sm:text-sm p-4 rounded-2xl border border-white/15 focus:outline-none focus:border-[#F1EBDD] focus:ring-2 focus:ring-[#C9D2BC]/20 text-[#F7F3E9] placeholder-[#9CAF91]/60 bg-[#122C25] leading-relaxed shadow-inner"
                    required
                  />
                  <div className="flex justify-between items-center mt-2 px-1 text-[11px] text-[#9CAF91]">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#9CAF91]" />
                      Everything you share is strictly confidential between you and your care team.
                    </span>
                    <span className={rawConcernSummary.trim().length >= 10 ? "text-[#F1EBDD] font-medium" : "text-[#9CAF91]"}>
                      {rawConcernSummary.trim().length} characters
                    </span>
                  </div>
                </div>
              </div>

              {/* Approachable Selectable Options */}
              <div>
                <div className="mb-3">
                  <h3 className="font-serif text-lg font-normal text-[#F7F3E9]">
                    What are you hoping to get support with? <span className="text-[#9CAF91] font-sans font-normal text-xs">(Select all that resonate)</span>
                  </h3>
                  <p className="text-xs text-[#C9D2BC] mt-0.5 font-light">
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
                            ? "bg-[#F1EBDD] border-[#F1EBDD] text-[#173C32] shadow-sm font-semibold"
                            : "border-white/10 hover:border-[#C9D2BC]/30 text-[#C9D2BC] bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <div>
                          <span className="block text-xs font-semibold">{cat.name}</span>
                          {cat.description && (
                            <span className={`block text-[10px] mt-0.5 line-clamp-1 ${isSelected ? "text-[#244F42]" : "text-[#9CAF91]"}`}>
                              {cat.description}
                            </span>
                          )}
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 border transition-colors ${
                            isSelected
                              ? "bg-[#173C32] border-[#173C32] text-[#F1EBDD]"
                              : "border-white/20 group-hover:border-[#9CAF91]"
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
              <div className="pt-2 border-t border-white/10">
                <label className="flex items-start gap-3 cursor-pointer p-3 rounded-2xl hover:bg-white/5 transition-colors">
                  <input
                    type="checkbox"
                    checked={hasCrisisConcerns}
                    onChange={(e) => setHasCrisisConcerns(e.target.checked)}
                    className="mt-0.5 rounded text-[#355E3B] focus:ring-[#9CAF91] w-4 h-4 bg-[#122C25] border-white/20"
                  />
                  <span className="text-xs text-[#C9D2BC] leading-relaxed">
                    I am experiencing intense emotional distress, panic, or thoughts of self-harm, and would appreciate prioritized outreach.
                  </span>
                </label>
              </div>

              {/* Error feedback & Continue button */}
              <div className="flex flex-col items-end pt-2 space-y-3">
                {step1Error && (
                  <div className="w-full p-4 rounded-2xl bg-rose-950/60 border border-rose-800 text-xs text-rose-200 flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
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
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#F1EBDD] hover:bg-white text-[#173C32] text-xs font-semibold rounded-full shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>Continue to Preferences</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Scheduling & Delivery Preferences */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#9CAF91] mb-2">
                  Session Delivery Preference
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSessionPreference("ONLINE_VIDEO")}
                    className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      sessionPreference === "ONLINE_VIDEO"
                        ? "bg-[#F1EBDD] border-[#F1EBDD] text-[#173C32] shadow-sm font-semibold"
                        : "border-white/10 hover:border-[#C9D2BC]/30 text-[#C9D2BC] bg-white/5"
                    }`}
                  >
                    <Video className={`w-4 h-4 shrink-0 mt-0.5 ${sessionPreference === "ONLINE_VIDEO" ? "text-[#173C32]" : "text-[#9CAF91]"}`} />
                    <div>
                      <div className="text-xs font-bold">Online Video Consultation</div>
                      <div className="text-[11px] opacity-80 mt-0.5">Secure, confidential video from the comfort of your home</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSessionPreference("IN_PERSON")}
                    className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      sessionPreference === "IN_PERSON"
                        ? "bg-[#F1EBDD] border-[#F1EBDD] text-[#173C32] shadow-sm font-semibold"
                        : "border-white/10 hover:border-[#C9D2BC]/30 text-[#C9D2BC] bg-white/5"
                    }`}
                  >
                    <MapPin className={`w-4 h-4 shrink-0 mt-0.5 ${sessionPreference === "IN_PERSON" ? "text-[#173C32]" : "text-[#9CAF91]"}`} />
                    <div>
                      <div className="text-xs font-bold">In-Person Session</div>
                      <div className="text-[11px] opacity-80 mt-0.5">Clinic appointment based on practitioner location</div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#9CAF91] mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
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
                        className={`p-3 text-center rounded-xl border text-xs transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#F1EBDD] border-[#F1EBDD] text-[#173C32] font-bold"
                            : "border-white/10 hover:border-[#C9D2BC]/30 text-[#C9D2BC] bg-white/5"
                        }`}
                      >
                        {day.charAt(0) + day.slice(1).toLowerCase()}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#9CAF91] mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
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
                            ? "bg-[#F1EBDD] border-[#F1EBDD] text-[#173C32] font-semibold shadow-sm"
                            : "border-white/10 hover:border-[#C9D2BC]/30 text-[#C9D2BC] bg-white/5"
                        }`}
                      >
                        <div className="text-xs font-bold">{t.label}</div>
                        <div className="text-[11px] opacity-80 mt-0.5">{t.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 border border-white/20 hover:bg-white/5 text-[#C9D2BC] text-xs font-semibold rounded-full transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-7 py-3 bg-[#F1EBDD] hover:bg-white text-[#173C32] text-xs font-semibold rounded-full shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span>Continue to Contact</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Client Details */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#9CAF91] mb-1.5">
                    Your Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full text-xs sm:text-sm px-4 py-3 rounded-xl border border-white/15 bg-[#122C25] text-[#F7F3E9] placeholder-[#9CAF91]/60 focus:outline-none focus:border-[#F1EBDD]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#9CAF91] mb-1.5">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full text-xs sm:text-sm px-4 py-3 rounded-xl border border-white/15 bg-[#122C25] text-[#F7F3E9] placeholder-[#9CAF91]/60 focus:outline-none focus:border-[#F1EBDD]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#9CAF91] mb-1.5">
                    Age Group
                  </label>
                  <select
                    value={ageBand}
                    onChange={(e) => setAgeBand(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3 py-3 rounded-xl border border-white/15 bg-[#122C25] text-[#F7F3E9] focus:outline-none focus:border-[#F1EBDD]"
                  >
                    <option value="18_24">18 – 24 years</option>
                    <option value="25_34">25 – 34 years</option>
                    <option value="35_44">35 – 44 years</option>
                    <option value="45_54">45 – 54 years</option>
                    <option value="55_PLUS">55+ years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#9CAF91] mb-1.5">
                    Contact Preference
                  </label>
                  <select
                    value={contactPreference}
                    onChange={(e) => setContactPreference(e.target.value as any)}
                    className="w-full text-xs sm:text-sm px-3 py-3 rounded-xl border border-white/15 bg-[#122C25] text-[#F7F3E9] focus:outline-none focus:border-[#F1EBDD]"
                  >
                    <option value="EMAIL">Email</option>
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="PHONE">Phone Call</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#9CAF91] mb-1.5">
                    Preferred Language
                  </label>
                  <input
                    type="text"
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    placeholder="e.g. English, Hindi"
                    className="w-full text-xs sm:text-sm px-4 py-3 rounded-xl border border-white/15 bg-[#122C25] text-[#F7F3E9] focus:outline-none focus:border-[#F1EBDD]"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 border border-white/20 hover:bg-white/5 text-[#C9D2BC] text-xs font-semibold rounded-full transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3.5 bg-[#F1EBDD] hover:bg-white text-[#173C32] text-xs font-semibold rounded-full shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete & Request Care</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
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
