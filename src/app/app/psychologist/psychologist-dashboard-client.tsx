"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Users, Bell, Smile, ChevronDown, BarChart2, 
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

  // Native Photo Upload State
  const [photoSourceMode, setPhotoSourceMode] = useState<"upload" | "link">("upload");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Handle local photo/image file selection
  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setFormMessage("Image file size exceeds the 10MB limit");
      return;
    }

    setPhotoFile(file);
    const localUrl = URL.createObjectURL(file);
    setFormMediaUrl(localUrl);
    setUploadState("uploading");
    setUploadProgress(30);
    setFormMessage(null);

    try {
      const progressTimer = setInterval(() => {
        setUploadProgress((prev) => (prev >= 85 ? prev : prev + 25));
      }, 150);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/psychologist/media/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressTimer);
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || json.error || "Failed to upload photo");
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
      setFormMessage(err.message || "Failed to upload photo. You can still paste an image link.");
    }
  }

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
    <div className="min-h-screen bg-[#FAF8F2] text-[#29272C] selection:bg-[#EAE6F0] selection:text-white pb-24 md:pb-12">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#FCFBFA]/95 backdrop-blur-md border-b border-[#F0EBF7] px-6 lg:px-10 h-[76px] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-xl bg-[#F4EFF9] flex items-center justify-center font-serif text-[18px] text-[#7856A4] transition-colors">
              Ψ
            </div>
            <div>
              <span className="font-sans text-[1.25rem] font-bold tracking-tight text-[#1A1A1A] block leading-none">
                Mind Refill
              </span>
            </div>
          </Link>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden lg:flex items-center gap-2">
          <button
            onClick={() => setActiveTab("home")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-bold transition-all relative ${
              activeTab === "home"
                ? "text-[#7856A4]"
                : "text-[#666666] hover:text-[#1A1A1A]"
            }`}
          >
            <Home className="w-[18px] h-[18px]" strokeWidth={2.5} /> Home
            {activeTab === "home" && <div className="absolute -bottom-[22px] left-1/2 -translate-x-1/2 w-10 h-0.5 bg-[#7856A4] rounded-t-full" />} 
          </button>
          
          <button
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-bold text-[#666666] hover:text-[#1A1A1A] transition-all`}
          >
            <Users className="w-[18px] h-[18px]" strokeWidth={2.5} /> Clients
          </button>
          
          <button
            onClick={() => setActiveTab("content")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-bold transition-all ${
              activeTab === "content"
                ? "text-[#7856A4]"
                : "text-[#666666] hover:text-[#1A1A1A]"
            }`}
          >
            <FileText className="w-[18px] h-[18px]" strokeWidth={2.5} /> Content
            {activeTab === "content" && <div className="absolute -bottom-[22px] left-1/2 -translate-x-1/2 w-10 h-0.5 bg-[#7856A4] rounded-t-full" />} 
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-bold transition-all ${
              activeTab === "products"
                ? "text-[#7856A4]"
                : "text-[#666666] hover:text-[#1A1A1A]"
            }`}
          >
            <Calendar className="w-[18px] h-[18px]" strokeWidth={2.5} /> Products
            {activeTab === "products" && <div className="absolute -bottom-[22px] left-1/2 -translate-x-1/2 w-10 h-0.5 bg-[#7856A4] rounded-t-full" />} 
          </button>

          <button
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-bold text-[#666666] hover:text-[#1A1A1A] transition-all`}
          >
            <Sparkles className="w-[18px] h-[18px]" strokeWidth={2.5} /> Analytics
          </button>
        </nav>

        {/* Right Header Actions */}
        <div className="flex items-center gap-6">
          <button className="text-[#AFA1CE] hover:text-[#7856A4] transition-colors relative">
            <Bell className="w-[20px] h-[20px]" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#7856A4] border-2 border-white" />
          </button>

          <div className="flex items-center gap-3 pl-6 border-l border-[#F0EBF7] cursor-pointer group">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#EEEAF5] shrink-0">
              <img src={profile?.profilePhotoUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100"} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="hidden lg:flex items-center gap-1.5">
              <span className="text-[14px] font-bold text-[#1A1A1A] group-hover:text-[#7856A4] transition-colors">
                Dr. Sarah Jenkins, Ph.D.
              </span>
              <svg className="w-4 h-4 text-[#AFA1CE]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* ============================== HOME TAB ============================== */}
        {activeTab === "home" && (
          <div className="space-y-8">
            
            {/* HERO & STATS SECTION */}
            <div className="w-full relative rounded-[32px] bg-[#F8F6FC] overflow-hidden p-8 lg:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-[#EAE6F0]">
              <div className="absolute inset-0 z-0 pointer-events-none">
                 <div className="absolute top-0 right-0 w-[40%] h-full opacity-60">
                   <Image src="https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&q=80&w=1200" alt="" fill className="object-cover mix-blend-multiply rounded-bl-[100px]" />
                 </div>
                 <div className="absolute inset-0 bg-gradient-to-r from-[#FCFBFA] via-[#FCFBFA]/90 to-transparent z-10" />
              </div>

              <div className="relative z-20 flex flex-col xl:flex-row xl:items-start justify-between gap-8 mb-10">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                   <div className="relative w-28 h-28 rounded-full border-4 border-white shadow-sm shrink-0">
                     <Image src={profile?.profilePhotoUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300"} alt="Avatar" fill className="object-cover rounded-full" />
                     <div className="absolute bottom-1 right-1 w-5 h-5 bg-[#10B981] border-2 border-white rounded-full" />
                   </div>
                   <div className="text-center sm:text-left space-y-2 pt-2">
                     <div className="inline-flex items-center gap-1.5 bg-[#F4EFF9] border border-[#EAE6F0] rounded-full px-3 py-1 mb-1">
                       <ShieldCheck className="w-3.5 h-3.5 text-[#7856A4]" />
                       <span className="text-[10px] font-bold tracking-[0.05em] text-[#7856A4] uppercase">Verified Mind Refill Clinician</span>
                     </div>
                     <h1 className="text-[2rem] md:text-[2.5rem] font-bold text-[#1A1A1A] tracking-tight leading-tight">
                       Welcome, Dr. Sarah Jenkins, Ph.D.
                     </h1>
                     <p className="text-[16px] text-[#666666] font-medium">Licensed Clinical Psychologist</p>
                   </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Handwritten script */}
                  <div className="hidden lg:block text-[#7856A4] transform -rotate-6 pt-4 pr-4">
                     <svg width="40" height="30" viewBox="0 0 40 30" fill="none" className="absolute -left-12 top-2 opacity-50"><path d="M5 25 Q 20 5 35 15" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" /></svg>
                     <span className="font-serif italic text-[18px] leading-tight block">Your work<br/>creates safer,<br/>brighter tomorrows.</span>
                     <span className="font-serif italic text-[16px] leading-tight block text-right mt-1">Thank you<br/>for being here.</span>
                     <Heart className="w-4 h-4 absolute bottom-0 -right-5 opacity-60" />
                  </div>
                  <button className="bg-[#7856A4] hover:bg-[#63458A] text-white px-6 py-3.5 rounded-full font-bold text-[14px] flex items-center gap-2 shadow-[0_8px_20px_rgb(120,86,164,0.2)] transition-all">
                    <Plus className="w-4 h-4" /> Share Reflection
                  </button>
                </div>
              </div>

              <div className="relative z-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-[20px] p-6 shadow-sm border border-[#EEEAF5] flex items-center gap-5 group hover:border-[#D1C4E9] transition-colors">
                   <div className="w-12 h-12 rounded-full bg-[#F4EFF9] flex items-center justify-center text-[#7856A4] shrink-0">
                     <Calendar className="w-5 h-5" />
                   </div>
                   <div className="flex-1">
                     <p className="text-[10px] font-bold tracking-widest text-[#AFA1CE] uppercase mb-0.5">Active Sessions</p>
                     <div className="flex items-center justify-between">
                       <h3 className="text-[28px] font-bold text-[#1A1A1A] leading-none">0</h3>
                       <ArrowRight className="w-4 h-4 text-[#AFA1CE] group-hover:text-[#7856A4]" />
                     </div>
                     <p className="text-[12px] text-[#666666] mt-1">Scheduled consultations</p>
                   </div>
                </div>
                <div className="bg-white rounded-[20px] p-6 shadow-sm border border-[#EEEAF5] flex items-center gap-5 group hover:border-[#D1C4E9] transition-colors">
                   <div className="w-12 h-12 rounded-full bg-[#F8F6FC] flex items-center justify-center text-[#7856A4] shrink-0">
                     <Users className="w-5 h-5" />
                   </div>
                   <div className="flex-1">
                     <p className="text-[10px] font-bold tracking-widest text-[#AFA1CE] uppercase mb-0.5">Client Inquiries</p>
                     <div className="flex items-center justify-between">
                       <h3 className="text-[28px] font-bold text-[#1A1A1A] leading-none">0</h3>
                       <ArrowRight className="w-4 h-4 text-[#AFA1CE] group-hover:text-[#7856A4]" />
                     </div>
                     <p className="text-[12px] text-[#666666] mt-1">Guided matches</p>
                   </div>
                </div>
                <div className="bg-white rounded-[20px] p-6 shadow-sm border border-[#EEEAF5] flex items-center gap-5 group hover:border-[#D1C4E9] transition-colors">
                   <div className="w-12 h-12 rounded-full bg-[#F4EFF9] flex items-center justify-center text-[#7856A4] shrink-0">
                     <FileText className="w-5 h-5" />
                   </div>
                   <div className="flex-1">
                     <p className="text-[10px] font-bold tracking-widest text-[#AFA1CE] uppercase mb-0.5">Reflections & Posts</p>
                     <div className="flex items-center justify-between">
                       <h3 className="text-[28px] font-bold text-[#1A1A1A] leading-none">2</h3>
                       <ArrowRight className="w-4 h-4 text-[#AFA1CE] group-hover:text-[#7856A4]" />
                     </div>
                     <p className="text-[12px] text-[#666666] mt-1">Published to profile</p>
                   </div>
                </div>
                <div className="bg-white rounded-[20px] p-6 shadow-sm border border-[#EEEAF5] flex items-center gap-5 group hover:border-[#D1C4E9] transition-colors">
                   <div className="w-12 h-12 rounded-full bg-[#F8F6FC] flex items-center justify-center text-[#7856A4] shrink-0">
                     <BookOpen className="w-5 h-5" />
                   </div>
                   <div className="flex-1">
                     <p className="text-[10px] font-bold tracking-widest text-[#AFA1CE] uppercase mb-0.5">Digital Guides</p>
                     <div className="flex items-center justify-between">
                       <h3 className="text-[28px] font-bold text-[#1A1A1A] leading-none">1</h3>
                       <ArrowRight className="w-4 h-4 text-[#AFA1CE] group-hover:text-[#7856A4]" />
                     </div>
                     <p className="text-[12px] text-[#666666] mt-1">Active workbooks</p>
                   </div>
                </div>
              </div>
            </div>

            {/* CONTENT CREATION ROW */}
            <div className="flex flex-col lg:flex-row gap-6">
               {/* Left Wide */}
               <div className="flex-1 bg-white rounded-[32px] p-8 shadow-sm border border-[#EEEAF5]">
                  <div className="flex items-center justify-between border-b border-[#F0EBF7] pb-4 mb-6">
                     <div className="flex items-center gap-8">
                       <button className="text-[14px] font-bold text-[#7856A4] relative">
                         Create Post
                         <div className="absolute -bottom-[18px] left-0 right-0 h-0.5 bg-[#7856A4]" />
                       </button>
                       <button className="text-[14px] font-semibold text-[#AFA1CE] hover:text-[#666666] transition-colors">
                         Create Article
                       </button>
                       <button className="text-[14px] font-semibold text-[#AFA1CE] hover:text-[#666666] transition-colors">
                         Share Resource
                       </button>
                     </div>
                     <button className="text-[13px] font-semibold text-[#7856A4] flex items-center gap-1.5 hover:text-[#63458A]">
                       Save Draft <ArrowRight className="w-3.5 h-3.5" />
                     </button>
                  </div>

                  <div className="w-full bg-[#FCFBFA] rounded-[20px] p-5 border border-[#EEEAF5] mb-6 flex items-start gap-3">
                     <input type="text" placeholder="Share a grounding thought, clinical reflection, or prompt..." className="flex-1 bg-transparent border-none outline-none text-[#1A1A1A] placeholder-[#AFA1CE] text-[15px]" />
                     <Smile className="w-5 h-5 text-[#AFA1CE]" />
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                     <button className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#EEEAF5] bg-white text-[#666666] font-semibold text-[13px] hover:border-[#D1C4E9] transition-colors">
                       <ImageIcon className="w-4 h-4" /> Photo
                     </button>
                     <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F4EFF9] text-[#7856A4] font-semibold text-[13px] transition-colors">
                       <Video className="w-4 h-4" /> Video
                     </button>
                     <button className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#EEEAF5] bg-white text-[#666666] font-semibold text-[13px] hover:border-[#D1C4E9] transition-colors">
                       <FileText className="w-4 h-4" /> Post
                     </button>
                     <button className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#EEEAF5] bg-white text-[#666666] font-semibold text-[13px] hover:border-[#D1C4E9] transition-colors">
                       <BookOpen className="w-4 h-4" /> Article
                     </button>
                     <button className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#EEEAF5] bg-white text-[#666666] font-semibold text-[13px] hover:border-[#D1C4E9] transition-colors">
                       <Bookmark className="w-4 h-4" /> Resource
                     </button>
                  </div>
               </div>

               {/* Right Narrow */}
               <div className="w-full lg:w-[320px] bg-gradient-to-br from-[#F8F6FC] to-[#F4EFF9] rounded-[32px] p-8 shadow-sm border border-[#EAE6F0] flex flex-col items-start justify-center relative overflow-hidden">
                  <div className="absolute bottom-0 right-0 w-[200px] h-[200px] bg-[#EAE6F0] rounded-full blur-3xl opacity-60" />
                  <div className="w-12 h-12 rounded-[16px] bg-white flex items-center justify-center shadow-sm text-[#7856A4] mb-5 relative z-10">
                    <Video className="w-5 h-5" />
                  </div>
                  <h3 className="text-[18px] font-bold text-[#1A1A1A] mb-2 relative z-10">Share a video</h3>
                  <p className="text-[13px] text-[#666666] leading-relaxed mb-6 relative z-10">
                    Record or upload a video from your device. Share insights, exercises, or quick tips.
                  </p>
                  <button className="w-full bg-white text-[#7856A4] border border-[#EEEAF5] hover:border-[#D1C4E9] rounded-full py-3 text-[13px] font-bold flex items-center justify-center gap-2 shadow-sm transition-colors relative z-10">
                    <UploadCloud className="w-4 h-4" /> Upload Video
                  </button>
               </div>
            </div>

            {/* PRACTICE MANAGEMENT */}
            <div className="space-y-5 pt-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[22px] font-bold text-[#1A1A1A] tracking-tight">Practice Management</h2>
                <button className="text-[13px] font-bold text-[#7856A4] flex items-center gap-1 hover:text-[#63458A]">
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#EEEAF5] flex items-center gap-4 cursor-pointer hover:border-[#D1C4E9] transition-colors group">
                   <div className="w-12 h-12 rounded-full bg-[#F4EFF9] flex items-center justify-center text-[#7856A4] shrink-0">
                     <Calendar className="w-5 h-5" />
                   </div>
                   <div className="flex-1">
                     <h4 className="text-[15px] font-bold text-[#1A1A1A]">Availability</h4>
                     <p className="text-[13px] text-[#666666]">Manage consultation hours</p>
                   </div>
                   <div className="w-8 h-8 rounded-full border border-[#EEEAF5] group-hover:border-[#7856A4] flex items-center justify-center text-[#AFA1CE] group-hover:text-[#7856A4] transition-colors">
                     <ArrowRight className="w-4 h-4" />
                   </div>
                </div>
                <div className="bg-[#FCFBFA] rounded-[24px] p-6 shadow-sm border border-[#F0EBF7] flex items-center gap-4 cursor-pointer hover:border-[#D1C4E9] transition-colors group">
                   <div className="w-12 h-12 rounded-full bg-[#F4EFF9] flex items-center justify-center text-[#7856A4] shrink-0">
                     <DollarSign className="w-5 h-5" />
                   </div>
                   <div className="flex-1">
                     <h4 className="text-[15px] font-bold text-[#1A1A1A]">Earnings & Ledger</h4>
                     <p className="text-[13px] text-[#666666]">Session fees & payouts</p>
                   </div>
                   <div className="w-8 h-8 rounded-full border border-[#EEEAF5] group-hover:border-[#7856A4] flex items-center justify-center text-[#AFA1CE] group-hover:text-[#7856A4] transition-colors">
                     <ArrowRight className="w-4 h-4" />
                   </div>
                </div>
                <div className="bg-[#FCFBFA] rounded-[24px] p-6 shadow-sm border border-[#F0EBF7] flex items-center gap-4 cursor-pointer hover:border-[#D1C4E9] transition-colors group">
                   <div className="w-12 h-12 rounded-full bg-[#F4EFF9] flex items-center justify-center text-[#7856A4] shrink-0">
                     <Sparkles className="w-5 h-5" />
                   </div>
                   <div className="flex-1">
                     <h4 className="text-[15px] font-bold text-[#1A1A1A]">AI Portfolio</h4>
                     <p className="text-[13px] text-[#666666]">Practice styles & builder</p>
                   </div>
                   <div className="w-8 h-8 rounded-full border border-[#EEEAF5] group-hover:border-[#7856A4] flex items-center justify-center text-[#AFA1CE] group-hover:text-[#7856A4] transition-colors">
                     <ArrowRight className="w-4 h-4" />
                   </div>
                </div>
              </div>
            </div>

            {/* RECENT ACTIVITY */}
            <div className="flex flex-col lg:flex-row gap-8 pt-4">
               {/* Left Wide */}
               <div className="flex-1 space-y-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[20px] font-bold text-[#1A1A1A] tracking-tight">Recent Activity</h2>
                    <button className="text-[13px] font-bold text-[#7856A4] flex items-center gap-1 hover:text-[#63458A]">
                      View all <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-white rounded-[20px] p-5 shadow-sm border border-[#EEEAF5] flex items-center justify-between group">
                       <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-[#F8F6FC] border border-[#F0EBF7] flex items-center justify-center text-[#AFA1CE]">
                           <FileText className="w-4 h-4" />
                         </div>
                         <div>
                           <p className="text-[13.5px] font-bold text-[#1A1A1A]">You published a new reflection</p>
                           <p className="text-[12px] text-[#AFA1CE]">2 days ago</p>
                         </div>
                       </div>
                       <div className="flex items-center gap-3">
                         <span className="text-[12px] text-[#AFA1CE] italic">&quot;Building Emotional Resilience&quot;</span>
                         <ArrowRight className="w-4 h-4 text-[#EEEAF5] group-hover:text-[#AFA1CE]" />
                       </div>
                    </div>

                    <div className="bg-white rounded-[20px] p-5 shadow-sm border border-[#EEEAF5] flex items-center justify-between group">
                       <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-[#F8F6FC] border border-[#F0EBF7] flex items-center justify-center text-[#AFA1CE]">
                           <BookOpen className="w-4 h-4" />
                         </div>
                         <div>
                           <p className="text-[13.5px] font-bold text-[#1A1A1A]">You updated a digital guide</p>
                           <p className="text-[12px] text-[#AFA1CE]">5 days ago</p>
                         </div>
                       </div>
                       <div className="flex items-center gap-3">
                         <span className="text-[12px] text-[#AFA1CE] italic">Mindful Breathing Exercises</span>
                         <ArrowRight className="w-4 h-4 text-[#EEEAF5] group-hover:text-[#AFA1CE]" />
                       </div>
                    </div>
                  </div>
               </div>

               {/* Right Narrow */}
               <div className="w-full lg:w-[320px] bg-white rounded-[24px] p-6 shadow-sm border border-[#EEEAF5] flex flex-col justify-between mt-12 lg:mt-0">
                 <div>
                   <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center gap-2">
                       <div className="w-7 h-7 rounded-full bg-[#FEF3C7] flex items-center justify-center text-[#D97706]">
                         <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                       </div>
                       <span className="text-[12px] font-bold text-[#1A1A1A]">Tips for your practice</span>
                     </div>
                     <div className="flex items-center gap-1.5 text-[#AFA1CE]">
                       <span className="text-[11px] font-medium mr-1">1/3</span>
                       <button className="w-6 h-6 rounded-full border border-[#EEEAF5] flex items-center justify-center hover:text-[#1A1A1A] transition-colors"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg></button>
                       <button className="w-6 h-6 rounded-full border border-[#EEEAF5] flex items-center justify-center hover:text-[#1A1A1A] transition-colors"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg></button>
                     </div>
                   </div>
                   <h4 className="text-[15px] font-bold text-[#1A1A1A] mb-2">Create short video insights</h4>
                   <p className="text-[12.5px] text-[#666666] leading-relaxed">
                     Short, authentic videos help more people discover your work. Share a quick tip, a mindset shift, or a simple exercise.
                   </p>
                 </div>
               </div>
            </div>

          </div>
        )}{activeTab === "content" && (
          <div className="space-y-6">
            {/* Header + Filter Pills */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-sans tracking-tight text-2xl sm:text-3xl font-normal text-[#29272C]">
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
                      : "bg-white/5 border border-[#EEEAF5] text-[#C9D2BC] hover:text-white"
                  }`}
                >
                  {filter === "ALL" ? "All Content" : filter.charAt(0) + filter.slice(1).toLowerCase() + "s"}
                </button>
              ))}
            </div>

            {/* Content Feed / Grid */}
            {filteredContent.length === 0 ? (
              <div className="atmospheric-card rounded-3xl p-12 text-center max-w-md mx-auto">
                <FileText className="w-8 h-8 text-[#A99BC7] mx-auto mb-3 opacity-60" />
                <h3 className="font-sans tracking-tight text-lg text-[#29272C]">No items in this category yet</h3>
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
                        <div className="flex items-center justify-between mb-3 text-[10px] text-[#A99BC7]">
                          <span className="uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-white/5 border border-[#EEEAF5] text-white">
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
                        <h3 className="font-sans tracking-tight text-base font-normal text-[#29272C] leading-snug mb-2">
                          {item.title}
                        </h3>

                        <p className="text-xs text-[#C9D2BC] font-light line-clamp-3 leading-relaxed mb-4">
                          {item.body}
                        </p>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-3 border-t border-[#EEEAF5] flex items-center justify-between text-xs text-[#A99BC7]">
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
                <h1 className="font-sans tracking-tight text-2xl sm:text-3xl font-normal text-[#29272C]">
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
                <BookOpen className="w-8 h-8 text-[#A99BC7] mx-auto mb-3 opacity-60" />
                <h3 className="font-sans tracking-tight text-lg text-[#29272C]">No digital products listed yet</h3>
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
                      <div className="flex items-center justify-between mb-3 text-[10px] text-[#A99BC7]">
                        <span className="px-2 py-0.5 rounded-full bg-white/5 border border-[#EEEAF5] text-white font-semibold uppercase tracking-wider">
                          Digital Workbook
                        </span>
                        <span className="font-sans tracking-tight text-sm font-semibold text-[#29272C]">
                          ₹{prod.priceMajor}
                        </span>
                      </div>

                      <h3 className="font-sans tracking-tight text-base font-normal text-[#29272C] leading-snug mb-1.5">
                        {prod.title}
                      </h3>

                      <p className="text-xs text-[#C9D2BC] font-light line-clamp-3 leading-relaxed mb-4">
                        {prod.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#EEEAF5] flex items-center justify-between text-xs">
                      <span className="text-[10px] text-[#A99BC7] flex items-center gap-1">
                        <Check className="w-3 h-3 text-[#A99BC7]" />
                        <span>Instant PDF Reader</span>
                      </span>
                      <Link
                        href={`/ebooks/${prod.slug}`}
                        target="_blank"
                        className="text-xs text-white hover:underline flex items-center gap-1"
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
                <h1 className="font-sans tracking-tight text-2xl sm:text-3xl font-normal text-[#29272C]">
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
                <div className="h-16 w-16 rounded-full bg-[#244F42] border border-[#EEEAF5] flex items-center justify-center font-sans tracking-tight text-2xl text-white overflow-hidden">
                  {profile.profilePhotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.profilePhotoUrl} alt={profile.fullName} className="w-full h-full object-cover" />
                  ) : (
                    profile.fullName.charAt(0)
                  )}
                </div>
                <div>
                  <h2 className="font-sans tracking-tight text-xl sm:text-2xl font-normal text-[#29272C]">
                    {profile.fullName}
                  </h2>
                  <p className="text-xs text-[#C9D2BC] font-light">{profile.professionalTitle}</p>
                  <p className="text-[11px] text-[#A99BC7] mt-0.5">
                    {profile.yearsOfExperience} years experience • {profile.location || "Verified Online Consultation"}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#EEEAF5] space-y-2">
                <span className="text-[10px] uppercase font-semibold text-[#A99BC7] tracking-wider block">
                  Bio / Clinical Approach
                </span>
                <p className="text-xs text-[#C9D2BC] font-light leading-relaxed">
                  {profile.bio || profile.shortIntro || "No bio entered yet."}
                </p>
              </div>

              <div className="pt-4 border-t border-[#EEEAF5] flex flex-wrap items-center justify-between gap-4">
                <span className="text-xs text-[#A99BC7]">
                  Authenticated as <strong className="text-[#29272C]">{user.email}</strong>
                </span>

                <form action="/api/auth/logout" method="POST">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 text-xs text-[#C9D2BC] hover:text-white px-3 py-1.5 rounded-full bg-white/5 border border-[#EEEAF5] transition-colors"
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
                  <h3 className="text-xs font-semibold text-[#29272C]">Edit Profile Information</h3>
                  <p className="text-[11px] text-[#C9D2BC] font-light">Bio, titles, specializations, photo</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#A99BC7] group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/app/psychologist/verification"
                className="atmospheric-card rounded-2xl p-4 flex items-center justify-between hover:border-[#9CAF91]/50 transition-all group"
              >
                <div>
                  <h3 className="text-xs font-semibold text-[#29272C]">Clinical Verification</h3>
                  <p className="text-[11px] text-[#C9D2BC] font-light">License documents and accreditation</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#A99BC7] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* ============================== '+ CREATE' MODAL SHEET ============================== */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full sm:max-w-lg bg-[#FAF8F2] border border-[#EEEAF5] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Sheet Header */}
            <div className="px-5 py-4 border-b border-[#EEEAF5] flex items-center justify-between">
              <div>
                <h3 className="font-sans tracking-tight text-lg font-normal text-[#29272C]">Create New Content</h3>
                <p className="text-[11px] text-[#A99BC7] font-light">
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
            <div className="grid grid-cols-5 p-2 bg-[#122C25] border-b border-[#EEEAF5] text-center text-[10px]">
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
                <label className="text-[11px] font-semibold text-[#A99BC7] uppercase tracking-wider block mb-1">
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
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-[#EEEAF5] text-xs text-[#29272C] placeholder-[#9CAF91]/60 focus:outline-none focus:border-[#F1EBDD]"
                />
              </div>

              {/* Video Creation Section: Upload Video File vs Add Video Link */}
              {createType === "video" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-1 bg-[#122C25] rounded-xl border border-[#EEEAF5]">
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
                        <label className="border-2 border-dashed border-[#EAE6F0] hover:border-[#9CAF91] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-white/5 hover:bg-white/10 transition-all text-center group">
                          <input
                            type="file"
                            accept="video/mp4,video/quicktime,video/webm"
                            onChange={handleVideoSelect}
                            className="hidden"
                          />
                          <div className="h-12 w-12 rounded-full bg-[#244F42] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                            <UploadCloud className="w-6 h-6" />
                          </div>
                          <span className="text-xs font-semibold text-[#29272C] block">
                            Choose video from phone or computer
                          </span>
                          <span className="text-[11px] text-[#C9D2BC] font-light">
                            Supports MP4, MOV, WebM • Up to 50MB
                          </span>
                        </label>
                      ) : (
                        <div className="space-y-3">
                          {/* Live Native Video Preview Player */}
                          <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-[#EEEAF5]">
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
                              <div className="flex justify-between text-[11px] text-[#A99BC7]">
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
                            <div className="flex items-center justify-between text-xs px-2 text-[#A99BC7]">
                              <span className="flex items-center gap-1.5 text-white">
                                <Check className="w-3.5 h-3.5 text-[#A99BC7]" />
                                <span>Ready to publish</span>
                              </span>
                              <label className="text-[11px] text-[#C9D2BC] hover:text-white underline cursor-pointer">
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
                      <label className="text-[11px] font-semibold text-[#A99BC7] uppercase tracking-wider block mb-1">
                        Video / Reel URL
                      </label>
                      <input
                        type="url"
                        value={formMediaUrl}
                        onChange={(e) => setFormMediaUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=... or direct video link"
                        className="w-full h-11 px-4 rounded-xl bg-white/5 border border-[#EEEAF5] text-xs text-[#29272C] placeholder-[#9CAF91]/60 focus:outline-none focus:border-[#F1EBDD]"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Photo Creation Section: File Upload or Link */}
              {createType === "photo" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-1 bg-[#122C25] rounded-xl border border-[#EEEAF5]">
                    <button
                      type="button"
                      onClick={() => setPhotoSourceMode("upload")}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        photoSourceMode === "upload"
                          ? "bg-[#F1EBDD] text-[#173C32] font-semibold"
                          : "text-[#C9D2BC] hover:text-white"
                      }`}
                    >
                      Upload Photo File
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoSourceMode("link")}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        photoSourceMode === "link"
                          ? "bg-[#F1EBDD] text-[#173C32] font-semibold"
                          : "text-[#C9D2BC] hover:text-white"
                      }`}
                    >
                      Paste Image Link
                    </button>
                  </div>

                  {photoSourceMode === "upload" ? (
                    <div>
                      {!formMediaUrl ? (
                        <label className="border-2 border-dashed border-[#EAE6F0] hover:border-[#9CAF91] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-white/5 hover:bg-white/10 transition-all text-center group">
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            onChange={handlePhotoSelect}
                            className="hidden"
                          />
                          <div className="h-12 w-12 rounded-full bg-[#244F42] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                            <UploadCloud className="w-6 h-6" />
                          </div>
                          <span className="text-xs font-semibold text-[#29272C] block">
                            Choose photo from phone or computer
                          </span>
                          <span className="text-[11px] text-[#C9D2BC] font-light">
                            Supports JPEG, PNG, WebP • Up to 10MB
                          </span>
                        </label>
                      ) : (
                        <div className="space-y-3">
                          <div className="relative rounded-2xl overflow-hidden bg-black/40 h-48 flex items-center justify-center border border-[#EEEAF5]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={formMediaUrl} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex items-center justify-between text-xs px-2 text-[#A99BC7]">
                            <span className="flex items-center gap-1.5 text-white">
                              <Check className="w-3.5 h-3.5 text-[#A99BC7]" />
                              <span>Photo ready to publish</span>
                            </span>
                            <label className="text-[11px] text-[#C9D2BC] hover:text-white underline cursor-pointer">
                              <span>Change photo</span>
                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                onChange={handlePhotoSelect}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label className="text-[11px] font-semibold text-[#A99BC7] uppercase tracking-wider block mb-1">
                        Photo Image URL (or Unsplash link)
                      </label>
                      <input
                        type="url"
                        value={formMediaUrl}
                        onChange={(e) => setFormMediaUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full h-11 px-4 rounded-xl bg-white/5 border border-[#EEEAF5] text-xs text-[#29272C] placeholder-[#9CAF91]/60 focus:outline-none focus:border-[#F1EBDD]"
                      />
                      {formMediaUrl && (
                        <div className="mt-2 h-36 rounded-xl overflow-hidden bg-black/40 border border-[#EEEAF5] relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={formMediaUrl} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Optional Media Attachment for Post, Article, Resource */}
              {(createType === "post" || createType === "article" || createType === "resource") && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-[#A99BC7] uppercase tracking-wider block">
                      Attachment (Optional Photo or Video)
                    </label>
                    {formMediaUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormMediaUrl("");
                          setVideoPreviewUrl(null);
                          setVideoFile(null);
                          setPhotoFile(null);
                        }}
                        className="text-[10px] text-red-300 hover:underline"
                      >
                        Remove attachment
                      </button>
                    )}
                  </div>

                  {!formMediaUrl ? (
                    <label className="border border-dashed border-[#EAE6F0] hover:border-[#F1EBDD] rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer bg-white/5 hover:bg-white/10 transition-all text-center">
                      <input
                        type="file"
                        accept="image/*,video/mp4,video/quicktime,video/webm"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file?.type.startsWith("video/")) {
                            handleVideoSelect(e);
                          } else {
                            handlePhotoSelect(e);
                          }
                        }}
                        className="hidden"
                      />
                      <UploadCloud className="w-4 h-4 text-[#A99BC7]" />
                      <span className="text-xs text-[#29272C] font-medium">
                        Upload photo or video from device
                      </span>
                    </label>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden bg-black/40 border border-[#EEEAF5] h-36 flex items-center justify-center">
                      {formMediaUrl.match(/\.(mp4|webm|mov)($|\?)/i) || videoPreviewUrl ? (
                        <video
                          src={videoPreviewUrl || formMediaUrl}
                          controls
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={formMediaUrl}
                          alt="Attached media"
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Reflection Body / Content */}
              <div>
                <label className="text-[11px] font-semibold text-[#A99BC7] uppercase tracking-wider block mb-1">
                  {createType === "article" ? "Article Body (Markdown supported)" : "Caption / Reflection Notes"}
                </label>
                <textarea
                  rows={createType === "article" ? 6 : 3}
                  value={formBody}
                  onChange={(e) => setFormBody(e.target.value)}
                  placeholder="Add your clinical thoughts, guidance, or psychoeducational message here..."
                  className="w-full p-3 rounded-xl bg-white/5 border border-[#EEEAF5] text-xs text-[#29272C] placeholder-[#9CAF91]/60 focus:outline-none focus:border-[#F1EBDD] resize-none"
                />
              </div>

              {/* Tag / Clinical Theme */}
              <div>
                <label className="text-[11px] font-semibold text-[#A99BC7] uppercase tracking-wider block mb-1">
                  Focus Theme
                </label>
                <select
                  value={formTag}
                  onChange={(e) => setFormTag(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#122C25] border border-[#EEEAF5] text-xs text-[#29272C] focus:outline-none focus:border-[#F1EBDD]"
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
          <div className="w-full sm:max-w-md bg-[#FAF8F2] border border-[#EEEAF5] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-[#EEEAF5] flex items-center justify-between">
              <div>
                <h3 className="font-sans tracking-tight text-lg font-normal text-[#29272C]">Add Digital Product</h3>
                <p className="text-[11px] text-[#A99BC7] font-light">E-Book or Guided Workbook</p>
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
                <label className="text-[11px] font-semibold text-[#A99BC7] uppercase tracking-wider block mb-1">
                  Product Title
                </label>
                <input
                  type="text"
                  required
                  value={prodTitle}
                  onChange={(e) => setProdTitle(e.target.value)}
                  placeholder="e.g. The Anxiety Companion Workbook"
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-[#EEEAF5] text-xs text-[#29272C] placeholder-[#9CAF91]/60 focus:outline-none focus:border-[#F1EBDD]"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#A99BC7] uppercase tracking-wider block mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  placeholder="Summarize what exercises and insights are inside this companion..."
                  className="w-full p-3 rounded-xl bg-white/5 border border-[#EEEAF5] text-xs text-[#29272C] placeholder-[#9CAF91]/60 focus:outline-none focus:border-[#F1EBDD] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#A99BC7] uppercase tracking-wider block mb-1">
                    Price (INR)
                  </label>
                  <input
                    type="number"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    placeholder="499"
                    className="w-full h-11 px-4 rounded-xl bg-white/5 border border-[#EEEAF5] text-xs text-[#29272C] focus:outline-none focus:border-[#F1EBDD]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#A99BC7] uppercase tracking-wider block mb-1">
                    Format
                  </label>
                  <div className="h-11 px-3 rounded-xl bg-white/5 border border-[#EEEAF5] text-xs text-[#C9D2BC] flex items-center">
                    PDF & Reader
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#A99BC7] uppercase tracking-wider block mb-1">
                  Cover Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={prodCoverUrl}
                  onChange={(e) => setProdCoverUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-[#EEEAF5] text-xs text-[#29272C] placeholder-[#9CAF91]/60 focus:outline-none focus:border-[#F1EBDD]"
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
          <div className="relative w-full max-w-2xl bg-[#FAF8F2] rounded-3xl border border-[#EAE6F0] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#EEEAF5] bg-[#122C25]/90">
              <div className="pr-4">
                <h3 className="font-sans tracking-tight text-lg text-[#29272C] font-medium line-clamp-1">
                  {watchingVideo.title}
                </h3>
                <span className="text-[11px] text-[#A99BC7]">Native Video Reflection</span>
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
              <div className="p-4 sm:p-5 bg-[#FAF8F2] text-xs text-[#C9D2BC] font-light border-t border-[#EEEAF5] max-h-32 overflow-y-auto">
                <p className="leading-relaxed whitespace-pre-wrap">{watchingVideo.caption}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================== MOBILE BOTTOM NAVIGATION BAR ============================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#122C25]/95 backdrop-blur-md border-t border-[#EEEAF5] px-4 h-16 flex items-center justify-around">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center gap-1 transition-colors min-w-[50px] ${
            activeTab === "home" ? "text-white" : "text-[#A99BC7]"
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Home</span>
        </button>

        <button
          onClick={() => setActiveTab("content")}
          className={`flex flex-col items-center gap-1 transition-colors min-w-[50px] ${
            activeTab === "content" ? "text-white" : "text-[#A99BC7]"
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
            activeTab === "products" ? "text-white" : "text-[#A99BC7]"
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] font-medium">Products</span>
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`flex flex-col items-center gap-1 transition-colors min-w-[50px] ${
            activeTab === "profile" ? "text-white" : "text-[#A99BC7]"
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium">Profile</span>
        </button>
      </nav>
    </div>
  );
}



