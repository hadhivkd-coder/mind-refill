import Link from "next/link";
import { ShieldCheck, Scale, AlertCircle, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service | Mind Refill",
  description:
    "Terms and clinical conditions governing the use of the Mind Refill psychological platform.",
};

export default function TermsOfServicePage() {
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

      {/* Terms Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full">
        <div className="bg-white rounded-3xl border border-sage-200/80 p-8 sm:p-12 shadow-sm space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage-100 text-forest-800 text-xs font-semibold mb-4">
              <Scale className="w-3.5 h-3.5 text-forest-600" />
              Platform Agreement
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-forest-950 tracking-tight">
              Terms of Service & Clinical Care Framework
            </h1>
            <p className="text-xs text-forest-500 mt-2">
              Last revised: September 2026 • Please read carefully before engaging in platform services.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Emergency Notice:</strong> Mind Refill is an outpatient psychological platform. If you or someone you know is in immediate crisis, experiencing thoughts of self-harm, or requires emergency psychiatric care, please contact your local emergency services (e.g. 112 / 988) or visit the nearest hospital immediately.
            </div>
          </div>

          <div className="prose prose-forest text-xs sm:text-sm text-forest-800 leading-relaxed space-y-6">
            <section>
              <h2 className="text-base font-bold text-forest-950 mb-2">1. Nature of the Platform</h2>
              <p>
                Mind Refill provides technological infrastructure connecting individuals seeking psychological support with independently licensed psychologists, psychotherapists, and clinical counselors. While we rigorously verify practitioner licenses, the clinical relationship is established directly between the client and the chosen practitioner.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-forest-950 mb-2">2. Credential Verification Standards</h2>
              <p>
                All psychologists listed in our public directory have submitted proof of active professional licensure, relevant university degrees, and professional certifications. These documents are verified by our clinical governance committee prior to public profile publication.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-forest-950 mb-2">3. Appointments, Holds & Cancellations</h2>
              <p>
                When a client initiates checkout for an appointment slot, a 15-minute temporary hold is placed on the psychologist&apos;s schedule. Once payment is captured, the appointment is confirmed. Cancellations and rescheduling requests must adhere to the individual practitioner&apos;s policy (typically 24 hours prior to scheduled session time).
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-forest-950 mb-2">4. Payments & Financial Transactions</h2>
              <p>
                All session fees, e-book purchases, and workshop registrations are processed via encrypted payment gateways. Client funds for sessions are placed into escrow and mature into available psychologist earnings following a standard 7-day settlement period.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-forest-950 mb-2">5. User Conduct & Mutual Respect</h2>
              <p>
                Our platform maintains a strict zero-tolerance policy regarding abusive, harassing, or threatening behavior toward practitioners, coordinators, or fellow workshop participants. Violations will result in immediate account termination.
              </p>
            </section>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-sage-200/60 bg-white py-6 text-center text-xs text-forest-600">
        <p>© {new Date().getFullYear()} Mind Refill. Transparent terms for compassionate care.</p>
      </footer>
    </main>
  );
}
