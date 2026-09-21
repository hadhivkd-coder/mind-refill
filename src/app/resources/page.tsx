import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BookOpen, Search, Clock, ArrowRight, Sparkles, Compass, Heart, BookmarkCheck } from "lucide-react";
import { ContentService } from "@/modules/content/services/content.service";

export const metadata = {
  title: "Clinical Resources & Mindful Insights | Mind Refill",
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
  { slug: "Relationships", label: "Relationships", desc: "Attachment styles, conflict de-escalation, and emotional safety" },
  { slug: "Life Transitions", label: "Life Transitions", desc: "Navigating major shifts, career pivots, and identity evolution" },
  { slug: "Grief & Loss", label: "Grief & Loss", desc: "Honoring bereavement, emotional waves, and tender remembrance" },
  { slug: "Self-Understanding", label: "Self-Understanding", desc: "Inner critic reduction, personal boundaries, and self-compassion" },
  { slug: "Sleep & Rest", label: "Sleep & Rest", desc: "Restoring circadian rhythm and quieting nighttime mental rumination" },
];

const SAMPLE_ARTICLES = [
  {
    id: "sample-1",
    slug: "understanding-nervous-system-regulation",
    title: "Understanding Nervous System Regulation in Moments of Overwhelm",
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
      "When emotional reactivity overrides understanding, couples often enter recursive distress. Learn how structured emotional pausing changes conversational outcomes.",
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
    title: "Recovering from Chronic Burnout: A Step-by-Step Clinical Roadmap",
    summary:
      "Burnout is not personal weakness; it is nervous exhaustion from sustained systemic over-functioning. Here is how genuine emotional pacing begins.",
    readingTimeMinutes: 7,
    publishedAt: "March 2, 2026",
    authorName: "Dr. Marcus Thorne, Psy.D.",
    authorTitle: "Neuropsychologist & Specialist",
    category: "Life Transitions",
    tags: ["Burnout", "Workplace Mental Health", "Rest"],
  },
  {
    id: "sample-4",
    slug: "moving-through-grief-compassionate-guide",
    title: "Moving Through Bereavement: Giving Yourself Permission to Grieve",
    summary:
      "Grief does not move along a tidy linear timeline. Clinical insights on allowing the waves of loss without pathologizing the depth of human love.",
    readingTimeMinutes: 5,
    publishedAt: "February 28, 2026",
    authorName: "Maya Lin, LCSW",
    authorTitle: "Trauma & Grief Specialist",
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
    category: "Sleep & Rest",
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
    <div className="min-h-screen flex flex-col bg-[#173C32] text-[#F7F3E9] selection:bg-[#3F6855] selection:text-[#F1EBDD]">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Editorial Header */}
        <section className="pt-14 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#173C32] via-[#1C473C] to-[#244F42] border-b border-white/5 text-center">
          <div className="max-w-4xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#C9D2BC]">
              <BookOpen className="w-3.5 h-3.5 text-[#9CAF91]" />
              <span>Clinical Insights & Psychoeducation</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-normal text-[#F7F3E9] leading-tight">
              Sometimes understanding is the first step toward feeling safe.
            </h1>

            <p className="text-sm sm:text-base text-[#C9D2BC] max-w-2xl mx-auto font-light leading-relaxed">
              Reflective essays, clinical frameworks, and somatic tools written by practicing psychologists to help you gently make sense of what you are experiencing.
            </p>

            {/* Search Bar */}
            <form method="GET" action="/resources" className="pt-4 max-w-2xl mx-auto">
              <div className="relative flex items-center">
                <Search className="w-5 h-5 text-[#9CAF91] absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  name="q"
                  defaultValue={query}
                  placeholder="Search essays, concepts, or topics (e.g. nervous system, grief, burnout)..."
                  className="w-full h-14 pl-12 pr-28 rounded-full bg-[#173C32]/80 border border-[#C9D2BC]/30 text-sm text-[#F7F3E9] placeholder-[#9CAF91]/70 focus:outline-none focus:border-[#F1EBDD] focus:ring-2 focus:ring-[#C9D2BC]/20 backdrop-blur-md shadow-inner transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-2 h-10 px-5 rounded-full bg-[#F1EBDD] hover:bg-white text-[#173C32] text-xs font-semibold transition-all"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Explore by Theme */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-semibold text-[#9CAF91] uppercase tracking-widest block mb-1">
                Browse by Theme
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#F7F3E9]">
                Explore by what you&apos;re experiencing
              </h2>
            </div>
            {selectedCategory && (
              <Link
                href="/resources"
                className="text-xs font-medium text-[#C9D2BC] hover:text-[#F1EBDD] underline underline-offset-4"
              >
                Clear filter
              </Link>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {EXPERIENCING_TOPICS.map((topic) => {
              const isSelected = selectedCategory.toLowerCase() === topic.slug.toLowerCase();
              return (
                <Link
                  key={topic.slug}
                  href={isSelected ? "/resources" : `/resources?category=${encodeURIComponent(topic.slug)}`}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between group ${
                    isSelected
                      ? "bg-[#F1EBDD] text-[#173C32] border-[#F1EBDD] shadow-md"
                      : "bg-[#244F42]/40 border-white/10 hover:border-[#9CAF91]/50 hover:bg-[#244F42]/70 text-[#F7F3E9]"
                  }`}
                >
                  <div>
                    <span className={`text-xs font-semibold block ${isSelected ? "text-[#173C32]" : "text-[#F7F3E9]"}`}>
                      {topic.label}
                    </span>
                    <p className={`text-[11px] mt-1 line-clamp-2 leading-relaxed ${isSelected ? "text-[#244F42]" : "text-[#C9D2BC]/80"}`}>
                      {topic.desc}
                    </p>
                  </div>
                  <div className={`mt-3 text-[10px] font-semibold flex items-center gap-1 ${isSelected ? "text-[#173C32]" : "text-[#9CAF91] group-hover:text-[#F1EBDD]"}`}>
                    <span>{isSelected ? "Active" : "Explore"}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Featured Insight Card */}
        {featuredArticle && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="atmospheric-card rounded-3xl p-8 sm:p-12 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#3F6855]/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 max-w-3xl space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-semibold text-[#173C32] uppercase tracking-widest px-3 py-1 rounded-full bg-[#F1EBDD]">
                    Featured Insight
                  </span>
                  <span className="text-xs text-[#9CAF91]">•</span>
                  <span className="text-xs text-[#C9D2BC] font-medium">{featuredArticle.category}</span>
                  <span className="text-xs text-[#9CAF91]">•</span>
                  <span className="text-xs text-[#C9D2BC] flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {featuredArticle.readingTimeMinutes} min read
                  </span>
                </div>

                <h2 className="font-serif text-2xl sm:text-4xl font-normal tracking-tight leading-tight text-[#F7F3E9]">
                  {featuredArticle.title}
                </h2>

                <p className="text-sm sm:text-base text-[#C9D2BC] leading-relaxed font-light">
                  {featuredArticle.summary}
                </p>

                <div className="pt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#3F6855]/50 flex items-center justify-center font-bold text-xs text-[#F1EBDD] border border-white/10">
                      {featuredArticle.authorName.charAt(0)}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-[#F7F3E9] block">{featuredArticle.authorName}</span>
                      <span className="text-[11px] text-[#9CAF91] block">{featuredArticle.authorTitle}</span>
                    </div>
                  </div>

                  <Link
                    href="/ebooks"
                    className="py-2.5 px-5 bg-[#F1EBDD] hover:bg-white text-[#173C32] text-xs font-semibold rounded-full shadow-sm transition-colors flex items-center gap-2"
                  >
                    <span>Read Workbooks & Guides</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Regular Articles Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 flex-1">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#F7F3E9]">
              {selectedCategory ? `Articles in ${selectedCategory}` : "All Clinical Reflections"}
            </h3>
          </div>

          {regularArticles.length === 0 ? (
            <div className="atmospheric-card rounded-3xl p-10 text-center max-w-md mx-auto my-8">
              <p className="text-xs text-[#C9D2BC]">No essays found matching this topic right now.</p>
              <Link href="/resources" className="mt-3 inline-block text-xs font-semibold text-[#F1EBDD] underline underline-offset-4">
                View all reflections
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularArticles.map((article) => (
                <div
                  key={article.id}
                  className="atmospheric-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between group hover:border-[#9CAF91]/50 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4 text-xs text-[#9CAF91]">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#173C32] bg-[#F1EBDD] px-2.5 py-0.5 rounded-full">
                        {article.category}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-[#C9D2BC]">
                        <Clock className="w-3 h-3" />
                        {article.readingTimeMinutes} min
                      </span>
                    </div>

                    <h3 className="font-serif text-lg sm:text-xl font-normal text-[#F7F3E9] group-hover:text-[#F1EBDD] transition-colors mb-3 leading-snug">
                      {article.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#C9D2BC] leading-relaxed mb-6 font-light line-clamp-3">
                      {article.summary}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#9CAF91]">
                    <span className="font-medium text-[#F7F3E9] text-[11px] truncate max-w-[180px]">
                      {article.authorName}
                    </span>
                    <span className="text-[10px] text-[#C9D2BC]">
                      {article.publishedAt}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
