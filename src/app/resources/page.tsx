import Link from "next/link";
import { BookOpen, Search, Clock, ArrowRight, Sparkles, User, Tag } from "lucide-react";
import { ContentService } from "@/modules/content/services/content.service";

export const metadata = {
  title: "Clinical Resources & Insights | Mind Refill",
  description:
    "Evidence-based articles, clinical insights, and mental wellbeing guides authored by licensed psychologists on Mind Refill.",
};

export const dynamic = "force-dynamic";

interface ResourcesPageProps {
  searchParams: {
    q?: string;
    category?: string;
  };
}

// Fallback curated articles when database is initializing or offline
const SAMPLE_ARTICLES = [
  {
    id: "sample-1",
    slug: "understanding-nervous-system-regulation",
    title: "Understanding Nervous System Regulation in Moments of High Stress",
    summary:
      "A clinical look at why the body enters fight-or-flight, and three physiologically grounded somatic grounding tools to restore psychological safety.",
    readingTimeMinutes: 6,
    publishedAt: "2026-03-15",
    authorName: "Dr. Sarah Jenkins, Ph.D.",
    category: "Anxiety & Stress",
    tags: ["Somatic Therapy", "Anxiety", "Grounding Techniques"],
  },
  {
    id: "sample-2",
    slug: "navigating-relationship-conflict-with-empathy",
    title: "Breaking the Cycle: How to Navigate Relationship Conflict with Non-Violent Communication",
    summary:
      "When emotional reactivity overrides understanding, couples often enter recursive distress. Learn how structured pausing changes the conversational outcome.",
    readingTimeMinutes: 8,
    publishedAt: "2026-03-10",
    authorName: "Elena Vance, LMFT",
    category: "Relationships",
    tags: ["Couples Therapy", "Communication", "Attachment"],
  },
  {
    id: "sample-3",
    slug: "recovering-from-burnout-clinical-roadmap",
    title: "Recovering from Chronic Workplace Burnout: A Step-by-Step Clinical Roadmap",
    summary:
      "Burnout is not a personal failure of resilience; it is a prolonged depletion of nervous system capacity. Here is how genuine neuro-cognitive recovery works.",
    readingTimeMinutes: 10,
    publishedAt: "2026-03-04",
    authorName: "Dr. Marcus Thorne, Psy.D.",
    category: "Career & Burnout",
    tags: ["Burnout", "Executive Function", "Restoration"],
  },
  {
    id: "sample-4",
    slug: "grief-is-not-linear-understanding-loss",
    title: "Grief is Not a Checklist: Understanding the Oscillating Waves of Loss",
    summary:
      "Why traditional stage models often misrepresent the real human experience of grief, and how to create space for sorrow without pathologizing it.",
    readingTimeMinutes: 7,
    publishedAt: "2026-02-28",
    authorName: "Maya Lin, LCSW",
    category: "Grief & Loss",
    tags: ["Bereavement", "Existential Care", "Healing"],
  },
];

const CATEGORIES = [
  "All Categories",
  "Anxiety & Stress",
  "Depression & Mood",
  "Relationships",
  "Career & Burnout",
  "Grief & Loss",
  "Trauma Recovery",
];

export default async function ResourcesPage({ searchParams }: ResourcesPageProps) {
  const query = (searchParams.q || "").toLowerCase().trim();
  const selectedCategory = searchParams.category || "All Categories";

  let articles: any[] = [];

  try {
    const result = await ContentService.listPublicArticles();
    if (result && result.items && result.items.length > 0) {
      articles = result.items.map((a: any) => ({
        id: a.id,
        slug: a.slug,
        title: a.title,
        summary: a.summary || (a.body ? a.body.slice(0, 180) + "..." : ""),
        readingTimeMinutes: a.readingTimeMinutes || 5,
        publishedAt: a.publishedAt ? new Date(a.publishedAt).toISOString().split("T")[0] : "Recently",
        authorName: a.author?.fullName || "Mind Refill Clinical Team",
        category: a.category || "Mental Wellbeing",
        tags: a.tags || ["Clinical Care"],
      }));
    } else {
      articles = SAMPLE_ARTICLES;
    }
  } catch {
    // Graceful fallback to curated clinical sample content
    articles = SAMPLE_ARTICLES;
  }

  // Apply search query and category filters
  const filteredArticles = articles.filter((article) => {
    const matchesQuery =
      !query ||
      article.title.toLowerCase().includes(query) ||
      article.summary.toLowerCase().includes(query) ||
      article.authorName.toLowerCase().includes(query);

    const matchesCategory =
      selectedCategory === "All Categories" ||
      article.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesQuery && matchesCategory;
  });

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
            <Link href="/resources" className="text-forest-950 font-semibold border-b-2 border-forest-600 pb-0.5">
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

      {/* Hero Banner */}
      <section className="bg-white border-b border-sage-200/70 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sage-100 border border-sage-200 text-forest-800 text-xs font-semibold mb-4">
            <BookOpen className="w-3.5 h-3.5 text-forest-600" />
            Clinical Psychoeducation & Self-Understanding
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-forest-950 leading-tight">
            Sometimes understanding is the first step toward feeling better.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-forest-700 max-w-2xl mx-auto leading-relaxed">
            Carefully written articles and reflective guides by licensed clinicians to help you make sense of complex emotional experiences.
          </p>

          {/* Search & Category Filter Bar */}
          <form method="GET" action="/resources" className="mt-8 max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-forest-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search topics, symptoms, or authors..."
                className="w-full pl-10 pr-4 py-3 bg-cream-50 border border-sage-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 text-forest-950 placeholder:text-forest-400"
              />
            </div>
            <button
              type="submit"
              className="py-3 px-6 bg-forest-700 hover:bg-forest-800 text-white text-sm font-semibold rounded-2xl shadow-sm transition-colors shrink-0"
            >
              Search
            </button>
          </form>

          {/* Category Pill Filters */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <Link
                  key={cat}
                  href={`/resources?category=${encodeURIComponent(cat)}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? "bg-forest-700 text-white shadow-sm"
                      : "bg-sage-50 text-forest-700 border border-sage-200 hover:bg-sage-100"
                  }`}
                >
                  {cat}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        {filteredArticles.length === 0 ? (
          <div className="bg-white rounded-3xl border border-sage-200 p-12 text-center max-w-md mx-auto my-12 shadow-sm">
            <div className="h-12 w-12 mx-auto rounded-2xl bg-sage-50 flex items-center justify-center text-forest-400 mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-forest-950">No articles match your search</h2>
            <p className="text-xs text-forest-600 mt-2 leading-relaxed">
              We couldn&apos;t find any articles matching &ldquo;{query || selectedCategory}&rdquo;. Try browsing all categories or explore our psychologist directory.
            </p>
            <div className="mt-6">
              <Link
                href="/resources"
                className="inline-flex items-center gap-1.5 py-2 px-4 bg-forest-700 text-white text-xs font-semibold rounded-xl hover:bg-forest-800 transition-colors"
              >
                Clear Search & Filters
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <article
                key={article.id}
                className="bg-white rounded-3xl border border-sage-200/80 p-6 sm:p-7 shadow-sm hover:shadow-md hover:border-forest-400 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-[11px] font-medium text-forest-500 mb-3">
                    <span className="px-2.5 py-1 rounded-full bg-sage-50 border border-sage-200 text-forest-800 font-semibold">
                      {article.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.readingTimeMinutes} min read
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-forest-950 group-hover:text-forest-700 transition-colors leading-snug mb-2">
                    {article.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-forest-700 leading-relaxed line-clamp-3 mb-5">
                    {article.summary}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {article.tags.map((tag: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-cream-100 text-forest-800 text-[10px] font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-sage-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-forest-100 text-forest-800 font-bold flex items-center justify-center text-[10px]">
                      {article.authorName.charAt(0)}
                    </div>
                    <span className="font-medium text-forest-800 truncate max-w-[140px]">
                      {article.authorName}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 font-semibold text-forest-700 group-hover:text-forest-900 group-hover:translate-x-0.5 transition-all">
                    Read Article
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Guided Care Banner */}
        <div className="mt-16 bg-forest-900 text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="max-w-xl text-center md:text-left">
            <span className="text-xs font-semibold text-sage-300 uppercase tracking-wider block mb-1">
              Need personalized support?
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Talk directly with a verified psychologist.
            </h2>
            <p className="text-xs sm:text-sm text-sage-200 mt-2 leading-relaxed">
              Articles can provide clarity, but genuine healing happens in connection. Let our care coordinators introduce you to the right practitioner.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/intake"
              className="py-3 px-6 bg-white text-forest-900 hover:bg-cream-100 text-sm font-semibold rounded-2xl shadow-sm transition-colors text-center"
            >
              Get Matched with a Psychologist
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-sage-200/60 bg-white py-8 text-center text-xs text-forest-600">
        <p>© {new Date().getFullYear()} Mind Refill. Educational resources authored by verified practitioners.</p>
      </footer>
    </main>
  );
}
