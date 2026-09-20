"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Upload, FileText, Download, CheckCircle, AlertTriangle, Clock } from "lucide-react";

export default function PsychologistVerificationDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [profile, setProfile] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState("LICENSE");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/psychologist/profile");
      if (!res.ok) throw new Error("Failed to load profile");
      const data = await res.json();
      setProfile(data);
    } catch (err: unknown) {
      setMessage({ type: "error", text: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentType", documentType);

    try {
      const res = await fetch("/api/psychologist/documents/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setMessage({ type: "success", text: "Document uploaded securely" });
      setFile(null);
      await loadProfile();
    } catch (err: unknown) {
      setMessage({ type: "error", text: (err as Error).message });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitApplication = async () => {
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/psychologist/verification/submit", {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");

      setMessage({ type: "success", text: "Verification application submitted for review!" });
      await loadProfile();
    } catch (err: unknown) {
      setMessage({ type: "error", text: (err as Error).message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async (docId: string) => {
    try {
      const res = await fetch(`/api/psychologist/documents/${docId}/download`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Download authorization failed");
      window.open(data.signedUrl, "_blank");
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-serene-50 p-8 flex items-center justify-center">Loading verification status...</div>;
  }

  const latestApp = profile?.verificationApps?.[0];
  const documents = latestApp?.documents || [];
  const status = profile?.verificationStatus || "PENDING";
  const latestReview = latestApp?.reviews?.[0];

  return (
    <div className="min-h-screen bg-serene-50 p-6 sm:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/app/psychologist"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-serene-500 hover:text-serene-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>

        {/* Status Header */}
        <div className="bg-white rounded-3xl border border-serene-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-xs font-semibold text-brand-700 uppercase tracking-wider">
                Credential Verification
              </span>
              <h1 className="text-2xl font-bold text-serene-950 mt-1">
                Professional License & Verification
              </h1>
              <p className="text-xs text-serene-500 mt-1">
                Verification is required before your profile can appear in the public discovery directory.
              </p>
            </div>

            <div>
              {status === "VERIFIED" && (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-50 text-green-800 border border-green-200 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  VERIFIED SPECIALIST
                </span>
              )}
              {status === "UNDER_REVIEW" && (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                  <Clock className="w-4 h-4 text-amber-600" />
                  UNDER REVIEW
                </span>
              )}
              {status === "REJECTED" && (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 text-red-800 border border-red-200 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  ACTION REQUIRED / REJECTED
                </span>
              )}
              {status === "PENDING" && (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-serene-100 text-serene-800 border border-serene-200 text-xs font-bold">
                  <FileText className="w-4 h-4 text-serene-500" />
                  PENDING DOCUMENTS
                </span>
              )}
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

        {/* Review Notes (if rejected or feedback available) */}
        {latestReview?.notes && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-xs text-amber-900">
            <h3 className="font-bold text-amber-950 mb-1">Administrative Review Notes:</h3>
            <p className="leading-relaxed">{latestReview.notes}</p>
          </div>
        )}

        {/* Document Upload Section */}
        {status !== "VERIFIED" && status !== "UNDER_REVIEW" && (
          <form onSubmit={handleUpload} className="bg-white rounded-3xl border border-serene-200 p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-serene-900">Upload Verification Document</h2>
            <p className="text-xs text-serene-500">
              Attach clinical licenses, registration certificates, or degree certificates (PDF, JPEG, or PNG up to 15MB).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-serene-700 uppercase tracking-wider mb-1">
                  Document Type
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-3 py-2 border border-serene-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="CLINICAL_LICENSE">Clinical License / Registration</option>
                  <option value="DEGREE_CERTIFICATE">Degree / Academic Certificate</option>
                  <option value="GOVERNMENT_ID">Government Photo ID</option>
                  <option value="OTHER_CREDENTIAL">Other Supporting Credential</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-serene-700 uppercase tracking-wider mb-1">
                  Select File
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-serene-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading || !file}
              className="mt-2 inline-flex items-center gap-2 py-2 px-5 bg-brand-700 hover:bg-brand-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              {uploading ? "Uploading securely..." : "Upload Document"}
            </button>
          </form>
        )}

        {/* Uploaded Documents Roster */}
        <div className="bg-white rounded-3xl border border-serene-200 p-6 sm:p-8 shadow-sm">
          <h2 className="text-sm font-bold text-serene-900 mb-4">Submitted Verification Documents</h2>

          {documents.length === 0 ? (
            <p className="text-xs text-serene-400 italic">
              No documents uploaded yet. Upload at least one credential to submit for verification.
            </p>
          ) : (
            <div className="space-y-3">
              {documents.map((doc: any) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-serene-200 bg-serene-50/50"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-brand-600" />
                    <div>
                      <span className="text-xs font-bold text-serene-900 block">{doc.documentType}</span>
                      <span className="text-[11px] text-serene-500">{doc.file.originalName}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownload(doc.id)}
                    className="inline-flex items-center gap-1 text-xs text-brand-700 hover:underline font-semibold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                </div>
              ))}
            </div>
          )}

          {status !== "VERIFIED" && status !== "UNDER_REVIEW" && (
            <div className="mt-6 pt-6 border-t border-serene-100 flex justify-end">
              <button
                type="button"
                onClick={handleSubmitApplication}
                disabled={submitting || documents.length === 0}
                className="py-2.5 px-6 bg-brand-700 hover:bg-brand-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Application for Review"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
