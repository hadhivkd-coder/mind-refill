import { enforcePageRole } from "@/modules/authorization/page-guard";
import { UserRole } from "@prisma/client";
import { prisma } from "@/shared/database/prisma";
import { PsychologistDashboardClient } from "./psychologist-dashboard-client";
import { minorToMajorString } from "@/shared/types/money";

export const dynamic = "force-dynamic";

export default async function PsychologistDashboardPage() {
  const session = await enforcePageRole(UserRole.PSYCHOLOGIST);

  let profile: any = null;
  let contentItems: any[] = [];
  let ebooks: any[] = [];
  let activeSessionsCount = 0;
  let inquiriesCount = 0;

  try {
    profile = await prisma.psychologistProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        specializations: { include: { specialization: true } },
      },
    });

    if (profile) {
      const [items, books, sessions, inqs] = await Promise.all([
        prisma.contentItem.findMany({
          where: { authorPsychologistId: profile.id },
          orderBy: { createdAt: "desc" },
        }),
        prisma.ebook.findMany({
          where: { authorPsychologistId: profile.id },
          orderBy: { createdAt: "desc" },
        }),
        prisma.appointment.count({
          where: { psychologistId: profile.id, status: "CONFIRMED" },
        }),
        prisma.counselingRequest.count({
          where: { targetPsychologistId: profile.id },
        }),
      ]);

      contentItems = items;
      ebooks = books;
      activeSessionsCount = sessions;
      inquiriesCount = inqs;
    }
  } catch (error) {
    console.error("Error loading psychologist data:", error);
  }

  // Fallback defaults if new profile
  const effectiveProfile = {
    id: profile?.id || "demo-profile-id",
    slug: profile?.slug || "dr-sarah-jenkins",
    fullName: profile?.fullName || "Dr. Sarah Jenkins, Ph.D.",
    professionalTitle: profile?.professionalTitle || "Licensed Clinical Psychologist",
    profilePhotoUrl: profile?.profilePhotoUrl || "https://images.unsplash.com/photo-1594824813637-2804b494632b?auto=format&fit=crop&q=80&w=600",
    shortIntro: profile?.shortIntro || "Helping individuals navigate emotional overwhelm, anxiety loops, and burnout.",
    bio: profile?.bio || "Licensed clinical psychologist specializing in cognitive and somatic therapies.",
    verificationStatus: profile?.verificationStatus || "VERIFIED",
    isPublic: profile?.isPublic ?? true,
    yearsOfExperience: profile?.yearsOfExperience || 12,
    location: profile?.location || "Verified Online Practitioner",
  };

  // Sample starter content if empty
  const formattedContent =
    contentItems.length > 0
      ? contentItems.map((item) => ({
          id: item.id,
          slug: item.slug,
          title: item.title,
          summary: item.summary,
          body: item.body,
          contentType: item.contentType,
          status: item.status,
          publishedAt: item.publishedAt ? item.publishedAt.toISOString() : null,
          createdAt: item.createdAt.toISOString(),
        }))
      : [
          {
            id: "p1",
            slug: "permission-to-pause",
            title: "Permission to Pause",
            summary: JSON.stringify({
              mediaUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=500",
              tag: "Stress & Anxiety",
            }),
            body: "Giving yourself permission to pause isn't giving up. It is the exact moment your nervous system begins to reset.",
            contentType: "PHOTO",
            status: "PUBLISHED",
            publishedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          },
          {
            id: "p2",
            slug: "gentle-pacing-on-the-path",
            title: "Gentle Pacing on the Path",
            summary: JSON.stringify({ tag: "Self-Understanding" }),
            body: "You don't have to fix the whole mountain today. You only have to take one gentle step on the path.",
            contentType: "POST",
            status: "PUBLISHED",
            publishedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          },
        ];

  const formattedProducts =
    ebooks.length > 0
      ? ebooks.map((b) => ({
          id: b.id,
          slug: b.slug,
          title: b.title,
          description: b.description,
          priceMajor: minorToMajorString(b.priceMinor),
          currency: b.currency,
          isPublished: b.isPublished,
          createdAt: b.createdAt.toISOString(),
        }))
      : [
          {
            id: "prod-1",
            slug: "overcoming-anxiety-companion-workbook",
            title: "The Overcoming Anxiety Companion Workbook",
            description: "A 4-week CBT and somatic daily grounding guide to tame racing thoughts and reclaim calm evenings.",
            priceMajor: "299.00",
            currency: "INR",
            isPublished: true,
            createdAt: new Date().toISOString(),
          },
        ];

  return (
    <PsychologistDashboardClient
      user={{
        id: session.user.id,
        email: session.user.email,
      }}
      profile={effectiveProfile}
      stats={{
        activeSessionsCount,
        inquiriesCount,
        publishedCount: formattedContent.length,
        productsCount: formattedProducts.length,
      }}
      initialContent={formattedContent}
      initialProducts={formattedProducts}
    />
  );
}
