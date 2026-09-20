import Link from "next/link";
import { ShieldCheck, Lock, Eye, FileText, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Mind Refill",
  description:
    "How Mind Refill protects your personal and psychological information with healthcare-grade confidentiality.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-cream-50 flex flex-col justify-between">
      {/* Header */}
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

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-700 hover:text-forest-950 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Policy Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full">
        <div className="bg-white rounded-3xl border border-sage-200/80 p-8 sm:p-12 shadow-sm space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage-100 text-forest-800 text-xs font-semibold mb-4">
              <ShieldCheck className="w-3.5 h-3.5 text-forest-600" />
              Healthcare Privacy Commitment
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-forest-950 tracking-tight">
              Privacy Policy & Clinical Confidentiality
            </h1>
            <p className="text-xs text-forest-500 mt-2">
              Last revised: September 2026 • Compliant with international psychological health privacy standards.
            </p>
          </div>

          <div className="prose prose-forest text-xs sm:text-sm text-forest-800 leading-relaxed space-y-6">
            <section>
              <h2 className="text-base font-bold text-forest-950 mb-2">1. Our Core Principle: Confidentiality First</h2>
              <p>
                Mind Refill was built with the premise that mental healthcare requires the highest degree of trust. We treat your personal, clinical, and psychological information with extreme discretion. We do not sell your personal data, and we never use your clinical communications for marketing or advertising targeting.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-forest-950 mb-2">2. Information We Collect</h2>
              <ul className="list-disc pl-5 space-y-1.5 text-forest-700">
                <li><strong>Identity Information:</strong> Name, verified email address, phone number, and account credentials.</li>
                <li><strong>Intake & Context Data:</strong> Age band, preferred languages, primary areas of concern, and personal reflection text submitted through the guided matching intake.</li>
                <li><strong>Practitioner Credentials:</strong> Medical/psychological licenses, academic degrees, and verification documents submitted by psychologists.</li>
                <li><strong>Financial Transactions:</strong> Payment status and transaction amounts stored in integer minor units; payment credentials (card numbers) are tokenized by PCI-DSS certified gateways (e.g. Razorpay) and never stored on our servers.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-forest-950 mb-2">3. Role-Based Access Separation</h2>
              <p>
                Access to client intake information is strictly restricted to assigned human care coordinators and the specific psychologist chosen for your counseling care. Platform administrators oversee system integrity and compliance but cannot browse private therapeutic transcripts.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-forest-950 mb-2">4. AI Ethics & Guardrails</h2>
              <p>
                Artificial intelligence is utilized on this platform solely to assist verified psychologists in structuring professional portfolios. AI is strictly prohibited from evaluating client diagnoses, determining medical suitability, or analyzing personal counseling notes.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-forest-950 mb-2">5. Data Retention & Your Rights</h2>
              <p>
                You retain the right to inspect, export, or request permanent deletion of your account and associated intake records at any time, subject only to mandatory legal healthcare record-keeping requirements.
              </p>
            </section>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-sage-200/60 bg-white py-6 text-center text-xs text-forest-600">
        <p>© {new Date().getFullYear()} Mind Refill. Dedicated to ethical mental wellbeing.</p>
      </footer>
    </main>
  );
}
