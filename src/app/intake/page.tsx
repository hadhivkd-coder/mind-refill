import { Suspense } from "react";
import { IntakeWizard } from "./intake-wizard";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default function IntakePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#173C32] text-[#F7F3E9] selection:bg-[#3F6855] selection:text-[#F1EBDD]">
      <Navbar />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="w-8 h-8 animate-spin text-[#9CAF91]" />
            </div>
          }
        >
          <IntakeWizard />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
