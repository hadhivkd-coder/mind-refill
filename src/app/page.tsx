import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Search, ShieldCheck, Heart, Sparkles, MoveRight, UserPlus, PlayCircle, Star } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { DirectoryService } from "@/modules/directory/services/directory.service";
import { ContentService } from "@/modules/content/services/content.service";
import { EbookService } from "@/modules/content/services/ebook.service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch real data safely
  let psychologists: any[] = [];
  let articles: any[] = [];
  let ebooks: any[] = [];

  try {
    const pResult = await DirectoryService.search({ limit: 3 });
    psychologists = pResult.psychologists || [];
    
    // Attempt to fetch real content, fallback to empty arrays to prevent crashes
    const cResult = await ContentService.listPublicArticles(1, 3);
    articles = cResult.items || [];
    
    const eResult = await EbookService.listPublicEbooks();
    ebooks = eResult ? eResult.slice(0, 3) : [];
  } catch (err) {
    console.error("Failed to load homepage dynamic data:", err);
  }

  const MIND_CATEGORIES = [
    { title: "Feeling overwhelmed", id: "overwhelmed" },
    { title: "Relationship difficulties", id: "relationships" },
    { title: "Anxiety & stress", id: "anxiety" },
    { title: "Sleep & rest", id: "sleep" },
    { title: "Life changes", id: "changes" },
    { title: "Understanding yourself", id: "self" },
    { title: "Something else", id: "other" },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#FAF8F2] text-[#29272C] selection:bg-[#A99BC7] selection:text-white">
      <Navbar />

      <main className="flex-grow flex flex-col items-center">
        {/* ========================================================================= */}
        {/* 1. HERO SECTION */}
        {/* ========================================================================= */}
        <section className="relative w-full max-w-[1600px] mx-auto pt-16 pb-20 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-12 overflow-hidden">
          {/* Subtle background color shape for the right side */}
          <div className="absolute top-0 right-0 w-[90vw] md:w-[45vw] h-full bg-[#F7F5FA] rounded-l-[4rem] -z-10" />

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* LEFT: Typography & CTAs */}
            <div className="lg:col-span-5 space-y-8 md:space-y-10 z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#EEEAF5] text-[12px] font-medium text-[#62547F] shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Modern Mental Wellbeing</span>
              </div>

              <div className="space-y-6">
                <h1 className="text-[2.75rem] sm:text-5xl md:text-[4.25rem] font-medium text-[#29272C] leading-[1.05] tracking-tight">
                  You don&apos;t have to figure it all out alone.
                </h1>

                <p className="text-lg md:text-[1.35rem] text-[#62547F] font-light leading-relaxed max-w-lg">
                  A safe, simple space to find the right support — at your own pace.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  href="/psychologists"
                  className="h-14 px-8 rounded-full bg-[#62547F] hover:bg-[#29272C] text-white font-medium text-[15px] flex items-center justify-center gap-2 transition-colors shadow-md hover:shadow-xl hover:-translate-y-0.5 duration-300"
                >
                  <span>Find support</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/intake"
                  className="h-14 px-8 rounded-full bg-white border border-[#EEEAF5] hover:border-[#A99BC7] text-[#62547F] hover:text-[#29272C] font-medium text-[15px] flex items-center justify-center transition-colors shadow-sm"
                >
                  <span>I&apos;m not sure where to start</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 flex items-center gap-4 text-[13px] text-[#A99BC7]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#AAB8A2]" />
                  <span>Licensed Professionals</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-[#EEEAF5]" />
                <div className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-[#E8D4D8]" />
                  <span>Confidential Space</span>
                </div>
              </div>
            </div>

            {/* RIGHT: Large Emotional Image */}
            <div className="lg:col-span-7 relative w-full aspect-[4/3] md:aspect-[16/10] lg:aspect-[4/3] rounded-[2rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(98,84,127,0.15)]">
              <Image
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=1600"
                alt="Therapist listening warmly"
                fill
                priority
                className="object-cover object-top"
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. WHAT ARE YOU LOOKING FOR? */}
        {/* ========================================================================= */}
        <section className="w-full py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <h2 className="text-[2rem] md:text-[2.5rem] font-medium text-[#29272C] tracking-tight">
                What&apos;s on your mind?
              </h2>
              <p className="text-[#62547F] text-[16px] font-light">
                Click what feels relevant to you, and we&apos;ll help you find the right path forward.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 max-w-4xl mx-auto">
              {MIND_CATEGORIES.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/intake?focus=${cat.id}`}
                  className="px-6 py-4 rounded-2xl bg-[#FAF8F2] border border-[#EEEAF5] hover:border-[#A99BC7] hover:bg-[#F7F5FA] text-[#29272C] text-[15px] font-medium transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  {cat.title}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. HOW MIND REFILL WORKS */}
        {/* ========================================================================= */}
        <section className="w-full py-24 bg-[#F7F5FA]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-[2rem] md:text-[2.5rem] font-medium text-[#29272C] tracking-tight">
                How it works
              </h2>
            </div>

            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              {/* Desktop Connecting Line */}
              <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-[1px] bg-gradient-to-r from-transparent via-[#A99BC7] to-transparent opacity-30" />

              <div className="relative text-center space-y-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-white border border-[#EEEAF5] text-[#62547F] flex items-center justify-center font-medium text-xl shadow-sm z-10 relative">
                  01
                </div>
                <h3 className="text-xl font-medium text-[#29272C]">Tell us what you&apos;re going through</h3>
                <p className="text-[15px] text-[#62547F] font-light leading-relaxed">
                  Take a moment to share your feelings securely. You set the pace.
                </p>
              </div>

              <div className="relative text-center space-y-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-white border border-[#EEEAF5] text-[#62547F] flex items-center justify-center font-medium text-xl shadow-sm z-10 relative">
                  02
                </div>
                <h3 className="text-xl font-medium text-[#29272C]">Find the right psychologist</h3>
                <p className="text-[15px] text-[#62547F] font-light leading-relaxed">
                  We match you with professionals who specialize exactly in your needs.
                </p>
              </div>

              <div className="relative text-center space-y-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#62547F] text-white flex items-center justify-center font-medium text-xl shadow-md z-10 relative">
                  03
                </div>
                <h3 className="text-xl font-medium text-[#29272C]">Take your next step</h3>
                <p className="text-[15px] text-[#62547F] font-light leading-relaxed">
                  Book a session, read resources, or just start a conversation. It&apos;s up to you.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. MEET PSYCHOLOGISTS */}
        {/* ========================================================================= */}
        <section className="w-full py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div className="space-y-3 max-w-xl">
                <h2 className="text-[2rem] md:text-[2.5rem] font-medium text-[#29272C] tracking-tight leading-tight">
                  Meet people who understand.
                </h2>
                <p className="text-[16px] text-[#62547F] font-light">
                  Our network of verified, licensed professionals is here to listen.
                </p>
              </div>
              <Link
                href="/psychologists"
                className="inline-flex items-center gap-1 text-[15px] font-medium text-[#62547F] hover:text-[#29272C] transition-colors"
              >
                <span>View all psychologists</span>
                <MoveRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {psychologists.map((psych) => (
                <div
                  key={psych.id}
                  className="bg-[#FAF8F2] border border-[#EEEAF5] rounded-[1.5rem] overflow-hidden flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="p-6 md:p-8 flex flex-col gap-6">
                    <div className="flex items-start gap-4">
                      <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 bg-white border border-[#EEEAF5]">
                        {psych.profilePhotoUrl ? (
                          <Image
                            src={psych.profilePhotoUrl}
                            alt={psych.fullName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#A99BC7]">
                            <UserPlus className="w-7 h-7" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-1 pt-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-[1.15rem] font-medium text-[#29272C]">
                            {psych.fullName}
                          </h3>
                          {psych.isVerified && (
                            <ShieldCheck className="w-4 h-4 text-[#AAB8A2]" />
                          )}
                        </div>
                        <p className="text-[13px] text-[#62547F]">
                          {psych.professionalTitle}
                        </p>
                        <p className="text-[12px] text-[#A99BC7]">
                          {psych.yearsOfExperience} yrs exp
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 text-[13.5px]">
                      <div className="flex items-start gap-2">
                        <span className="text-[#A99BC7] w-[4.5rem] flex-shrink-0">Specialties</span>
                        <span className="text-[#29272C] leading-snug">
                          {psych.specializations?.map((s: any) => s.name).join(", ") || "General Practice"}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[#A99BC7] w-[4.5rem] flex-shrink-0">Languages</span>
                        <span className="text-[#29272C] leading-snug">
                          {psych.languages?.map((l: any) => l.name).join(", ") || "English"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-2 mt-auto">
                    <Link
                      href={`/psychologists/${psych.slug}`}
                      className="w-full h-12 rounded-full bg-white border border-[#EEEAF5] hover:border-[#A99BC7] text-[#29272C] font-medium text-[14px] flex items-center justify-center transition-colors"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              ))}
              {psychologists.length === 0 && (
                <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-16 bg-[#FAF8F2] border border-[#EEEAF5] rounded-[1.5rem] text-[#62547F]">
                  No verified psychologists available at the moment.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. CONTENT / RESOURCES */}
        {/* ========================================================================= */}
        <section className="w-full py-20 bg-[#FAF8F2] border-t border-[#EEEAF5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div className="space-y-3 max-w-xl">
                <h2 className="text-[2rem] md:text-[2.5rem] font-medium text-[#29272C] tracking-tight leading-tight">
                  Explore resources.
                </h2>
                <p className="text-[16px] text-[#62547F] font-light">
                  Articles, insights, and videos created directly by our professionals.
                </p>
              </div>
              <Link
                href="/resources"
                className="inline-flex items-center gap-1 text-[15px] font-medium text-[#62547F] hover:text-[#29272C] transition-colors"
              >
                <span>Browse all resources</span>
                <MoveRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {articles.length > 0 ? (
                articles.map((article) => (
                  <Link href={`/resources/${article.slug}`} key={article.id} className="group flex flex-col gap-4">
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#EEEAF5]">
                      {article.coverImageUrl ? (
                        <Image src={article.coverImageUrl} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#A99BC7]">
                          <PlayCircle className="w-8 h-8 opacity-50" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2 px-1">
                      <span className="text-[12px] font-medium text-[#62547F] uppercase tracking-wider">{article.category?.name || "Article"}</span>
                      <h3 className="text-lg font-medium text-[#29272C] group-hover:text-[#62547F] transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-[14px] text-[#62547F] line-clamp-2 font-light">
                        {article.excerpt || "Read more about this topic..."}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-1 md:col-span-3 text-center py-12 text-[#62547F]">
                  Resources are currently being updated.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. E-BOOKS / WORKBOOKS */}
        {/* ========================================================================= */}
        <section className="w-full py-20 bg-white border-t border-[#EEEAF5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div className="space-y-3 max-w-xl">
                <h2 className="text-[2rem] md:text-[2.5rem] font-medium text-[#29272C] tracking-tight leading-tight">
                  Guided Workbooks.
                </h2>
                <p className="text-[16px] text-[#62547F] font-light">
                  In-depth digital products to help you reflect, process, and grow.
                </p>
              </div>
              <Link
                href="/ebooks"
                className="inline-flex items-center gap-1 text-[15px] font-medium text-[#62547F] hover:text-[#29272C] transition-colors"
              >
                <span>View all workbooks</span>
                <MoveRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              {ebooks.length > 0 ? (
                ebooks.map((ebook) => (
                  <Link href={`/ebooks/${ebook.slug}`} key={ebook.id} className="group flex flex-col gap-4 p-4 rounded-2xl hover:bg-[#F7F5FA] transition-colors">
                    <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-[#EEEAF5] shadow-sm group-hover:shadow-md transition-shadow">
                      {ebook.coverImageUrl ? (
                        <Image src={ebook.coverImageUrl} alt={ebook.title} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#A99BC7]">
                          <BookOpen className="w-8 h-8 opacity-50" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-1.5 px-1 pt-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-[#29272C] line-clamp-1">{ebook.title}</h3>
                        <span className="text-[14px] font-medium text-[#62547F]">${ebook.price}</span>
                      </div>
                      <p className="text-[13px] text-[#A99BC7]">By {ebook.author?.fullName || "Mind Refill Professional"}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-1 md:col-span-3 text-center py-12 text-[#62547F]">
                  Workbooks are currently being updated.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. TRUST / PRIVACY */}
        {/* ========================================================================= */}
        <section className="w-full py-16 bg-[#FAF8F2] border-t border-[#EEEAF5]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
            <ShieldCheck className="w-10 h-10 text-[#AAB8A2] mx-auto opacity-80" />
            <h3 className="text-xl md:text-2xl font-medium text-[#29272C]">
              Your privacy is fundamental
            </h3>
            <p className="text-[15px] md:text-[16px] text-[#62547F] font-light leading-relaxed max-w-2xl mx-auto">
              We employ strict, bank-level encryption and do not sell your personal data. 
              Our professionals are rigorously vetted, verified, and bound by confidentiality agreements. 
              This is a safe space.
            </p>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 8. FINAL EMOTIONAL CTA */}
        {/* ========================================================================= */}
        <section className="w-full py-24 md:py-32 bg-white border-t border-[#EEEAF5]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-8">
            <h2 className="text-[2.5rem] md:text-[3.5rem] font-medium text-[#29272C] tracking-tight leading-tight">
              You don&apos;t need to have all the answers.
            </h2>
            <p className="text-xl md:text-2xl text-[#62547F] font-light">
              You only need a next step.
            </p>
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/intake"
                className="h-14 px-10 rounded-full bg-[#29272C] hover:bg-[#62547F] text-white font-medium text-[15px] flex items-center justify-center gap-2 transition-all shadow-md hover:-translate-y-0.5 duration-300 w-full sm:w-auto"
              >
                <span>Find my next step</span>
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
