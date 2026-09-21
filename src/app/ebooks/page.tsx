import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BookMarked, BookOpen, ShieldCheck, Check, Sparkles, ArrowRight } from "lucide-react";
import { EbookService } from "@/modules/content/services/ebook.service";

export const metadata = {
  title: "Clinical E-Books & Guided Workbooks | Mind Refill",
  description:
    "Structured psychological workbooks, clinical guides, and evidence-based reflection exercises to support your emotional wellbeing journey.",
};

export const dynamic = "force-dynamic";

const SAMPLE_EBOOKS = [
  {
    id: "eb-1",
    slug: "overcoming-anxiety-companion-workbook",
    title: "The Anxiety Companion: A CBT-Based Workbook for Daily Calming",
    description:
      "A comprehensive, step-by-step workbook featuring cognitive restructuring worksheets, exposure hierarchies, and somatic grounding rituals tested over a decade of clinical practice.",
    coverImageUrl: null,
    priceMajor: "499.00",
    currency: "INR",
    authorName: "Dr. Sarah Jenkins, Ph.D.",
    authorTitle: "Licensed Clinical Psychologist",
    authorSlug: "dr-sarah-jenkins",
    pageCount: 124,
    format: "Instant PDF & Interactive Reader",
  },
  {
    id: "eb-2",
    slug: "secure-attachment-and-couples-workbook",
    title: "From Reactivity to Connection: The Couples Attachment Guide",
    description:
      "Practical communication scripts, de-escalation protocols, and emotional attunement practices for couples wanting to build secure emotional intimacy.",
    coverImageUrl: null,
    priceMajor: "599.00",
    currency: "INR",
    authorName: "Elena Vance, LMFT",
    authorTitle: "Couples & Family Therapist",
    authorSlug: "elena-vance",
    pageCount: 148,
    format: "Instant PDF & Interactive Reader",
  },
  {
    id: "eb-3",
    slug: "sleep-restoration-insomnia-manual",
    title: "Restoring Natural Sleep: A Clinician's CBT-I Protocol",
    description:
      "A structured 6-week cognitive-behavioral therapy protocol for chronic insomnia, racing nighttime thoughts, and circadian disruption.",
    coverImageUrl: null,
    priceMajor: "399.00",
    currency: "INR",
    authorName: "Dr. Marcus Thorne, Psy.D.",
    authorTitle: "Neuropsychologist & Sleep Specialist",
    authorSlug: "dr-marcus-thorne",
    pageCount: 96,
    format: "Instant PDF & Interactive Reader",
  },
];

export default async function EbooksPage() {
  let ebooks: any[] = [];

  try {
    const dbEbooks = await EbookService.listPublicEbooks();
    if (dbEbooks && dbEbooks.length > 0) {
      ebooks = dbEbooks.map((e: any) => ({
        id: e.id,
        slug: e.slug,
        title: e.title,
        description: e.description,
        coverImageUrl: e.coverImageUrl,
        priceMajor: e.priceMajor,
        currency: e.currency,
        authorName: e.author?.name || "Verified Clinician",
        authorTitle: e.author?.title || "Licensed Psychologist",
        authorSlug: e.author?.slug || "",
        pageCount: 110,
        format: "Instant PDF & Interactive Reader",
      }));
    } else {
      ebooks = SAMPLE_EBOOKS;
    }
  } catch {
    ebooks = SAMPLE_EBOOKS;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#173C32] text-[#F7F3E9] selection:bg-[#3F6855] selection:text-[#F1EBDD]">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="pt-14 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#173C32] via-[#1C473C] to-[#244F42] border-b border-white/5 text-center">
          <div className="max-w-4xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#C9D2BC]">
              <BookMarked className="w-3.5 h-3.5 text-[#9CAF91]" />
              <span>Curated Psychological Library</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-normal text-[#F7F3E9] leading-tight">
              Tools for understanding yourself, one page at a time.
            </h1>

            <p className="text-sm sm:text-base text-[#C9D2BC] max-w-2xl mx-auto font-light leading-relaxed">
              Practical exercises, psychoeducational frameworks, and guided reflection prompts designed by licensed psychologists for structured personal healing.
            </p>

            <div className="pt-2 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#C9D2BC] text-xs font-medium">
              <span className="h-2 w-2 rounded-full bg-[#9CAF91] animate-pulse" />
              <span>Digital companions with printable exercises and clinician worksheets.</span>
            </div>
          </div>
        </section>

        {/* Catalog Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 flex-1 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ebooks.map((ebook) => (
              <div
                key={ebook.id}
                className="atmospheric-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between group hover:border-[#9CAF91]/50 transition-all"
              >
                <div>
                  {/* Book Cover Mockup */}
                  <div className="h-56 w-full rounded-2xl bg-gradient-to-br from-[#122C25] via-[#173C32] to-[#244F42] p-6 text-white flex flex-col justify-between border border-white/10 relative overflow-hidden mb-6 shadow-inner">
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-[#3F6855]/30 blur-xl pointer-events-none" />
                    <div>
                      <span className="text-[10px] font-semibold text-[#9CAF91] uppercase tracking-widest block mb-1">
                        Mind Refill Publication
                      </span>
                      <h3 className="font-serif text-lg font-normal leading-snug line-clamp-3 text-[#F7F3E9]">
                        {ebook.title}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#C9D2BC] pt-3 border-t border-white/10">
                      <span className="truncate max-w-[140px]">{ebook.authorName}</span>
                      <span className="font-medium px-2.5 py-0.5 rounded-full bg-[#173C32] text-[10px] text-[#F1EBDD] border border-white/10">
                        Guided Manual
                      </span>
                    </div>
                  </div>

                  <h2 className="font-serif text-xl font-normal text-[#F7F3E9] leading-snug mb-2 group-hover:text-[#F1EBDD] transition-colors">
                    {ebook.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-[#C9D2BC] leading-relaxed line-clamp-3 mb-5 font-light">
                    {ebook.description}
                  </p>

                  <div className="space-y-2 mb-6 text-xs text-[#9CAF91]">
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#C9D2BC] shrink-0" />
                      <span>{ebook.pageCount} pages of structured clinical exercises</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#C9D2BC] shrink-0" />
                      <span>Printable worksheets & reflection exercises</span>
                    </div>
                  </div>
                </div>

                <div className="pt-5 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#9CAF91] font-semibold block">
                      Access Mode
                    </span>
                    <span className="text-xs font-semibold text-[#F7F3E9]">
                      Instant PDF & Reader
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <Link
                      href={`/ebooks/${ebook.slug}`}
                      className="inline-flex items-center gap-2 py-2.5 px-4 bg-[#F1EBDD] hover:bg-white text-[#173C32] text-xs font-semibold rounded-full shadow-sm transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Read & Access</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Clinician Ethos Banner */}
          <div className="mt-16 atmospheric-card rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#F1EBDD] shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#F7F3E9]">Ethically Authored & Clinically Reviewed</h3>
                <p className="text-xs text-[#C9D2BC] mt-0.5 font-light">
                  Every workbook is authored by verified, registered practitioners and grounded in contemporary therapeutic research.
                </p>
              </div>
            </div>
            <Link
              href="/psychologists"
              className="text-xs font-semibold text-[#F1EBDD] hover:text-white shrink-0 underline underline-offset-4 flex items-center gap-1"
            >
              <span>Meet the Authors</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
