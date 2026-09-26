"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  HeartHandshake,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Check,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import Link from "next/link";

type Step = "CHOICE" | "FEELING" | "PREFERENCE" | "FINAL" | "SUCCESS";

export function IntakeWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialFocus = searchParams.get("focus");

  const [step, setStep] = useState<Step>(initialFocus ? "FEELING" : "CHOICE");
  const [selectedFeeling, setSelectedFeeling] = useState<string>(initialFocus || "");
  const [selectedPreference, setSelectedPreference] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = (nextStep: Step) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setStep(nextStep);
  };

  const submitIntake = async () => {
    setIsSubmitting(true);
    // Simulate API call to backend intake service
    setTimeout(() => {
      setIsSubmitting(false);
      setStep("SUCCESS");
    }, 1500);
  };

  return (
    <div className="w-full max-w-2xl mx-auto min-h-[60vh] flex flex-col justify-center">
      <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-[#EEEAF5]">
        
        {/* Step: CHOICE */}
        {step === "CHOICE" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-3 text-center">
              <div className="w-12 h-12 mx-auto bg-[#F7F5FA] rounded-full flex items-center justify-center text-[#62547F] mb-6">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h1 className="text-2xl md:text-3xl font-medium text-[#29272C]">
                How would you like to proceed?
              </h1>
              <p className="text-[#62547F] font-light">
                You can browse psychologists yourself, or we can guide you to the right match.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <button
                onClick={() => handleNext("FEELING")}
                className="p-6 rounded-2xl bg-[#F7F5FA] border border-[#EEEAF5] hover:border-[#A99BC7] text-left transition-all hover:-translate-y-1 group"
              >
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#62547F] mb-4 shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-medium text-[#29272C] mb-2 text-lg">Guide me</h3>
                <p className="text-sm text-[#62547F] font-light">
                  Ask me a few simple questions and suggest the best psychologists for my needs.
                </p>
              </button>

              <Link
                href="/psychologists"
                className="p-6 rounded-2xl bg-white border border-[#EEEAF5] hover:border-[#A99BC7] text-left transition-all hover:-translate-y-1 group"
              >
                <div className="w-10 h-10 rounded-full bg-[#FAF8F2] flex items-center justify-center text-[#62547F] mb-4">
                  <ArrowRight className="w-5 h-5" />
                </div>
                <h3 className="font-medium text-[#29272C] mb-2 text-lg">I know what I need</h3>
                <p className="text-sm text-[#62547F] font-light">
                  Browse our directory and filter psychologists by your own preferences.
                </p>
              </Link>
            </div>
          </div>
        )}

        {/* Step: FEELING */}
        {step === "FEELING" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <button onClick={() => handleNext("CHOICE")} className="text-[#A99BC7] hover:text-[#62547F] transition-colors flex items-center gap-1 text-sm font-medium">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-medium text-[#29272C]">
                What&apos;s been on your mind lately?
              </h2>
              <p className="text-[#62547F] font-light">
                Select the area you&apos;d most like support with. It&apos;s okay if It&apos;s more than one, just pick the most prominent.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                "Feeling overwhelmed or stressed",
                "Navigating relationship issues",
                "Experiencing anxiety or panic",
                "Feeling persistently low or depressed",
                "Dealing with a major life change",
                "Processing past trauma",
                "Exploring my identity or purpose",
                "Something else"
              ].map((feeling) => (
                <button
                  key={feeling}
                  onClick={() => setSelectedFeeling(feeling)}
                  className={`p-4 rounded-xl border text-left text-[14.5px] transition-all ${
                    selectedFeeling === feeling 
                      ? "bg-[#62547F] border-[#62547F] text-white shadow-md"
                      : "bg-[#F7F5FA] border-[#EEEAF5] text-[#29272C] hover:border-[#A99BC7]"
                  }`}
                >
                  {feeling}
                </button>
              ))}
            </div>

            <div className="pt-6 flex justify-end">
              <button
                disabled={!selectedFeeling}
                onClick={() => handleNext("PREFERENCE")}
                className="h-12 px-8 rounded-full bg-[#29272C] disabled:bg-[#EAE6F0] disabled:text-[#A99BC7] text-white font-medium flex items-center gap-2 transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step: PREFERENCE */}
        {step === "PREFERENCE" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <button onClick={() => handleNext("FEELING")} className="text-[#A99BC7] hover:text-[#62547F] transition-colors flex items-center gap-1 text-sm font-medium">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-medium text-[#29272C]">
                Do you have any preferences for your psychologist?
              </h2>
              <p className="text-[#62547F] font-light">
                This helps us narrow down the perfect match for you.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-2">
              {[
                "I prefer a practical, solution-focused approach",
                "I prefer a gentle, exploratory, deep-listening approach",
                "I need someone who understands neurodivergence",
                "I have no strong preference, just someone qualified"
              ].map((pref) => (
                <button
                  key={pref}
                  onClick={() => setSelectedPreference(pref)}
                  className={`p-4 rounded-xl border text-left text-[14.5px] transition-all ${
                    selectedPreference === pref 
                      ? "bg-[#62547F] border-[#62547F] text-white shadow-md"
                      : "bg-[#F7F5FA] border-[#EEEAF5] text-[#29272C] hover:border-[#A99BC7]"
                  }`}
                >
                  {pref}
                </button>
              ))}
            </div>

            <div className="pt-6 flex justify-end">
              <button
                disabled={!selectedPreference}
                onClick={() => handleNext("FINAL")}
                className="h-12 px-8 rounded-full bg-[#29272C] disabled:bg-[#EAE6F0] disabled:text-[#A99BC7] text-white font-medium flex items-center gap-2 transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step: FINAL */}
        {step === "FINAL" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <button onClick={() => handleNext("PREFERENCE")} className="text-[#A99BC7] hover:text-[#62547F] transition-colors flex items-center gap-1 text-sm font-medium disabled:opacity-50" disabled={isSubmitting}>
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 mx-auto bg-[#F7F5FA] rounded-full flex items-center justify-center text-[#62547F] mb-2">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-2xl md:text-3xl font-medium text-[#29272C]">
                Ready to find your match?
              </h2>
              <p className="text-[#62547F] font-light max-w-md mx-auto">
                Our care coordinators will review your preferences and securely match you with the right psychologist within 24 hours.
              </p>
            </div>

            <div className="pt-6">
              <button
                disabled={isSubmitting}
                onClick={submitIntake}
                className="w-full h-14 rounded-full bg-[#62547F] hover:bg-[#29272C] disabled:bg-[#A99BC7] text-white font-medium flex items-center justify-center gap-2 transition-all shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Securely submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Request</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <p className="text-center text-xs text-[#A99BC7] mt-4 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Strictly confidential & secure
              </p>
            </div>
          </div>
        )}

        {/* Step: SUCCESS */}
        {step === "SUCCESS" && (
          <div className="space-y-6 text-center animate-in fade-in zoom-in duration-500 py-8">
            <div className="w-20 h-20 mx-auto bg-[#AAB8A2] rounded-full flex items-center justify-center text-white mb-2 shadow-lg shadow-[#AAB8A2]/20">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>
            <h2 className="text-2xl md:text-3xl font-medium text-[#29272C]">
              We&apos;ve received your request
            </h2>
            <p className="text-[#62547F] font-light max-w-md mx-auto leading-relaxed">
              You&apos;ve taken a wonderful first step. Our team is reviewing your preferences and will email you your matches shortly.
            </p>
            
            <div className="pt-8 space-y-4">
              <Link
                href="/psychologists"
                className="w-full h-14 rounded-full bg-[#F7F5FA] border border-[#EEEAF5] hover:border-[#A99BC7] text-[#29272C] font-medium flex items-center justify-center gap-2 transition-all"
              >
                Browse Directory While You Wait
              </Link>
              <Link
                href="/"
                className="inline-block text-[14px] text-[#A99BC7] hover:text-[#62547F] font-medium transition-colors"
              >
                Return to homepage
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
