import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ProfileService } from "@/modules/profiles/services/profile.service";
import { PortfolioService } from "@/modules/portfolio/services/portfolio.service";
import {
  ShieldCheck,
  Award,
  Briefcase,
  Globe,
  Calendar,
  ArrowLeft,
  ExternalLink,
  Sparkles,
  Check,
  HeartHandshake,
  Clock,
  Video,
} from "lucide-react";

interface ProfilePageProps {
  params: { slug: string };
}

const FALLBACK_PROFILE = {
  id: "demo-1",
  slug: "dr-sarah-jenkins",
  fullName: "Dr. Sarah Jenkins, Ph.D.",
  professionalTitle: "Licensed Clinical Psychologist & CBT Specialist",
  profilePhotoUrl: null,
  shortIntro:
    "Helping individuals navigate anxiety, stress, and life transitions with evidence-based care.",
  bio: "Dr. Sarah Jenkins is a licensed clinical psychologist with over 12 years of experience providing compassionate, evidence-based psychological care. She integrates cognitive-behavioral therapy (CBT) and mindfulness-based interventions to support individuals facing anxiety disorders, panic, and professional burnout.\n\nHer clinical approach emphasizes establishing a secure, non-judgmental therapeutic alliance where clients can explore deep-seated behavioral loops while acquiring concrete somatic and cognitive tools.",
  professionalApproach:
    "I view therapy as a collaborative partnership. We begin by identifying your values, symptoms, and existing coping mechanisms. Together, we establish practical strategies for daily emotional regulation while examining underlying cognitive patterns.",
  yearsOfExperience: 12,
  location: "London, UK",
  timezone: "Europe/London",
  isVerified: true,
  specializations: [
    { id: "s1", name: "Anxiety & Stress Management" },
    { id: "s2", name: "Trauma & PTSD" },
    { id: "s3", name: "Career Burnout & Exhaustion" },
  ],
  languages: [
    { id: "l1", name: "English", nativeName: "English" },
    { id: "l2", name: "French", nativeName: "Français" },
  ],
  qualifications: [
    { id: "q1", degree: "Ph.D. in Clinical Psychology", institution: "University College London", yearObtained: 2014, description: "Doctoral research focused on cognitive vulnerability in anxiety disorders." },
    { id: "q2", degree: "M.Sc. in Psychological Sciences", institution: "King's College London", yearObtained: 2010, description: "Specialized clinical focus in adult neuropsychiatry." },
  ],
  experiences: [
    { id: "e1", roleTitle: "Lead Clinical Psychologist", organization: "Harley Health Mental Health Centre", description: "Supervising outpatient psychotherapy and individual CBT cohorts." },
    { id: "e2", roleTitle: "Senior Psychologist", organization: "NHS Foundation Trust", description: "Primary care psychological therapies and acute crisis stabilization." },
  ],
  socialLinks: [],
};

export async function generateMetadata({ params }: ProfilePageProps): Promise<any> {
  try {
    const profile = await ProfileService.getPublicProfileBySlug(params.slug);
    const title = profile.seoTitle || `${profile.fullName} | Verified ${profile.professionalTitle}`;
    const description =
      profile.seoDescription ||
      profile.shortIntro ||
      `Consult with ${profile.fullName}, verified psychologist with ${profile.yearsOfExperience} years of experience.`;

    return {
      title,
      description,
      openGraph: { title, description, type: "profile" },
    };
  } catch {
    return {
      title: "Dr. Sarah Jenkins, Ph.D. | Verified Psychologist",
      description: "Consult with verified psychologist Dr. Sarah Jenkins specializing in CBT and anxiety.",
    };
  }
}

export default async function PublicPsychologistProfilePage({ params }: ProfilePageProps) {
  let profile: any;
  let portfolioData: any = null;

  try {
    profile = await ProfileService.getPublicProfileBySlug(params.slug);
    portfolioData = await PortfolioService.getPublicPortfolioBySlug(params.slug);
  } catch {
    // If slug matches demo or DB offline, gracefully fallback
    if (params.slug === "dr-sarah-jenkins" || params.slug === "demo-1") {
      profile = FALLBACK_PROFILE;
    } else {
      notFound();
    }
  }

  const portfolio = portfolioData?.publishedContent;

  return (
    <main className="min-h-screen bg-cream-50 py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      <div className="max-w-4xl mx-auto space-y-8 w-full">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/psychologists"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-600 hover:text-forest-950 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Psychologist Directory
          </Link>
          <span className="text-[11px] text-forest-500 font-medium">
            Confidential Consultation Request
          </span>
        </div>

        {/* Hero Practitioner Card */}
        <div className="bg-white rounded-3xl border border-sage-200/80 p-8 sm:p-10 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
            <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-3xl bg-forest-100 flex items-center justify-center font-bold text-forest-800 text-3xl shrink-0 shadow-inner">
              {profile.profilePhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.profilePhotoUrl}
                  alt={profile.fullName}
                  className="h-full w-full object-cover rounded-3xl"
                />
              ) : (
                profile.fullName.charAt(0)
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-forest-950 tracking-tight">
                  {profile.fullName}
                </h1>
                {profile.isVerified && (
                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-forest-50 text-forest-800 border border-forest-200 text-xs font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-forest-600" />
                    Verified Clinician
                  </span>
                )}
                {portfolio && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sage-100 text-forest-800 text-[10px] font-bold">
                    <Sparkles className="w-3 h-3 text-forest-600" />
                    Clinical Portfolio
                  </span>
                )}
              </div>

              <p className="text-sm sm:text-base font-semibold text-forest-700 mb-3">
                {portfolio ? portfolio.headline : profile.professionalTitle}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-forest-600 mb-4">
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-forest-500" />
                  {profile.yearsOfExperience} Years Clinical Experience
                </span>
                {profile.location && <span>• {profile.location}</span>}
                {profile.timezone && <span>• {profile.timezone}</span>}
              </div>

              <p className="text-xs sm:text-sm text-forest-700 leading-relaxed max-w-2xl">
                {portfolio ? portfolio.introduction : (profile.shortIntro || "")}
              </p>

              {/* Booking & Care Intake Action */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href={`/intake?psychologist=${profile.slug}`}
                  className="py-3 px-6 bg-forest-700 hover:bg-forest-800 text-white text-xs font-semibold rounded-2xl shadow-sm transition-all flex items-center gap-2"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  {portfolio ? portfolio.ctaText : `Request Counseling with ${profile.fullName}`}
                </Link>
                <span className="text-[11px] text-forest-500">
                  Human-assisted coordination • 100% confidential
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Who I Help Section (from published portfolio if available) */}
        {portfolio && portfolio.whoTheyHelp && portfolio.whoTheyHelp.length > 0 && (
          <div className="bg-white rounded-3xl border border-sage-200/80 p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-xs font-bold text-forest-900 uppercase tracking-wider">
              Who I Help & Clinical Focus
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {portfolio.whoTheyHelp.map((item: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2 bg-cream-50 p-3 rounded-2xl border border-sage-100 text-xs text-forest-800">
                  <Check className="w-4 h-4 text-forest-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profile Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Clinical Details Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* About / Clinical Bio */}
            {(portfolio?.about || profile.bio) && (
              <section className="bg-white rounded-3xl border border-sage-200/80 p-7 sm:p-8 shadow-sm">
                <h2 className="text-base font-bold text-forest-950 mb-4">About the Practitioner</h2>
                <div className="text-xs sm:text-sm text-forest-700 leading-relaxed whitespace-pre-line">
                  {portfolio ? portfolio.about : profile.bio}
                </div>
              </section>
            )}

            {/* Therapeutic Approach */}
            {(portfolio?.counselingApproach || profile.professionalApproach) && (
              <section className="bg-white rounded-3xl border border-sage-200/80 p-7 sm:p-8 shadow-sm">
                <h2 className="text-base font-bold text-forest-950 mb-4">Therapeutic Approach</h2>
                <div className="text-xs sm:text-sm text-forest-700 leading-relaxed whitespace-pre-line">
                  {portfolio ? portfolio.counselingApproach : profile.professionalApproach}
                </div>
              </section>
            )}

            {/* Experience */}
            {profile.experiences && profile.experiences.length > 0 && (
              <section className="bg-white rounded-3xl border border-sage-200/80 p-7 sm:p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Briefcase className="w-4 h-4 text-forest-600" />
                  <h2 className="text-base font-bold text-forest-950">Clinical Experience</h2>
                </div>
                <div className="space-y-4">
                  {profile.experiences.map((exp: any) => (
                    <div key={exp.id} className="border-l-2 border-forest-300 pl-4 py-0.5">
                      <h3 className="text-sm font-semibold text-forest-950">{exp.roleTitle}</h3>
                      <p className="text-xs text-forest-700 font-medium">{exp.organization}</p>
                      {exp.description && (
                        <p className="text-xs text-forest-600 mt-1 leading-relaxed">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Qualifications */}
            {profile.qualifications && profile.qualifications.length > 0 && (
              <section className="bg-white rounded-3xl border border-sage-200/80 p-7 sm:p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Award className="w-4 h-4 text-forest-600" />
                  <h2 className="text-base font-bold text-forest-950">Degrees & Qualifications</h2>
                </div>
                <div className="space-y-4">
                  {profile.qualifications.map((q: any) => (
                    <div key={q.id} className="border-l-2 border-forest-300 pl-4 py-0.5">
                      <div className="flex justify-between items-baseline">
                        <h3 className="text-sm font-semibold text-forest-950">{q.degree}</h3>
                        <span className="text-xs text-forest-400">{q.yearObtained}</span>
                      </div>
                      <p className="text-xs text-forest-700 font-medium">{q.institution}</p>
                      {q.description && (
                        <p className="text-xs text-forest-600 mt-1">{q.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar Info Column */}
          <div className="space-y-6">
            {/* Specializations */}
            {profile.specializations && profile.specializations.length > 0 && (
              <div className="bg-white rounded-3xl border border-sage-200/80 p-6 shadow-sm">
                <h3 className="text-xs font-bold text-forest-950 uppercase tracking-wider mb-3">
                  Areas of Clinical Expertise
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {profile.specializations.map((spec: any) => (
                    <span
                      key={spec.id}
                      className="px-3 py-1 rounded-xl bg-forest-50 text-forest-900 border border-forest-100 text-xs font-medium"
                    >
                      {spec.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {profile.languages && profile.languages.length > 0 && (
              <div className="bg-white rounded-3xl border border-sage-200/80 p-6 shadow-sm">
                <h3 className="text-xs font-bold text-forest-950 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-forest-500" />
                  Languages Spoken
                </h3>
                <div className="flex flex-wrap gap-2 text-xs text-forest-700">
                  {profile.languages.map((l: any) => (
                    <span
                      key={l.id}
                      className="px-2.5 py-1 rounded-xl bg-sage-50 font-medium text-forest-800 border border-sage-100"
                    >
                      {l.name} {l.nativeName ? `(${l.nativeName})` : ""}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Human Coordination Assurance */}
            <div className="bg-sage-100/60 rounded-3xl border border-sage-200 p-6 text-xs text-forest-800 space-y-3">
              <div className="flex items-center gap-2 text-forest-900 font-bold">
                <HeartHandshake className="w-4 h-4 text-forest-700" />
                <span>How Requesting Works</span>
              </div>
              <p className="leading-relaxed">
                When you request care, our care coordination team reviews your submission, confirms the practitioner&apos;s active slot availability, and supports you through the initial appointment booking.
              </p>
              <Link
                href={`/intake?psychologist=${profile.slug}`}
                className="block text-center py-2 px-4 bg-forest-700 hover:bg-forest-800 text-white font-semibold rounded-xl transition-colors shadow-2xs"
              >
                Request Care &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-sage-200/60 bg-white py-6 text-center text-xs text-forest-600">
        <p>© {new Date().getFullYear()} Mind Refill. Verified psychologist profile.</p>
      </footer>
    </main>
  );
}
