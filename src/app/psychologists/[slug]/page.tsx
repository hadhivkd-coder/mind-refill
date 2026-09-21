import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ProfileService } from "@/modules/profiles/services/profile.service";
import { PortfolioService } from "@/modules/portfolio/services/portfolio.service";
import {
  ShieldCheck,
  Award,
  Briefcase,
  Globe,
  Calendar,
  ArrowLeft,
  Sparkles,
  Check,
  HeartHandshake,
  Clock,
  Video,
  MapPin,
  ArrowRight,
  BookOpen,
  FileText,
  Play,
  Instagram,
} from "lucide-react";
import { ProfileReflections } from "./profile-reflections";

interface ProfilePageProps {
  params: { slug: string };
}

const FALLBACK_PROFILES: Record<string, any> = {
  "dr-sarah-jenkins": {
    id: "demo-1",
    slug: "dr-sarah-jenkins",
    fullName: "Dr. Sarah Jenkins, Ph.D.",
    professionalTitle: "Licensed Clinical Psychologist & CBT Specialist",
    profilePhotoUrl: "https://images.unsplash.com/photo-1594824813637-2804b494632b?auto=format&fit=crop&q=80&w=600",
    shortIntro:
      "Helping individuals untangle chronic anxiety, panic loops, and executive burnout using evidence-based cognitive and somatic methods.",
    bio: "Dr. Sarah Jenkins is a licensed clinical psychologist with over 12 years of experience providing compassionate, evidence-based psychological care. She integrates cognitive-behavioral therapy (CBT), acceptance-based frameworks, and somatic regulation to support individuals facing persistent anxiety, panic, and professional burnout.\n\nHer clinical approach emphasizes establishing a secure, non-judgmental therapeutic alliance where clients can explore behavioral loops without shame while acquiring practical somatic and cognitive skills.",
    professionalApproach:
      "I view therapy as a collaborative partnership. We begin by identifying your values, your symptoms, and how your nervous system responds to daily pressure. Together, we establish practical strategies for emotional grounding while carefully examining underlying cognitive patterns.",
    whoTheyHelp: [
      "High-achieving professionals coping with chronic pressure and imposter feelings.",
      "Individuals experiencing panic symptoms, intrusive thoughts, and generalized worry.",
      "Clients navigating major life changes and grief.",
    ],
    yearsOfExperience: 12,
    location: "London, UK (Online Globally)",
    timezone: "GMT / UTC+0",
    isVerified: true,
    sessionFee: "₹1,800",
    availability: "Accepting new clients for online video sessions",
    specializations: [
      { id: "s1", name: "Anxiety & Stress Management" },
      { id: "s2", name: "Trauma & Somatic Grounding" },
      { id: "s3", name: "Career Burnout & Perfectionism" },
    ],
    languages: [
      { id: "l1", name: "English", nativeName: "English" },
      { id: "l2", name: "French", nativeName: "Français" },
    ],
    qualifications: [
      { id: "q1", degree: "Ph.D. in Clinical Psychology", institution: "University College London", yearObtained: 2012, description: "Doctoral dissertation on cognitive avoidance in panic disorders." },
      { id: "q2", degree: "B.Sc. (Hons) in Psychology", institution: "University of Edinburgh", yearObtained: 2007, description: "First class honors." },
    ],
    experiences: [
      { id: "e1", roleTitle: "Consultant Clinical Psychologist", organization: "Camden & Islington NHS Foundation Trust", description: "Led complex anxiety outpatient clinic." },
      { id: "e2", roleTitle: "Private Practice Director", organization: "Mind Refill Psychological Network", description: "Providing international tele-psychology care." },
    ],
    posts: [
      {
        id: "p0-video",
        type: "video",
        mediaUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?auto=format&fit=crop&q=80&w=600",
        caption: "A 60-second breathing technique to down-regulate your nervous system before entering stressful conversations.",
        date: "Today",
      },
      {
        id: "p1",
        type: "photo",
        mediaUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=500",
        caption: "Giving yourself permission to pause isn't giving up. It's the moment your nervous system begins to reset.",
        date: "2 days ago",
      },
      {
        id: "p2",
        type: "quote",
        caption: "“You don't have to fix the whole mountain today. You only have to take one gentle step on the path.”",
        date: "5 days ago",
      },
      {
        id: "p3",
        type: "photo",
        mediaUrl: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&q=80&w=500",
        caption: "Morning somatic check-in: 3 slow breaths, shoulders dropping away from ears, noticing feet on the floor.",
        date: "1 week ago",
      },
    ],
    products: [
      {
        id: "prod-1",
        title: "The Overcoming Anxiety Companion Workbook",
        description: "A 4-week CBT and somatic daily grounding guide to tame racing thoughts and reclaim peaceful evenings.",
        price: "₹299",
        coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400",
        slug: "overcoming-anxiety-companion-workbook",
      },
    ],
  },
};

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const fallback = FALLBACK_PROFILES[params.slug] || FALLBACK_PROFILES["dr-sarah-jenkins"];
  return {
    title: `${fallback.fullName} | Verified Psychologist | Mind Refill`,
    description: fallback.shortIntro,
  };
}

export default async function PublicPsychologistProfilePage({ params }: ProfilePageProps) {
  const profile = FALLBACK_PROFILES[params.slug] || FALLBACK_PROFILES["dr-sarah-jenkins"];

  return (
    <div className="min-h-screen flex flex-col bg-[#173C32] text-[#F7F3E9] selection:bg-[#3F6855] selection:text-[#F1EBDD] pb-20 sm:pb-0">
      <Navbar />

      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 w-full">
        {/* Back Link */}
        <div>
          <Link
            href="/psychologists"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#9CAF91] hover:text-[#F1EBDD] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Psychologists</span>
          </Link>
        </div>

        {/* Profile Header Hero */}
        <section className="atmospheric-card p-6 sm:p-10 rounded-3xl border border-white/10 shadow-xl relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Left Photo */}
            <div className="md:col-span-4 relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#122C25] border border-white/15 shadow-lg">
              <Image
                src={profile.profilePhotoUrl}
                alt={profile.fullName}
                fill
                priority
                className="object-cover object-center"
              />
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#173C32]/90 backdrop-blur-md border border-[#9CAF91]/30 flex items-center gap-1.5 text-[11px] text-[#9CAF91] font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#9CAF91]" />
                <span>Verified</span>
              </div>
            </div>

            {/* Right Details */}
            <div className="md:col-span-8 space-y-5">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-[#9CAF91]">
                  Clinical Practitioner
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#F7F3E9] mt-1">
                  {profile.fullName}
                </h1>
                <p className="text-sm text-[#C9D2BC] font-medium mt-1">
                  {profile.professionalTitle} • {profile.yearsOfExperience} years practice
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-[#9CAF91] mt-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {profile.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" />
                    Languages: {profile.languages.map((l: any) => l.name).join(", ")}
                  </span>
                </div>
              </div>

              <p className="font-serif italic text-base sm:text-lg text-[#F1EBDD]/90 leading-relaxed border-l-2 border-[#9CAF91]/40 pl-4 py-1">
                &ldquo;{profile.shortIntro}&rdquo;
              </p>

              {/* Specialization Badges */}
              <div className="flex flex-wrap gap-2 pt-1">
                {profile.specializations.map((spec: any) => (
                  <span
                    key={spec.id}
                    className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#C9D2BC]"
                  >
                    {spec.name}
                  </span>
                ))}
              </div>

              {/* Booking Action Card */}
              <div className="pt-4 p-5 rounded-2xl bg-[#122C25]/80 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-[#9CAF91] block">Consultation Fee</span>
                  <span className="font-serif text-2xl font-bold text-[#F1EBDD]">
                    {profile.sessionFee}
                  </span>
                  <span className="text-[11px] text-[#C9D2BC]/70 block mt-0.5">
                    50-minute private video consultation
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href={`/intake?preferredPsychologist=${profile.slug}`}
                    className="h-12 px-7 rounded-full bg-[#F1EBDD] hover:bg-white text-[#173C32] font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Book a Session</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Tabs / Feed: Social & Professional Portfolio */}
        <section className="space-y-6">
          <div className="border-b border-white/10 pb-3 flex items-center justify-between">
            <h2 className="font-serif text-2xl font-medium text-[#F7F3E9]">
              Reflections & Shared Insights
            </h2>
            <span className="text-xs text-[#9CAF91]">
              Recent posts & guides
            </span>
          </div>

          {/* Mind Refill Content & Reflections Grid with Native Video Playback */}
          <ProfileReflections posts={profile.posts || []} psychologistName={profile.fullName} />
        </section>

        {/* Books & Digital Products */}
        {profile.products && profile.products.length > 0 && (
          <section className="space-y-6">
            <div className="border-b border-white/10 pb-3 flex items-center justify-between">
              <h2 className="font-serif text-2xl font-medium text-[#F7F3E9]">
                Books & Workbooks
              </h2>
              <span className="text-xs text-[#9CAF91]">
                Interactive self-guided material
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {profile.products.map((prod: any) => (
                <div
                  key={prod.id}
                  className="atmospheric-card p-6 rounded-3xl border border-white/10 flex flex-col sm:flex-row gap-5 items-center justify-between group"
                >
                  <div className="relative w-24 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-[#122C25] shadow">
                    <Image
                      src={prod.coverUrl}
                      alt={prod.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-2 flex-grow text-center sm:text-left">
                    <h3 className="font-serif text-lg font-medium text-[#F7F3E9]">
                      {prod.title}
                    </h3>
                    <p className="text-xs text-[#C9D2BC]/90 font-light leading-relaxed">
                      {prod.description}
                    </p>
                    <div className="flex items-center justify-center sm:justify-start gap-3 pt-1">
                      <span className="font-serif text-base font-bold text-[#F1EBDD]">
                        {prod.price}
                      </span>
                      <Link
                        href={`/ebooks/${prod.slug}`}
                        className="px-4 py-1.5 rounded-full bg-[#F1EBDD] text-[#173C32] text-xs font-semibold hover:bg-white transition-colors"
                      >
                        Read & Access
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Clinical Approach & Credentials */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          <div className="atmospheric-card p-8 rounded-3xl space-y-4 border border-white/10">
            <h3 className="font-serif text-2xl font-medium text-[#F7F3E9]">
              Therapeutic Approach
            </h3>
            <p className="text-xs sm:text-sm text-[#C9D2BC] font-light leading-relaxed whitespace-pre-line">
              {profile.bio}
            </p>
          </div>

          <div className="atmospheric-card p-8 rounded-3xl space-y-4 border border-white/10">
            <h3 className="font-serif text-2xl font-medium text-[#F7F3E9]">
              Qualifications & Credentials
            </h3>
            <div className="space-y-4">
              {profile.qualifications?.map((q: any) => (
                <div key={q.id} className="border-l-2 border-[#9CAF91]/50 pl-3.5 space-y-0.5">
                  <div className="text-xs font-semibold text-[#F1EBDD]">{q.degree}</div>
                  <div className="text-[11px] text-[#9CAF91]">{q.institution} • {q.yearObtained}</div>
                </div>
              ))}
              {profile.experiences?.map((e: any) => (
                <div key={e.id} className="border-l-2 border-[#9CAF91]/50 pl-3.5 space-y-0.5">
                  <div className="text-xs font-semibold text-[#F1EBDD]">{e.roleTitle}</div>
                  <div className="text-[11px] text-[#9CAF91]">{e.organization}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Mobile Sticky Booking Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-3.5 bg-[#173C32]/95 backdrop-blur-md border-t border-white/15 z-30 flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] text-[#9CAF91] uppercase tracking-wider block">Session</span>
          <span className="font-serif text-lg font-bold text-[#F1EBDD]">{profile.sessionFee}</span>
        </div>
        <Link
          href={`/intake?preferredPsychologist=${profile.slug}`}
          className="h-11 px-6 rounded-full bg-[#F1EBDD] text-[#173C32] font-semibold text-xs flex items-center justify-center gap-1.5 shadow"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Book Session</span>
        </Link>
      </div>

      <Footer />
    </div>
  );
}
