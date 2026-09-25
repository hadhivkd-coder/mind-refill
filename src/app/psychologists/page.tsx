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
  HeartHandshake,
  Compass,
  CheckCircle2,
  Users
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
  };
}

export default async function PsychologistsDirectoryPage({
  searchParams,
}: DirectoryPageProps) {
  const query = searchParams.q || "";
  const specializationSlug = searchParams.specialization || "";

  // Fetch real data (wrapped in try-catch for safe production rendering)
  let psychologists: any[] = [];
  let specializations: any[] = [];

  try {
    const result = await DirectoryService.search({
      query,
      specializationSlug,
      limit: 50,
    });
    psychologists = result.psychologists;
    specializations = await TaxonomyService.getActiveSpecializations();
  } catch (err) {
    console.error("Failed to load directory data:", err);
  }

  // If DB has no specializations, fallback to UI list
  const FALLBACK_SPECIALIZATIONS = specializations.length > 0 ? specializations : [
    { name: "Anxiety", slug: "anxiety" },
    { name: "Depression", slug: "depression" },
    { name: "Trauma & PTSD", slug: "trauma-ptsd" },
    { name: "Relationships", slug: "relationships" },
    { name: "Life Transitions", slug: "life-transitions" },
    { name: "Stress & Burnout", slug: "stress-burnout" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F2] text-[#29272C] font-sans selection:bg-[#A99BC7] selection:text-white">
      <Navbar />

      <main className="flex-grow">
        {/* ========================================================================= */}
        {/* HERO & SEARCH BAR */}
        {/* ========================================================================= */}
        <section className="relative pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-[2.5rem] md:text-[3.5rem] font-medium text-[#29272C] leading-tight tracking-tight">
            Meet people who understand.
          </h1>
          <p className="text-[16px] md:text-[18px] text-[#62547F] font-light max-w-2xl mx-auto leading-relaxed">
            Connect with qualified, compassionate psychologists who specialize in exactly what you&apos;re going through.
          </p>

          <div className="pt-6 max-w-2xl mx-auto space-y-6">
            <form action="/psychologists" method="GET" className="relative w-full">
              <div className="relative flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-[#A99BC7]" />
                <input
                  type="text"
                  name="q"
                  defaultValue={query}
                  placeholder="Search by name or focus area..."
                  className="w-full h-14 pl-12 pr-28 rounded-full bg-white border border-[#EEEAF5] text-[#29272C] placeholder:text-[#A99BC7] focus:outline-none focus:ring-2 focus:ring-[#A99BC7]/30 transition-all text-sm soft-shadow"
                />
                <button
                  type="submit"
                  className="absolute right-2 h-10 px-5 rounded-full bg-[#62547F] hover:bg-[#29272C] text-white text-[13px] font-medium transition-colors"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Specialty filter chips */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link
                href="/psychologists"
                className={`px-4 py-2 rounded-full text-[13px] font-medium transition-colors ${
                  !specializationSlug
                    ? "bg-[#62547F] text-white"
                    : "bg-white border border-[#EEEAF5] text-[#62547F] hover:border-[#A99BC7]"
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
                    className={`px-4 py-2 rounded-full text-[13px] font-medium transition-colors ${
                      active
                        ? "bg-[#62547F] text-white"
                        : "bg-white border border-[#EEEAF5] text-[#62547F] hover:border-[#A99BC7]"
                    }`}
                  >
                    {spec.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* DIRECTORY LISTINGS */}
        {/* ========================================================================= */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {psychologists.length === 0 ? (
            <div className="text-center py-16 bg-white border border-[#EEEAF5] rounded-[2rem] p-8 max-w-lg mx-auto space-y-4 shadow-sm">
              <Compass className="w-10 h-10 text-[#A99BC7] mx-auto" />
              <h3 className="text-xl font-medium text-[#29272C]">
                No exact match found
              </h3>
              <p className="text-[14px] text-[#62547F] leading-relaxed">
                We couldn&apos;t find a practitioner matching those exact filters. Try clearing your search or let our coordinators help you.
              </p>
              <div className="pt-4">
                <Link
                  href="/psychologists"
                  className="px-6 py-3 rounded-full bg-[#EEEAF5] hover:bg-[#A99BC7] text-[#29272C] text-[14px] font-medium inline-block transition-colors"
                >
                  Clear Filters
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {psychologists.map((psych) => (
                <div
                  key={psych.id}
                  className="bg-white border border-[#EEEAF5] rounded-[1.5rem] overflow-hidden flex flex-col soft-shadow-hover transition-all duration-300 group"
                >
                  <div className="p-6 md:p-8 flex flex-col gap-6">
                    {/* Header: Photo + Name */}
                    <div className="flex items-start gap-4">
                      <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 bg-[#EEEAF5]">
                        {psych.profilePhotoUrl ? (
                          <Image
                            src={psych.profilePhotoUrl}
                            alt={psych.fullName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#A99BC7]">
                            <Users className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-[1.15rem] font-medium text-[#29272C]">
                            {psych.fullName}
                          </h3>
                          {psych.isVerified && (
                            <CheckCircle2 className="w-4 h-4 text-[#AAB8A2]" />
                          )}
                        </div>
                        <p className="text-[13px] text-[#62547F]">
                          {psych.professionalTitle}
                        </p>
                        <p className="text-[12px] text-[#A99BC7] pt-1">
                          {psych.yearsOfExperience} yrs exp
                        </p>
                      </div>
                    </div>

                    {/* Short Intro */}
                    {psych.shortIntro && (
                      <p className="text-[13px] sm:text-[14px] text-[#62547F] font-light leading-relaxed line-clamp-3">
                        {psych.shortIntro}
                      </p>
                    )}

                    {/* Metadata Table */}
                    <div className="space-y-4 text-[13.5px]">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-start gap-2">
                          <span className="text-[#A99BC7] w-20 flex-shrink-0">Specialties</span>
                          <span className="text-[#29272C]">
                            {psych.specializations.map((spec: any) => spec.name).join(", ") || "General Practice"}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-[#A99BC7] w-20 flex-shrink-0">Languages</span>
                          <span className="text-[#29272C]">
                            {psych.languages.map((l: any) => l.name).join(", ") || "English"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Profile Action */}
                  <div className="px-6 pb-6 pt-2 mt-auto flex items-center gap-3">
                    <Link
                      href={`/psychologists/${psych.slug}`}
                      className="flex-1 h-12 rounded-full bg-white border border-[#EEEAF5] hover:border-[#A99BC7] text-[#29272C] font-medium text-[14px] text-center flex items-center justify-center transition-colors"
                    >
                      View profile
                    </Link>
                    <Link
                      href={`/psychologists/${psych.slug}/book`}
                      className="flex-1 h-12 rounded-full bg-[#62547F] hover:bg-[#29272C] text-white font-medium text-[14px] text-center flex items-center justify-center transition-colors"
                    >
                      Book
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* GUIDED MATCHING CALLOUT */}
        {/* ========================================================================= */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 pb-24">
          <div className="max-w-4xl mx-auto bg-[#F7F5FA] p-8 md:p-12 rounded-[2rem] text-center space-y-6">
            <div className="w-14 h-14 mx-auto rounded-full bg-white border border-[#EEEAF5] flex items-center justify-center">
              <HeartHandshake className="w-6 h-6 text-[#A99BC7]" />
            </div>
            <h3 className="text-2xl md:text-3xl font-medium text-[#29272C]">
              Not sure which psychologist is right for you?
            </h3>
            <p className="text-[15px] md:text-[16px] text-[#62547F] max-w-xl mx-auto font-light leading-relaxed">
              Take 3 minutes to share what you&apos;re going through. Our care coordinators will review your focus areas and connect you thoughtfully.
            </p>
            <div className="pt-4">
              <Link
                href="/intake"
                className="inline-flex items-center gap-2 px-8 h-14 rounded-full bg-[#29272C] hover:bg-[#62547F] text-white font-medium text-[15px] transition-colors"
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
