"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Check, Globe, RotateCcw, Save, Eye, Palette, History, AlertCircle } from "lucide-react";
import { PortfolioContent } from "@/modules/portfolio/providers/ai-provider.interface";
import { PORTFOLIO_TEMPLATES } from "@/modules/portfolio/services/portfolio.service";

interface VersionItem {
  id: string;
  versionNum: number;
  styleName: string;
  changeNotes: string | null;
  createdAt: string;
}

interface PortfolioStudioProps {
  portfolioId: string;
  isPublished: boolean;
  publishedVersionId: string | null;
  initialContent: PortfolioContent | null;
  initialStyle: string;
  initialVersionNum: number | null;
  versionsHistory: VersionItem[];
  hasAiEntitlement: boolean;
  slug: string;
}

export function PortfolioStudio({
  isPublished,
  initialContent,
  initialStyle,
  initialVersionNum,
  versionsHistory,
  hasAiEntitlement,
  slug,
}: PortfolioStudioProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"editor" | "preview" | "history">("editor");

  const defaultContent: PortfolioContent = initialContent || {
    headline: "Licensed Clinical Psychologist & Psychotherapist",
    introduction: "Dedicated to providing compassionate, evidence-based psychological care to foster resilience.",
    about: "Clinical psychologist specializing in integrative psychotherapy, cognitive behavioral therapies, and mental wellness.",
    expertise: ["Anxiety", "Depression", "Life Transitions", "Stress Management"],
    whoTheyHelp: ["Adults facing burnout", "Individuals navigating grief and transitions"],
    experienceSummary: "Extensive experience across clinical hospital and outpatient private practice settings.",
    qualificationsSummary: [
      { degree: "Master of Science in Clinical Psychology", institution: "University", year: 2018 },
    ],
    languages: ["English"],
    counselingApproach: "Grounded in Cognitive Behavioral Therapy (CBT) and mindfulness-based interventions.",
    ctaText: "Book an Intake Consultation",
    sectionOrder: ["hero", "about", "expertise", "who_they_help", "approach", "qualifications", "services", "contact"],
  };

  const [content, setContent] = useState<PortfolioContent>(defaultContent);
  const [selectedStyle, setSelectedStyle] = useState<string>(initialStyle || "modern");
  const [currentVersionNum, setCurrentVersionNum] = useState<number | null>(initialVersionNum);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; error?: boolean } | null>(null);

  // AI Prompt Modal State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiBio, setAiBio] = useState("");
  const [aiTone, setAiTone] = useState("warm");

  async function handleGenerateAi() {
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
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-white rounded-3xl border border-serene-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold ${
              isPublished
                ? "bg-green-100 text-green-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {isPublished ? "Live Published" : "Draft Only"}
          </span>
          {currentVersionNum && (
            <span className="text-xs font-mono text-serene-500 bg-serene-100 px-2 py-0.5 rounded-lg">
              v{currentVersionNum}
            </span>
          )}
          <a
            href={`/psychologists/${slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-brand-700 hover:text-brand-900 font-semibold ml-2"
          >
            <Globe className="w-3.5 h-3.5" />
            View Public Page
          </a>
        </div>

        <div className="flex items-center gap-2">
          {hasAiEntitlement ? (
            <button
              onClick={() => setShowAiModal(true)}
              className="bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generate with AI
            </button>
          ) : (
            <a
              href="/app/psychologist/subscription"
              className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Unlock AI Builder (Pro)
            </a>
          )}

          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="bg-serene-100 hover:bg-serene-200 text-serene-800 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? "Saving..." : "Save Draft"}
          </button>

          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            {isPublishing ? "Publishing..." : "Publish Live"}
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2 ${
            feedback.error ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-green-50 text-green-700 border border-green-200"
          }`}
        >
          {feedback.error ? <AlertCircle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
          {feedback.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-serene-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab("editor")}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
            activeTab === "editor"
              ? "bg-white text-serene-900 shadow-sm border border-serene-200"
              : "text-serene-500 hover:text-serene-900"
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          Structured Content & Theme
        </button>

        <button
          onClick={() => setActiveTab("preview")}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
            activeTab === "preview"
              ? "bg-white text-serene-900 shadow-sm border border-serene-200"
              : "text-serene-500 hover:text-serene-900"
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          Live Template Preview
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
            activeTab === "history"
              ? "bg-white text-serene-900 shadow-sm border border-serene-200"
              : "text-serene-500 hover:text-serene-900"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          Version History ({versionsHistory.length})
        </button>
      </div>

      {/* Tab: Editor */}
      {activeTab === "editor" && (
        <div className="space-y-6">
          {/* Template Style Selector */}
          <div className="bg-white rounded-3xl border border-serene-200 p-6 space-y-3">
            <h3 className="text-xs font-bold text-serene-900 uppercase tracking-wider">
              Choose Visual Template Theme
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {PORTFOLIO_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => setSelectedStyle(tmpl.id)}
                  className={`p-3 rounded-2xl text-left border transition-all ${
                    selectedStyle === tmpl.id
                      ? "border-brand-600 bg-brand-50/50 ring-2 ring-brand-500/20"
                      : "border-serene-200 hover:border-serene-300 bg-white"
                  }`}
                >
                  <div className="font-bold text-xs text-serene-900">{tmpl.name}</div>
                  <div className="text-[10px] text-serene-500 mt-1 line-clamp-2">{tmpl.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="bg-white rounded-3xl border border-serene-200 p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-serene-700 mb-1">Headline</label>
              <input
                type="text"
                value={content.headline}
                onChange={(e) => setContent({ ...content, headline: e.target.value })}
                className="w-full text-xs rounded-xl border border-serene-200 p-2.5 focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-serene-700 mb-1">Introduction</label>
              <textarea
                rows={2}
                value={content.introduction}
                onChange={(e) => setContent({ ...content, introduction: e.target.value })}
                className="w-full text-xs rounded-xl border border-serene-200 p-2.5 focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-serene-700 mb-1">About & Clinical Bio</label>
              <textarea
                rows={4}
                value={content.about}
                onChange={(e) => setContent({ ...content, about: e.target.value })}
                className="w-full text-xs rounded-xl border border-serene-200 p-2.5 focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-serene-700 mb-1">
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
                className="w-full text-xs rounded-xl border border-serene-200 p-2.5 focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-serene-700 mb-1">
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
                className="w-full text-xs rounded-xl border border-serene-200 p-2.5 focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-serene-700 mb-1">Counseling Approach & Modalities</label>
              <textarea
                rows={3}
                value={content.counselingApproach}
                onChange={(e) => setContent({ ...content, counselingApproach: e.target.value })}
                className="w-full text-xs rounded-xl border border-serene-200 p-2.5 focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-serene-700 mb-1">Experience Summary</label>
              <textarea
                rows={2}
                value={content.experienceSummary}
                onChange={(e) => setContent({ ...content, experienceSummary: e.target.value })}
                className="w-full text-xs rounded-xl border border-serene-200 p-2.5 focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-serene-700 mb-1">Call to Action Button Text</label>
              <input
                type="text"
                value={content.ctaText}
                onChange={(e) => setContent({ ...content, ctaText: e.target.value })}
                className="w-full text-xs rounded-xl border border-serene-200 p-2.5 focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab: Preview */}
      {activeTab === "preview" && (
        <div className="bg-white rounded-3xl border border-serene-200 p-8 shadow-sm space-y-8">
          <div className="border-b border-serene-100 pb-4 flex items-center justify-between">
            <div className="text-xs text-serene-400">
              Visual Preview Theme: <span className="font-bold text-brand-700 uppercase">{selectedStyle}</span>
            </div>
          </div>

          {/* Hero */}
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Clinical Focus</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-serene-900 leading-tight">
              {content.headline}
            </h1>
            <p className="text-sm text-serene-600 leading-relaxed max-w-3xl">
              {content.introduction}
            </p>
            <button className="py-2.5 px-6 bg-brand-600 text-white text-xs font-bold rounded-xl shadow-sm">
              {content.ctaText}
            </button>
          </div>

          {/* About */}
          <div className="border-t border-serene-100 pt-6 space-y-2">
            <h2 className="text-base font-bold text-serene-900">About My Practice</h2>
            <p className="text-xs text-serene-600 leading-relaxed">{content.about}</p>
          </div>

          {/* Expertise */}
          <div className="border-t border-serene-100 pt-6 space-y-3">
            <h2 className="text-base font-bold text-serene-900">Areas of Clinical Expertise</h2>
            <div className="flex flex-wrap gap-2">
              {content.expertise.map((exp, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-brand-50 text-brand-700 border border-brand-100 rounded-full text-xs font-medium"
                >
                  {exp}
                </span>
              ))}
            </div>
          </div>

          {/* Who I Help */}
          <div className="border-t border-serene-100 pt-6 space-y-3">
            <h2 className="text-base font-bold text-serene-900">Who I Help</h2>
            <ul className="space-y-1.5 text-xs text-serene-600">
              {content.whoTheyHelp.map((w, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-green-600 shrink-0" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Approach */}
          <div className="border-t border-serene-100 pt-6 space-y-2">
            <h2 className="text-base font-bold text-serene-900">Therapeutic Philosophy & Approach</h2>
            <p className="text-xs text-serene-600 leading-relaxed">{content.counselingApproach}</p>
          </div>
        </div>
      )}

      {/* Tab: History */}
      {activeTab === "history" && (
        <div className="bg-white rounded-3xl border border-serene-200 p-6 space-y-4">
          <h3 className="text-sm font-bold text-serene-900">Version History & Rollback</h3>
          {versionsHistory.length === 0 ? (
            <p className="text-xs text-serene-400 py-6 text-center">No previous versions saved yet.</p>
          ) : (
            <div className="divide-y divide-serene-100">
              {versionsHistory.map((ver) => (
                <div key={ver.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-serene-900">
                        Version {ver.versionNum}
                      </span>
                      <span className="text-[10px] bg-serene-100 px-2 py-0.5 rounded text-serene-600 font-semibold">
                        {ver.styleName}
                      </span>
                    </div>
                    <p className="text-[11px] text-serene-500 mt-0.5">
                      {ver.changeNotes || "Update"} • {new Date(ver.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() => handleRollback(ver.versionNum)}
                    className="text-xs text-brand-700 hover:text-brand-900 font-semibold flex items-center gap-1 px-3 py-1.5 rounded-lg border border-brand-200 hover:bg-brand-50 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restore
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI Prompt Modal */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-serene-200 max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-600" />
              <h3 className="text-base font-bold text-serene-900">AI Portfolio Studio Assistant</h3>
            </div>
            <p className="text-xs text-serene-500">
              Enter your clinical focus, resume notes, or paste your raw bio. The AI will formulate an empathetic, client-facing professional portfolio.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-serene-700 mb-1">
                  Raw Bio, Clinical Notes, or CV Excerpt
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g. Specialized in CBT and mindfulness for acute anxiety and tech burnout over the past 8 years..."
                  value={aiBio}
                  onChange={(e) => setAiBio(e.target.value)}
                  className="w-full text-xs rounded-xl border border-serene-200 p-2.5 focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-serene-700 mb-1">
                  Preferred Tone
                </label>
                <select
                  value={aiTone}
                  onChange={(e) => setAiTone(e.target.value)}
                  className="w-full text-xs rounded-xl border border-serene-200 p-2.5 focus:ring-2 focus:ring-brand-500"
                >
                  <option value="warm">Warm & Compassionate</option>
                  <option value="authoritative">Clinical & Academic Authority</option>
                  <option value="modern">Direct & Action-Oriented</option>
                  <option value="mindful">Reflective & Mindfulness Centered</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-serene-100">
              <button
                onClick={() => setShowAiModal(false)}
                className="text-xs text-serene-600 px-4 py-2 hover:bg-serene-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateAi}
                disabled={isGenerating}
                className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isGenerating ? "Synthesizing with AI..." : "Generate Portfolio"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
