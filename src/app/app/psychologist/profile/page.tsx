"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Eye, CheckCircle2, ShieldAlert, Sparkles } from "lucide-react";

export default function PsychologistProfileDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [professionalTitle, setProfessionalTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [shortIntro, setShortIntro] = useState("");
  const [bio, setBio] = useState("");
  const [professionalApproach, setProfessionalApproach] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState(0);
  const [location, setLocation] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/psychologist/profile");
      if (!res.ok) throw new Error("Failed to load profile");
      const data = await res.json();
      setProfile(data);
      setFullName(data.fullName || "");
      setProfessionalTitle(data.professionalTitle || "");
      setSlug(data.slug || "");
      setShortIntro(data.shortIntro || "");
      setBio(data.bio || "");
      setProfessionalApproach(data.professionalApproach || "");
      setYearsOfExperience(data.yearsOfExperience || 0);
      setLocation(data.location || "");
      setIsPublic(Boolean(data.isPublic));
    } catch (err: unknown) {
      setMessage({ type: "error", text: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/psychologist/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          professionalTitle,
          slug,
          shortIntro,
          bio,
          professionalApproach,
          yearsOfExperience: Number(yearsOfExperience),
          location,
          isPublic,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save profile");

      setMessage({ type: "success", text: "Professional profile saved successfully" });
      await fetchProfile();
    } catch (err: unknown) {
      setMessage({ type: "error", text: (err as Error).message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-serene-50 p-8 flex items-center justify-center">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-serene-50 p-6 sm:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/app/psychologist"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-serene-500 hover:text-serene-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
          {profile?.verificationStatus === "VERIFIED" && profile?.isPublic && (
            <Link
              href={`/psychologists/${profile.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:underline"
            >
              <Eye className="w-3.5 h-3.5" />
              View Public Profile
            </Link>
          )}
        </div>

        {/* Header & Completion Meter */}
        <div className="bg-white rounded-3xl border border-serene-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-xs font-semibold text-brand-700 uppercase tracking-wider">
                Profile Management
              </span>
              <h1 className="text-2xl font-bold text-serene-950 mt-1">
                Your Professional Profile
              </h1>
              <p className="text-xs text-serene-500 mt-1">
                This data serves as the foundation for both the public directory and your future portfolio.
              </p>
            </div>
            <div className="bg-serene-50 border border-serene-200 rounded-2xl p-4 text-center min-w-[140px]">
              <div className="text-xs font-semibold text-serene-500 uppercase tracking-wider mb-1">
                Completion
              </div>
              <div className="text-2xl font-bold text-brand-700">
                {profile?.completionPercent ?? 0}%
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div
            role="alert"
            className={`p-4 rounded-xl text-xs font-medium border ${
              message.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Profile Editor Form */}
        <form onSubmit={handleSave} className="bg-white rounded-3xl border border-serene-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label htmlFor="fullName" className="block text-xs font-semibold text-serene-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-serene-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>

            <div>
              <label htmlFor="professionalTitle" className="block text-xs font-semibold text-serene-700 uppercase tracking-wider mb-1">
                Professional Title
              </label>
              <input
                id="professionalTitle"
                type="text"
                required
                value={professionalTitle}
                onChange={(e) => setProfessionalTitle(e.target.value)}
                placeholder="Clinical Psychologist / Neuropsychologist"
                className="w-full px-3 py-2 border border-serene-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-xs font-semibold text-serene-700 uppercase tracking-wider mb-1">
                Public URL Slug
              </label>
              <div className="flex items-center">
                <span className="text-xs text-serene-400 bg-serene-50 px-3 py-2 border border-r-0 border-serene-300 rounded-l-lg">
                  /
                </span>
                <input
                  id="slug"
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 border border-serene-300 rounded-r-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label htmlFor="experience" className="block text-xs font-semibold text-serene-700 uppercase tracking-wider mb-1">
                Years of Experience
              </label>
              <input
                id="experience"
                type="number"
                min={0}
                max={60}
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                className="w-full px-3 py-2 border border-serene-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="shortIntro" className="block text-xs font-semibold text-serene-700 uppercase tracking-wider mb-1">
              Short Professional Introduction
            </label>
            <input
              id="shortIntro"
              type="text"
              maxLength={300}
              value={shortIntro}
              onChange={(e) => setShortIntro(e.target.value)}
              placeholder="Brief summary appearing on directory cards..."
              className="w-full px-3 py-2 border border-serene-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-xs font-semibold text-serene-700 uppercase tracking-wider mb-1">
              Full Professional Bio
            </label>
            <textarea
              id="bio"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Detail your clinical background, training, and experience..."
              className="w-full px-3 py-2 border border-serene-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div>
            <label htmlFor="approach" className="block text-xs font-semibold text-serene-700 uppercase tracking-wider mb-1">
              Counseling Approach & Methodology
            </label>
            <textarea
              id="approach"
              rows={3}
              value={professionalApproach}
              onChange={(e) => setProfessionalApproach(e.target.value)}
              placeholder="Describe how you work with clients (e.g. CBT, psychodynamic, client-centered)..."
              className="w-full px-3 py-2 border border-serene-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div className="pt-4 border-t border-serene-100 flex items-center justify-between">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded border-serene-300 focus:ring-brand-500"
              />
              <div>
                <span className="text-xs font-bold text-serene-900 block">List profile publicly in directory</span>
                <span className="text-[11px] text-serene-500">
                  Profile will only appear once credential verification is approved.
                </span>
              </div>
            </label>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 py-2 px-6 bg-brand-700 hover:bg-brand-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
