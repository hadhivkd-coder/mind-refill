"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Home,
  LayoutGrid,
  Plus,
  BookOpen,
  User,
  Image as ImageIcon,
  Video,
  FileText,
  Bookmark,
  Sparkles,
  Check,
  Trash2,
  ExternalLink,
  Calendar,
  DollarSign,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  X,
  Clock,
  Heart,
  Eye,
  LogOut,
  Send,
  UploadCloud,
  Play,
} from "lucide-react";

export interface PsychologistDashboardProps {
  initialTab?: "home" | "content" | "products" | "profile";
  user: {
    id: string;
    email: string;
  };
  profile: {
    id: string;
    slug: string;
    fullName: string;
    professionalTitle: string;
    profilePhotoUrl: string | null;
    shortIntro: string | null;
    bio: string;
    verificationStatus: string;
    isPublic: boolean;
    yearsOfExperience: number;
    location: string | null;
  };
  stats: {
    activeSessionsCount: number;
    inquiriesCount: number;
    publishedCount: number;
    productsCount: number;
  };
  initialContent: Array<{
    id: string;
    slug: string;
    title: string;
    summary: string | null;
    body: string;
    contentType: string;
    status: string;
    publishedAt: string | null;
    createdAt: string;
  }>;
  initialProducts: Array<{
    id: string;
    slug: string;
    title: string;
    description: string;
    priceMajor: string;
    currency: string;
    isPublished: boolean;
    createdAt: string;
  }>;
}

type TabType = "home" | "content" | "products" | "profile";
type CreateType = "photo" | "video" | "post" | "article" | "resource";

export function PsychologistDashboardClient({
  initialTab = "home",
  user,
  profile,
  stats,
  initialContent,
  initialProducts,
}: PsychologistDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createType, setCreateType] = useState<CreateType>("post");

  // Content state
  const [contentList, setContentList] = useState(initialContent);
  const [contentFilter, setContentFilter] = useState<string>("ALL");

  // Products state
  const [productList, setProductList] = useState(initialProducts);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  // Form states for Create Modal
  const [formTitle, setFormTitle] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formMediaUrl, setFormMediaUrl] = useState("");
  const [formThumbnailUrl, setFormThumbnailUrl] = useState("");
  const [formTag, setFormTag] = useState("Stress & Anxiety");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);

  // Native Video Upload State
  const [videoSourceMode, setVideoSourceMode] = useState<"upload" | "link">("upload");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "processing" | "ready">("idle");
  const [watchingVideo, setWatchingVideo] = useState<{ url: string; title: string; caption?: string } | null>(null);

  // Form states for Product Modal
  const [prodTitle, setProdTitle] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodPrice, setProdPrice] = useState("499");
  const [prodCoverUrl, setProdCoverUrl] = useState("");
  const [isProdSubmitting, setIsProdSubmitting] = useState(false);

  // Handle local video file selection
  async function handleVideoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setFormMessage("Video file size exceeds the 50MB limit");
      return;
    }

    setVideoFile(file);
    const localUrl = URL.createObjectURL(file);
    setVideoPreviewUrl(localUrl);
    setUploadState("uploading");
    setUploadProgress(15);
    setFormMessage(null);

    // Auto-generate video thumbnail on canvas
    try {
      const vid = document.createElement("video");
      vid.src = localUrl;
      vid.muted = true;
      vid.currentTime = 1.0;
      vid.onloadeddata = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = vid.videoWidth || 640;
          canvas.height = vid.videoHeight || 360;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
            const thumb = canvas.toDataURL("image/jpeg", 0.75);
            setFormThumbnailUrl(thumb);
          }
        } catch {
          // Canvas capture fallback
        }
      };
    } catch {
      // Non-blocking thumbnail generation
    }

    // Upload to media endpoint with progress
    try {
      const progressTimer = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 85) {
            clearInterval(progressTimer);
            return 85;
          }
          return prev + 20;
        });
      }, 200);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/psychologist/media/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressTimer);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error?.message || json.error || "Failed to upload video file");
      }

      setUploadProgress(100);
      setUploadState("ready");
      setFormMediaUrl(json.data.url);
      if (!formTitle) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        setFormTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    } catch (err: any) {
      setUploadState("idle");
      setFormMessage(err.message || "Failed to upload video file. You can still paste a video link.");
    }
  }

  // Handle Create Post / Content
  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formTitle.trim()) return;
    setIsSubmitting(true);
    setFormMessage(null);

    try {
      let finalTitle = formTitle.trim();
      let finalBody = formBody.trim() || formTitle.trim();

      // Ensure minimum length for API validation
      if (finalTitle.length < 5) {
        finalTitle = finalTitle + " - Reflection";
      }
      if (createType === "article" && finalBody.length < 50) {
        finalBody = finalBody + " — Clinical psychoeducation and reflection from Mind Refill practitioner.";
      } else if (finalBody.length < 5) {
        finalBody = finalBody + " (Mind Refill reflection)";
      }

      const res = await fetch("/api/psychologist/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: finalTitle,
          body: finalBody,
          mediaUrl: formMediaUrl.trim() || undefined,
          thumbnailUrl: formThumbnailUrl.trim() || undefined,
          tag: formTag,
          contentType: createType.toUpperCase(),
          publishImmediately: true,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        const rawErr = json.error;
        const msg =
          typeof rawErr === "object"
            ? rawErr?.message || JSON.stringify(rawErr)
            : rawErr || "Failed to publish reflection";
        throw new Error(msg);
      }

      // Add to list
      const newItem = {
        id: json.data.id,
        slug: json.data.slug,
        title: json.data.title,
        summary: json.data.summary,
        body: json.data.body,
        contentType: json.data.contentType,
        status: json.data.status,
        publishedAt: json.data.publishedAt || new Date().toISOString(),
        createdAt: json.data.createdAt || new Date().toISOString(),
      };

      setContentList([newItem, ...contentList]);
      setIsCreateOpen(false);
      setFormTitle("");
      setFormBody("");
      setFormMediaUrl("");
      setActiveTab("content");
    } catch (err: any) {
      setFormMessage(err.message || "An error occurred while publishing");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle Delete Content
  async function handleDeleteContent(id: string) {
    if (!confirm("Are you sure you want to remove this item?")) return;
    try {
      const res = await fetch(`/api/psychologist/content?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setContentList(contentList.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Handle Create Product
  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!prodTitle.trim() || !prodDesc.trim()) return;
    setIsProdSubmitting(true);

    try {
      const res = await fetch("/api/psychologist/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: prodTitle.trim(),
          description: prodDesc.trim(),
          price: Number(prodPrice) || 299,
          coverImageUrl: prodCoverUrl.trim() || undefined,
          publishImmediately: true,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        const rawErr = json.error;
        const msg =
          typeof rawErr === "object"
            ? rawErr?.message || JSON.stringify(rawErr)
            : rawErr || "Failed to create product";
        throw new Error(msg);
      }

      const newProduct = {
        id: json.data.id,
        slug: json.data.slug,
        title: json.data.title,
        description: json.data.description,
        priceMajor: (Number(json.data.priceMinor || 29900) / 100).toFixed(2),
        currency: json.data.currency || "INR",
        isPublished: true,
        createdAt: json.data.createdAt || new Date().toISOString(),
      };

      setProductList([newProduct, ...productList]);
      setIsAddProductOpen(false);
      setProdTitle("");
      setProdDesc("");
      setProdCoverUrl("");
      setActiveTab("products");
    } catch (err: any) {
      alert(err.message || "Error creating product");
    } finally {
      setIsProdSubmitting(false);
    }
  }

  // Filtered content items
  const filteredContent = contentList.filter((item) => {
    if (contentFilter === "ALL") return true;
    return item.contentType === contentFilter;
  });

  return (
    <div className="min-h-screen bg-[#173C32] text-[#F7F3E9] selection:bg-[#3F6855] selection:text-[#F1EBDD] pb-24 md:pb-12">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#173C32]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-[#244F42] border border-white/10 flex items-center justify-center font-bold text-sm text-[#F1EBDD] group-hover:border-[#9CAF91]/50 transition-colors">
              Ψ
            </div>
            <div>
              <span className="font-serif text-lg font-normal tracking-tight text-[#F7F3E9] block leading-none">
                Mind Refill
              </span>
              <span className="text-[10px] uppercase tracking-wider text-[#9CAF91] font-semibold">
                Practitioner Studio
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#122C25]/80 p-1 rounded-full border border-white/10">
          <button
            onClick={() => setActiveTab("home")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === "home"
                ? "bg-[#F1EBDD] text-[#173C32] font-semibold shadow-sm"
                : "text-[#C9D2BC] hover:text-white"
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab("content")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === "content"
                ? "bg-[#F1EBDD] text-[#173C32] font-semibold shadow-sm"
                : "text-[#C9D2BC] hover:text-white"
            }`}
          >
            Content
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === "products"
                ? "bg-[#F1EBDD] text-[#173C32] font-semibold shadow-sm"
                : "text-[#C9D2BC] hover:text-white"
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === "profile"
                ? "bg-[#F1EBDD] text-[#173C32] font-semibold shadow-sm"
                : "text-[#C9D2BC] hover:text-white"
            }`}
          >
            Profile
          </button>
        </nav>

        {/* Desktop Header Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setCreateType("post");
              setIsCreateOpen(true);
            }}
            className="hidden sm:inline-flex items-center gap-2 h-9 px-4 rounded-full bg-[#F1EBDD] hover:bg-white text-[#173C32] text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create</span>
          </button>

          <Link
            href={`/psychologists/${profile.slug}`}
            target="_blank"
            className="text-xs font-medium text-[#C9D2BC] hover:text-[#F1EBDD] px-2.5 py-1.5 rounded-full bg-white/5 border border-white/10 hidden lg:flex items-center gap-1.5 transition-colors"
          >
            <span>Live Profile</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        {/* ============================== HOME TAB ============================== */}
        {activeTab === "home" && (
          <div className="space-y-6">
            {/* Welcome Greeting Card */}
            <div className="atmospheric-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3F6855]/30 text-[#F1EBDD] border border-white/10 text-[10px] font-semibold uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#9CAF91]" />
                    <span>Verified Mind Refill Clinician</span>
                  </div>
                  <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#F7F3E9] pt-1">
                    Welcome, {profile.fullName}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#C9D2BC] font-light">
                    {profile.professionalTitle}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setCreateType("post");
                    setIsCreateOpen(true);
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#F1EBDD] hover:bg-white text-[#173C32] text-xs font-semibold shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Share Reflection</span>
                </button>
              </div>
            </div>

            {/* Quick Overview Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="atmospheric-card rounded-2xl p-4 text-center">
                <span className="text-[10px] uppercase font-semibold text-[#9CAF91] tracking-wider block">
                  Active Sessions
                </span>
                <span className="font-serif text-2xl font-normal text-[#F7F3E9] block mt-1">
                  {stats.activeSessionsCount}
                </span>
                <span className="text-[10px] text-[#C9D2BC] mt-0.5 block">Scheduled consultations</span>
              </div>
              <div className="atmospheric-card rounded-2xl p-4 text-center">
                <span className="text-[10px] uppercase font-semibold text-[#9CAF91] tracking-wider block">
                  Client Inquiries
                </span>
                <span className="font-serif text-2xl font-normal text-[#F7F3E9] block mt-1">
                  {stats.inquiriesCount}
                </span>
                <span className="text-[10px] text-[#C9D2BC] mt-0.5 block">Guided matches</span>
              </div>
              <div className="atmospheric-card rounded-2xl p-4 text-center">
                <span className="text-[10px] uppercase font-semibold text-[#9CAF91] tracking-wider block">
                  Reflections & Posts
                </span>
                <span className="font-serif text-2xl font-normal text-[#F7F3E9] block mt-1">
                  {contentList.length}
                </span>
                <span className="text-[10px] text-[#C9D2BC] mt-0.5 block">Published to profile</span>
              </div>
              <div className="atmospheric-card rounded-2xl p-4 text-center">
                <span className="text-[10px] uppercase font-semibold text-[#9CAF91] tracking-wider block">
                  Digital Guides
                </span>
                <span className="font-serif text-2xl font-normal text-[#F7F3E9] block mt-1">
                  {productList.length}
                </span>
                <span className="text-[10px] text-[#C9D2BC] mt-0.5 block">Active workbooks</span>
              </div>
            </div>

            {/* Quick Share Prompt ("What's on your mind?") */}
            <div className="atmospheric-card rounded-2xl p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#244F42] border border-white/10 flex items-center justify-center font-bold text-xs text-[#F1EBDD] shrink-0">
                  {profile.fullName.charAt(0)}
                </div>
                <button
                  onClick={() => {
                    setCreateType("post");
                    setIsCreateOpen(true);
                  }}
                  className="flex-1 text-left px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs text-[#9CAF91] hover:border-[#9CAF91]/40 hover:text-[#C9D2BC] transition-all"
                >
                  Share a grounding thought, clinical reflection, or prompt...
                </button>
              </div>

              {/* 5 Fast Create Buttons */}
              <div className="flex items-center justify-around gap-2 pt-4 mt-3 border-t border-white/10">
                <button
                  onClick={() => {
                    setCreateType("photo");
                    setIsCreateOpen(true);
                  }}
                  className="flex items-center gap-1.5 text-xs text-[#C9D2BC] hover:text-[#F1EBDD] transition-colors py-1 px-2 rounded-lg hover:bg-white/5"
                >
                  <ImageIcon className="w-4 h-4 text-[#9CAF91]" />
                  <span className="text-[11px]">Photo</span>
                </button>
                <button
                  onClick={() => {
                    setCreateType("video");
                    setIsCreateOpen(true);
                  }}
                  className="flex items-center gap-1.5 text-xs text-[#C9D2BC] hover:text-[#F1EBDD] transition-colors py-1 px-2 rounded-lg hover:bg-white/5"
                >
                  <Video className="w-4 h-4 text-[#9CAF91]" />
                  <span className="text-[11px]">Video</span>
                </button>
                <button
                  onClick={() => {
                    setCreateType("post");
                    setIsCreateOpen(true);
                  }}
                  className="flex items-center gap-1.5 text-xs text-[#C9D2BC] hover:text-[#F1EBDD] transition-colors py-1 px-2 rounded-lg hover:bg-white/5"
                >
                  <FileText className="w-4 h-4 text-[#9CAF91]" />
                  <span className="text-[11px]">Post</span>
                </button>
                <button
                  onClick={() => {
                    setCreateType("article");
                    setIsCreateOpen(true);
                  }}
                  className="flex items-center gap-1.5 text-xs text-[#C9D2BC] hover:text-[#F1EBDD] transition-colors py-1 px-2 rounded-lg hover:bg-white/5"
                >
                  <BookOpen className="w-4 h-4 text-[#9CAF91]" />
                  <span className="text-[11px]">Article</span>
                </button>
                <button
                  onClick={() => {
                    setCreateType("resource");
                    setIsCreateOpen(true);
                  }}
                  className="flex items-center gap-1.5 text-xs text-[#C9D2BC] hover:text-[#F1EBDD] transition-colors py-1 px-2 rounded-lg hover:bg-white/5"
                >
                  <Bookmark className="w-4 h-4 text-[#9CAF91]" />
                  <span className="text-[11px]">Resource</span>
                </button>
              </div>
            </div>

            {/* Practice Administration Shortcuts */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-[#9CAF91] uppercase tracking-widest block">
                Practice Management
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link
                  href="/app/psychologist/availability"
                  className="atmospheric-card rounded-2xl p-4 flex items-center justify-between hover:border-[#9CAF91]/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white/5 text-[#9CAF91]">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-[#F7F3E9]">Availability</h3>
                      <p className="text-[11px] text-[#C9D2BC] font-light">Manage consultation hours</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#9CAF91] group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/app/psychologist/earnings"
                  className="atmospheric-card rounded-2xl p-4 flex items-center justify-between hover:border-[#9CAF91]/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white/5 text-[#9CAF91]">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-[#F7F3E9]">Earnings & Ledger</h3>
                      <p className="text-[11px] text-[#C9D2BC] font-light">Session fees & payouts</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#9CAF91] group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <Link
                  href="/app/psychologist/portfolio"
                  className="atmospheric-card rounded-2xl p-4 flex items-center justify-between hover:border-[#9CAF91]/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white/5 text-[#9CAF91]">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-[#F7F3E9]">AI Portfolio</h3>
                      <p className="text-[11px] text-[#C9D2BC] font-light">Practice styles & builder</p>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#9CAF91] group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ============================== CONTENT TAB ============================== */}
        {activeTab === "content" && (
          <div className="space-y-6">
            {/* Header + Filter Pills */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#F7F3E9]">
                  Published Content & Reflections
                </h1>
                <p className="text-xs text-[#C9D2BC] font-light mt-0.5">
                  Items you share here appear directly on your public psychologist profile.
                </p>
              </div>

              <button
                onClick={() => {
                  setCreateType("post");
                  setIsCreateOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F1EBDD] hover:bg-white text-[#173C32] text-xs font-semibold shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create</span>
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {["ALL", "PHOTO", "VIDEO", "POST", "ARTICLE", "RESOURCE"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setContentFilter(filter)}
                  className={`px-3.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    contentFilter === filter
                      ? "bg-[#F1EBDD] text-[#173C32] font-semibold"
                      : "bg-white/5 border border-white/10 text-[#C9D2BC] hover:text-white"
                  }`}
                >
                  {filter === "ALL" ? "All Content" : filter.charAt(0) + filter.slice(1).toLowerCase() + "s"}
                </button>
              ))}
            </div>

            {/* Content Feed / Grid */}
            {filteredContent.length === 0 ? (
              <div className="atmospheric-card rounded-3xl p-12 text-center max-w-md mx-auto">
                <FileText className="w-8 h-8 text-[#9CAF91] mx-auto mb-3 opacity-60" />
                <h3 className="font-serif text-lg text-[#F7F3E9]">No items in this category yet</h3>
                <p className="text-xs text-[#C9D2BC] mt-1 font-light">
                  Share your first thought, photo, video, or clinical insight with prospective clients.
                </p>
                <button
                  onClick={() => {
                    setCreateType("post");
                    setIsCreateOpen(true);
                  }}
                  className="mt-4 px-4 py-2 rounded-full bg-[#F1EBDD] text-[#173C32] text-xs font-semibold"
                >
                  + Create First Item
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredContent.map((item) => {
                  let parsedMeta: any = null;
                  try {
                    if (item.summary && item.summary.startsWith("{")) {
                      parsedMeta = JSON.parse(item.summary);
                    }
                  } catch {
                    parsedMeta = null;
                  }

                  const mediaUrl = parsedMeta?.mediaUrl || null;
                  const thumbnailUrl = parsedMeta?.thumbnailUrl || null;
                  const tag = parsedMeta?.tag || item.summary || item.contentType;
                  const isVideo = item.contentType === "VIDEO";

                  return (
                    <div
                      key={item.id}
                      className="atmospheric-card rounded-2xl p-5 flex flex-col justify-between group hover:border-[#9CAF91]/50 transition-all"
                    >
                      <div>
                        {/* Type & Date */}
                        <div className="flex items-center justify-between mb-3 text-[10px] text-[#9CAF91]">
                          <span className="uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#F1EBDD]">
                            {item.contentType}
                          </span>
                          <span className="text-[#C9D2BC]">
                            {new Date(item.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>

                        {/* Photo / Video Preview if present */}
                        {mediaUrl && (
                          <div
                            onClick={() => {
                              if (isVideo) {
                                setWatchingVideo({
                                  url: mediaUrl,
                                  title: item.title,
                                  caption: item.body,
                                });
                              }
                            }}
                            className={`h-44 w-full rounded-xl overflow-hidden mb-3 bg-black/40 relative ${
                              isVideo ? "cursor-pointer group/preview" : ""
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={isVideo && thumbnailUrl ? thumbnailUrl : mediaUrl}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {isVideo && (
                              <div className="absolute inset-0 bg-black/35 group-hover/preview:bg-black/20 flex items-center justify-center transition-all">
                                <div className="h-11 w-11 rounded-full bg-[#F1EBDD] text-[#173C32] flex items-center justify-center shadow-lg group-hover/preview:scale-110 transition-transform">
                                  <Play className="w-5 h-5 ml-0.5 fill-current" />
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Title & Body */}
                        <h3 className="font-serif text-base font-normal text-[#F7F3E9] leading-snug mb-2">
                          {item.title}
                        </h3>

                        <p className="text-xs text-[#C9D2BC] font-light line-clamp-3 leading-relaxed mb-4">
                          {item.body}
                        </p>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-[#9CAF91]">
                        <span className="text-[10px] text-[#C9D2BC]">{tag}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteContent(item.id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/20 text-[#C9D2BC] hover:text-red-400 transition-colors"
                            title="Delete item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================== PRODUCTS TAB ============================== */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#F7F3E9]">
                  Digital Books & Guided Workbooks
                </h1>
                <p className="text-xs text-[#C9D2BC] font-light mt-0.5">
                  Offer clients structured digital companions, self-reflection manuals, and worksheets.
                </p>
              </div>

              <button
                onClick={() => setIsAddProductOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F1EBDD] hover:bg-white text-[#173C32] text-xs font-semibold shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Product</span>
              </button>
            </div>

            {/* Products List */}
            {productList.length === 0 ? (
              <div className="atmospheric-card rounded-3xl p-12 text-center max-w-md mx-auto">
                <BookOpen className="w-8 h-8 text-[#9CAF91] mx-auto mb-3 opacity-60" />
                <h3 className="font-serif text-lg text-[#F7F3E9]">No digital products listed yet</h3>
                <p className="text-xs text-[#C9D2BC] mt-1 font-light">
                  Publish a workbook, guided protocol, or psychoeducational PDF guide.
                </p>
                <button
                  onClick={() => setIsAddProductOpen(true)}
                  className="mt-4 px-4 py-2 rounded-full bg-[#F1EBDD] text-[#173C32] text-xs font-semibold"
                >
                  + Add Your First Guide
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {productList.map((prod) => (
                  <div
                    key={prod.id}
                    className="atmospheric-card rounded-2xl p-5 flex flex-col justify-between hover:border-[#9CAF91]/50 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3 text-[10px] text-[#9CAF91]">
                        <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#F1EBDD] font-semibold uppercase tracking-wider">
                          Digital Workbook
                        </span>
                        <span className="font-serif text-sm font-semibold text-[#F7F3E9]">
                          ₹{prod.priceMajor}
                        </span>
                      </div>

                      <h3 className="font-serif text-base font-normal text-[#F7F3E9] leading-snug mb-1.5">
                        {prod.title}
                      </h3>

                      <p className="text-xs text-[#C9D2BC] font-light line-clamp-3 leading-relaxed mb-4">
                        {prod.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-[#9CAF91] flex items-center gap-1">
                        <Check className="w-3 h-3 text-[#9CAF91]" />
                        <span>Instant PDF Reader</span>
                      </span>
                      <Link
                        href={`/ebooks/${prod.slug}`}
                        target="_blank"
                        className="text-xs text-[#F1EBDD] hover:underline flex items-center gap-1"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================== PROFILE TAB ============================== */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#F7F3E9]">
                  Practitioner Profile
                </h1>
                <p className="text-xs text-[#C9D2BC] font-light mt-0.5">
                  How you appear to clients across Mind Refill.
                </p>
              </div>

              <Link
                href={`/psychologists/${profile.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F1EBDD] hover:bg-white text-[#173C32] text-xs font-semibold shadow-sm transition-all"
              >
                <span>View Public Profile</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Profile Summary Card */}
            <div className="atmospheric-card rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-[#244F42] border border-white/10 flex items-center justify-center font-serif text-2xl text-[#F1EBDD] overflow-hidden">
                  {profile.profilePhotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.profilePhotoUrl} alt={profile.fullName} className="w-full h-full object-cover" />
                  ) : (
                    profile.fullName.charAt(0)
                  )}
                </div>
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-normal text-[#F7F3E9]">
                    {profile.fullName}
                  </h2>
                  <p className="text-xs text-[#C9D2BC] font-light">{profile.professionalTitle}</p>
                  <p className="text-[11px] text-[#9CAF91] mt-0.5">
                    {profile.yearsOfExperience} years experience • {profile.location || "Verified Online Consultation"}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-2">
                <span className="text-[10px] uppercase font-semibold text-[#9CAF91] tracking-wider block">
                  Bio / Clinical Approach
                </span>
                <p className="text-xs text-[#C9D2BC] font-light leading-relaxed">
                  {profile.bio || profile.shortIntro || "No bio entered yet."}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs text-[#9CAF91]">
                  Authenticated as <strong className="text-[#F7F3E9]">{user.email}</strong>
                </span>

                <form action="/api/auth/logout" method="POST">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 text-xs text-[#C9D2BC] hover:text-white px-3 py-1.5 rounded-full bg-white/5 border border-white/10 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Account Settings Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/app/psychologist/profile"
                className="atmospheric-card rounded-2xl p-4 flex items-center justify-between hover:border-[#9CAF91]/50 transition-all group"
              >
                <div>
                  <h3 className="text-xs font-semibold text-[#F7F3E9]">Edit Profile Information</h3>
                  <p className="text-[11px] text-[#C9D2BC] font-light">Bio, titles, specializations, photo</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#9CAF91] group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/app/psychologist/verification"
                className="atmospheric-card rounded-2xl p-4 flex items-center justify-between hover:border-[#9CAF91]/50 transition-all group"
              >
                <div>
                  <h3 className="text-xs font-semibold text-[#F7F3E9]">Clinical Verification</h3>
                  <p className="text-[11px] text-[#C9D2BC] font-light">License documents and accreditation</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#9CAF91] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* ============================== '+ CREATE' MODAL SHEET ============================== */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full sm:max-w-lg bg-[#173C32] border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Sheet Header */}
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-normal text-[#F7F3E9]">Create New Content</h3>
                <p className="text-[11px] text-[#9CAF91] font-light">
                  Simple publishing, directly to your public profile
                </p>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-full text-[#C9D2BC] hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 5 Type Switcher */}
            <div className="grid grid-cols-5 p-2 bg-[#122C25] border-b border-white/10 text-center text-[10px]">
              <button
                type="button"
                onClick={() => setCreateType("photo")}
                className={`py-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
                  createType === "photo" ? "bg-[#F1EBDD] text-[#173C32] font-semibold" : "text-[#C9D2BC] hover:text-white"
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Photo</span>
              </button>
              <button
                type="button"
                onClick={() => setCreateType("video")}
                className={`py-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
                  createType === "video" ? "bg-[#F1EBDD] text-[#173C32] font-semibold" : "text-[#C9D2BC] hover:text-white"
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Video</span>
              </button>
              <button
                type="button"
                onClick={() => setCreateType("post")}
                className={`py-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
                  createType === "post" ? "bg-[#F1EBDD] text-[#173C32] font-semibold" : "text-[#C9D2BC] hover:text-white"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Post</span>
              </button>
              <button
                type="button"
                onClick={() => setCreateType("article")}
                className={`py-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
                  createType === "article" ? "bg-[#F1EBDD] text-[#173C32] font-semibold" : "text-[#C9D2BC] hover:text-white"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Article</span>
              </button>
              <button
                type="button"
                onClick={() => setCreateType("resource")}
                className={`py-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
                  createType === "resource" ? "bg-[#F1EBDD] text-[#173C32] font-semibold" : "text-[#C9D2BC] hover:text-white"
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>Resource</span>
              </button>
            </div>

            {/* Form Form Body */}
            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4 overflow-y-auto">
              {formMessage && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-200">
                  {formMessage}
                </div>
              )}

              {/* Title / Heading / Thought */}
              <div>
                <label className="text-[11px] font-semibold text-[#9CAF91] uppercase tracking-wider block mb-1">
                  {createType === "post" ? "Reflection Headline" : "Title / Caption"}
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder={
                    createType === "post"
                      ? "e.g. Taking a pause isn't giving up..."
                      : createType === "photo"
                      ? "e.g. Morning clinic space & grounding tools..."
                      : createType === "video"
                      ? "e.g. How to calm overthinking in 3 minutes..."
                      : "e.g. Understanding Nervous System Safety..."
                  }
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-xs text-[#F7F3E9] placeholder-[#9CAF91]/60 focus:outline-none focus:border-[#F1EBDD]"
                />
              </div>

              {/* Video Creation Section: Upload Video File vs Add Video Link */}
              {createType === "video" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-1 bg-[#122C25] rounded-xl border border-white/10">
                    <button
                      type="button"
                      onClick={() => setVideoSourceMode("upload")}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        videoSourceMode === "upload"
                          ? "bg-[#F1EBDD] text-[#173C32] font-semibold"
                          : "text-[#C9D2BC] hover:text-white"
                      }`}
                    >
                      Upload Video File
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoSourceMode("link")}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        videoSourceMode === "link"
                          ? "bg-[#F1EBDD] text-[#173C32] font-semibold"
                          : "text-[#C9D2BC] hover:text-white"
                      }`}
                    >
                      Add Video Link
                    </button>
                  </div>

                  {videoSourceMode === "upload" ? (
                    <div>
                      {!videoPreviewUrl ? (
                        <label className="border-2 border-dashed border-white/20 hover:border-[#9CAF91] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-white/5 hover:bg-white/10 transition-all text-center group">
                          <input
                            type="file"
                            accept="video/mp4,video/quicktime,video/webm"
                            onChange={handleVideoSelect}
                            className="hidden"
                          />
                          <div className="h-12 w-12 rounded-full bg-[#244F42] flex items-center justify-center text-[#F1EBDD] group-hover:scale-110 transition-transform">
                            <UploadCloud className="w-6 h-6" />
                          </div>
                          <span className="text-xs font-semibold text-[#F7F3E9] block">
                            Choose video from phone or computer
                          </span>
                          <span className="text-[11px] text-[#C9D2BC] font-light">
                            Supports MP4, MOV, WebM • Up to 50MB
                          </span>
                        </label>
                      ) : (
                        <div className="space-y-3">
                          {/* Live Native Video Preview Player */}
                          <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-white/10">
                            <video
                              src={videoPreviewUrl}
                              controls
                              playsInline
                              className="w-full h-full object-contain"
                            />
                          </div>

                          {/* Upload Progress Bar */}
                          {uploadState !== "ready" && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-[11px] text-[#9CAF91]">
                                <span>
                                  {uploadState === "uploading"
                                    ? `Uploading video... ${uploadProgress}%`
                                    : "Preparing your video..."}
                                </span>
                                <span>{videoFile?.name}</span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <div
                                  className="h-full bg-[#F1EBDD] transition-all duration-300"
                                  style={{ width: `${uploadProgress}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {uploadState === "ready" && (
                            <div className="flex items-center justify-between text-xs px-2 text-[#9CAF91]">
                              <span className="flex items-center gap-1.5 text-[#F1EBDD]">
                                <Check className="w-3.5 h-3.5 text-[#9CAF91]" />
                                <span>Ready to publish</span>
                              </span>
                              <label className="text-[11px] text-[#C9D2BC] hover:text-[#F1EBDD] underline cursor-pointer">
                                <span>Change video</span>
                                <input
                                  type="file"
                                  accept="video/mp4,video/quicktime,video/webm"
                                  onChange={handleVideoSelect}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label className="text-[11px] font-semibold text-[#9CAF91] uppercase tracking-wider block mb-1">
                        Video / Reel URL
                      </label>
                      <input
                        type="url"
                        value={formMediaUrl}
                        onChange={(e) => setFormMediaUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=... or direct video link"
                        className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-xs text-[#F7F3E9] placeholder-[#9CAF91]/60 focus:outline-none focus:border-[#F1EBDD]"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Photo Creation Section: File or URL */}
              {createType === "photo" && (
                <div>
                  <label className="text-[11px] font-semibold text-[#9CAF91] uppercase tracking-wider block mb-1">
                    Photo Image URL (or Unsplash link)
                  </label>
                  <input
                    type="url"
                    value={formMediaUrl}
                    onChange={(e) => setFormMediaUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-xs text-[#F7F3E9] placeholder-[#9CAF91]/60 focus:outline-none focus:border-[#F1EBDD]"
                  />
                  {formMediaUrl && (
                    <div className="mt-2 h-36 rounded-xl overflow-hidden bg-black/40 border border-white/10 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={formMediaUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              )}

              {/* Reflection Body / Content */}
              <div>
                <label className="text-[11px] font-semibold text-[#9CAF91] uppercase tracking-wider block mb-1">
                  {createType === "article" ? "Article Body (Markdown supported)" : "Caption / Reflection Notes"}
                </label>
                <textarea
                  rows={createType === "article" ? 6 : 3}
                  value={formBody}
                  onChange={(e) => setFormBody(e.target.value)}
                  placeholder="Add your clinical thoughts, guidance, or psychoeducational message here..."
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-[#F7F3E9] placeholder-[#9CAF91]/60 focus:outline-none focus:border-[#F1EBDD] resize-none"
                />
              </div>

              {/* Tag / Clinical Theme */}
              <div>
                <label className="text-[11px] font-semibold text-[#9CAF91] uppercase tracking-wider block mb-1">
                  Focus Theme
                </label>
                <select
                  value={formTag}
                  onChange={(e) => setFormTag(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#122C25] border border-white/10 text-xs text-[#F7F3E9] focus:outline-none focus:border-[#F1EBDD]"
                >
                  <option value="Stress & Anxiety">Stress & Anxiety</option>
                  <option value="Relationships">Relationships</option>
                  <option value="Life Transitions">Life Transitions</option>
                  <option value="Grief & Loss">Grief & Loss</option>
                  <option value="Self-Understanding">Self-Understanding</option>
                  <option value="Sleep & Rest">Sleep & Rest</option>
                </select>
              </div>

              {/* Publish Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 rounded-full bg-[#F1EBDD] hover:bg-white text-[#173C32] text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Publishing to Profile...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Publish to Profile</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================== '+ ADD PRODUCT' MODAL ============================== */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full sm:max-w-md bg-[#173C32] border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-normal text-[#F7F3E9]">Add Digital Product</h3>
                <p className="text-[11px] text-[#9CAF91] font-light">E-Book or Guided Workbook</p>
              </div>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="p-1 rounded-full text-[#C9D2BC] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-5 space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-[#9CAF91] uppercase tracking-wider block mb-1">
                  Product Title
                </label>
                <input
                  type="text"
                  required
                  value={prodTitle}
                  onChange={(e) => setProdTitle(e.target.value)}
                  placeholder="e.g. The Anxiety Companion Workbook"
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-xs text-[#F7F3E9] placeholder-[#9CAF91]/60 focus:outline-none focus:border-[#F1EBDD]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#9CAF91] uppercase tracking-wider block mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Summarize what exercises and insights are inside this companion..."
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-[#F7F3E9] placeholder-[#9CAF91]/60 focus:outline-none focus:border-[#F1EBDD] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#9CAF91] uppercase tracking-wider block mb-1">
                    Price (INR)
                  </label>
                  <input
                    type="number"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="499"
                    className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-xs text-[#F7F3E9] focus:outline-none focus:border-[#F1EBDD]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#9CAF91] uppercase tracking-wider block mb-1">
                    Format
                  </label>
                  <div className="h-11 px-3 rounded-xl bg-white/5 border border-white/10 text-xs text-[#C9D2BC] flex items-center">
                    PDF & Reader
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#9CAF91] uppercase tracking-wider block mb-1">
                  Cover Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={prodCoverUrl}
                  onChange={(e) => setProdCoverUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-xs text-[#F7F3E9] placeholder-[#9CAF91]/60 focus:outline-none focus:border-[#F1EBDD]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProdSubmitting}
                  className="w-full h-11 rounded-full bg-[#F1EBDD] hover:bg-white text-[#173C32] text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProdSubmitting ? <span>Publishing Product...</span> : <span>Publish Product</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================== NATIVE VIDEO MODAL ============================== */}
      {watchingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-[#173C32] rounded-3xl border border-white/20 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/10 bg-[#122C25]/90">
              <div className="pr-4">
                <h3 className="font-serif text-lg text-[#F7F3E9] font-medium line-clamp-1">
                  {watchingVideo.title}
                </h3>
                <span className="text-[11px] text-[#9CAF91]">Native Video Reflection</span>
              </div>
              <button
                onClick={() => setWatchingVideo(null)}
                className="p-2 rounded-full hover:bg-white/10 text-[#C9D2BC] hover:text-white transition-colors"
                aria-label="Close video"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Box */}
            <div className="relative bg-black aspect-video flex items-center justify-center">
              <video
                src={watchingVideo.url}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            </div>

            {/* Video Caption */}
            {watchingVideo.caption && (
              <div className="p-4 sm:p-5 bg-[#173C32] text-xs text-[#C9D2BC] font-light border-t border-white/10 max-h-32 overflow-y-auto">
                <p className="leading-relaxed whitespace-pre-wrap">{watchingVideo.caption}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================== MOBILE BOTTOM NAVIGATION BAR ============================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#122C25]/95 backdrop-blur-md border-t border-white/10 px-4 h-16 flex items-center justify-around">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center gap-1 transition-colors min-w-[50px] ${
            activeTab === "home" ? "text-[#F1EBDD]" : "text-[#9CAF91]"
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Home</span>
        </button>

        <button
          onClick={() => setActiveTab("content")}
          className={`flex flex-col items-center gap-1 transition-colors min-w-[50px] ${
            activeTab === "content" ? "text-[#F1EBDD]" : "text-[#9CAF91]"
          }`}
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[10px] font-medium">Content</span>
        </button>

        {/* Prominent Center '+ Create' Button */}
        <button
          onClick={() => {
            setCreateType("post");
            setIsCreateOpen(true);
          }}
          className="h-11 w-11 -mt-4 rounded-full bg-[#F1EBDD] text-[#173C32] shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          aria-label="Create content"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>

        <button
          onClick={() => setActiveTab("products")}
          className={`flex flex-col items-center gap-1 transition-colors min-w-[50px] ${
            activeTab === "products" ? "text-[#F1EBDD]" : "text-[#9CAF91]"
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] font-medium">Products</span>
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`flex flex-col items-center gap-1 transition-colors min-w-[50px] ${
            activeTab === "profile" ? "text-[#F1EBDD]" : "text-[#9CAF91]"
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium">Profile</span>
        </button>
      </nav>
    </div>
  );
}
