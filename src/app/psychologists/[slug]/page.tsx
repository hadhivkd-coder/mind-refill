import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ProfileService } from "@/modules/profiles/services/profile.service";
import { ContentService } from "@/modules/content/services/content.service";
import {
  ShieldCheck,
  Award,
  Briefcase,
  Globe,
  Calendar,
  ArrowLeft,
  Check,
  Clock,
  Video,
  MapPin,
  BookOpen,
  FileText,
  UserPlus,
} from "lucide-react";

interface ProfilePageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  try {
    const profile = await ProfileService.getPublicProfileBySlug(params.slug);
    if (!profile) return { title: "Profile Not Found | Mind Refill" };
    return {
      title: `${profile.fullName} | Verified Psychologist | Mind Refill`,
      description: profile.shortIntro || `Book a session with ${profile.fullName}.`,
    };
  } catch (err) {
    return { title: "Psychologist | Mind Refill" };
  }
}

export default async function PublicPsychologistProfilePage({ params }: ProfilePageProps) {
  let profile;
  let articles: any[] = [];
  
  try {
    profile = await ProfileService.getPublicProfileBySlug(params.slug);
    if (!profile) return notFound();
    
    // Also fetch their public articles if any
    try {
      const articlesRes = await ContentService.listPublicArticles(1, 4);
      // For now we just mock filtering by author since the backend might not have this exposed cleanly
      // If we had `listArticlesByAuthor`, we would use it here. 
      // We will just show some content as a placeholder to respect "Instagram simplicity content feed".
      articles = articlesRes.items || [];
    } catch (e) {
      console.error("Failed to load articles for profile:", e);
    }
  } catch (error) {
    return notFound();
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#FAF8F2] text-[#29272C] selection:bg-[#A99BC7] selection:text-white pb-20 sm:pb-0">
      <Navbar />

      <main className="flex-grow">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-12">
          
          {/* Back Button */}
          <div>
            <Link
              href="/psychologists"
              className="inline-flex items-center gap-2 text-[#A99BC7] hover:text-[#62547F] text-[14px] font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Directory
            </Link>
          </div>

          {/* Header Profile Section */}
          <header className="flex flex-col md:flex-row gap-8 md:gap-10 items-start">
            <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden flex-shrink-0 bg-white border border-[#EEEAF5] shadow-sm">
              {profile.profilePhotoUrl ? (
                <Image
                  src={profile.profilePhotoUrl}
                  alt={profile.fullName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#A99BC7]">
                  <UserPlus className="w-12 h-12" />
                </div>
              )}
            </div>

            <div className="space-y-5 flex-1">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-3xl md:text-4xl font-medium text-[#29272C] tracking-tight">
                    {profile.fullName}
                  </h1>
                  {profile.isVerified && (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EAE6F0] text-[#62547F] text-[11px] font-medium tracking-wide uppercase">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#AAB8A2]" />
                      Verified
                    </div>
                  )}
                </div>
                <p className="text-[16px] text-[#62547F] mt-1.5 font-light">
                  {profile.professionalTitle}
                </p>
                <div className="flex flex-wrap gap-4 mt-3 text-[13.5px] text-[#A99BC7]">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> {profile.yearsOfExperience} yrs exp
                  </span>
                  {profile.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" /> {profile.location}
                    </span>
                  )}
                  {profile.languages && profile.languages.length > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-4 h-4" /> {profile.languages.map((l: any) => l.name).join(", ")}
                    </span>
                  )}
                </div>
              </div>

              {profile.shortIntro && (
                <p className="text-[15px] md:text-[16px] text-[#62547F] font-light leading-relaxed max-w-2xl">
                  {profile.shortIntro}
                </p>
              )}

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href={`/psychologists/${profile.slug}/book`}
                  className="h-12 px-8 rounded-full bg-[#29272C] hover:bg-[#62547F] text-white font-medium text-[14px] flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <Calendar className="w-4 h-4" />
                  Book a session
                </Link>
                <button
                  className="h-12 px-6 rounded-full bg-white border border-[#EEEAF5] hover:border-[#A99BC7] text-[#62547F] font-medium text-[14px] flex items-center justify-center transition-colors shadow-sm"
                >
                  Follow for updates
                </button>
              </div>
            </div>
          </header>

          <hr className="border-[#EEEAF5]" />

          {/* About & Approach */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-8 space-y-12">
              <section className="space-y-4">
                <h2 className="text-xl font-medium text-[#29272C]">About</h2>
                <div className="prose prose-sm md:prose-base prose-p:text-[#62547F] prose-p:font-light prose-p:leading-relaxed">
                  {profile.bio.split("\n").map((para: string, idx: number) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>
              </section>

              {profile.professionalApproach && (
                <section className="space-y-4">
                  <h2 className="text-xl font-medium text-[#29272C]">Therapeutic Approach</h2>
                  <div className="prose prose-sm md:prose-base prose-p:text-[#62547F] prose-p:font-light prose-p:leading-relaxed">
                    {profile.professionalApproach.split("\n").map((para: string, idx: number) => (
                      <p key={idx}>{para}</p>
                    ))}
                  </div>
                </section>
              )}

              {/* Content Feed (Instagram Simplicity) */}
              <section className="space-y-6 pt-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-medium text-[#29272C]">Recent Content</h2>
                  <Link href={`/psychologists/${profile.slug}/content`} className="text-sm font-medium text-[#62547F] hover:text-[#29272C]">
                    View all
                  </Link>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {articles.length > 0 ? articles.map((article: any) => (
                    <Link href={`/resources/${article.slug}`} key={article.id} className="group block space-y-3 p-3 rounded-2xl bg-white border border-[#EEEAF5] hover:border-[#A99BC7] transition-all">
                      <div className="relative w-full aspect-square rounded-xl bg-[#F7F5FA] overflow-hidden">
                        {article.coverImageUrl ? (
                          <Image src={article.coverImageUrl} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-[#A99BC7]">
                            <FileText className="w-8 h-8 opacity-50" />
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-[11px] font-medium text-[#A99BC7] uppercase tracking-wider">{article.category?.name || "Article"}</span>
                        <h3 className="text-[14px] font-medium text-[#29272C] leading-snug line-clamp-2 mt-1">{article.title}</h3>
                      </div>
                    </Link>
                  )) : (
                    <div className="col-span-full py-8 text-center text-[#A99BC7] font-light bg-[#F7F5FA] rounded-2xl">
                      No recent content available.
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Sidebar (Specializations, Qualifications, Availability) */}
            <div className="md:col-span-4 space-y-8">
              <div className="p-6 rounded-2xl bg-white border border-[#EEEAF5] shadow-sm space-y-6">
                
                {profile.specializations && profile.specializations.length > 0 && (
                  <div>
                    <h3 className="text-[14px] font-medium text-[#29272C] mb-3 uppercase tracking-wider">Specializations</h3>
                    <div className="flex flex-col gap-2.5">
                      {profile.specializations.map((spec: any) => (
                        <div key={spec.id} className="flex items-start gap-2 text-[14px] text-[#62547F]">
                          <Check className="w-4 h-4 text-[#AAB8A2] mt-0.5 flex-shrink-0" />
                          <span>{spec.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <hr className="border-[#EEEAF5]" />

                {profile.qualifications && profile.qualifications.length > 0 && (
                  <div>
                    <h3 className="text-[14px] font-medium text-[#29272C] mb-3 uppercase tracking-wider">Qualifications</h3>
                    <div className="space-y-4">
                      {profile.qualifications.map((qual: any) => (
                        <div key={qual.id} className="flex gap-3">
                          <Award className="w-4 h-4 text-[#A99BC7] flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[13px] font-medium text-[#29272C]">{qual.degree}</p>
                            <p className="text-[12px] text-[#62547F] mt-0.5">{qual.institution}, {qual.yearObtained}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <hr className="border-[#EEEAF5]" />

                <div>
                  <h3 className="text-[14px] font-medium text-[#29272C] mb-3 uppercase tracking-wider">Availability</h3>
                  <div className="flex items-start gap-2 p-3 bg-[#F7F5FA] rounded-xl text-[13px] text-[#62547F]">
                    <Video className="w-4 h-4 text-[#A99BC7] flex-shrink-0 mt-0.5" />
                    <span>Accepting new clients for online video sessions.</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
          
        </article>
      </main>
      
      {/* Sticky Mobile Booking Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-[#EEEAF5] z-50">
        <Link
          href={`/psychologists/${profile.slug}/book`}
          className="w-full h-14 rounded-full bg-[#29272C] text-white font-medium text-[15px] flex items-center justify-center gap-2 shadow-lg"
        >
          <Calendar className="w-5 h-5" />
          Book a session
        </Link>
      </div>

      <Footer />
    </div>
  );
}
