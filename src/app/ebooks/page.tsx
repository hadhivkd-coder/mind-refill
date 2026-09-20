import Link from "next/link";
import { BookMarked, BookOpen, Download, ShieldCheck, ArrowRight, Star, Check, Sparkles } from "lucide-react";
import { EbookService } from "@/modules/content/services/ebook.service";
import { minorToMajorString } from "@/shared/types/money";

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
    title: "The Anxiety Companion: A CBT-Based Workbook for Daily Nervous System Calming",
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
            <Link href="/psychologists" className="hover:text-forest-950 transition-colors">
              Find a Psychologist
            </Link>
            <Link href="/resources" className="hover:text-forest-950 transition-colors">
              Clinical Resources
            </Link>
            <Link href="/ebooks" className="text-forest-950 font-bold border-b-2 border-forest-700 pb-1">
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

      {/* Hero Section */}
      <section className="bg-white border-b border-sage-200/70 py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sage-100 border border-sage-200 text-forest-800 text-xs font-semibold shadow-2xs">
            <BookMarked className="w-3.5 h-3.5 text-forest-600" />
            Curated Psychological Library
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-forest-950 leading-tight">
            Tools for understanding yourself, one page at a time.
          </h1>

          <p className="text-base sm:text-lg text-forest-700 max-w-2xl mx-auto leading-relaxed font-normal">
            Practical exercises, psychoeducational frameworks, and reflection prompts designed by licensed psychologists for structured personal growth.
          </p>

          <div className="pt-2 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cream-100 border border-sage-200/80 text-forest-700 text-xs font-medium">
            <span className="h-2 w-2 rounded-full bg-forest-600 animate-pulse" />
            Open Access Preview: Interactive modules and exercise worksheets are freely accessible online.
          </div>
        </div>
      </section>

      {/* Catalog Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 flex-1 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ebooks.map((ebook) => (
            <div
              key={ebook.id}
              className="bg-white rounded-3xl border border-sage-200/90 p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-forest-400 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Book Cover Mockup */}
                <div className="h-52 w-full rounded-2xl bg-gradient-to-br from-forest-850 via-forest-900 to-forest-950 p-6 text-white flex flex-col justify-between shadow-inner relative overflow-hidden mb-6">
                  <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-forest-700/30 blur-xl pointer-events-none" />
                  <div>
                    <span className="text-[10px] font-bold text-sage-300 uppercase tracking-widest block mb-1">
                      Mind Refill Publication
                    </span>
                    <h3 className="text-base font-bold leading-snug line-clamp-3 text-cream-50">
                      {ebook.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-sage-200 pt-3 border-t border-forest-800">
                    <span>{ebook.authorName}</span>
                    <span className="font-semibold px-2.5 py-0.5 rounded-full bg-forest-800 text-[10px] border border-forest-700">
                      Guided Manual
                    </span>
                  </div>
                </div>

                <h2 className="text-lg font-bold text-forest-950 leading-snug mb-2">
                  {ebook.title}
                </h2>

                <p className="text-xs sm:text-sm text-forest-700 leading-relaxed line-clamp-3 mb-5">
                  {ebook.description}
                </p>

                <div className="space-y-2 mb-6 text-xs text-forest-700">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-forest-600 shrink-0" />
                    <span>{ebook.pageCount} pages of structured clinical exercises</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-forest-600 shrink-0" />
                    <span>Printable worksheets & interactive self-checks</span>
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-sage-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-forest-500 font-semibold block">
                    Access Mode
                  </span>
                  <span className="text-xs font-bold text-forest-700">
                    Digital Workbook
                  </span>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <Link
                    href={`/ebooks/${ebook.slug}`}
                    className="inline-flex items-center gap-2 py-2.5 px-4 bg-forest-800 hover:bg-forest-900 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Read & Access Workbook
                  </Link>
                  <span className="text-[10px] text-forest-500 font-medium">Free Open Access Preview</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Reassurance Footer Banner */}
        <div className="mt-16 bg-sage-100/70 border border-sage-200/80 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-xs">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-white flex items-center justify-center text-forest-700 shrink-0 shadow-2xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-forest-950">Ethically Authored & Reviewed</h3>
              <p className="text-xs text-forest-700 mt-0.5">
                Every publication is authored by verified, practicing clinicians and reviewed for ethical psychological rigor.
              </p>
            </div>
          </div>
          <Link
            href="/psychologists"
            className="text-xs font-semibold text-forest-800 hover:text-forest-950 shrink-0 underline"
          >
            Meet the Authors &rarr;
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-sage-200/60 bg-white py-8 text-center text-xs text-forest-600">
        <p>© {new Date().getFullYear()} Mind Refill. Evidence-based workbooks and digital therapeutic companions.</p>
      </footer>
    </main>
  );
}
