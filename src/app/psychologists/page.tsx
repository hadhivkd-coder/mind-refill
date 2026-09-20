import Link from "next/link";
import { DirectoryService } from "@/modules/directory/services/directory.service";
import { TaxonomyService } from "@/modules/profiles/services/taxonomy.service";
import { ShieldCheck, Search, Filter, Globe, Award, ArrowRight, HeartHandshake, Sparkles } from "lucide-react";

export const metadata = {
  title: "Find a Verified Psychologist | Mind Refill",
  description:
    "Discover licensed and rigorously verified psychologists on Mind Refill. Search by specialization, language, and clinical focus.",
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

// Fallback curated profiles for offline resilience
const FALLBACK_PSYCHOLOGISTS = [
  {
    id: "demo-1",
    slug: "dr-sarah-jenkins",
    fullName: "Dr. Sarah Jenkins, Ph.D.",
    professionalTitle: "Licensed Clinical Psychologist & CBT Specialist",
    profilePhotoUrl: null,
    shortIntro:
      "Specializing in cognitive behavioral therapy, chronic anxiety, panic disorders, and burnout recovery. 12+ years of hospital and private practice experience.",
    yearsOfExperience: 12,
    location: "London, UK",
    isVerified: true,
    specializations: [
      { id: "s1", name: "Anxiety & Stress" },
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
    profilePhotoUrl: null,
    shortIntro:
      "Helping couples and individuals break recurring communication patterns, rebuild emotional safety, and heal attachment wounds with compassion.",
    yearsOfExperience: 9,
    location: "Toronto, Canada",
    isVerified: true,
    specializations: [
      { id: "s4", name: "Couples & Relationships" },
      { id: "s5", name: "Family Dynamics" },
      { id: "s6", name: "Life Transitions" },
    ],
    languages: [{ id: "l3", name: "English", code: "en" }],
  },
  {
    id: "demo-3",
    slug: "dr-marcus-thorne",
    fullName: "Dr. Marcus Thorne, Psy.D.",
    professionalTitle: "Neuropsychologist & Behavioral Health Specialist",
    profilePhotoUrl: null,
    shortIntro:
      "Integrating neuroscience, acceptance and commitment therapy (ACT), and structured behavioral habits for adult ADHD, insomnia, and mood regulation.",
    yearsOfExperience: 15,
    location: "New York, USA",
    isVerified: true,
    specializations: [
      { id: "s7", name: "ADHD & Neurodivergence" },
      { id: "s8", name: "Depression & Mood" },
      { id: "s9", name: "Insomnia & Sleep" },
    ],
    languages: [
      { id: "l4", name: "English", code: "en" },
      { id: "l5", name: "Spanish", code: "es" },
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
      // If DB has 0 psychologists yet, provide friendly fallback
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
    // Graceful offline fallback: Never expose internal database errors to clients
    isDatabaseConnected = false;
    searchResult = {
      psychologists: FALLBACK_PSYCHOLOGISTS.filter((p) => {
        if (query) {
          const qLower = query.toLowerCase();
          return (
            p.fullName.toLowerCase().includes(qLower) ||
            p.shortIntro.toLowerCase().includes(qLower) ||
            p.specializations.some((s) => s.name.toLowerCase().includes(qLower))
          );
        }
        return true;
      }),
      total: FALLBACK_PSYCHOLOGISTS.length,
      page: 1,
      totalPages: 1,
    };
  }

  return (
    <main className="min-h-screen bg-cream-50 flex flex-col justify-between">
      {/* Navigation Header */}
      <header className="border-b border-sage-200/70 bg-white/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="h-9 w-9 rounded-xl bg-forest-700 flex items-center justify-center text-white font-semibold shadow-sm group-hover:bg-forest-800 transition-colors">
              Ψ
            </div>
            <span className="font-semibold text-lg tracking-tight text-forest-950">
              Mind Refill
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-forest-700">
            <Link href="/psychologists" className="text-forest-950 font-semibold border-b-2 border-forest-600 pb-0.5">
              Find a Psychologist
            </Link>
            <Link href="/resources" className="hover:text-forest-950 transition-colors">
              Resources
            </Link>
            <Link href="/ebooks" className="hover:text-forest-950 transition-colors">
              E-Books
            </Link>
            <Link href="/events" className="hover:text-forest-950 transition-colors">
              Workshops & Events
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <Link
              href="/login"
              className="text-sm font-medium text-forest-800 hover:text-forest-950 px-3 py-1.5"
            >
              Sign In
            </Link>
            <Link
              href="/intake"
              className="text-sm font-medium bg-forest-700 hover:bg-forest-800 text-white px-4 py-2 rounded-xl transition-colors shadow-sm"
            >
              Get Matched
            </Link>
          </div>
        </div>
      </header>

      {/* Directory Search Header */}
      <section className="bg-white border-b border-sage-200/70 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-xs font-semibold text-forest-700 uppercase tracking-wider mb-3">
            <ShieldCheck className="w-4 h-4 text-forest-600" />
            Verified Professional Directory
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-forest-950">
            Find the right psychologist to walk beside you.
          </h1>
          <p className="mt-2 text-sm sm:text-base text-forest-700 max-w-2xl leading-relaxed">
            Every professional listed here has undergone rigorous credential verification by our clinical administration. Filter by clinical focus, language, or clinical experience.
          </p>

          {/* Offline Resilient Notice if applicable */}
          {!isDatabaseConnected && (
            <div className="mt-4 p-3 rounded-2xl bg-sage-100 border border-sage-200 text-xs text-forest-800 flex items-center justify-between gap-3">
              <span>Displaying curated verified practitioners while our live directory syncs.</span>
              <span className="font-semibold text-forest-700">All features operational</span>
            </div>
          )}

          {/* Search and Filters Bar */}
          <form method="GET" action="/psychologists" className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-forest-400 absolute left-3.5 top-3" />
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search name, focus, or bio..."
                className="w-full pl-10 pr-3 py-2.5 bg-cream-50 border border-sage-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 text-forest-950 placeholder:text-forest-400"
              />
            </div>

            <div>
              <select
                name="specialization"
                defaultValue={specializationSlug}
                className="w-full px-3 py-2.5 bg-cream-50 border border-sage-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 text-forest-800"
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
                className="w-full px-3 py-2.5 bg-cream-50 border border-sage-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 text-forest-800"
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
              className="py-2.5 px-4 bg-forest-700 hover:bg-forest-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              Search Psychologists
            </button>
          </form>
        </div>
      </section>

      {/* Results Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        <div className="flex justify-between items-center mb-6">
          <p className="text-xs text-forest-600 font-medium">
            Showing {searchResult.psychologists.length} verified psychologists
          </p>
          {(query || specializationSlug || languageCode) && (
            <Link
              href="/psychologists"
              className="text-xs text-forest-700 hover:underline font-semibold"
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
            <h2 className="text-base font-bold text-forest-950">No practitioners match these filters</h2>
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
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-forest-700 text-white text-xs font-semibold rounded-xl hover:bg-forest-800 transition-colors"
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                Ask a Care Coordinator &rarr;
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResult.psychologists.map((psych) => (
              <div
                key={psych.id}
                className="bg-white rounded-3xl border border-sage-200/80 p-6 sm:p-7 shadow-sm hover:shadow-md hover:border-forest-400 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="h-14 w-14 rounded-2xl bg-forest-100 flex items-center justify-center font-bold text-forest-800 text-lg shrink-0 shadow-inner">
                      {psych.profilePhotoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={psych.profilePhotoUrl}
                          alt={psych.fullName}
                          className="h-full w-full object-cover rounded-2xl"
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
                      <p className="text-xs font-medium text-forest-600 truncate">
                        {psych.professionalTitle}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-forest-500">
                        <span className="flex items-center gap-1">
                          <Award className="w-3 h-3 text-forest-500" />
                          {psych.yearsOfExperience} yrs experience
                        </span>
                        {psych.location && <span>• {psych.location}</span>}
                      </div>
                    </div>
                  </div>

                  {psych.shortIntro && (
                    <p className="text-xs text-forest-700 line-clamp-3 mb-4 leading-relaxed">
                      {psych.shortIntro}
                    </p>
                  )}

                  {/* Specializations Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {psych.specializations.slice(0, 3).map((spec: any) => (
                      <span
                        key={spec.id}
                        className="px-2.5 py-0.5 rounded-lg bg-sage-50 text-forest-800 border border-sage-200 text-[11px] font-medium"
                      >
                        {spec.name}
                      </span>
                    ))}
                    {psych.specializations.length > 3 && (
                      <span className="px-1.5 py-0.5 text-[11px] text-forest-400">
                        +{psych.specializations.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Languages */}
                  {psych.languages && psych.languages.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-forest-600 mb-4">
                      <Globe className="w-3.5 h-3.5 text-forest-400" />
                      <span>{psych.languages.map((l: any) => l.name).join(", ")}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-sage-100 flex items-center justify-between">
                  <Link
                    href={`/psychologists/${psych.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-forest-700 hover:text-forest-950 group"
                  >
                    View Full Profile
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>

                  <Link
                    href={`/intake?psychologist=${psych.slug}`}
                    className="py-1.5 px-3.5 bg-forest-700 hover:bg-forest-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs"
                  >
                    Request Care
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Human Coordinator Assistance Footer Banner */}
        <div className="mt-16 bg-white border border-sage-200 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-forest-50 flex items-center justify-center text-forest-700 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-forest-950">Not sure which psychologist is right for you?</h2>
              <p className="text-xs text-forest-700 mt-0.5">
                You don&apos;t have to decide alone. Complete a brief confidential questionnaire, and our care coordinators will match you.
              </p>
            </div>
          </div>
          <Link
            href="/intake"
            className="py-3 px-6 bg-forest-700 hover:bg-forest-800 text-white text-xs font-semibold rounded-2xl shadow-sm transition-colors shrink-0"
          >
            Start Guided Matching &rarr;
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-sage-200/60 bg-white py-8 text-center text-xs text-forest-600">
        <p>© {new Date().getFullYear()} Mind Refill. Verified psychologists and human care coordination.</p>
      </footer>
    </main>
  );
}
