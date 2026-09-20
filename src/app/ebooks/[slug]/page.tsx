import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BookMarked,
  ArrowLeft,
  ShieldCheck,
  User,
  Clock,
  CheckCircle2,
  Download,
  Share2,
  Sparkles,
  HeartHandshake,
  Printer,
  ChevronRight,
} from "lucide-react";
import { EbookService } from "@/modules/content/services/ebook.service";

interface EbookDetailPageProps {
  params: { slug: string };
}

const SAMPLE_WORKBOOK_DETAILS: Record<
  string,
  {
    title: string;
    description: string;
    authorName: string;
    authorTitle: string;
    authorSlug: string;
    pageCount: number;
    format: string;
    priceMajor: string;
    publishedDate: string;
    chapters: { title: string; subtitle: string; exercises: string[] }[];
    clinicalExcerpt: string;
    practicalWorksheet: {
      title: string;
      instructions: string;
      steps: { prompt: string; example: string }[];
    };
  }
> = {
  "overcoming-anxiety-companion-workbook": {
    title: "The Anxiety Companion: A CBT-Based Workbook for Daily Nervous System Calming",
    description:
      "A comprehensive, clinician-guided workbook featuring cognitive restructuring worksheets, exposure hierarchies, and somatic grounding rituals tested over a decade of clinical practice.",
    authorName: "Dr. Sarah Jenkins, Ph.D.",
    authorTitle: "Licensed Clinical Psychologist & CBT Specialist",
    authorSlug: "dr-sarah-jenkins",
    pageCount: 124,
    format: "Instant PDF & Interactive Workbook",
    priceMajor: "499.00",
    publishedDate: "March 2026",
    chapters: [
      {
        title: "Module 1: The Physiology of the Nervous System",
        subtitle: "Why the body enters fight-or-flight before the thinking brain catches up",
        exercises: [
          "Tracking your personal somatic anxiety signature (heart rate, muscle tension, breath rate)",
          "The Physiological Sigh: 2 quick inhales through the nose, 1 slow exhale through the mouth",
          "Mapping your daily emotional baseline and trigger thresholds",
        ],
      },
      {
        title: "Module 2: Cognitive Restructuring & Decatastrophizing",
        subtitle: "Interrupting automatic catastrophic spirals with objective empirical inquiry",
        exercises: [
          "The 3-Column Thought Record: Situation, Automatic Prediction, Realistic Alternative",
          "Identifying the 6 Core Cognitive Distortions (Catastrophizing, Mind-reading, All-or-Nothing)",
          "Probability Estimation: Calculating worst-case, best-case, and most-likely scenarios",
        ],
      },
      {
        title: "Module 3: Graded Exposure & Behavioral Activation",
        subtitle: "Retraining amygdala response by approaching avoided situations incrementally",
        exercises: [
          "Constructing your 10-step Subjective Units of Distress (SUDS 0-100) hierarchy",
          "Habituation tracking: Sitting with discomfort until autonomic arousal drops by 50%",
          "Creating sustainable, values-aligned weekly exposure goals",
        ],
      },
      {
        title: "Module 4: Daily Somatic Maintenance & Relapse Prevention",
        subtitle: "Cultivating long-term autonomic nervous system resilience",
        exercises: [
          "Morning 5-minute somatic scan and body posture realignment",
          "The 5-4-3-2-1 Sensory Grounding anchor for acute panic spikes",
          "Personal crisis buffer plan: Who to call, what to do, and when to pause",
        ],
      },
    ],
    clinicalExcerpt:
      "Anxiety is not a character flaw; it is an overprotective alarm system in an overtired body. When the brain detects uncertainty, it naturally extrapolates toward danger. Our work in this workbook is not to eradicate anxiety — because anxiety is a biological defense — but to recalibrate the alarm so it only sounds when genuine fire is present.",
    practicalWorksheet: {
      title: "The 4-Step Thought Disentanglement Exercise",
      instructions:
        "When you notice high anxiety or racing thoughts, pause and answer these four diagnostic questions on a piece of paper:",
      steps: [
        {
          prompt: "1. The Triggering Situation",
          example: "e.g. Received a brief message from my manager saying 'Let's chat tomorrow morning.'",
        },
        {
          prompt: "2. The Automatic Thought & Worst-Case Story",
          example: "e.g. 'I am about to be criticized, reprimanded, or lose my position.' (SUDS: 85/100)",
        },
        {
          prompt: "3. Objective Evidence Examination",
          example: "e.g. Evidence for: My project had a delay. Evidence against: My last two reviews were strong, delays were team-wide.",
        },
        {
          prompt: "4. The Grounded Balanced Perspective",
          example: "e.g. 'The message is neutral. It is far more likely a routine update than a crisis. I can handle whatever tomorrow brings.' (SUDS: 35/100)",
        },
      ],
    },
  },
  "secure-attachment-and-couples-workbook": {
    title: "From Reactivity to Connection: The Couples Attachment Guide",
    description:
      "Practical communication scripts, de-escalation protocols, and emotional attunement practices for couples wanting to build secure emotional intimacy.",
    authorName: "Elena Vance, LMFT",
    authorTitle: "Couples & Family Therapist",
    authorSlug: "elena-vance",
    pageCount: 148,
    format: "Instant PDF & Interactive Workbook",
    priceMajor: "599.00",
    publishedDate: "February 2026",
    chapters: [
      {
        title: "Module 1: Mapping the Recursive Conflict Loop",
        subtitle: "Understanding how pursuer anxiety and withdrawer overwhelm fuel each other",
        exercises: [
          "Identifying the 'Demon Dialogues': Find the cycle before the cycle finds you",
          "Uncovering primary soft emotions (hurt, fear, loneliness) beneath secondary hardness (anger, shut-down)",
          "The 20-minute flooding time-out agreement protocol",
        ],
      },
      {
        title: "Module 2: The Art of the Non-Defensive Pause",
        subtitle: "De-escalating heated conversational spirals in under 90 seconds",
        exercises: [
          "The 'Speaker-Listener' validation structure without rebuttal",
          "Mirroring exercises: Repeating your partner's emotional state until they feel heard",
          "Reframing blame into vulnerable attachment requests",
        ],
      },
      {
        title: "Module 3: Repairing Emotional Ruptures",
        subtitle: "How to apologize effectively after high reactivity or withdrawal",
        exercises: [
          "The 4 Elements of an Attuned Repair: Accountability, Impact, Vulnerability, Commitment",
          "Identifying attachment triggers from family-of-origin experiences",
          "Weekly 15-minute 'State of Our Union' connection dialogue",
        ],
      },
    ],
    clinicalExcerpt:
      "Behind the most furious argument about dishes or punctuality is almost always a quiet, tender question: 'Are you there for me? Do I matter to you? If I reach out, will you turn toward me?' When couples learn to hear the longing beneath the criticism, true healing begins.",
    practicalWorksheet: {
      title: "The 3-Minute De-escalation Script",
      instructions:
        "When conflict begins escalating above a conversational tone, either partner can call for the structured reset script:",
      steps: [
        {
          prompt: "Step 1: Name the Cycle",
          example: "e.g. 'I notice our cycle is starting. I don't want to fight with you, I want to feel close to you.'",
        },
        {
          prompt: "Step 2: Take Somatic Ownership",
          example: "e.g. 'My chest is tight and I am feeling flooded. I need a 15-minute breather so I don't speak reactively.'",
        },
        {
          prompt: "Step 3: Offer Emotional Reassurance",
          example: "e.g. 'I am not walking away from our conversation. I am taking a pause so I can listen to you with care at 7:30 PM.'",
        },
      ],
    },
  },
  "sleep-restoration-insomnia-manual": {
    title: "Restoring Natural Sleep: A Clinician's CBT-I Protocol",
    description:
      "A structured 6-week cognitive-behavioral therapy protocol for chronic insomnia, racing nighttime thoughts, and circadian disruption.",
    authorName: "Dr. Marcus Thorne, Psy.D.",
    authorTitle: "Neuropsychologist & Sleep Specialist",
    authorSlug: "dr-marcus-thorne",
    pageCount: 96,
    format: "Instant PDF & Interactive Workbook",
    priceMajor: "399.00",
    publishedDate: "January 2026",
    chapters: [
      {
        title: "Module 1: The Two Process Sleep Model",
        subtitle: "Balancing Homeostatic Sleep Drive (Adenosine) with Circadian Rhythm",
        exercises: [
          "Calculating your baseline Sleep Efficiency Ratio (Time Asleep ÷ Time in Bed)",
          "The Morning Light Anchor: 10 minutes of direct ocular sunlight within 30 minutes of waking",
          "Eliminating compensatory behaviors (daytime napping, sleeping in on weekends)",
        ],
      },
      {
        title: "Module 2: Stimulus Control Therapy",
        subtitle: "Breaking the conditioned arousal pairing between your bed and anxiety",
        exercises: [
          "The 20-Minute Rule: If not asleep in 20 minutes, leave the bedroom immediately",
          "Establishing a low-stimulation dim transition zone (reading fiction, stretching, quiet reflection)",
          "Restricting bedroom activities strictly to sleep and intimacy",
        ],
      },
      {
        title: "Module 3: Cognitive De-Arousal & The Daytime Worry Log",
        subtitle: "Discharging ruminative mental loops prior to bedtime",
        exercises: [
          "The Scheduled Worry Session: 15 minutes at 5:00 PM to dump all anxieties onto paper",
          "Paradoxical Intention: Relieving performance anxiety about 'having to fall asleep'",
          "Autogenic Relaxation: Systematic progressive somatic muscle unwinding",
        ],
      },
    ],
    clinicalExcerpt:
      "Sleep cannot be forced; it can only be invited. Trying hard to sleep is the single most effective way to stay awake. By eliminating nocturnal effort and resetting stimulus control, your body's innate biological sleep drive reliably takes over.",
    practicalWorksheet: {
      title: "The Evening Wind-Down Checklist",
      instructions: "Implement these three evidence-based protocols 60 minutes before your target bedtime:",
      steps: [
        {
          prompt: "1. The Digital Sunset (60 min prior)",
          example: "Power down high-luminance blue screens. Transition to warm amber lamps (under 2700K).",
        },
        {
          prompt: "2. The Thought Evacuation (45 min prior)",
          example: "Write down the 3 primary tasks for tomorrow onto a physical notepad to signal task closure to the brain.",
        },
        {
          prompt: "3. The Peripheral Warming Protocol (30 min prior)",
          example: "A warm shower or wearing socks. Vasodilation drops core body temperature, triggering melatonin release.",
        },
      ],
    },
  },
};

export async function generateMetadata({ params }: EbookDetailPageProps): Promise<Metadata> {
  const details = SAMPLE_WORKBOOK_DETAILS[params.slug];
  if (details) {
    return {
      title: `${details.title} | Mind Refill`,
      description: details.description,
    };
  }
  return {
    title: "Clinical Workbook | Mind Refill",
    description: "Evidence-based psychological workbook and clinical guide on Mind Refill.",
  };
}

export default async function EbookDetailPage({ params }: EbookDetailPageProps) {
  let workbook = SAMPLE_WORKBOOK_DETAILS[params.slug];

  // If not found in static dictionary, attempt DB lookup
  if (!workbook) {
    try {
      const dbEbook = await EbookService.getPublicEbookBySlug(params.slug);
      if (dbEbook) {
        workbook = {
          title: dbEbook.title,
          description: dbEbook.description,
          authorName: dbEbook.author?.fullName || "Mind Refill Specialist",
          authorTitle: dbEbook.author?.professionalTitle || "Licensed Psychologist",
          authorSlug: dbEbook.author?.slug || "dr-sarah-jenkins",
          pageCount: 100,
          format: "Instant PDF Download",
          priceMajor: "499.00",
          publishedDate: "2026",
          chapters: [],
          clinicalExcerpt: dbEbook.description,
          practicalWorksheet: {
            title: "Guided Self-Reflection",
            instructions: "Take a quiet moment to reflect on your goals with this workbook:",
            steps: [
              { prompt: "Primary Intention", example: "What do you hope to understand or transform?" },
              { prompt: "First Small Step", example: "What is one gentle change you can practice today?" },
            ],
          },
        };
      }
    } catch {
      // fallback to first sample
      workbook = SAMPLE_WORKBOOK_DETAILS["overcoming-anxiety-companion-workbook"];
    }
  }

  if (!workbook) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-cream-50 flex flex-col justify-between text-forest-950">
      {/* Header Navigation */}
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

          <div className="flex items-center space-x-4">
            <Link
              href="/ebooks"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-700 hover:text-forest-950 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              All Workbooks
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex-1 w-full space-y-10">
        {/* Preview Notice Banner */}
        <div className="bg-forest-50 border border-forest-200/80 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-xl bg-forest-700 text-white flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-forest-950">
                Complimentary Preview Access Active
              </h2>
              <p className="text-xs text-forest-700 mt-0.5 leading-relaxed">
                As payment features are currently on hold for our preview launch, you have immediate, complimentary access to this clinical workbook, chapters, and worksheets.
              </p>
            </div>
          </div>
          <Link
            href="/intake"
            className="py-2.5 px-5 bg-forest-700 hover:bg-forest-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0"
          >
            Work with a Psychologist
          </Link>
        </div>

        {/* Hero Section */}
        <div className="bg-white rounded-3xl border border-sage-200/80 p-8 sm:p-10 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Cover Art Visual */}
          <div className="h-72 w-full rounded-2xl bg-gradient-to-br from-forest-800 via-forest-900 to-forest-950 p-7 text-white flex flex-col justify-between shadow-md relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-forest-700/30 blur-2xl pointer-events-none" />
            <div>
              <span className="text-[10px] font-semibold text-sage-300 uppercase tracking-widest block mb-2">
                Mind Refill Publication
              </span>
              <h1 className="text-lg font-extrabold leading-snug text-cream-50">
                {workbook.title}
              </h1>
            </div>

            <div className="pt-4 border-t border-forest-700/60 flex items-center justify-between text-xs text-sage-200">
              <span>{workbook.pageCount} Pages</span>
              <span>{workbook.format}</span>
            </div>
          </div>

          {/* Details & Author */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage-100 text-forest-800 text-xs font-semibold mb-3">
                <BookMarked className="w-3.5 h-3.5 text-forest-600" />
                Evidence-Based Self-Guided Care
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-forest-950 tracking-tight leading-tight">
                {workbook.title}
              </h1>
              <p className="mt-3 text-xs sm:text-sm text-forest-700 leading-relaxed">
                {workbook.description}
              </p>
            </div>

            {/* Author Credit */}
            <div className="p-4 rounded-2xl bg-cream-50 border border-sage-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-forest-100 flex items-center justify-center text-forest-800 font-bold text-sm">
                  {workbook.authorName.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-bold text-forest-950">{workbook.authorName}</div>
                  <div className="text-[11px] text-forest-600">{workbook.authorTitle}</div>
                </div>
              </div>

              <Link
                href={`/psychologists/${workbook.authorSlug}`}
                className="text-xs font-semibold text-forest-800 hover:text-forest-950 underline shrink-0"
              >
                View Profile &rarr;
              </Link>
            </div>

            {/* Feature Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs text-forest-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-forest-600 shrink-0" />
                <span>Printable Worksheets</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-forest-600 shrink-0" />
                <span>Self-Paced Exercises</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-forest-600 shrink-0" />
                <span>Ethically Reviewed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Excerpt */}
        <section className="bg-cream-100/60 rounded-3xl border border-sage-200/80 p-8 sm:p-10">
          <span className="text-[10px] uppercase font-bold text-forest-600 tracking-wider block mb-2">
            Author’s Clinical Note
          </span>
          <blockquote className="text-sm sm:text-base italic text-forest-900 leading-relaxed border-l-3 border-forest-600 pl-4 py-1">
            “{workbook.clinicalExcerpt}”
          </blockquote>
          <div className="mt-3 text-xs font-semibold text-forest-700 pl-4">
            — {workbook.authorName}
          </div>
        </section>

        {/* Chapters & Curriculum Breakdown */}
        {workbook.chapters.length > 0 && (
          <section className="bg-white rounded-3xl border border-sage-200/80 p-8 sm:p-10 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-bold text-forest-600 uppercase tracking-wider block mb-1">
                Curriculum Overview
              </span>
              <h2 className="text-xl font-bold text-forest-950">Table of Contents & Practical Modules</h2>
              <p className="text-xs text-forest-600 mt-1">
                Each module is structured to combine psychoeducation with concrete, daily behavioral tools.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              {workbook.chapters.map((ch, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-sage-200/90 bg-cream-50/40 hover:bg-white transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-forest-950">{ch.title}</h3>
                      <p className="text-xs text-forest-600 mt-0.5">{ch.subtitle}</p>
                    </div>
                    <span className="text-[10px] font-bold text-forest-500 bg-sage-100 px-2 py-0.5 rounded-full shrink-0">
                      Module 0{idx + 1}
                    </span>
                  </div>

                  <ul className="space-y-1.5 pt-2 border-t border-sage-100 text-xs text-forest-800">
                    {ch.exercises.map((ex, exIdx) => (
                      <li key={exIdx} className="flex items-start gap-2">
                        <span className="text-forest-500 font-bold">•</span>
                        <span>{ex}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Interactive Clinical Worksheet */}
        <section className="bg-white rounded-3xl border-2 border-forest-600/30 p-8 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sage-100 pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-50 text-forest-800 border border-forest-200 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-forest-600" />
                Featured Clinical Tool
              </div>
              <h2 className="text-xl font-bold text-forest-950">
                {workbook.practicalWorksheet.title}
              </h2>
              <p className="text-xs text-forest-600 mt-1">
                {workbook.practicalWorksheet.instructions}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {workbook.practicalWorksheet.steps.map((step, sIdx) => (
              <div
                key={sIdx}
                className="p-5 rounded-2xl bg-cream-50 border border-sage-200/70 space-y-2"
              >
                <div className="text-xs font-bold text-forest-950 flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-forest-700 text-white text-[10px] flex items-center justify-center font-bold">
                    {sIdx + 1}
                  </span>
                  {step.prompt}
                </div>
                <div className="text-xs text-forest-700 pl-7 italic bg-white p-3 rounded-xl border border-sage-100">
                  {step.example}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Care Guidance CTA */}
        <div className="bg-forest-900 text-white rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-xl">
          <h2 className="text-2xl font-bold">Need help working through these exercises?</h2>
          <p className="text-xs sm:text-sm text-sage-200 max-w-xl mx-auto leading-relaxed">
            Self-guided tools are most effective when paired with compassionate clinical guidance. Let our human care coordinators match you with a psychologist.
          </p>
          <div className="pt-3 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/intake"
              className="py-3 px-6 bg-white hover:bg-cream-100 text-forest-950 text-xs font-semibold rounded-xl shadow-md transition-colors"
            >
              Start Guided Matching Intake
            </Link>
            <Link
              href={`/psychologists/${workbook.authorSlug}`}
              className="py-3 px-6 bg-forest-800 hover:bg-forest-700 text-white border border-forest-600 text-xs font-semibold rounded-xl transition-colors"
            >
              Consult with {workbook.authorName}
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-sage-200/60 bg-white py-8 text-center text-xs text-forest-600">
        <p>© {new Date().getFullYear()} Mind Refill. Evidence-based workbooks and digital therapeutic companions.</p>
      </footer>
    </main>
  );
}
