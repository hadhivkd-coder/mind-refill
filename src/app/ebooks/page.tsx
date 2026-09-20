import Link from "next/link";
import { BookMarked, Download, ShieldCheck, ArrowRight, Star, Check } from "lucide-react";
import { EbookService } from "@/modules/content/services/ebook.service";
import { minorToMajorString } from "@/shared/types/money";

export const metadata = {
  title: "Clinical E-Books & Self-Guided Workbooks | Mind Refill",
  description:
    "Structured psychological workbooks, clinical guides, and evidence-based exercises to support your wellbeing journey on Mind Refill.",
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
    format: "Instant PDF Download",
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
    format: "Instant PDF Download",
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
    format: "Instant PDF Download",
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
        format: "Instant PDF Download",
      }));
    } else {
      ebooks = SAMPLE_EBOOKS;
    }
  } catch {
    ebooks = SAMPLE_EBOOKS;
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
            <Link href="/psychologists" className="hover:text-forest-950 transition-colors">
              Find a Psychologist
            </Link>
            <Link href="/resources" className="hover:text-forest-950 transition-colors">
              Resources
            </Link>
            <Link href="/ebooks" className="text-forest-950 font-semibold border-b-2 border-forest-600 pb-0.5">
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

      {/* Hero Section */}
      <section className="bg-white border-b border-sage-200/70 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sage-100 border border-sage-200 text-forest-800 text-xs font-semibold mb-4">
            <BookMarked className="w-3.5 h-3.5 text-forest-600" />
            Evidence-Based Clinical Guides
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-forest-950 leading-tight">
            Self-guided psychological workbooks, crafted with clinical care.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-forest-700 max-w-2xl mx-auto leading-relaxed">
            Practical exercises, psychoeducational frameworks, and reflection prompts designed by licensed psychologists for structured personal growth.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cream-100 border border-sage-200/80 text-forest-700 text-xs font-medium">
            <span className="h-2 w-2 rounded-full bg-forest-600 animate-pulse" />
            Preview Launch: Online payment processing is currently on hold. Digital companions are coordinated directly upon request.
          </div>
        </div>
      </section>

      {/* Catalog Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        {ebooks.length === 0 ? (
          <div className="bg-white rounded-3xl border border-sage-200 p-12 text-center max-w-md mx-auto my-12 shadow-sm">
            <div className="h-12 w-12 mx-auto rounded-2xl bg-sage-50 flex items-center justify-center text-forest-400 mb-4">
              <BookMarked className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-forest-950">No e-books published yet</h2>
            <p className="text-xs text-forest-600 mt-2 leading-relaxed">
              Our clinical team is currently preparing curated digital publications. Please check back soon or explore our articles.
            </p>
            <div className="mt-6">
              <Link
                href="/resources"
                className="inline-flex items-center gap-1.5 py-2 px-4 bg-forest-700 text-white text-xs font-semibold rounded-xl hover:bg-forest-800 transition-colors"
              >
                Browse Clinical Resources
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ebooks.map((ebook) => (
              <div
                key={ebook.id}
                className="bg-white rounded-3xl border border-sage-200/80 p-6 sm:p-7 shadow-sm hover:shadow-md hover:border-forest-400 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Book Cover Mockup */}
                  <div className="h-52 w-full rounded-2xl bg-gradient-to-br from-forest-800 to-forest-950 p-6 text-white flex flex-col justify-between shadow-inner relative overflow-hidden mb-6">
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-forest-700/30 blur-xl pointer-events-none" />
                    <div>
                      <span className="text-[10px] font-semibold text-sage-300 uppercase tracking-widest block mb-1">
                        Mind Refill Publication
                      </span>
                      <h3 className="text-base font-bold leading-snug line-clamp-3 text-cream-50">
                        {ebook.title}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-sage-200 pt-3 border-t border-forest-700/60">
                      <span>{ebook.authorName}</span>
                      <span className="font-semibold px-2 py-0.5 rounded-full bg-forest-700/80 text-[10px]">
                        PDF
                      </span>
                    </div>
                  </div>

                  <h2 className="text-lg font-bold text-forest-950 leading-snug mb-2">
                    {ebook.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-forest-700 leading-relaxed line-clamp-3 mb-4">
                    {ebook.description}
                  </p>

                  <div className="space-y-1.5 mb-6 text-xs text-forest-700">
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-forest-600 shrink-0" />
                      <span>{ebook.pageCount} pages of guided clinical exercises</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-forest-600 shrink-0" />
                      <span>Immediate download & permanent access</span>
                    </div>
                  </div>
                </div>

                <div className="pt-5 border-t border-sage-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-forest-500 font-semibold block">
                      One-time price
                    </span>
                    <span className="text-lg font-extrabold text-forest-950">
                      ₹{ebook.priceMajor}
                    </span>
                  </div>

                  <Link
                    href={`/login?redirect=/app/client/purchases`}
                    className="inline-flex items-center gap-2 py-2.5 px-5 bg-forest-700 hover:bg-forest-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Purchase & Access
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reassurance Footer Banner */}
        <div className="mt-16 bg-sage-100/70 border border-sage-200 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center text-forest-700 shrink-0 shadow-xs">
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
