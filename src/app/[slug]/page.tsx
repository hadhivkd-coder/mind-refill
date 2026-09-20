import { redirect, notFound } from "next/navigation";
import { ProfileService } from "@/modules/profiles/services/profile.service";
import { platformConfig } from "@/shared/config/platform";

interface CanonicalSlugPageProps {
  params: { slug: string };
}

/**
 * Canonical Portfolio Route (/[slug])
 * Resolves psychologist identity by slug. In Phase 2, seamlessly routes to the psychologist's
 * verified public profile, establishing the permanent canonical URL for the Phase 7 AI Portfolio Builder.
 */
export default async function CanonicalPortfolioSlugPage({ params }: CanonicalSlugPageProps) {
  const normalized = params.slug.toLowerCase().trim();

  // Protect system routes
  if (platformConfig.reservedSlugs.includes(normalized)) {
    notFound();
  }

  try {
    const profile = await ProfileService.getPublicProfileBySlug(normalized);
    if (!profile) {
      notFound();
    }
    // Forward directly to the canonical public profile route
    redirect(`/psychologists/${encodeURIComponent(profile.slug)}`);
  } catch {
    notFound();
  }
}
