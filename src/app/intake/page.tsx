import { Suspense } from "react";
import { IntakeWizard } from "./intake-wizard";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function IntakePage() {
  return (
    <div className="min-h-screen bg-serene-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center">
        <Link href="/" className="text-base font-bold text-serene-900 tracking-tight flex items-center gap-2">
          <span className="h-7 w-7 rounded-lg bg-brand-700 text-white flex items-center justify-center text-xs font-black">
            Ψ
          </span>
          Psychology Platform
        </Link>

        <Link
          href="/psychologists"
          className="text-xs font-semibold text-brand-700 hover:text-brand-800 transition-colors"
        >
          &larr; View Directory
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          </div>
        }
      >
        <IntakeWizard />
      </Suspense>
    </div>
  );
}
