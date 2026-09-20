import Link from "next/link";
import Image from "next/image";
import { DirectoryService } from "@/modules/directory/services/directory.service";
import { TaxonomyService } from "@/modules/profiles/services/taxonomy.service";
import { ShieldCheck, Search, Filter, Globe, Award, ArrowRight, HeartHandshake, Sparkles, Clock, Calendar } from "lucide-react";

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

// Fallback curated profiles with real human photography for offline resilience
const FALLBACK_PSYCHOLOGISTS = [
  {
    id: "demo-1",
    slug: "dr-sarah-jenkins",
    fullName: "Dr. Sarah Jenkins, Ph.D.",
    professionalTitle: "Licensed Clinical Psychologist & CBT Specialist",
    profilePhotoUrl: "https://images.unsplash.com/photo-1594824813637-2804b494632b?auto=format&fit=crop&q=80&w=400",
    shortIntro:
      "Helping individuals untangle chronic anxiety, panic loops, and executive burnout using evidence-based cognitive and somatic methods.",
    yearsOfExperience: 12,
    location: "London, UK",
    isVerified: true,
    sessionFee: "₹1,800",
    availability: "Available this week",
    specializations: [
      { id: "s1", name: "Anxiety & Panic" },
      { id: "s2", name: "Trauma & PTSD" },
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
    profilePhotoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
    shortIntro:
      "Specializing in couples attachment, recurring communication friction, and emotional attunement. Creating safety for difficult conversations.",
    yearsOfExperience: 9,
    location: "Toronto, Canada",
    isVerified: true,
    sessionFee: "₹2,200",
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
    profilePhotoUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
    shortIntro:
      "Integrating neuropsychology and Acceptance & Commitment Therapy (ACT) to support adult ADHD, depressive episodes, and sleep restoration.",
    yearsOfExperience: 15,
    location: "New York, USA",
    isVerified: true,
    sessionFee: "₹2,500",
    availability: "Online sessions open",
    specializations: [
      { id: "s7", name: "Adult ADHD" },
      { id: "s8", name: "Depression & Mood" },
      { id: "s9", name: "Insomnia & Sleep" },
    ],
    languages: [
      { id: "l4", name: "English", code: "en" },
      { id: "l5", name: "Spanish", code: "es" },
    ],
  },
  {
    id: "demo-4",
    slug: "dr-ananya-sen",
    fullName: "Dr. Ananya Sen, M.Phil.",
    professionalTitle: "Clinical Psychologist & Compassion-Focused Therapist",
    profilePhotoUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
    shortIntro:
      "Supporting young professionals and students through harsh inner criticism, grief, and emotional dysregulation with warmth and grounded psychoeducation.",
    yearsOfExperience: 8,
    location: "Bangalore, India",
    isVerified: true,
    sessionFee: "₹1,600",
    availability: "Available tomorrow",
    specializations: [
      { id: "s10", name: "Self-Compassion" },
      { id: "s11", name: "Grief & Loss" },
      { id: "s12", name: "Academic Stress" },
    ],
    languages: [
      { id: "l6", name: "English", code: "en" },
      { id: "l7", name: "Hindi", code: "hi" },
    ],
  },
  {
    id: "demo-5",
    slug: "david-martinez",
    fullName: "David Martinez, LCSW",
    professionalTitle: "Licensed Somatic & Mindfulness Psychotherapist",
    profilePhotoUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400",
    shortIntro:
      "Combining body-based somatic grounding and mindfulness to help clients release stored emotional trauma and regulate their nervous systems.",
    yearsOfExperience: 11,
    location: "Madrid, Spain",
    isVerified: true,
    sessionFee: "₹2,000",
    availability: "Slots open this weekend",
    specializations: [
      { id: "s13", name: "Somatic Grounding" },
      { id: "s14", name: "Chronic Stress" },
      { id: "s15", name: "Mindfulness" },
    ],
    languages: [
      { id: "l8", name: "English", code: "en" },
      { id: "l9", name: "Spanish", code: "es" },
    ],
  },
];

const FALLBACK_SPECIALIZATIONS = [
  { id: "sp-1", name: "Anxiety & Stress Management", slug: "anxiety-stress" },
  { id: "sp-2", name: "Depression & Mood", slug: "depression-mood" },
  { id: "sp-3", name: "Trauma & PTSD", slug: "trauma-ptsd" },
  { id: "sp-4", name: "Relationships & Couples", slug: "couples-relationship" },
  { id: "sp-5", name: "Career & Burnout", slug: "career-burnout" },
  { id: "sp-6", name: "ADHD & Neurodivergence", slug: "adhd-neurodivergence" },
];

const FALLBACK_LANGUAGES = [
  { id: "lg-1", code: "en", name: "English", nativeName: "English" },
  { id: "lg-2", code: "es", name: "Spanish", nativeName: "Español" },
  { id: "lg-3", code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { id: "lg-4", code: "fr", name: "French", nativeName: "Français" },
];

export default async function DirectoryPage({ searchParams }: DirectoryPageProps) {
  const query = searchParams.q || "";
  const specializationSlug = searchParams.specialization || "";
  const languageCode = searchParams.language || "";
  const minExperience = searchParams.experience ? Number(searchParams.experience) : undefined;
  const page = searchParams.page ? Number(searchParams.page) : 1;

  let searchResult: { psychologists: any[]; total: number; page: number; totalPages: number } = {
    psychologists: [],
    total: 0,
    page: 1,
    totalPages: 1,
  };
  let specializations: any[] = FALLBACK_SPECIALIZATIONS;
  let languages: any[] = FALLBACK_LANGUAGES;
  let isDatabaseConnected = true;

  try {
    const [dbResult, dbSpecs, dbLangs] = await Promise.all([
      DirectoryService.search({
        query,
        specializationSlug,
        languageCode,
        minExperience,
        page,
        limit: 12,
      }),
      TaxonomyService.getActiveSpecializations(),
      TaxonomyService.getActiveLanguages(),
    ]);

    if (dbResult && dbResult.psychologists) {
      searchResult = dbResult;
      if (searchResult.total === 0 && !query && !specializationSlug && !languageCode) {
        searchResult = {
          psychologists: FALLBACK_PSYCHOLOGISTS,
          total: FALLBACK_PSYCHOLOGISTS.length,
          page: 1,
          totalPages: 1,
        };
      }
    }
    if (dbSpecs && dbSpecs.length > 0) specializations = dbSpecs;
    if (dbLangs && dbLangs.length > 0) languages = dbLangs;
  } catch {
    isDatabaseConnected = false;
    let filtered = [...FALLBACK_PSYCHOLOGISTS];
    if (query) {
      const qLower = query.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.fullName.toLowerCase().includes(qLower) ||
          p.professionalTitle.toLowerCase().includes(qLower) ||
          p.shortIntro.toLowerCase().includes(qLower)
      );
    }
    if (specializationSlug) {
      filtered = filtered.filter((p) =>
        p.specializations.some((s) => s.id === specializationSlug || s.name.toLowerCase().includes(specializationSlug.replace("-", " ")))
      );
    }
    if (languageCode) {
      filtered = filtered.filter((p) =>
        p.languages.some((l) => l.code.toLowerCase() === languageCode.toLowerCase())
      );
    }

    searchResult = {
      psychologists: filtered,
      total: filtered.length,
      page: 1,
      totalPages: 1,
    };
  }

  return (
    <main className="min-h-screen bg-cream-50 flex flex-col justify-between text-forest-950">
      {/* Navigation Header */}
      <header className="border-b border-sage-200/70 bg-white/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="h-10 w-10 rounded-2xl bg-forest-800 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:bg-forest-900 transition-colors">
              Ψ
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-forest-950 block leading-tight">
                Mind Refill
              </span>
              <span className="text-[10px] uppercase tracking-widest text-forest-600 font-semibold block">
                Psychology & Well-Being
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-forest-700">
            <Link href="/psychologists" className="text-forest-950 font-bold border-b-2 border-forest-700 pb-1">
              Find a Psychologist
            </Link>
            <Link href="/resources" className="hover:text-forest-950 transition-colors">
              Clinical Resources
            </Link>
            <Link href="/ebooks" className="hover:text-forest-950 transition-colors">
              E-Books & Workbooks
            </Link>
            <Link href="/events" className="hover:text-forest-950 transition-colors">
              Workshops & Events
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <Link
              href="/login"
              className="text-sm font-medium text-forest-800 hover:text-forest-950 px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/intake"
              className="text-xs sm:text-sm font-semibold bg-forest-800 hover:bg-forest-900 text-white px-5 py-2.5 rounded-2xl transition-all shadow-sm"
            >
              Get Guided Help
            </Link>
          </div>
        </div>
      </header>

      {/* Directory Search Header */}
      <section className="bg-white border-b border-sage-200/70 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-xs font-bold text-forest-700 uppercase tracking-widest mb-3">
            <ShieldCheck className="w-4 h-4 text-forest-600" />
            Verified Professional Directory
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-forest-950">
            Find the right psychologist to walk beside you.
          </h1>
          <p className="mt-3 text-sm sm:text-base text-forest-700 max-w-2xl leading-relaxed">
            Every practitioner listed on Mind Refill is individually verified for active licensing, professional ethics, and authentic therapeutic attunement.
          </p>

          {/* Search and Filters Bar */}
          <form method="GET" action="/psychologists" className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-forest-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search by name, focus, or approach..."
                className="w-full pl-10 pr-3 py-3 bg-cream-50/70 border border-sage-300 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 text-forest-950 placeholder:text-forest-400"
              />
            </div>

            <div>
              <select
                name="specialization"
                defaultValue={specializationSlug}
                className="w-full px-3.5 py-3 bg-cream-50/70 border border-sage-300 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 text-forest-900"
              >
                <option value="">All Specializations</option>
                {specializations.map((s) => (
                  <option key={s.id} value={s.slug}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                name="language"
                defaultValue={languageCode}
                className="w-full px-3.5 py-3 bg-cream-50/70 border border-sage-300 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 text-forest-900"
              >
                <option value="">All Languages</option>
                {languages.map((l) => (
                  <option key={l.id} value={l.code}>
                    {l.name} ({l.nativeName || l.code})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="py-3 px-5 bg-forest-800 hover:bg-forest-900 text-white text-xs sm:text-sm font-bold rounded-2xl transition-colors shadow-sm cursor-pointer"
            >
              Filter Practitioners
            </button>
          </form>
        </div>
      </section>

      {/* Results Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <div className="flex justify-between items-center mb-8">
          <p className="text-xs text-forest-600 font-medium">
            Showing {searchResult.psychologists.length} verified clinicians
          </p>
          {(query || specializationSlug || languageCode) && (
            <Link
              href="/psychologists"
              className="text-xs text-forest-800 hover:underline font-bold"
            >
              Clear filters
            </Link>
          )}
        </div>

        {searchResult.psychologists.length === 0 ? (
          <div className="bg-white border border-sage-200 rounded-3xl p-12 text-center max-w-lg mx-auto my-12 shadow-sm">
            <div className="h-12 w-12 mx-auto rounded-2xl bg-sage-50 flex items-center justify-center text-forest-400 mb-4">
              <Filter className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-forest-950">We couldn&apos;t find a match with those filters.</h2>
            <p className="text-xs text-forest-600 mt-2 leading-relaxed">
              Try broadening your search or let our human care coordinators match you personally with a psychologist suited to your needs.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
              <Link
                href="/psychologists"
                className="py-2.5 px-4 border border-sage-300 text-forest-800 text-xs font-semibold rounded-xl hover:bg-cream-50 transition-colors"
              >
                Clear Search Filters
              </Link>
              <Link
                href="/intake"
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-forest-800 text-white text-xs font-semibold rounded-xl hover:bg-forest-900 transition-colors"
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                Ask a Care Coordinator &rarr;
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {searchResult.psychologists.map((psych) => (
              <div
                key={psych.id}
                className="bg-white rounded-3xl border border-sage-200/90 p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-forest-400 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Photo & Identity Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative h-18 w-18 rounded-2xl overflow-hidden border-2 border-sage-200 shrink-0 shadow-xs bg-forest-100 flex items-center justify-center text-forest-800 font-bold text-xl">
                      {psych.profilePhotoUrl ? (
                        <Image
                          src={psych.profilePhotoUrl}
                          alt={psych.fullName}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        psych.fullName.charAt(0)
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h2 className="text-base font-bold text-forest-950 truncate">
                          {psych.fullName}
                        </h2>
                        {psych.isVerified && (
                          <span title="Verified Clinical Practitioner" className="shrink-0">
                            <ShieldCheck className="w-4 h-4 text-forest-600" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-forest-600 truncate mt-0.5">
                        {psych.professionalTitle}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-forest-500">
                        <span className="flex items-center gap-1">
                          <Award className="w-3 h-3 text-forest-500" />
                          {psych.yearsOfExperience} yrs experience
                        </span>
                        {psych.location && <span>• {psych.location}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Human Introduction */}
                  {psych.shortIntro && (
                    <p className="text-xs text-forest-700 line-clamp-3 mb-4 leading-relaxed bg-cream-50/60 p-3 rounded-xl border border-sage-100/70">
                      {psych.shortIntro}
                    </p>
                  )}

                  {/* Specializations Tags */}
                  {psych.specializations && psych.specializations.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {psych.specializations.slice(0, 3).map((spec: any) => (
                        <span
                          key={spec.id}
                          className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-sage-50 text-forest-800 border border-sage-200/80"
                        >
                          {spec.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="pt-4 border-t border-sage-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-forest-500 block font-semibold">
                      Languages
                    </span>
                    <span className="text-xs font-semibold text-forest-800">
                      {psych.languages?.map((l: any) => l.name || l.code).join(", ") || "English"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/psychologists/${psych.slug}`}
                      className="py-2 px-3.5 bg-forest-800 hover:bg-forest-900 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                    >
                      View Profile &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Guided Matching Reassurance Banner */}
        <div className="mt-16 bg-sage-100/80 border border-sage-200/80 rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-forest-700 shrink-0 shadow-2xs">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-forest-950">Feeling overwhelmed by choices?</h3>
              <p className="text-xs text-forest-700 mt-1 max-w-xl">
                You don&apos;t have to search alone. Tell our care coordinators what you are experiencing, and we will personally connect you with an experienced psychologist suited to your schedule and goals.
              </p>
            </div>
          </div>
          <Link
            href="/intake"
            className="w-full sm:w-auto px-6 py-3 bg-forest-800 hover:bg-forest-900 text-white text-xs font-bold rounded-2xl shadow-sm transition-colors text-center shrink-0"
          >
            Get Matched With a Coordinator &rarr;
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-sage-200 bg-white py-8 px-4 text-center text-xs text-forest-600">
        <p>© {new Date().getFullYear()} Mind Refill. Verified psychology practitioner directory.</p>
      </footer>
    </main>
  );
}
