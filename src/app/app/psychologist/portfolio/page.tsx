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
  const profile = await prisma.psychologistProfile.findUnique({
    where: { userId: session.user.id },
  });

  const [portfolioData, hasAiEntitlement] = await Promise.all([
    PortfolioService.getPsychologistPortfolio(session.user.id),
    profile ? SubscriptionService.hasEntitlement(profile.id, "aiPortfolioBuilder") : Promise.resolve(false),
  ]);

  return (
    <div className="min-h-screen bg-serene-50 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <Link
          href="/app/psychologist"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-serene-500 hover:text-serene-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Psychologist Portal
        </Link>

        <header className="border-b border-serene-200 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-brand-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-serene-900">
              AI Professional Portfolio Studio
            </h1>
          </div>
          <p className="text-xs text-serene-500 mt-1">
            Synthesize an evidence-based clinical portfolio with AI, choose from 5 tailored design templates, manage versions, and publish directly to your verified public profile.
          </p>
        </header>

        <PortfolioStudio
          portfolioId={portfolioData.portfolioId}
          isPublished={portfolioData.isPublished}
          publishedVersionId={portfolioData.publishedVersionId}
          initialContent={portfolioData.latestVersion?.content ?? null}
          initialStyle={portfolioData.latestVersion?.styleName ?? "modern"}
          initialVersionNum={portfolioData.latestVersion?.versionNum ?? null}
          versionsHistory={portfolioData.versionsHistory}
          hasAiEntitlement={Boolean(hasAiEntitlement)}
          slug={profile?.slug || ""}
        />
      </div>
    </div>
  );
}
