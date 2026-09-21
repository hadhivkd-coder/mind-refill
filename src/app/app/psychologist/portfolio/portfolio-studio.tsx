"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Save,
  Check,
  RotateCcw,
  Palette,
  Eye,
  History,
  AlertCircle,
  Globe,
  ArrowRight,
  X,
} from "lucide-react";

const DEFAULT_CONTENT = {
  headline: "Licensed Clinical Psychologist & Somatic CBT Specialist",
  introduction: "Helping individuals navigate chronic stress, anxiety, and burnout using evidence-based cognitive and somatic approaches.",
  about: "Over 12 years of experience providing compassionate, evidence-based psychological care. Dedicated to creating an emotionally secure, non-judgmental space where clients can explore patterns without shame.",
  expertise: ["Anxiety & Panic", "Burnout & Perfectionism", "Trauma Recovery", "Sleep & Somatics"],
  whoTheyHelp: [
    "Adults dealing with chronic anxiety and racing thoughts",
    "High-achieving professionals facing workplace burnout",
    "Individuals navigating major life transitions and grief",
  ],
  counselingApproach: "Collaborative, relational CBT integrated with somatic regulation to ground the nervous system.",
  experienceSummary: "Extensive experience across hospital outpatient clinics and international private tele-psychology practice.",
  ctaText: "Book an Intake Consultation",
};

export interface PortfolioStudioProps {
  slug: string;
  portfolioId?: string;
  hasAiEntitlement: boolean;
  isPublished?: boolean;
  publishedVersionId?: string | null;
  initialContent?: any;
  initialStyle?: string;
  activeStyle?: string;
  initialVersionNum?: number | null;
  initialPublishedContent?: Record<string, unknown> | null;
  versionsHistory: Array<{
    id: string;
    versionNum: number;
    styleName: string;
    changeNotes: string | null;
    isPublished: boolean;
    createdAt: string;
  }>;
}

const PORTFOLIO_TEMPLATES = [
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Quiet typography, serene spacing, focused clinical clarity.",
  },
  {
    id: "warm",
    name: "Warm & Relatable",
    description: "Approachable earth tones, gentle cards, welcoming atmosphere.",
  },
  {
    id: "modern",
    name: "Modern Contemporary",
    description: "Crisp lines, bold accents, structured modular grid.",
  },
  {
    id: "editorial",
    name: "Refined & Editorial",
    description: "Sophisticated serif accents, balanced spacing, premium aesthetic.",
  },
  {
    id: "clinical",
    name: "Clinical Authority",
    description: "Structured clinical hierarchy highlighting qualifications and methods.",
  },
];

export function PortfolioStudio({
  slug,
  portfolioId,
  hasAiEntitlement,
  isPublished: propIsPublished,
  publishedVersionId,
  initialContent,
  initialStyle,
  activeStyle,
  initialVersionNum,
  initialPublishedContent,
  versionsHistory,
}: PortfolioStudioProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"editor" | "preview" | "history">("editor");
  const [selectedStyle, setSelectedStyle] = useState(initialStyle || activeStyle || "modern");
  const [content, setContent] = useState(initialContent || DEFAULT_CONTENT);
  const [isPublished] = useState(Boolean(initialPublishedContent || propIsPublished));
  const [currentVersionNum, setCurrentVersionNum] = useState<number | null>(
    initialVersionNum || versionsHistory[0]?.versionNum || 1
  );

  // Loading & Feedback states
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; error?: boolean } | null>(null);

  // AI Modal
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiBio, setAiBio] = useState("");
  const [aiTone, setAiTone] = useState("warm");

  async function handleGenerateAi() {
    if (!aiBio.trim()) return;
    setIsGenerating(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/psychologist/portfolio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawBio: aiBio,
          preferredTone: aiTone,
          styleName: selectedStyle,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "AI Generation failed");

      setContent(data.data.content);
      setCurrentVersionNum(data.data.versionNum);
      setSelectedStyle(data.data.styleName);
      setShowAiModal(false);
      setFeedback({ text: `Version ${data.data.versionNum} generated successfully!` });
      router.refresh();
    } catch (err: unknown) {
      setFeedback({
        text: err instanceof Error ? err.message : "Error generating portfolio",
        error: true,
      });
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSaveDraft() {
    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/psychologist/portfolio/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          styleName: selectedStyle,
          changeNotes: "Manual editor revision",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to save draft");

      setCurrentVersionNum(data.data.versionNum);
      setFeedback({ text: `Version ${data.data.versionNum} saved as draft!` });
      router.refresh();
    } catch (err: unknown) {
      setFeedback({
        text: err instanceof Error ? err.message : "Error saving draft",
        error: true,
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePublish() {
    if (!currentVersionNum) {
      setFeedback({ text: "Please save a draft version before publishing.", error: true });
      return;
    }

    setIsPublishing(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/psychologist/portfolio/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ versionNum: currentVersionNum }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to publish");

      setFeedback({ text: `Version ${currentVersionNum} is now published live on your public profile!` });
      router.refresh();
    } catch (err: unknown) {
      setFeedback({
        text: err instanceof Error ? err.message : "Error publishing portfolio",
        error: true,
      });
    } finally {
      setIsPublishing(false);
    }
  }

  async function handleRollback(targetVer: number) {
    if (!confirm(`Restore Version ${targetVer} as a new draft?`)) return;
    setFeedback(null);
    try {
      const res = await fetch("/api/psychologist/portfolio/rollback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetVersionNum: targetVer }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed to rollback");

      setContent(data.data.content);
      setSelectedStyle(data.data.styleName);
      setCurrentVersionNum(data.data.versionNum);
      setFeedback({ text: `Rolled back to Version ${targetVer} (created new Version ${data.data.versionNum})` });
      setActiveTab("editor");
      router.refresh();
    } catch (err: unknown) {
      setFeedback({
        text: err instanceof Error ? err.message : "Error rolling back",
        error: true,
      });
    }
  }

  return (
    <div className="space-y-6 text-[#F7F3E9]">
      {/* Top Action Bar */}
      <div className="atmospheric-card rounded-3xl border border-white/10 p-5 shadow-xl flex flex-wrap items-center justify-between gap-4 bg-[#122C25]/85 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isPublished
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
            }`}
          >
            {isPublished ? "Live Published" : "Draft Only"}
          </span>
          {currentVersionNum && (
            <span className="text-xs font-mono text-[#9CAF91] bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
              v{currentVersionNum}
            </span>
          )}
          <a
            href={`/psychologists/${slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#9CAF91] hover:text-[#F1EBDD] font-medium ml-1 transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>View Public Profile</span>
          </a>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {hasAiEntitlement ? (
            <button
              onClick={() => setShowAiModal(true)}
              className="bg-[#244F42] hover:bg-[#3F6855] text-[#F1EBDD] border border-white/15 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#F1EBDD]" />
              <span>Generate with AI</span>
            </button>
          ) : (
            <a
              href="/app/psychologist/subscription"
              className="bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 border border-amber-500/30 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Unlock AI Builder (Pro)</span>
            </a>
          )}

          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="bg-white/10 hover:bg-white/15 text-[#F7F3E9] border border-white/15 px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Saving..." : "Save Draft"}</span>
          </button>

          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="bg-[#F1EBDD] hover:bg-white text-[#173C32] px-5 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isPublishing ? "Publishing..." : "Publish Live"}</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2 ${
            feedback.error
              ? "bg-rose-500/20 text-rose-200 border border-rose-500/30"
              : "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30"
          }`}
        >
          {feedback.error ? <AlertCircle className="w-4 h-4 shrink-0 text-rose-300" /> : <Check className="w-4 h-4 shrink-0 text-emerald-300" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("editor")}
          className={`px-4 py-2 rounded-full transition-all flex items-center gap-1.5 ${
            activeTab === "editor"
              ? "bg-[#F1EBDD] text-[#173C32] font-semibold shadow-sm"
              : "text-[#C9D2BC] hover:text-white bg-white/5 border border-white/10"
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Structured Content & Theme</span>
        </button>

        <button
          onClick={() => setActiveTab("preview")}
          className={`px-4 py-2 rounded-full transition-all flex items-center gap-1.5 ${
            activeTab === "preview"
              ? "bg-[#F1EBDD] text-[#173C32] font-semibold shadow-sm"
              : "text-[#C9D2BC] hover:text-white bg-white/5 border border-white/10"
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Live Template Preview</span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 rounded-full transition-all flex items-center gap-1.5 ${
            activeTab === "history"
              ? "bg-[#F1EBDD] text-[#173C32] font-semibold shadow-sm"
              : "text-[#C9D2BC] hover:text-white bg-white/5 border border-white/10"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Version History ({versionsHistory.length})</span>
        </button>
      </div>

      {/* Tab: Editor */}
      {activeTab === "editor" && (
        <div className="space-y-6">
          {/* Template Style Selector */}
          <div className="atmospheric-card rounded-3xl border border-white/10 p-6 sm:p-8 space-y-4 bg-[#122C25]/80">
            <h3 className="text-xs font-semibold text-[#9CAF91] uppercase tracking-wider">
              Choose Visual Template Theme
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {PORTFOLIO_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => setSelectedStyle(tmpl.id)}
                  className={`p-4 rounded-2xl text-left border transition-all ${
                    selectedStyle === tmpl.id
                      ? "border-[#F1EBDD] bg-[#244F42] text-[#F1EBDD] ring-2 ring-[#F1EBDD]/30"
                      : "border-white/10 hover:border-white/20 bg-white/5 text-[#C9D2BC]"
                  }`}
                >
                  <div className="font-serif font-medium text-sm text-[#F7F3E9]">{tmpl.name}</div>
                  <div className="text-[11px] text-[#C9D2BC] font-light mt-1 line-clamp-2">
                    {tmpl.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields - High Contrast Dark Inputs */}
          <div className="atmospheric-card rounded-3xl border border-white/10 p-6 sm:p-8 space-y-5 bg-[#122C25]/80">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9CAF91] mb-1.5">
                Headline / Clinical Title
              </label>
              <input
                type="text"
                value={content.headline}
                onChange={(e) => setContent({ ...content, headline: e.target.value })}
                placeholder="e.g. Licensed Clinical Psychologist & Somatic CBT Specialist"
                className="w-full text-sm rounded-xl bg-[#173C32]/90 border border-white/20 text-[#F7F3E9] placeholder-[#9CAF91]/60 p-3 focus:outline-none focus:border-[#F1EBDD] focus:ring-1 focus:ring-[#F1EBDD] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9CAF91] mb-1.5">
                Introduction
              </label>
              <textarea
                rows={2}
                value={content.introduction}
                onChange={(e) => setContent({ ...content, introduction: e.target.value })}
                placeholder="Brief, empathetic summary of how you help individuals find emotional grounding..."
                className="w-full text-sm rounded-xl bg-[#173C32]/90 border border-white/20 text-[#F7F3E9] placeholder-[#9CAF91]/60 p-3 focus:outline-none focus:border-[#F1EBDD] focus:ring-1 focus:ring-[#F1EBDD] transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9CAF91] mb-1.5">
                About & Clinical Bio
              </label>
              <textarea
                rows={4}
                value={content.about}
                onChange={(e) => setContent({ ...content, about: e.target.value })}
                placeholder="Clinical background, modalities, experience, and therapeutic philosophy..."
                className="w-full text-sm rounded-xl bg-[#173C32]/90 border border-white/20 text-[#F7F3E9] placeholder-[#9CAF91]/60 p-3 focus:outline-none focus:border-[#F1EBDD] focus:ring-1 focus:ring-[#F1EBDD] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9CAF91] mb-1.5">
                Areas of Clinical Expertise (comma-separated)
              </label>
              <input
                type="text"
                value={content.expertise.join(", ")}
                onChange={(e) =>
                  setContent({
                    ...content,
                    expertise: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                  })
                }
                placeholder="Anxiety & Panic, Trauma Recovery, Burnout, Sleep & Somatics"
                className="w-full text-sm rounded-xl bg-[#173C32]/90 border border-white/20 text-[#F7F3E9] placeholder-[#9CAF91]/60 p-3 focus:outline-none focus:border-[#F1EBDD] focus:ring-1 focus:ring-[#F1EBDD] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9CAF91] mb-1.5">
                Who I Help / Client Profiles (one per line)
              </label>
              <textarea
                rows={3}
                value={content.whoTheyHelp.join("\n")}
                onChange={(e) =>
                  setContent({
                    ...content,
                    whoTheyHelp: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
                  })
                }
                placeholder="Adults dealing with chronic anxiety and racing thoughts&#10;High-achieving professionals facing burnout&#10;Individuals navigating major life transitions"
                className="w-full text-sm rounded-xl bg-[#173C32]/90 border border-white/20 text-[#F7F3E9] placeholder-[#9CAF91]/60 p-3 focus:outline-none focus:border-[#F1EBDD] focus:ring-1 focus:ring-[#F1EBDD] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9CAF91] mb-1.5">
                Counseling Approach & Modalities
              </label>
              <textarea
                rows={3}
                value={content.counselingApproach}
                onChange={(e) => setContent({ ...content, counselingApproach: e.target.value })}
                placeholder="I integrate cognitive behavioral techniques with somatic grounding to restore emotional safety..."
                className="w-full text-sm rounded-xl bg-[#173C32]/90 border border-white/20 text-[#F7F3E9] placeholder-[#9CAF91]/60 p-3 focus:outline-none focus:border-[#F1EBDD] focus:ring-1 focus:ring-[#F1EBDD] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9CAF91] mb-1.5">
                Experience Summary
              </label>
              <textarea
                rows={2}
                value={content.experienceSummary}
                onChange={(e) => setContent({ ...content, experienceSummary: e.target.value })}
                placeholder="Over 12 years of clinical practice across hospital outpatient and private tele-psychology settings..."
                className="w-full text-sm rounded-xl bg-[#173C32]/90 border border-white/20 text-[#F7F3E9] placeholder-[#9CAF91]/60 p-3 focus:outline-none focus:border-[#F1EBDD] focus:ring-1 focus:ring-[#F1EBDD] transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#9CAF91] mb-1.5">
                Call to Action Button Text
              </label>
              <input
                type="text"
                value={content.ctaText}
                onChange={(e) => setContent({ ...content, ctaText: e.target.value })}
                placeholder="Book an Intake Consultation"
                className="w-full text-sm rounded-xl bg-[#173C32]/90 border border-white/20 text-[#F7F3E9] placeholder-[#9CAF91]/60 p-3 focus:outline-none focus:border-[#F1EBDD] focus:ring-1 focus:ring-[#F1EBDD] transition-all"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab: Preview */}
      {activeTab === "preview" && (
        <div className="atmospheric-card rounded-3xl border border-white/10 p-8 sm:p-12 space-y-8 bg-[#122C25]/85 shadow-xl">
          <div className="border-b border-white/10 pb-4 flex items-center justify-between">
            <div className="text-xs text-[#9CAF91]">
              Visual Preview Theme:{" "}
              <span className="font-semibold text-[#F1EBDD] uppercase tracking-wider">
                {selectedStyle}
              </span>
            </div>
          </div>

          {/* Hero Preview */}
          <div className="space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#9CAF91]">
              Clinical Focus
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-normal text-[#F7F3E9] leading-tight">
              {content.headline || "Clinical Psychologist & Psychotherapist"}
            </h1>
            <p className="text-sm sm:text-base text-[#C9D2BC] font-light leading-relaxed max-w-3xl">
              {content.introduction || "Dedicated to providing compassionate, evidence-based psychological care."}
            </p>
            <div className="pt-2">
              <button className="py-3 px-8 bg-[#F1EBDD] hover:bg-white text-[#173C32] text-xs font-bold rounded-full shadow-md transition-all">
                {content.ctaText || "Book an Intake Consultation"}
              </button>
            </div>
          </div>

          {/* About */}
          <div className="border-t border-white/10 pt-6 space-y-2">
            <h2 className="font-serif text-xl font-medium text-[#F7F3E9]">About My Practice</h2>
            <p className="text-xs sm:text-sm text-[#C9D2BC] font-light leading-relaxed">
              {content.about}
            </p>
          </div>

          {/* Expertise */}
          <div className="border-t border-white/10 pt-6 space-y-3">
            <h2 className="font-serif text-xl font-medium text-[#F7F3E9]">Areas of Clinical Expertise</h2>
            <div className="flex flex-wrap gap-2">
              {content.expertise?.map((exp: string, i: number) => (
                <span
                  key={i}
                  className="px-3.5 py-1 bg-white/5 text-[#F1EBDD] border border-white/10 rounded-full text-xs"
                >
                  {exp}
                </span>
              ))}
            </div>
          </div>

          {/* Who I Help */}
          <div className="border-t border-white/10 pt-6 space-y-3">
            <h2 className="font-serif text-xl font-medium text-[#F7F3E9]">Who I Help</h2>
            <ul className="space-y-2 text-xs sm:text-sm text-[#C9D2BC] font-light">
              {content.whoTheyHelp?.map((w: string, i: number) => (
                <li key={i} className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#9CAF91] shrink-0" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Approach */}
          <div className="border-t border-white/10 pt-6 space-y-2">
            <h2 className="font-serif text-xl font-medium text-[#F7F3E9]">Therapeutic Philosophy & Approach</h2>
            <p className="text-xs sm:text-sm text-[#C9D2BC] font-light leading-relaxed">
              {content.counselingApproach}
            </p>
          </div>
        </div>
      )}

      {/* Tab: History */}
      {activeTab === "history" && (
        <div className="atmospheric-card rounded-3xl border border-white/10 p-6 sm:p-8 space-y-5 bg-[#122C25]/80">
          <h3 className="font-serif text-xl font-normal text-[#F7F3E9]">Version History & Rollback</h3>
          {versionsHistory.length === 0 ? (
            <p className="text-xs text-[#9CAF91] py-8 text-center font-light">No previous versions saved yet.</p>
          ) : (
            <div className="divide-y divide-white/10">
              {versionsHistory.map((ver) => (
                <div key={ver.id} className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-[#F7F3E9]">
                        Version {ver.versionNum}
                      </span>
                      <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-[#F1EBDD] font-semibold">
                        {ver.styleName}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#9CAF91] mt-1 font-light">
                      {ver.changeNotes || "Update"} • {new Date(ver.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() => handleRollback(ver.versionNum)}
                    className="text-xs text-[#F1EBDD] hover:text-white font-medium flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI Assistant Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#173C32] rounded-3xl border border-white/20 max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/5 text-[#F1EBDD]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-medium text-[#F7F3E9]">AI Portfolio Assistant</h3>
                  <p className="text-[11px] text-[#9CAF91]">Synthesize your credentials and clinical voice</p>
                </div>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="p-1 rounded-full text-[#C9D2BC] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#9CAF91] mb-1.5">
                  Raw Bio, Clinical Notes, or Resume Excerpt
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g. Specialized in CBT and somatic grounding for acute anxiety and tech burnout over the past 8 years..."
                  value={aiBio}
                  onChange={(e) => setAiBio(e.target.value)}
                  className="w-full text-sm rounded-xl bg-black/40 border border-white/20 text-[#F7F3E9] placeholder-[#9CAF91]/60 p-3 focus:outline-none focus:border-[#F1EBDD] focus:ring-1 focus:ring-[#F1EBDD]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#9CAF91] mb-1.5">
                  Preferred Tone
                </label>
                <select
                  value={aiTone}
                  onChange={(e) => setAiTone(e.target.value)}
                  className="w-full text-sm rounded-xl bg-[#122C25] border border-white/20 text-[#F7F3E9] p-3 focus:outline-none focus:border-[#F1EBDD]"
                >
                  <option value="warm">Warm & Compassionate</option>
                  <option value="authoritative">Clinical & Academic Authority</option>
                  <option value="modern">Direct & Action-Oriented</option>
                  <option value="mindful">Reflective & Mindfulness Centered</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setShowAiModal(false)}
                className="text-xs text-[#C9D2BC] hover:text-white px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateAi}
                disabled={isGenerating}
                className="bg-[#F1EBDD] hover:bg-white text-[#173C32] text-xs font-bold px-5 py-2.5 rounded-full flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isGenerating ? "Synthesizing with AI..." : "Generate Portfolio"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
