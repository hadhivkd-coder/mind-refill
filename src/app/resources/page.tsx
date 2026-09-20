import Link from "next/link";
import { BookOpen, Search, Clock, ArrowRight, Sparkles, User, Tag, Compass, Heart } from "lucide-react";
import { ContentService } from "@/modules/content/services/content.service";

export const metadata = {
  title: "Clinical Resources & Editorial Insights | Mind Refill",
  description:
    "Evidence-based essays, reflective frameworks, and psychoeducational guides authored by licensed psychologists on Mind Refill.",
};

export const dynamic = "force-dynamic";

interface ResourcesPageProps {
  searchParams: {
    q?: string;
    category?: string;
  };
}

const EXPERIENCING_TOPICS = [
  { slug: "Stress & Anxiety", label: "Stress & Anxiety", desc: "Somatic grounding, panic soothing, and calming overthinking" },
  { slug: "Relationships", label: "Relationships", desc: "Attachment styles, conflict de-escalation, and vulnerability" },
  { slug: "Life Transitions", label: "Life Transitions", desc: "Navigating relocation, career shifts, and major identity changes" },
  { slug: "Grief & Loss", label: "Grief & Loss", desc: "Honoring bereavement, emotional waves, and tender remembrance" },
  { slug: "Self-Understanding", label: "Self-Understanding", desc: "Inner critic reduction, personal boundaries, and emotional awareness" },
  { slug: "Sleep", label: "Sleep & Rest", desc: "Restoring circadian rhythm and quieting nighttime mental rumination" },
];

const SAMPLE_ARTICLES = [
  {
    id: "sample-1",
    slug: "understanding-nervous-system-regulation",
    title: "Understanding Nervous System Regulation in Moments of High Stress",
    summary:
      "A clinical look at why the human body enters fight-or-flight when emotional pressure mounts, and three physiologically grounded somatic tools to restore felt safety in minutes.",
    readingTimeMinutes: 6,
    publishedAt: "March 15, 2026",
    authorName: "Dr. Sarah Jenkins, Ph.D.",
    authorTitle: "Licensed Clinical Psychologist",
    category: "Stress & Anxiety",
    tags: ["Somatic Therapy", "Nervous System", "Grounding"],
    isFeatured: true,
  },
  {
    id: "sample-2",
    slug: "navigating-relationship-conflict-with-empathy",
    title: "Breaking the Blame-Withdraw Cycle: How to Navigate Relationship Friction",
    summary:
      "When emotional reactivity overrides understanding, couples often enter recursive distress. Learn how structured emotional pausing changes the conversational outcome.",
    readingTimeMinutes: 8,
    publishedAt: "March 10, 2026",
    authorName: "Elena Vance, LMFT",
    authorTitle: "Couples & Family Therapist",
    category: "Relationships",
    tags: ["Couples Therapy", "Communication", "Attachment"],
  },
  {
    id: "sample-3",
    slug: "recovering-from-burnout-clinical-roadmap",
    title: "Recovering from Chronic Workplace Burnout: A Step-by-Step Clinical Roadmap",
    summary:
      "Burnout is not a personal failure of discipline; it is a prolonged depletion of nervous system capacity. Here is how genuine cognitive-emotional recovery unfolds.",
    readingTimeMinutes: 10,
    publishedAt: "March 04, 2026",
    authorName: "Dr. Marcus Thorne, Psy.D.",
    authorTitle: "Neuropsychologist",
    category: "Life Transitions",
    tags: ["Burnout", "Executive Function", "Restoration"],
  },
  {
    id: "sample-4",
    slug: "grief-is-not-linear-understanding-loss",
    title: "Grief is Not a Checklist: Living with the Oscillating Waves of Loss",
    summary:
      "Why traditional stage models often misrepresent the real human experience of grief, and how to create space for sorrow without pathologizing your feelings.",
    readingTimeMinutes: 7,
    publishedAt: "February 28, 2026",
    authorName: "Dr. Ananya Sen, M.Phil.",
    authorTitle: "Clinical Psychologist",
    category: "Grief & Loss",
    tags: ["Bereavement", "Existential Care", "Healing"],
  },
  {
    id: "sample-5",
    slug: "silencing-the-harsh-inner-critic",
    title: "How to Soften the Voice of Your Harsh Inner Critic",
    summary:
      "Perfectionism often masks a deep fear of inadequacy. Discover how compassion-focused therapy helps you build an internal ally instead of an internal warden.",
    readingTimeMinutes: 6,
    publishedAt: "February 20, 2026",
    authorName: "Dr. Sarah Jenkins, Ph.D.",
    authorTitle: "Licensed Clinical Psychologist",
    category: "Self-Understanding",
    tags: ["Self-Compassion", "CBT", "Inner Child"],
  },
  {
    id: "sample-6",
    slug: "restoring-sleep-when-your-mind-wont-quiet",
    title: "Restoring Sleep When Your Racing Mind Won't Turn Off at Night",
    summary:
      "Evidence-based behavioral cues and cognitive decoupling protocols to ease nighttime hyper-arousal and return to restful, uninterrupted slumber.",
    readingTimeMinutes: 9,
    publishedAt: "February 15, 2026",
    authorName: "David Martinez, LCSW",
    authorTitle: "Somatic Psychotherapist",
    category: "Sleep",
    tags: ["Sleep Hygiene", "CBT-I", "Mindfulness"],
  },
];

export default async function ResourcesPage({ searchParams }: ResourcesPageProps) {
  const query = (searchParams.q || "").toLowerCase().trim();
  const selectedCategory = searchParams.category || "";

  let articles: any[] = [];

  try {
    const result = await ContentService.listPublicArticles();
    if (result && result.items && result.items.length > 0) {
      articles = result.items.map((a: any, idx: number) => ({
        id: a.id,
        slug: a.slug,
        title: a.title,
        summary: a.summary || (a.body ? a.body.slice(0, 180) + "..." : ""),
        readingTimeMinutes: a.readingTimeMinutes || 6,
        publishedAt: a.publishedAt ? new Date(a.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recently",
        authorName: a.author?.fullName || "Mind Refill Clinical Team",
        authorTitle: a.author?.professionalTitle || "Verified Clinician",
        category: a.category || "Self-Understanding",
        tags: a.tags || ["Clinical Care"],
        isFeatured: idx === 0,
      }));
    } else {
      articles = SAMPLE_ARTICLES;
    }
  } catch {
    articles = SAMPLE_ARTICLES;
  }

  // Filter articles
  const filteredArticles = articles.filter((article) => {
    const matchesQuery =
      !query ||
      article.title.toLowerCase().includes(query) ||
      article.summary.toLowerCase().includes(query) ||
      article.authorName.toLowerCase().includes(query);

    const matchesCategory =
      !selectedCategory ||
      article.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      selectedCategory.toLowerCase().includes(article.category.toLowerCase());

    return matchesQuery && matchesCategory;
  });

  const featuredArticle = filteredArticles.find((a) => a.isFeatured) || filteredArticles[0] || SAMPLE_ARTICLES[0];
  const regularArticles = filteredArticles.filter((a) => a.id !== featuredArticle?.id);

  return (
    <main className="min-h-screen bg-cream-50 flex flex-col justify-between text-forest-950">
      {/* Header */}
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
            <Link href="/resources" className="text-forest-950 font-bold border-b-2 border-forest-700 pb-1">
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

      {/* Hero Editorial Header */}
      <section className="bg-white border-b border-sage-200/70 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sage-100 text-forest-800 text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5 text-forest-600" />
            <span>Clinical Insights & Psychoeducation</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-forest-950 leading-tight">
            Sometimes understanding is the first step toward feeling better.
          </h1>

          <p className="text-base sm:text-lg text-forest-700 max-w-2xl mx-auto leading-relaxed font-normal">
            Reflective essays, clinical frameworks, and somatic tools written by practicing psychologists to help you make sense of what you are experiencing.
          </p>
        </div>
      </section>

      {/* Explore by What You're Experiencing */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 w-full">
        <div className="mb-6">
          <span className="text-xs font-bold text-forest-600 uppercase tracking-widest block mb-1">
            Browse by Theme
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-forest-950">
            Explore by what you&apos;re experiencing
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {EXPERIENCING_TOPICS.map((topic) => {
            const isSelected = selectedCategory.toLowerCase() === topic.slug.toLowerCase();
            return (
              <Link
                key={topic.slug}
                href={isSelected ? "/resources" : `/resources?category=${encodeURIComponent(topic.slug)}`}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between group cursor-pointer ${
                  isSelected
                    ? "bg-forest-800 text-white border-forest-800 shadow-sm"
                    : "bg-white border-sage-200/90 hover:border-forest-400 hover:shadow-2xs text-forest-900"
                }`}
              >
                <div>
                  <span className={`text-xs font-bold block ${isSelected ? "text-white" : "text-forest-950"}`}>
                    {topic.label}
                  </span>
                  <p className={`text-[11px] mt-1 line-clamp-2 leading-snug ${isSelected ? "text-sage-200" : "text-forest-600"}`}>
                    {topic.desc}
                  </p>
                </div>
                <div className={`mt-3 text-[10px] font-semibold flex items-center gap-1 ${isSelected ? "text-sage-200" : "text-forest-700 group-hover:text-forest-950"}`}>
                  <span>{isSelected ? "Active filter" : "Explore"}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Insight Card */}
      {featuredArticle && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 w-full">
          <div className="bg-gradient-to-br from-forest-900 via-forest-950 to-forest-900 text-white rounded-3xl p-8 sm:p-12 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-forest-800/40 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-sage-300 uppercase tracking-widest px-3 py-1 rounded-full bg-forest-800/80 border border-forest-700">
                  Featured Insight
                </span>
                <span className="text-xs text-sage-300">•</span>
                <span className="text-xs text-sage-300 font-medium">{featuredArticle.category}</span>
                <span className="text-xs text-sage-300">•</span>
                <span className="text-xs text-sage-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {featuredArticle.readingTimeMinutes} min read
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white">
                {featuredArticle.title}
              </h2>

              <p className="text-sm sm:text-base text-sage-200 leading-relaxed font-normal">
                {featuredArticle.summary}
              </p>

              <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-forest-800">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-full bg-forest-800 flex items-center justify-center font-bold text-xs text-sage-200 border border-forest-700">
                    {featuredArticle.authorName.charAt(0)}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">{featuredArticle.authorName}</span>
                    <span className="text-[11px] text-sage-300 block">{featuredArticle.authorTitle || "Licensed Psychologist"}</span>
                  </div>
                </div>

                <Link
                  href="/ebooks"
                  className="py-2.5 px-5 bg-white hover:bg-cream-100 text-forest-950 text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  Read & Download Guides &rarr;
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Catalog of Articles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-base sm:text-lg font-bold text-forest-950">
            {selectedCategory ? `Articles on ${selectedCategory}` : "All Articles & Clinical Essays"}
          </h3>
          {selectedCategory && (
            <Link href="/resources" className="text-xs font-bold text-forest-800 hover:underline">
              Clear Filter
            </Link>
          )}
        </div>

        {regularArticles.length === 0 ? (
          <div className="bg-white border border-sage-200 rounded-3xl p-10 text-center max-w-md mx-auto my-8">
            <p className="text-xs text-forest-700">No articles found matching this topic.</p>
            <Link href="/resources" className="mt-3 inline-block text-xs font-bold text-forest-800 underline">
              View all resources
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularArticles.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-3xl border border-sage-200/90 p-6 sm:p-7 shadow-xs hover:shadow-md hover:border-forest-400 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3 text-xs text-forest-600">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700 bg-sage-50 px-2.5 py-1 rounded-full border border-sage-200/70">
                      {article.category}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-forest-500">
                      <Clock className="w-3 h-3" />
                      {article.readingTimeMinutes} min
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-forest-950 group-hover:text-forest-800 transition-colors mb-2.5 leading-snug">
                    {article.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-forest-700 leading-relaxed mb-6 line-clamp-3">
                    {article.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-sage-100 flex items-center justify-between text-xs text-forest-600">
                  <span className="font-semibold text-forest-900 text-[11px] truncate max-w-[180px]">
                    {article.authorName}
                  </span>
                  <span className="text-[10px] text-forest-500">
                    {article.publishedAt}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-sage-200 bg-white py-8 text-center text-xs text-forest-600">
        <p>© {new Date().getFullYear()} Mind Refill. Clinical resources & psychoeducation.</p>
      </footer>
    </main>
  );
}
