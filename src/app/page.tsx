import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Users, Sparkles, MessageCircle, BookOpen, ChevronRight, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { DirectoryService } from "@/modules/directory/services/directory.service";

const BRING_YOU_HERE_CARDS = [
  {
    id: "talk",
    icon: MessageCircle,
    title: "Talk to someone",
    desc: "Speak with a professional who can listen and help.",
    link: "/intake",
  },
  {
    id: "find",
    icon: Users,
    title: "Find a psychologist",
    desc: "Browse our directory to find your perfect match.",
    link: "/psychologists",
  },
  {
    id: "understand",
    icon: Sparkles,
    title: "Understand what I'm feeling",
    desc: "Discover insights into your emotional patterns.",
    link: "/intake",
  },
  {
    id: "explore",
    icon: BookOpen,
    title: "Explore resources",
    desc: "Read articles, watch videos, and learn.",
    link: "/resources",
  },
];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch real verified psychologists directly from the database via DirectoryService
  // Wrapped in try/catch to gracefully handle DB connection errors in production
  let psychologists: any[] = [];
  try {
    const result = await DirectoryService.search({ limit: 3 });
    psychologists = result.psychologists;
  } catch (error) {
    console.error("Failed to fetch featured psychologists:", error);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F2] text-[#29272C] font-sans selection:bg-[#A99BC7] selection:text-white">
      <Navbar />

      <main className="flex-grow">
        {/* ========================================================================= */}
        {/* 1. HERO SECTION (Light, Airy, Calm) */}
        {/* ========================================================================= */}
        <section className="relative w-full pt-16 pb-20 md:pt-28 md:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Subtle background color field */}
          <div className="absolute top-0 right-0 w-[80vw] md:w-[50vw] h-[80vh] bg-[#F7F5FA] rounded-bl-[100px] -z-10" />

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Typography & CTAs */}
            <div className="space-y-8 md:space-y-10 max-w-2xl">
              <h1 className="text-[2.75rem] sm:text-5xl md:text-[4rem] font-medium text-[#29272C] leading-[1.05] tracking-tight">
                You don&apos;t have to <br className="hidden sm:block" />
                figure it all out alone.
              </h1>

              <p className="text-lg md:text-xl text-[#62547F] font-light leading-relaxed max-w-lg">
                A safe, simple space to find the right support — at your own pace.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
                <Link
                  href="/psychologists"
                  className="h-14 px-8 rounded-full bg-[#62547F] hover:bg-[#29272C] text-white font-medium text-[15px] flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Find support</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/intake"
                  className="h-14 px-8 rounded-full bg-white border border-[#EEEAF5] hover:border-[#A99BC7] text-[#62547F] font-medium text-[15px] flex items-center justify-center transition-colors"
                >
                  <span>I&apos;m not sure where to start</span>
                </Link>
              </div>

              <div className="pt-2">
                <Link href="/psychologists" className="inline-flex items-center gap-1 text-[14px] text-[#A99BC7] hover:text-[#62547F] font-medium transition-colors">
                  Meet our psychologists <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Photography */}
            <div className="relative w-full aspect-square md:aspect-[4/3] rounded-[2rem] overflow-hidden soft-shadow">
              <Image
                src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200"
                alt="Calm, natural light interior"
                fill
                priority
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. "WHAT BRINGS YOU HERE?" SECTION */}
        {/* ========================================================================= */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            <div className="text-center md:text-left max-w-2xl">
              <h2 className="text-[2rem] md:text-[2.5rem] font-medium text-[#29272C] tracking-tight">
                What brings you here?
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {BRING_YOU_HERE_CARDS.map((card) => {
                const IconComponent = card.icon;
                return (
                  <Link
                    key={card.id}
                    href={card.link}
                    className="group bg-[#FAF8F2] hover:bg-[#F7F5FA] border border-[#EEEAF5] hover:border-[#A99BC7] rounded-2xl p-6 md:p-8 transition-colors flex flex-col justify-between space-y-6"
                  >
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#62547F] soft-shadow-hover transition-all">
                      <IconComponent className="w-5 h-5 stroke-[1.5]" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-[1.1rem] font-medium text-[#29272C]">
                        {card.title}
                      </h3>
                      <p className="text-[14px] text-[#62547F] font-light leading-relaxed">
                        {card.desc}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. NOT SURE WHERE TO START? (Guided Intake Block) */}
        {/* ========================================================================= */}
        <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto bg-[#F7F5FA] rounded-[2rem] p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
            <div className="space-y-4 max-w-xl text-center md:text-left">
              <h2 className="text-[2rem] md:text-[2.5rem] font-medium text-[#29272C] tracking-tight">
                Not sure where to start?
              </h2>
              <p className="text-[16px] md:text-[18px] text-[#62547F] font-light leading-relaxed">
                That&apos;s okay. Tell us a little about what&apos;s going on and we&apos;ll help you find the right next step.
              </p>
            </div>
            <div className="flex-shrink-0 w-full md:w-auto">
              <Link
                href="/intake"
                className="w-full md:w-auto h-14 px-8 rounded-full bg-[#29272C] hover:bg-[#62547F] text-white font-medium text-[15px] flex items-center justify-center gap-2 transition-colors"
              >
                <span>Help me find support</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. PSYCHOLOGIST DISCOVERY */}
        {/* ========================================================================= */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <h2 className="text-[2rem] md:text-[2.5rem] font-medium text-[#29272C] tracking-tight">
                Meet people who understand.
              </h2>
              <Link
                href="/psychologists"
                className="inline-flex items-center gap-1 text-[15px] font-medium text-[#62547F] hover:text-[#29272C] transition-colors"
              >
                <span>View all psychologists</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {psychologists.map((psych) => (
                <div
                  key={psych.id}
                  className="bg-[#FAF8F2] border border-[#EEEAF5] rounded-[1.5rem] overflow-hidden flex flex-col"
                >
                  <div className="p-6 md:p-8 flex flex-col gap-6">
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
                      </div>
                    </div>

                    <div className="space-y-4 text-[13.5px]">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-start gap-2">
                          <span className="text-[#A99BC7] w-20 flex-shrink-0">Specialties</span>
                          <span className="text-[#29272C]">
                            {psych.specializations.map(s => s.name).join(", ") || "General Practice"}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-[#A99BC7] w-20 flex-shrink-0">Languages</span>
                          <span className="text-[#29272C]">
                            {psych.languages.map(l => l.name).join(", ") || "English"}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-[#A99BC7] w-20 flex-shrink-0">Experience</span>
                          <span className="text-[#29272C]">{psych.yearsOfExperience} years</span>
                        </div>
                      </div>
                    </div>
                  </div>

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
              {psychologists.length === 0 && (
                 <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 text-[#62547F]">
                    No verified psychologists available at the moment. Please check back later.
                 </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
