import Link from "next/link";
import {
  ShieldCheck,
  HeartHandshake,
  ArrowRight,
  Sparkles,
  Compass,
  BookOpen,
  Calendar,
  BookMarked,
  CheckCircle2,
  Users,
  Award,
  Lock,
} from "lucide-react";

export const metadata = {
  title: "Mind Refill | You Don't Have to Figure It All Out Alone",
  description:
    "Compassionate, human-guided psychological care. Connect with licensed, verified psychologists or let our care coordinators match you thoughtfully.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-cream-50 flex flex-col justify-between text-forest-950 selection:bg-sage-200 selection:text-forest-900">
      {/* Navigation Header */}
      <header className="border-b border-sage-200/70 bg-white/90 backdrop-blur-md sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
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

          <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium text-forest-800">
            <Link href="/psychologists" className="hover:text-forest-950 transition-colors">
              Find a Psychologist
            </Link>
            <Link href="/resources" className="hover:text-forest-950 transition-colors">
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
              className="text-sm font-medium text-forest-800 hover:text-forest-950 px-3 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/find-a-psychologist"
              className="text-sm font-semibold bg-forest-700 hover:bg-forest-800 text-white px-5 py-2.5 rounded-2xl transition-all shadow-sm hover:shadow-md"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* SECTION 1: Emotional Hero */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-28 px-4 sm:px-6 lg:px-8">
        {/* Subtle Organic Background Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-sage-100/60 via-cream-100/30 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sage-100/80 border border-sage-200 text-forest-800 text-xs font-semibold mb-8 animate-fade-in shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-forest-600" />
            <span>A little support can change a lot.</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-forest-950 leading-[1.12]">
            You don&apos;t have to figure it all out{" "}
            <span className="text-forest-700 underline decoration-sage-300 decoration-wavy decoration-2 underline-offset-8">
              alone.
            </span>
          </h1>

          <p className="mt-7 text-lg sm:text-xl text-forest-700 max-w-2xl mx-auto leading-relaxed font-normal">
            Whether you know exactly what you&apos;re looking for or you&apos;re not sure where to begin, we&apos;ll help you find the right path — and the right person to walk it with.
          </p>

          {/* Primary Action Choices */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto w-full">
            <Link
              href="/find-a-psychologist"
              className="flex items-center justify-between p-5 rounded-2xl bg-forest-700 hover:bg-forest-800 text-white shadow-md hover:shadow-lg transition-all text-left group"
            >
              <div>
                <span className="text-[11px] font-semibold text-sage-200 uppercase tracking-wider block mb-0.5">
                  Start Here
                </span>
                <span className="text-base font-bold text-white block">
                  Find the right support
                </span>
                <span className="text-xs text-sage-100 block mt-0.5">
                  Explore psychologists or get matched
                </span>
              </div>
              <ArrowRight className="w-5 h-5 text-sage-200 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/intake"
              className="flex items-center justify-between p-5 rounded-2xl border-2 border-forest-600 bg-white hover:bg-sage-50 text-forest-950 shadow-sm hover:shadow-md transition-all text-left group"
            >
              <div>
                <span className="text-[11px] font-semibold text-forest-600 uppercase tracking-wider block mb-0.5">
                  Human Coordination
                </span>
                <span className="text-base font-bold text-forest-950 block">
                  I&apos;m not sure what I need
                </span>
                <span className="text-xs text-forest-700 block mt-0.5">
                  Talk to a care coordinator
                </span>
              </div>
              <ArrowRight className="w-5 h-5 text-forest-600 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-forest-600">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-forest-700" />
              Rigorously verified licenses
            </span>
            <span className="flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-forest-700" />
              Human-assisted care matching
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-forest-700" />
              Medical-grade confidentiality
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 2: Wherever you are right now */}
      <section className="py-16 md:py-20 bg-white border-y border-sage-200/70 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold text-forest-600 uppercase tracking-wider block mb-2">
              Every Journey is Unique
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-forest-950 tracking-tight">
              Wherever you are right now, there is a way forward.
            </h2>
            <p className="text-sm text-forest-700 mt-3 leading-relaxed">
              Mental wellbeing isn&apos;t about having all the answers today. It begins with identifying what you need right now.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                feeling: "“I've been feeling overwhelmed.”",
                description: "Chronic pressure, racing thoughts, and trouble unwinding from daily stress.",
                action: "Explore Anxiety & Stress Specialists",
                link: "/psychologists?specialization=anxiety-stress",
              },
              {
                feeling: "“I don't know what I'm feeling.”",
                description: "A sense of numbness, fatigue, or lingering emotional confusion that feels difficult to name.",
                action: "Talk with a Care Coordinator",
                link: "/intake",
              },
              {
                feeling: "“I need someone to talk to.”",
                description: "A safe, confidential space where you can speak honestly without fear of being judged.",
                action: "Browse 1-on-1 Counselors",
                link: "/psychologists",
              },
              {
                feeling: "“I'm navigating a difficult transition.”",
                description: "Career changes, relationship breakups, grief, or major family milestones.",
                action: "Explore Transition Support",
                link: "/psychologists?specialization=career-burnout",
              },
              {
                feeling: "“I want to understand myself better.”",
                description: "Curious about your attachment style, emotional habits, and personal growth patterns.",
                action: "Read Reflective Guides",
                link: "/resources",
              },
              {
                feeling: "“I want clinical guidance for my partner & me.”",
                description: "Breaking reactive conflict cycles and rebuilding mutual emotional safety.",
                action: "Explore Relationship Therapy",
                link: "/psychologists?specialization=couples-relationship",
              },
            ].map((item, idx) => (
              <Link
                key={idx}
                href={item.link}
                className="p-6 rounded-3xl border border-sage-200/80 bg-cream-50/50 hover:bg-white hover:border-forest-500 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <h3 className="text-base font-bold text-forest-950 group-hover:text-forest-700 transition-colors mb-2">
                    {item.feeling}
                  </h3>
                  <p className="text-xs text-forest-700 leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-700 group-hover:text-forest-950 pt-3 border-t border-sage-200/60">
                  <span>{item.action}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 & 4: Not sure who to talk to? That's okay. */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="bg-forest-900 text-white rounded-3xl p-8 sm:p-14 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-forest-800/40 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl relative z-10">
            <span className="text-xs font-semibold text-sage-300 uppercase tracking-wider block mb-3">
              Human-Assisted Care Matching
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Not sure who you need to talk to? That&apos;s okay.
            </h2>
            <p className="text-sm sm:text-base text-sage-200 mt-4 leading-relaxed">
              Choosing a therapist from a directory can feel exhausting when you are already drained. Our human care coordinators listen to your context, preferences, and goals, then match you with a psychologist who genuinely fits.
            </p>
          </div>

          {/* 4-Step Human Flow */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10 pt-8 border-t border-forest-800">
            {[
              {
                step: "01",
                title: "Tell us what's going on",
                desc: "A brief 3-minute intake with questions about what you're feeling and your schedule.",
              },
              {
                step: "02",
                title: "Talk with a coordinator",
                desc: "A compassionate care coordinator reviews your responses and answers any questions.",
              },
              {
                step: "03",
                title: "Get thoughtfully matched",
                desc: "We introduce you to a verified psychologist specializing in your exact situation.",
              },
              {
                step: "04",
                title: "Book your session",
                desc: "Confirm a time slot that fits your week and begin your counseling journey.",
              },
            ].map((step, idx) => (
              <div key={idx} className="space-y-2">
                <span className="text-2xl font-black text-forest-500 font-mono block">
                  {step.step}
                </span>
                <h3 className="text-sm font-bold text-white">{step.title}</h3>
                <p className="text-xs text-sage-300 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 relative z-10">
            <Link
              href="/intake"
              className="inline-flex items-center gap-2 py-3 px-6 bg-white hover:bg-cream-100 text-forest-950 text-sm font-semibold rounded-2xl shadow-md transition-all"
            >
              <span>Begin Guided Intake</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 5: Verified Professionals */}
      <section className="py-16 bg-cream-100/50 border-y border-sage-200/70 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="text-xs font-semibold text-forest-600 uppercase tracking-wider block mb-2">
                Clinical Rigor & Integrity
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-forest-950 tracking-tight leading-snug">
                Verified professionals. Thoughtfully matched.
              </h2>
              <p className="text-sm text-forest-700 mt-3 leading-relaxed">
                We never claim vague &ldquo;best therapists in the city.&rdquo; We focus on rigorous transparency, verified licensing, and genuine therapeutic compatibility.
              </p>

              <div className="mt-6 space-y-3 text-xs text-forest-800">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-forest-600 shrink-0 mt-0.5" />
                  <span><strong>License & Degree Auditing:</strong> Every clinician&apos;s practicing license, certifications, and academic degrees are verified before publication.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-forest-600 shrink-0 mt-0.5" />
                  <span><strong>Transparent Profiles:</strong> Read verified professional titles, years of experience, therapeutic methods, and session pricing upfront.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-forest-600 shrink-0 mt-0.5" />
                  <span><strong>No AI Diagnosis:</strong> Artificial intelligence on this platform never evaluates or diagnoses clients. Clinical care remains strictly human.</span>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href="/psychologists"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-700 hover:text-forest-950 group"
                >
                  <span>Explore the Verified Psychologist Directory</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-sage-200 p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-forest-50 flex items-center justify-center text-forest-700 shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-forest-950">Credential Transparency</h3>
                  <p className="text-xs text-forest-600">Strict clinical governance standards</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-cream-50 border border-sage-100 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-forest-600 font-medium">Licensed Practitioners</span>
                  <span className="font-bold text-forest-900">100% Verified</span>
                </div>
                <div className="w-full bg-sage-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-forest-600 h-full w-full rounded-full" />
                </div>
              </div>

              <p className="text-xs text-forest-600 leading-relaxed italic">
                &ldquo;A successful therapeutic relationship depends on trust, mutual safety, and clinical alignment. We verify the credentials so you can focus on your healing.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 & 7: Psychoeducational Resources & Ecosystem */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold text-forest-600 uppercase tracking-wider block mb-2">
            Beyond 1-on-1 Sessions
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-forest-950 tracking-tight">
            Comprehensive tools for mental wellbeing.
          </h2>
          <p className="text-sm text-forest-700 mt-3 leading-relaxed">
            Support looks different for everyone. Access clinician-authored articles, self-guided reflection workbooks, and live virtual workshops.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl border border-sage-200/80 p-7 shadow-sm flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 rounded-2xl bg-sage-50 text-forest-700 flex items-center justify-center mb-5">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-forest-950 mb-2">Clinical Articles</h3>
              <p className="text-xs text-forest-700 leading-relaxed mb-6">
                Evidence-based essays on emotional regulation, boundary setting, attachment patterns, and neurodivergence.
              </p>
            </div>
            <Link
              href="/resources"
              className="inline-flex items-center gap-1 text-xs font-semibold text-forest-700 hover:text-forest-950"
            >
              Browse Articles &rarr;
            </Link>
          </div>

          <div className="bg-white rounded-3xl border border-sage-200/80 p-7 shadow-sm flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 rounded-2xl bg-forest-50 text-forest-700 flex items-center justify-center mb-5">
                <BookMarked className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-forest-950 mb-2">E-Books & Workbooks</h3>
              <p className="text-xs text-forest-700 leading-relaxed mb-6">
                Structured clinical guides and daily reflection exercises you can complete at your own pace.
              </p>
            </div>
            <Link
              href="/ebooks"
              className="inline-flex items-center gap-1 text-xs font-semibold text-forest-700 hover:text-forest-950"
            >
              View Workbooks &rarr;
            </Link>
          </div>

          <div className="bg-white rounded-3xl border border-sage-200/80 p-7 shadow-sm flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 rounded-2xl bg-cream-100 text-forest-700 flex items-center justify-center mb-5">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-forest-950 mb-2">Workshops & Webinars</h3>
              <p className="text-xs text-forest-700 leading-relaxed mb-6">
                Live, clinician-facilitated group discussions and skill-building sessions in small, confidential cohorts.
              </p>
            </div>
            <Link
              href="/events"
              className="inline-flex items-center gap-1 text-xs font-semibold text-forest-700 hover:text-forest-950"
            >
              See Upcoming Events &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 8: Practitioner Invitation */}
      <section className="py-16 bg-sage-100/50 border-t border-sage-200/70 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-semibold text-forest-600 uppercase tracking-wider block mb-2">
            For Licensed Practitioners
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-forest-950 tracking-tight">
            Your clinical work can reach the people who need it.
          </h2>
          <p className="text-sm text-forest-700 mt-3 max-w-xl mx-auto leading-relaxed">
            Focus on compassionate client care. We handle credential presentation, client coordination matching, appointment hold scheduling, and secure payouts.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/register"
              className="py-3 px-6 bg-forest-700 hover:bg-forest-800 text-white text-xs font-semibold rounded-2xl shadow-sm transition-colors"
            >
              Apply as a Psychologist
            </Link>
            <Link
              href="/login"
              className="py-3 px-6 bg-white hover:bg-cream-50 text-forest-800 border border-sage-300 text-xs font-semibold rounded-2xl transition-colors"
            >
              Practitioner Login
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 9: Final Calm CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-sage-200/70 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-forest-950 tracking-tight">
            Wherever you&apos;re starting from, there&apos;s a next step.
          </h2>
          <p className="mt-4 text-base text-forest-700 leading-relaxed max-w-xl mx-auto">
            Take a breath. You don&apos;t have to commit to anything today except finding clarity on how to begin.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/find-a-psychologist"
              className="py-3.5 px-8 bg-forest-700 hover:bg-forest-800 text-white text-sm font-semibold rounded-2xl shadow-md transition-all"
            >
              Find your next step
            </Link>
            <Link
              href="/psychologists"
              className="py-3.5 px-8 bg-cream-50 hover:bg-cream-100 text-forest-900 border border-sage-300 text-sm font-semibold rounded-2xl transition-all"
            >
              Explore verified directory
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-sage-200 bg-white py-12 px-4 sm:px-6 lg:px-8 text-xs text-forest-600">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-xl bg-forest-700 flex items-center justify-center text-white font-bold text-sm">
                Ψ
              </div>
              <span className="font-bold text-base text-forest-950">
                Mind Refill
              </span>
            </div>
            <p className="text-xs text-forest-600 max-w-sm leading-relaxed">
              An ethical, human-coordinated digital space connecting clients seeking psychological support with verified psychologists.
            </p>
            <p className="text-[11px] text-forest-500">
              Emergency Note: If you are experiencing acute crisis or thoughts of self-harm, please contact emergency services (112 / 988) or visit the nearest emergency room immediately.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-forest-950 mb-3 uppercase tracking-wider text-[11px]">
              Platform Discovery
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/psychologists" className="hover:text-forest-950 transition-colors">
                  Verified Directory
                </Link>
              </li>
              <li>
                <Link href="/intake" className="hover:text-forest-950 transition-colors">
                  Guided Matching Intake
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-forest-950 transition-colors">
                  Clinical Resources
                </Link>
              </li>
              <li>
                <Link href="/ebooks" className="hover:text-forest-950 transition-colors">
                  E-Books & Workbooks
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-forest-950 transition-colors">
                  Workshops & Events
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-forest-950 mb-3 uppercase tracking-wider text-[11px]">
              Clinical Governance
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/legal/privacy" className="hover:text-forest-950 transition-colors">
                  Privacy & Confidentiality
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="hover:text-forest-950 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-forest-950 transition-colors">
                  Join as a Psychologist
                </Link>
              </li>
              <li>
                <Link href="/api/health" className="hover:text-forest-950 transition-colors">
                  System Health Probe
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-sage-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-forest-500 text-[11px]">
          <p>© {new Date().getFullYear()} Mind Refill. Built with human care, clinical rigor, and ethical technology.</p>
          <div className="flex space-x-6">
            <Link href="/legal/privacy" className="hover:text-forest-800">
              Privacy Policy
            </Link>
            <Link href="/legal/terms" className="hover:text-forest-800">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
