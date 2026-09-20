import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
  Share2,
  Bookmark,
  CheckCircle2,
} from "lucide-react";

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
      "Adults experiencing overwhelming anxiety, panic attacks, or persistent dread",
      "Professionals facing chronic workplace burnout, perfectionism, or imposter feelings",
      "Individuals navigating health anxiety or psychosomatic stress symptoms",
      "Those who feel 'stuck in their head' and want actionable coping tools",
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
      { id: "q1", degree: "Ph.D. in Clinical Psychology", institution: "University College London", yearObtained: 2014, description: "Doctoral research focused on cognitive vulnerability in anxiety disorders." },
      { id: "q2", degree: "M.Sc. in Psychological Sciences", institution: "King's College London", yearObtained: 2010, description: "Specialized clinical focus in adult neuropsychiatry." },
    ],
    experiences: [
      { id: "e1", roleTitle: "Lead Clinical Psychologist", organization: "Harley Health Mental Health Centre", description: "Supervising outpatient psychotherapy and individual CBT cohorts." },
      { id: "e2", roleTitle: "Senior Psychologist", organization: "NHS Foundation Trust", description: "Primary care psychological therapies and acute crisis stabilization." },
    ],
  },
  "elena-vance": {
    id: "demo-2",
    slug: "elena-vance",
    fullName: "Elena Vance, LMFT",
    professionalTitle: "Licensed Marriage & Family Therapist",
    profilePhotoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600",
    shortIntro:
      "Specializing in couples attachment, recurring communication friction, and emotional attunement. Creating safety for difficult conversations.",
    bio: "Elena Vance is a Licensed Marriage and Family Therapist with 9 years of specialized focus on couples dynamics, attachment theory, and relational intimacy. She works with partners who feel stuck in repetitive blame-withdraw cycles or who are navigating significant life transitions.\n\nHer practice is grounded in Emotionally Focused Therapy (EFT) and attachment science, helping partners understand each other's emotional vulnerabilities without reactivity.",
    professionalApproach:
      "My primary goal in the therapy room is to slow conversations down. When couples argue, it is rarely about dishes or schedules — it is almost always about safety, trust, and connection. I provide a calm container where both partners feel deeply heard.",
    whoTheyHelp: [
      "Couples caught in painful conflict cycles or emotional distance",
      "Partners healing from breaches of trust or infidelity",
      "Individuals wanting to understand their romantic attachment patterns",
      "Couples transitioning to parenthood or cross-cultural dynamics",
    ],
    yearsOfExperience: 9,
    location: "Toronto, Canada (Online Sessions)",
    timezone: "EST / UTC-5",
    isVerified: true,
    sessionFee: "₹2,200",
    availability: "Accepting couples and individual clients",
    specializations: [
      { id: "s4", name: "Couples & Relationships" },
      { id: "s5", name: "Attachment Wounds" },
      { id: "s6", name: "Family Transitions" },
    ],
    languages: [{ id: "l3", name: "English", nativeName: "English" }],
    qualifications: [
      { id: "q3", degree: "M.A. in Marriage & Family Therapy", institution: "University of Toronto", yearObtained: 2015, description: "Advanced training in Emotionally Focused Couples Therapy." },
    ],
    experiences: [
      { id: "e3", roleTitle: "Clinical Director", organization: "Relational Health Institute", description: "Couples therapy practice and therapist supervision." },
    ],
  },
  "dr-marcus-thorne": {
    id: "demo-3",
    slug: "dr-marcus-thorne",
    fullName: "Dr. Marcus Thorne, Psy.D.",
    professionalTitle: "Neuropsychologist & Behavioral Health Specialist",
    profilePhotoUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600",
    shortIntro:
      "Integrating neuropsychology and Acceptance & Commitment Therapy (ACT) to support adult ADHD, depressive episodes, and sleep restoration.",
    bio: "Dr. Marcus Thorne is a licensed clinical psychologist and neuropsychologist. With 15 years of hospital and private practice experience, Dr. Thorne focuses on how neural functioning intersects with daily behavioral patterns, attention regulation, and mood stability.",
    professionalApproach:
      "I demystify mental health through the lens of nervous system biology. When clients understand why their brains respond to cognitive fatigue with distraction or shutdown, shame disappears and sustainable executive habits become possible.",
    whoTheyHelp: [
      "Adults diagnosed with or questioning ADHD and executive dysfunction",
      "Individuals experiencing persistent low mood, apathy, or fatigue",
      "Clients struggling with chronic insomnia and nighttime rumination",
    ],
    yearsOfExperience: 15,
    location: "New York, USA (Online Consultations)",
    timezone: "EST / UTC-5",
    isVerified: true,
    sessionFee: "₹2,500",
    availability: "Online appointments open",
    specializations: [
      { id: "s7", name: "Adult ADHD" },
      { id: "s8", name: "Depression & Mood" },
      { id: "s9", name: "Insomnia & Sleep" },
    ],
    languages: [
      { id: "l4", name: "English", nativeName: "English" },
      { id: "l5", name: "Spanish", nativeName: "Español" },
    ],
    qualifications: [
      { id: "q4", degree: "Psy.D. in Clinical Neuropsychology", institution: "Columbia University", yearObtained: 2009, description: "Doctoral dissertation on prefrontal cortex executive functioning." },
    ],
    experiences: [
      { id: "e4", roleTitle: "Senior Attending Psychologist", organization: "Manhattan Behavioral Health", description: "Adult neuropsychological assessment and cognitive rehabilitation." },
    ],
  },
  "dr-ananya-sen": {
    id: "demo-4",
    slug: "dr-ananya-sen",
    fullName: "Dr. Ananya Sen, M.Phil.",
    professionalTitle: "Clinical Psychologist & Compassion-Focused Therapist",
    profilePhotoUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600",
    shortIntro:
      "Supporting young professionals and students through harsh inner criticism, grief, and emotional dysregulation with warmth and grounded psychoeducation.",
    bio: "Dr. Ananya Sen is an RCI-registered Clinical Psychologist with 8 years of dedicated clinical practice. She is deeply passionate about reducing mental health stigma and helping individuals cultivate self-compassion.",
    professionalApproach:
      "My sessions are a collaborative, safe space where we unpack self-critical thoughts and build emotional resilience through compassion-focused techniques.",
    whoTheyHelp: [
      "Individuals with harsh inner critics or perfectionistic paralysis",
      "Young adults undergoing career identity shifts or grief",
      "Clients seeking warm, culturally sensitive therapy",
    ],
    yearsOfExperience: 8,
    location: "Bangalore, India (Online & In-person)",
    timezone: "IST / UTC+5:30",
    isVerified: true,
    sessionFee: "₹1,600",
    availability: "Slots available tomorrow",
    specializations: [
      { id: "s10", name: "Self-Compassion" },
      { id: "s11", name: "Grief & Loss" },
      { id: "s12", name: "Academic Stress" },
    ],
    languages: [
      { id: "l6", name: "English", nativeName: "English" },
      { id: "l7", name: "Hindi", nativeName: "हिन्दी" },
    ],
    qualifications: [
      { id: "q5", degree: "M.Phil. in Clinical Psychology", institution: "NIMHANS", yearObtained: 2016, description: "RCI certified clinical training." },
    ],
    experiences: [
      { id: "e5", roleTitle: "Consultant Psychologist", organization: "Centre for Emotional Wellbeing", description: "Individual adult psychotherapy and clinical supervision." },
    ],
  },
  "david-martinez": {
    id: "demo-5",
    slug: "david-martinez",
    fullName: "David Martinez, LCSW",
    professionalTitle: "Licensed Somatic & Mindfulness Psychotherapist",
    profilePhotoUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600",
    shortIntro:
      "Combining body-based somatic grounding and mindfulness to help clients release stored emotional trauma and regulate their nervous systems.",
    bio: "David Martinez is a Licensed Clinical Social Worker and Certified Somatic Experiencing Practitioner with 11 years of experience in nervous system regulation and trauma integration.",
    professionalApproach:
      "We often try to think our way out of emotional distress, but stress lives in the nervous system. In our sessions, we gently tune into physical sensations to release trapped fight-or-flight energy.",
    whoTheyHelp: [
      "Individuals experiencing chronic tension, tight chest, or somatic stress",
      "Those who find traditional talk therapy too cognitive or detached",
      "Clients in recovery from chronic developmental trauma",
    ],
    yearsOfExperience: 11,
    location: "Madrid, Spain (Online Globally)",
    timezone: "CET / UTC+1",
    isVerified: true,
    sessionFee: "₹2,000",
    availability: "Weekend slots open",
    specializations: [
      { id: "s13", name: "Somatic Grounding" },
      { id: "s14", name: "Chronic Stress" },
      { id: "s15", name: "Mindfulness" },
    ],
    languages: [
      { id: "l8", name: "English", nativeName: "English" },
      { id: "l9", name: "Spanish", nativeName: "Español" },
    ],
    qualifications: [
      { id: "q6", degree: "Master of Social Work (MSW)", institution: "Autonomous University of Madrid", yearObtained: 2013, description: "Clinical trauma specialization." },
    ],
    experiences: [
      { id: "e6", roleTitle: "Senior Somatic Practitioner", organization: "Integrative Trauma Clinic", description: "Individual body-oriented psychotherapy." },
    ],
  },
};

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const fallback = FALLBACK_PROFILES[params.slug] || FALLBACK_PROFILES["dr-sarah-jenkins"];
  try {
    const profile = await ProfileService.getPublicProfileBySlug(params.slug);
    const title = profile?.seoTitle || `${profile?.fullName || fallback.fullName} | Verified ${profile?.professionalTitle || fallback.professionalTitle} | Mind Refill`;
    const description =
      profile?.seoDescription ||
      profile?.shortIntro ||
      fallback.shortIntro;

    return {
      title,
      description,
      openGraph: { title, description, type: "profile" },
    };
  } catch {
    return {
      title: `${fallback.fullName} | Verified ${fallback.professionalTitle} | Mind Refill`,
      description: fallback.shortIntro,
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
    if (FALLBACK_PROFILES[params.slug]) {
      profile = FALLBACK_PROFILES[params.slug];
    } else {
      notFound();
    }
  }

  const portfolio = portfolioData?.publishedContent;
  const whoTheyHelpList = portfolio?.whoTheyHelp || profile.whoTheyHelp || [
    "Adults experiencing anxiety, panic, or persistent stress",
    "Individuals navigating burnout, life transitions, or relationship challenges",
    "Those seeking a confidential, non-judgmental space to reflect and grow",
  ];

  return (
    <main className="min-h-screen bg-cream-50 py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-between text-forest-950">
      <div className="max-w-5xl mx-auto space-y-8 w-full">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/psychologists"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-700 hover:text-forest-950 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Psychologist Directory
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-forest-600 font-medium">
              Verified Clinical Practitioner
            </span>
          </div>
        </div>

        {/* Hero Practitioner Identity Card */}
        <div className="bg-white rounded-3xl border border-sage-200/90 p-6 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-sage-100/40 via-cream-100/20 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
            {/* Photo */}
            <div className="relative h-36 w-36 sm:h-44 sm:w-44 rounded-3xl overflow-hidden border-2 border-sage-200 shrink-0 shadow-md bg-forest-100">
              {profile.profilePhotoUrl ? (
                <Image
                  src={profile.profilePhotoUrl}
                  alt={profile.fullName}
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="h-full w-full flex items-center justify-center font-bold text-forest-800 text-4xl">
                  {profile.fullName.charAt(0)}
                </span>
              )}
            </div>

            {/* Core Human Header */}
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-4xl font-extrabold text-forest-950 tracking-tight">
                  {profile.fullName}
                </h1>
                {profile.isVerified && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-forest-50 text-forest-800 border border-forest-200 text-xs font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-forest-600" />
                    Verified License
                  </span>
                )}
              </div>

              <p className="text-sm sm:text-base font-semibold text-forest-700">
                {portfolio ? portfolio.headline : profile.professionalTitle}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-forest-600">
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-forest-600" />
                  {profile.yearsOfExperience} Years Clinical Practice
                </span>
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-forest-600" />
                    {profile.location}
                  </span>
                )}
                <span className="flex items-center gap-1 text-forest-700 font-medium">
                  <Clock className="w-3.5 h-3.5 text-forest-600" />
                  {profile.availability || "Accepting clients"}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-forest-700 leading-relaxed max-w-2xl pt-1">
                {portfolio ? portfolio.introduction : (profile.shortIntro || "")}
              </p>

              {/* Primary & Secondary CTAs */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link
                  href={`/intake?psychologist=${profile.slug}`}
                  className="py-3.5 px-8 bg-forest-800 hover:bg-forest-900 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-sm hover:shadow transition-all flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Book a Session
                </Link>

                <div className="text-xs text-forest-700 flex items-center gap-2">
                  <span className="font-bold text-forest-950 text-sm">
                    {profile.sessionFee || "Standard Consultation"}
                  </span>
                  <span className="text-forest-400">•</span>
                  <span>50-min session</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* The 5 Key Questions Grid: Who they help, How they work, Credentials */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left / Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. Who Do They Help? */}
            <section className="bg-white rounded-3xl border border-sage-200/90 p-7 sm:p-8 shadow-xs">
              <h2 className="text-sm font-bold text-forest-950 uppercase tracking-wider mb-4 flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-forest-600" />
                Who I Help & Clinical Focus
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {whoTheyHelpList.map((item: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 bg-cream-50/70 p-3.5 rounded-2xl border border-sage-100 text-xs text-forest-800 leading-relaxed"
                  >
                    <CheckCircle2 className="w-4 h-4 text-forest-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 2. How Do They Work? (Therapeutic Approach) */}
            <section className="bg-white rounded-3xl border border-sage-200/90 p-7 sm:p-8 shadow-xs">
              <h2 className="text-base font-bold text-forest-950 mb-3">
                My Clinical Approach
              </h2>
              <div className="text-xs sm:text-sm text-forest-700 leading-relaxed whitespace-pre-line space-y-3">
                {portfolio ? portfolio.counselingApproach : (profile.professionalApproach || profile.bio)}
              </div>
            </section>

            {/* 3. About the Practitioner (Detailed Bio) */}
            <section className="bg-white rounded-3xl border border-sage-200/90 p-7 sm:p-8 shadow-xs">
              <h2 className="text-base font-bold text-forest-950 mb-3">
                About {profile.fullName}
              </h2>
              <div className="text-xs sm:text-sm text-forest-700 leading-relaxed whitespace-pre-line space-y-3">
                {portfolio ? portfolio.about : profile.bio}
              </div>
            </section>

            {/* 4. Clinical Experience & Career History */}
            {profile.experiences && profile.experiences.length > 0 && (
              <section className="bg-white rounded-3xl border border-sage-200/90 p-7 sm:p-8 shadow-xs">
                <div className="flex items-center gap-2 mb-6">
                  <Briefcase className="w-4 h-4 text-forest-600" />
                  <h2 className="text-base font-bold text-forest-950">Clinical Experience</h2>
                </div>
                <div className="space-y-4">
                  {profile.experiences.map((exp: any) => (
                    <div key={exp.id} className="border-l-2 border-forest-300 pl-4 py-1">
                      <h3 className="text-sm font-bold text-forest-950">{exp.roleTitle}</h3>
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

            {/* 5. Degrees & Verified Qualifications */}
            {profile.qualifications && profile.qualifications.length > 0 && (
              <section className="bg-white rounded-3xl border border-sage-200/90 p-7 sm:p-8 shadow-xs">
                <div className="flex items-center gap-2 mb-6">
                  <Award className="w-4 h-4 text-forest-600" />
                  <h2 className="text-base font-bold text-forest-950">Degrees & Qualifications</h2>
                </div>
                <div className="space-y-4">
                  {profile.qualifications.map((q: any) => (
                    <div key={q.id} className="border-l-2 border-forest-300 pl-4 py-1">
                      <div className="flex justify-between items-baseline">
                        <h3 className="text-sm font-bold text-forest-950">{q.degree}</h3>
                        <span className="text-xs text-forest-500 font-medium">{q.yearObtained}</span>
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

          {/* Right / Sidebar Column */}
          <div className="space-y-6">
            {/* Booking Card Quick Action */}
            <div className="bg-forest-900 text-white rounded-3xl p-6 sm:p-7 shadow-md space-y-4">
              <span className="text-[10px] font-bold text-sage-300 uppercase tracking-widest block">
                Session Booking
              </span>
              <h3 className="text-lg font-bold">
                Ready to take the next step?
              </h3>
              <p className="text-xs text-sage-200 leading-relaxed">
                Connect directly with {profile.fullName}. A human care coordinator will confirm matching availability with no pressure.
              </p>
              <div className="pt-2">
                <Link
                  href={`/intake?psychologist=${profile.slug}`}
                  className="w-full block text-center py-3 bg-white hover:bg-cream-100 text-forest-950 font-bold text-xs rounded-2xl shadow-sm transition-colors"
                >
                  Book a Session &rarr;
                </Link>
              </div>
            </div>

            {/* Specializations */}
            {profile.specializations && profile.specializations.length > 0 && (
              <div className="bg-white rounded-3xl border border-sage-200/90 p-6 shadow-xs">
                <h3 className="text-xs font-bold text-forest-950 uppercase tracking-wider mb-3">
                  Clinical Focus Areas
                </h3>
                <div className="flex flex-wrap gap-2">
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
              <div className="bg-white rounded-3xl border border-sage-200/90 p-6 shadow-xs">
                <h3 className="text-xs font-bold text-forest-950 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-forest-600" />
                  Consultation Languages
                </h3>
                <div className="flex flex-wrap gap-2 text-xs text-forest-700">
                  {profile.languages.map((l: any) => (
                    <span
                      key={l.id}
                      className="px-3 py-1 rounded-xl bg-sage-50 font-medium text-forest-800 border border-sage-200/80"
                    >
                      {l.name} {l.nativeName ? `(${l.nativeName})` : ""}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Safety & Care Assurance */}
            <div className="bg-cream-50 rounded-3xl border border-sage-200/90 p-6 text-xs text-forest-800 space-y-3">
              <div className="flex items-center gap-2 text-forest-950 font-bold">
                <ShieldCheck className="w-4 h-4 text-forest-700" />
                <span>Clinical Integrity & Safety</span>
              </div>
              <p className="leading-relaxed text-forest-700">
                All consultations conducted on Mind Refill adhere to strict professional licensing ethics and medical confidentiality. Sessions are 100% human-led.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-sage-200/60 bg-white py-8 text-center text-xs text-forest-600">
        <p>© {new Date().getFullYear()} Mind Refill. Verified psychology practitioner profile.</p>
      </footer>
    </main>
  );
}
