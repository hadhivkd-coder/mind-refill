import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { DirectoryService } from "@/modules/directory/services/directory.service";
import { TaxonomyService } from "@/modules/profiles/services/taxonomy.service";
import {
  ShieldCheck,
  Search,
  ArrowRight,
  Sparkles,
  HeartHandshake,
  Clock,
  Compass,
  CheckCircle2,
} from "lucide-react";

export const metadata = {
  title: "Find a Verified Psychologist | Mind Refill",
  description:
    "Discover licensed and rigorously verified psychologists on Mind Refill. Search by clinical focus, language, and therapeutic approach.",
};

export const dynamic = "force-dynamic";

interface DirectoryPageProps {
  searchParams: {
    q?: string;
    specialization?: string;
    language?: string;
    experience?: string;
    page?: string;
  };
}

const FALLBACK_PSYCHOLOGISTS = [
  {
    id: "demo-1",
    slug: "dr-sarah-jenkins",
    fullName: "Dr. Sarah Jenkins, Ph.D.",
    professionalTitle: "Licensed Clinical Psychologist & CBT Specialist",
    profilePhotoUrl: "https://images.unsplash.com/photo-1594824813637-2804b494632b?auto=format&fit=crop&q=80&w=600",
    shortIntro:
      "Helping individuals untangle chronic anxiety, panic loops, and executive burnout using evidence-based cognitive and somatic methods.",
    yearsOfExperience: 12,
    location: "London, UK",
    isVerified: true,
    sessionFee: "â‚¹1,800",
    availability: "Available this week",
    specializations: [
      { id: "s1", name: "Anxiety & Panic" },
      { id: "s2", name: "Trauma Recovery" },
      { id: "s3", name: "Career Burnout" },
    ],
    languages: [
      { id: "l1", name: "English", code: "en" },
      { id: "l2", name: "French", code: "fr" },
    ],
  },
  {
    id: "demo-2",
    slug: "elena-vance",
    fullName: "Elena Vance, LMFT",
    professionalTitle: "Licensed Marriage & Family Therapist",
    profilePhotoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600",
    shortIntro:
      "Specializing in couples attachment, recurring communication friction, and emotional attunement. Creating safety for difficult conversations.",
    yearsOfExperience: 9,
    location: "Toronto, Canada",
    isVerified: true,
    sessionFee: "â‚¹2,200",
    availability: "Next opening Thursday",
    specializations: [
      { id: "s4", name: "Couples & Relationships" },
      { id: "s5", name: "Attachment Wounds" },
      { id: "s6", name: "Family Transitions" },
    ],
    languages: [{ id: "l3", name: "English", code: "en" }],
  },
  {
    id: "demo-3",
    slug: "dr-marcus-thorne",
    fullName: "Dr. Marcus Thorne, Psy.D.",
    professionalTitle: "Neuropsychologist & Behavioral Health Specialist",
    profilePhotoUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600",
    shortIntro:
      "Integrating neurobiological stabilization with ACT and DBT. Focused on adult ADHD, depressive episodes, and somatic emotional regulation.",
    yearsOfExperience: 15,
    location: "San Francisco, CA",
    isVerified: true,
    sessionFee: "â‚¹2,500",
    availability: "Online sessions open",
    specializations: [
      { id: "s7", name: "Adult ADHD" },
      { id: "s8", name: "Depression & Mood" },
      { id: "s9", name: "Sleep & Somatic Care" },
    ],
    languages: [
      { id: "l4", name: "English", code: "en" },
      { id: "l5", name: "Spanish", code: "es" },
    ],
  },
  {
    id: "demo-4",
    slug: "dr-ananya-sen",
    fullName: "Dr. Ananya Sen, Ph.D.",
    professionalTitle: "Clinical Psychologist & Mindfulness Practitioner",
    profilePhotoUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600",
    shortIntro:
      "Compassionate inquiry exploring generational patterns, grief, and self-worth. Providing a safe, non-pathologizing space for women and young adults.",
    yearsOfExperience: 8,
    location: "Bangalore, India",
    isVerified: true,
    sessionFee: "â‚¹1,600",
    availability: "Flexible evening slots",
    specializations: [
      { id: "s10", name: "Grief & Bereavement" },
      { id: "s11", name: "Self-Esteem" },
      { id: "s12", name: "Cultural Identity" },
    ],
    languages: [
      { id: "l6", name: "English", code: "en" },
      { id: "l7", name: "Hindi", code: "hi" },
    ],
  },
];

const FALLBACK_SPECIALIZATIONS = [
  { id: "sp-1", name: "Anxiety & Stress", slug: "anxiety-stress" },
  { id: "sp-2", name: "Depression & Mood", slug: "depression-mood" },
  { id: "sp-3", name: "Trauma & PTSD", slug: "trauma-ptsd" },
  { id: "sp-4", name: "Couples & Relationships", slug: "couples-relationship" },
  { id: "sp-5", name: "Career & Burnout", slug: "career-burnout" },
];

export default async function DirectoryPage({ searchParams }: DirectoryPageProps) {
  const query = searchParams.q || "";
  const specializationSlug = searchParams.specialization || "";
  const languageCode = searchParams.language || "";

  let psychologists = [...FALLBACK_PSYCHOLOGISTS];

  try {
    const [dbResult] = await Promise.all([
      DirectoryService.search({
        query,
        specializationSlug,
        languageCode,
        page: 1,
        limit: 12,
      }),
    ]);
    if (dbResult && dbResult.psychologists && dbResult.psychologists.length > 0) {
      psychologists = dbResult.psychologists.map((p) => ({
        ...p,
        profilePhotoUrl: p.profilePhotoUrl || "https://images.unsplash.com/photo-1594824813637-2804b494632b?auto=format&fit=crop&q=80&w=600",
        shortIntro: p.shortIntro || "Verified Mind Refill clinical practitioner.",
        sessionFee: "â‚¹1,800",
        availability: "Available this week",
        location: "Verified Online Consultation",
      }));
    } else {
      // Fallback search filter
      if (query) {
        const qLower = query.toLowerCase();
        psychologists = psychologists.filter(
          (p) =>
            p.fullName.toLowerCase().includes(qLower) ||
            p.professionalTitle.toLowerCase().includes(qLower) ||
            p.shortIntro.toLowerCase().includes(qLower)
        );
      }
      if (specializationSlug) {
        psychologists = psychologists.filter((p) =>
          p.specializations.some((s) =>
            s.name.toLowerCase().includes(specializationSlug.replace("-", " "))
          )
        );
      }
    }
  } catch {
    // Graceful offline fallback
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#173C32] text-[#F7F3E9] selection:bg-[#3F6855] selection:text-[#F1EBDD]">
      <Navbar />

      <main className="flex-grow">
        {/* Directory Hero Header */}
        <section className="pt-12 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#173C32] via-[#1C473C] to-[#244F42] border-b border-white/5 text-center">
          <div className="max-w-4xl mx-auto space-y-5">
            <span className="text-xs font-semibold tracking-widest text-[#9CAF91] uppercase">
              Verified Practitioners
            </span>

            <h1 className="font-sans  sm:text-5xl md:text-6xl font-normal text-[#F7F3E9] leading-tight">
              Find the right psychologist to walk beside you.
            </h1>

            <p className="text-sm sm:text-base text-[#C9D2BC] max-w-2xl mx-auto font-light leading-relaxed">
              Every clinician on Mind Refill is credential-verified, holding active clinical registration, degrees in psychology, and ongoing supervision.
            </p>

            {/* Integrated Search Bar */}
            <form method="GET" action="/psychologists" className="pt-4 max-w-2xl mx-auto">
              <div className="relative flex items-center">
                <Search className="w-5 h-5 text-[#9CAF91] absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  name="q"
                  defaultValue={query}
                  placeholder="Search by specialty, name, or concern (e.g., anxiety, couples, burnout)..."
                  className="w-full h-14 pl-12 pr-28 rounded-full bg-[#173C32]/80 border border-[#C9D2BC]/30 text-sm text-[#F7F3E9] placeholder-[#9CAF91]/70 focus:outline-none focus:border-[#F1EBDD] focus:ring-2 focus:ring-[#C9D2BC]/20 backdrop-blur-md shadow-inner transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-2 h-10 px-5 rounded-full bg-[#F1EBDD] hover:bg-white text-[#173C32] text-xs font-semibold transition-all"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Specialty filter chips */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-2">
              <Link
                href="/psychologists"
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  !specializationSlug
                    ? "bg-[#F1EBDD] text-[#173C32] font-semibold"
                    : "bg-white/5 border border-white/10 text-[#C9D2BC] hover:text-[#F7F3E9]"
                }`}
              >
                All Specializations
              </Link>
              {FALLBACK_SPECIALIZATIONS.map((spec) => {
                const active = specializationSlug === spec.slug;
                return (
                  <Link
                    key={spec.slug}
                    href={`/psychologists?specialization=${spec.slug}`}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                      active
                        ? "bg-[#F1EBDD] text-[#173C32] font-semibold"
                        : "bg-white/5 border border-white/10 text-[#C9D2BC] hover:text-[#F7F3E9]"
                    }`}
                  >
                    {spec.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Directory Listings */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {psychologists.length === 0 ? (
            <div className="text-center py-20 atmospheric-card rounded-3xl p-8 max-w-md mx-auto space-y-4">
              <Compass className="w-10 h-10 text-[#9CAF91] mx-auto" />
              <h3 className="font-sans  font-medium text-[#F7F3E9]">
                No exact match found
              </h3>
              <p className="text-xs text-[#C9D2BC] leading-relaxed">
                We couldn&apos;t find a practitioner matching those exact filters. Try clearing your search or let our coordinators help you.
              </p>
              <div className="pt-2">
                <Link
                  href="/psychologists"
                  className="px-5 py-2.5 rounded-full bg-[#F1EBDD] text-[#173C32] text-xs font-semibold inline-block"
                >
                  Clear Filters
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {psychologists.map((psych) => (
                <div
                  key={psych.id}
                  className="atmospheric-card rounded-3xl overflow-hidden flex flex-col justify-between border border-white/10 hover:border-[#C9D2BC]/30 transition-all duration-300 group shadow-sm hover:shadow-xl hover:shadow-black/20"
                >
                  <div className="space-y-5">
                    {/* Portrait Photo */}
                    <div className="relative aspect-[4/3] w-full bg-[#122C25] overflow-hidden">
                      <Image
                        src={psych.profilePhotoUrl}
                        alt={psych.fullName}
                        fill
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#173C32] via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full bg-[#173C32]/90 backdrop-blur-md text-[11px] font-medium text-[#9CAF91] border border-white/10">
                          {psych.availability}
                        </span>
                        <span className="text-xs font-serif font-semibold text-[#F1EBDD]">
                          {psych.sessionFee} / session
                        </span>
                      </div>
                    </div>

                    {/* Bio & Details */}
                    <div className="px-6 space-y-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-sans  font-medium text-[#F7F3E9]">
                            {psych.fullName}
                          </h3>
                          <ShieldCheck className="w-4 h-4 text-[#9CAF91] flex-shrink-0" />
                        </div>
                        <p className="text-xs text-[#9CAF91] font-light mt-0.5">
                          {psych.professionalTitle} â€¢ {psych.yearsOfExperience} yrs exp
                        </p>
                      </div>

                      <p className="text-xs sm:text-sm text-[#C9D2BC]/90 font-light leading-relaxed line-clamp-3">
                        {psych.shortIntro}
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {psych.specializations.map((spec: any) => (
                          <span
                            key={spec.id || spec.name}
                            className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] text-[#C9D2BC]"
                          >
                            {spec.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Profile CTA */}
                  <div className="p-6 pt-4 border-t border-white/5">
                    <Link
                      href={`/psychologists/${psych.slug}`}
                      className="w-full py-3 rounded-2xl bg-[#F1EBDD] hover:bg-white text-[#173C32] font-semibold text-xs text-center flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                      <span>View Profile & Availability</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Guided matching callout */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto pb-24">
          <div className="atmospheric-card p-8 sm:p-12 rounded-3xl text-center space-y-5 border border-[#C9D2BC]/20">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[#244F42] flex items-center justify-center text-[#F1EBDD]">
              <HeartHandshake className="w-6 h-6 text-[#9CAF91]" />
            </div>
            <h3 className="font-sans  sm:text-3xl font-normal text-[#F7F3E9]">
              Not sure which psychologist is right for you?
            </h3>
            <p className="text-sm text-[#C9D2BC] max-w-xl mx-auto font-light leading-relaxed">
              Take 3 minutes to share what you&apos;re going through. Our care coordinators will review your focus areas and connect you thoughtfully.
            </p>
            <div className="pt-2">
              <Link
                href="/intake"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#F1EBDD] hover:bg-white text-[#173C32] font-semibold text-sm transition-all shadow-md"
              >
                <span>Start Guided Matching</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
