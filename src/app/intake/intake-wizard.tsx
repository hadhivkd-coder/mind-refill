"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  HeartHandshake,
  AlertTriangle,
  Calendar,
  Clock,
  Video,
  MapPin,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  PhoneCall,
  Loader2,
} from "lucide-react";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export function IntakeWizard({ initialPsychologistSlug }: { initialPsychologistSlug?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetSlug = initialPsychologistSlug || searchParams.get("psychologist") || "";

  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
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
        if (data.success && data.data) {
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
      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/login?redirect=/intake${targetSlug ? `?psychologist=${targetSlug}` : ""}`);
          return;
        }
        throw new Error(data.error?.message || "Failed to submit request");
      }

      setSubmittedResult(data.data);
      setStep(4);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 4 && submittedResult) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-3xl border border-serene-200 p-8 sm:p-10 shadow-sm text-center">
        <div className="h-16 w-16 bg-brand-50 text-brand-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-serene-900">Request Received</h2>
        <p className="text-sm text-serene-600 mt-2 leading-relaxed">
          Thank you for trusting us with your journey. Your counseling request has been securely
          submitted to our Care Coordination team.
        </p>

        {submittedResult.isEscalated && (
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              Immediate Crisis Support Available
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              If you are in immediate danger or distress, please call emergency services (112) or reach out to:
              <br />
              <strong>• Vandrevala Foundation Helpline:</strong> +91 9999 666 555 (24x7)
              <br />
              <strong>• Kiran Mental Health Helpline:</strong> 1800-599-0019 (24x7)
              <br />
              <strong>• AASRA:</strong> +91 98204 66726 (24x7)
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/app/client/requests"
            className="px-6 py-2.5 bg-brand-700 hover:bg-brand-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
          >
            Track in Client Portal &rarr;
          </Link>
          <Link
            href="/psychologists"
            className="px-6 py-2.5 border border-serene-200 hover:bg-serene-50 text-serene-700 text-xs font-semibold rounded-xl transition-colors"
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
      <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold">Urgent Support Notice:</span> This intake form is not intended for acute medical emergencies. If you are experiencing suicidal thoughts or in crisis, please call{" "}
          <strong className="underline">1800-599-0019</strong> (Kiran 24/7) or <strong>112</strong> immediately.
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-serene-200 p-6 sm:p-10 shadow-sm">
        {/* Header */}
        <div className="mb-8 border-b border-serene-100 pb-6">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-700 uppercase tracking-wider mb-1">
            <HeartHandshake className="w-4 h-4" />
            {targetPsychologist ? "Direct Counseling Request" : "Guided Matching Intake"}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-serene-900 tracking-tight">
            {targetPsychologist
              ? `Consultation with ${targetPsychologist.fullName}`
              : "Help Me Find The Right Psychologist"}
          </h1>
          <p className="text-xs text-serene-500 mt-1.5 leading-relaxed">
            {targetPsychologist
              ? `You are requesting a session with ${targetPsychologist.fullName}, ${targetPsychologist.professionalTitle}. Complete these brief details to coordinate availability.`
              : "Share what you are going through. A human care coordinator will carefully match you with an experienced, verified professional tailored to your needs."}
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step === s
                    ? "bg-brand-700 text-white"
                    : step > s
                    ? "bg-brand-100 text-brand-800"
                    : "bg-serene-100 text-serene-400"
                }`}
              >
                {s}
              </div>
              <span className="text-xs font-medium text-serene-600 hidden sm:inline">
                {s === 1 ? "Your Focus" : s === 2 ? "Preferences" : "Contact"}
              </span>
              {s < 3 && <div className="w-8 sm:w-16 h-0.5 bg-serene-100 ml-2" />}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: Areas of Concern */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-serene-700 mb-2">
                  What areas would you like support with? <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-serene-500 mb-3">Select all topics that resonate with your current challenges.</p>

                {loadingCategories ? (
                  <div className="flex items-center gap-2 text-xs text-serene-400 py-4">
                    <Loader2 className="w-4 h-4 animate-spin" /> Loading categories...
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {categories.map((cat) => {
                      const isSelected = selectedCategories.includes(cat.name);
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => toggleCategory(cat.name)}
                          className={`p-3 text-left rounded-xl border text-xs font-medium transition-all ${
                            isSelected
                              ? "bg-brand-50 border-brand-500 text-brand-900 shadow-sm"
                              : "border-serene-200 hover:border-brand-300 text-serene-700 bg-white"
                          }`}
                        >
                          {cat.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-serene-700 mb-2">
                  Tell us in your own words what you&apos;re experiencing <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-serene-500 mb-2">
                  A brief summary of what you are going through (min 10 characters). This helps your coordinator understand your needs.
                </p>
                <textarea
                  rows={4}
                  value={rawConcernSummary}
                  onChange={(e) => setRawConcernSummary(e.target.value)}
                  placeholder="For example: I have been feeling overwhelmed by workplace stress and persistent anxiety over the last three months, affecting my sleep and relationships..."
                  className="w-full text-xs p-3.5 rounded-xl border border-serene-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-serene-900 placeholder:text-serene-400"
                  required
                />
              </div>

              {/* Safety self-report check */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasCrisisConcerns}
                    onChange={(e) => setHasCrisisConcerns(e.target.checked)}
                    className="mt-0.5 rounded text-brand-700 focus:ring-brand-500"
                  />
                  <span className="text-xs text-serene-600 leading-snug">
                    I am in significant emotional distress or having thoughts of self-harm, and require prioritized outreach.
                  </span>
                </label>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  disabled={selectedCategories.length === 0 || rawConcernSummary.trim().length < 10}
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
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
                <label className="block text-xs font-bold uppercase tracking-wider text-serene-700 mb-2">
                  Session Delivery Preference
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSessionPreference("ONLINE_VIDEO")}
                    className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                      sessionPreference === "ONLINE_VIDEO"
                        ? "bg-brand-50 border-brand-500 text-brand-900 shadow-sm"
                        : "border-serene-200 hover:border-brand-300 text-serene-700 bg-white"
                    }`}
                  >
                    <Video className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold">Online Video Consultation</div>
                      <div className="text-[11px] text-serene-500 mt-0.5">Secure, confidential video from anywhere</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSessionPreference("IN_PERSON")}
                    className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                      sessionPreference === "IN_PERSON"
                        ? "bg-brand-50 border-brand-500 text-brand-900 shadow-sm"
                        : "border-serene-200 hover:border-brand-300 text-serene-700 bg-white"
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold">In-Person Session</div>
                      <div className="text-[11px] text-serene-500 mt-0.5">Clinic visit based on psychologist location</div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-serene-700 mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-serene-400" />
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
                        className={`p-2.5 text-center rounded-xl border text-xs font-medium transition-all ${
                          isSelected
                            ? "bg-brand-50 border-brand-500 text-brand-900 font-bold"
                            : "border-serene-200 hover:border-brand-300 text-serene-600 bg-white"
                        }`}
                      >
                        {day.charAt(0) + day.slice(1).toLowerCase()}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-serene-700 mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-serene-400" />
                  Preferred Time Windows
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
                        className={`p-3 text-left rounded-xl border transition-all ${
                          isSelected
                            ? "bg-brand-50 border-brand-500 text-brand-900"
                            : "border-serene-200 hover:border-brand-300 text-serene-700 bg-white"
                        }`}
                      >
                        <div className="text-xs font-bold">{t.label}</div>
                        <div className="text-[11px] text-serene-500">{t.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 border border-serene-200 hover:bg-serene-50 text-serene-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 bg-brand-700 hover:bg-brand-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-serene-700 mb-1.5">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your name"
                    required
                    className="w-full text-xs p-3 rounded-xl border border-serene-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-serene-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-serene-700 mb-1.5">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full text-xs p-3 rounded-xl border border-serene-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-serene-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-serene-700 mb-1.5">
                    Age Group
                  </label>
                  <select
                    value={ageBand}
                    onChange={(e) => setAgeBand(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-serene-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-serene-900"
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-serene-700 mb-1.5">
                    Preferred Language
                  </label>
                  <input
                    type="text"
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    placeholder="English, Hindi, etc."
                    className="w-full text-xs p-3 rounded-xl border border-serene-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-serene-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-serene-700 mb-1.5">
                    Preferred Contact
                  </label>
                  <select
                    value={contactPreference}
                    onChange={(e) => setContactPreference(e.target.value as any)}
                    className="w-full text-xs p-3 rounded-xl border border-serene-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-serene-900"
                  >
                    <option value="EMAIL">Email</option>
                    <option value="PHONE">Phone Call</option>
                    <option value="WHATSAPP">WhatsApp</option>
                  </select>
                </div>
              </div>

              <div className="bg-serene-50 rounded-2xl p-4 border border-serene-200 text-xs text-serene-600 leading-relaxed">
                <div className="font-semibold text-serene-800 mb-1 flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-brand-600" />
                  What happens after submission?
                </div>
                Your dedicated care coordinator will review your intake details, coordinate scheduling availability with the psychologist, and reach out via your preferred contact channel to confirm your appointment.
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 border border-serene-200 hover:bg-serene-50 text-serene-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="submit"
                  disabled={submitting || !fullName.trim()}
                  className="px-7 py-2.5 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Submitting Request...
                    </>
                  ) : (
                    "Submit Counseling Request"
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
