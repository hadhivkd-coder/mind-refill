import { enforcePageRole } from "@/modules/authorization/page-guard";
import { UserRole } from "@prisma/client";
import { PortfolioService } from "@/modules/portfolio/services/portfolio.service";
import { SubscriptionService } from "@/modules/subscriptions/services/subscription.service";
import { prisma } from "@/shared/database/prisma";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { PortfolioStudio } from "./portfolio-studio";

export const dynamic = "force-dynamic";

export default async function PsychologistPortfolioPage() {
  const session = await enforcePageRole(UserRole.PSYCHOLOGIST);

  let profile: any = null;
  let portfolioData: any = {
    portfolioId: "default-portfolio-id",
    isPublished: false,
    publishedVersionId: null,
    latestVersion: null,
    versionsHistory: [],
  };
  let hasAiEntitlement = false;

  try {
    profile = await prisma.psychologistProfile.findUnique({
      where: { userId: session.user.id },
    });

    const [pData, aiEnt] = await Promise.all([
      PortfolioService.getPsychologistPortfolio(session.user.id).catch(() => portfolioData),
      profile ? SubscriptionService.hasEntitlement(profile.id, "aiPortfolioBuilder").catch(() => false) : Promise.resolve(false),
    ]);

    if (pData) portfolioData = pData;
    hasAiEntitlement = Boolean(aiEnt);
  } catch (err) {
    console.error("Error loading portfolio data:", err);
  }

  return (
    <div className="min-h-screen bg-[#173C32] text-[#F7F3E9] selection:bg-[#3F6855] selection:text-[#F1EBDD] p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <Link
          href="/app/psychologist"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#9CAF91] hover:text-[#F1EBDD] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Practitioner Workspace</span>
        </Link>

        <header className="border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-[#9CAF91]" />
            <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#F7F3E9]">
              AI Professional Portfolio Studio
            </h1>
          </div>
          <p className="text-xs text-[#C9D2BC] mt-1 font-light">
            Synthesize an evidence-based clinical portfolio with AI, choose from 5 tailored design templates, and publish directly to your verified profile.
          </p>
        </header>

        <div className="atmospheric-card rounded-3xl p-6 sm:p-8">
          <PortfolioStudio
            portfolioId={portfolioData.portfolioId}
            isPublished={portfolioData.isPublished}
            publishedVersionId={portfolioData.publishedVersionId}
            initialContent={portfolioData.latestVersion?.content ?? null}
            initialStyle={portfolioData.latestVersion?.styleName ?? "modern"}
            initialVersionNum={portfolioData.latestVersion?.versionNum ?? null}
            versionsHistory={portfolioData.versionsHistory || []}
            hasAiEntitlement={hasAiEntitlement}
            slug={profile?.slug || "dr-sarah-jenkins"}
          />
        </div>
      </div>
    </div>
  );
}
