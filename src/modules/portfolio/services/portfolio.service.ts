import { prisma } from "@/shared/database/prisma";
import { ForbiddenError, NotFoundError, ValidationError } from "@/shared/errors";
import {
  PortfolioContent,
  PortfolioContentSchema,
} from "../providers/ai-provider.interface";
import { GeminiAIProvider } from "../providers/gemini-ai.provider";
import { SubscriptionService } from "@/modules/subscriptions/services/subscription.service";
import { AuditService } from "@/modules/audit/audit.service";

export const PORTFOLIO_TEMPLATES = [
  { id: "minimal", name: "Minimalist", description: "Clean typography, high whitespace, focused clinical clarity." },
  { id: "warm", name: "Warm & Relatable", description: "Approachable earth tones, gentle cards, welcoming atmosphere." },
  { id: "modern", name: "Modern Contemporary", description: "Crisp lines, bold accents, structured modular grid." },
  { id: "elegant", name: "Refined & Editorial", description: "Sophisticated serif accents, balanced spacing, premium aesthetic." },
  { id: "professional", name: "Clinical Authority", description: "Structured clinical hierarchy highlighting qualifications and methods." },
];

export class PortfolioService {
  private static aiProvider = new GeminiAIProvider();

  /**
   * Retrieves or initializes a portfolio record for a psychologist.
   */
  static async getPsychologistPortfolio(userId: string) {
    const profile = await prisma.psychologistProfile.findUnique({
      where: { userId },
      include: {
        specializations: { include: { specialization: true } },
        languages: { include: { language: true } },
        qualifications: true,
      },
    });

    if (!profile) throw new NotFoundError("Psychologist profile not found");

    let portfolio = await prisma.portfolio.findUnique({
      where: { psychologistProfileId: profile.id },
      include: {
        versions: {
          orderBy: { versionNum: "desc" },
          take: 10,
        },
      },
    });

    if (!portfolio) {
      portfolio = await prisma.portfolio.create({
        data: {
          psychologistProfileId: profile.id,
        },
        include: {
          versions: {
            orderBy: { versionNum: "desc" },
            take: 10,
          },
        },
      });
    }

    const publishedVersion = portfolio.publishedVersionId
      ? await prisma.portfolioVersion.findUnique({
          where: { id: portfolio.publishedVersionId },
        })
      : null;

    return {
      portfolioId: portfolio.id,
      isPublished: portfolio.isPublished,
      publishedVersionId: portfolio.publishedVersionId,
      publishedVersion: publishedVersion
        ? {
            id: publishedVersion.id,
            versionNum: publishedVersion.versionNum,
            styleName: publishedVersion.styleName,
            content: publishedVersion.contentJson as unknown as PortfolioContent,
            createdAt: publishedVersion.createdAt.toISOString(),
          }
        : null,
      latestVersion: portfolio.versions[0]
        ? {
            id: portfolio.versions[0].id,
            versionNum: portfolio.versions[0].versionNum,
            styleName: portfolio.versions[0].styleName,
            content: portfolio.versions[0].contentJson as unknown as PortfolioContent,
            changeNotes: portfolio.versions[0].changeNotes,
            createdAt: portfolio.versions[0].createdAt.toISOString(),
          }
        : null,
      versionsHistory: portfolio.versions.map((v) => ({
        id: v.id,
        versionNum: v.versionNum,
        styleName: v.styleName,
        changeNotes: v.changeNotes,
        createdAt: v.createdAt.toISOString(),
      })),
      profileSummary: {
        fullName: profile.fullName,
        professionalTitle: profile.professionalTitle,
        slug: profile.slug,
        yearsOfExperience: profile.yearsOfExperience,
        specialties: profile.specializations.map((s) => s.specialization.name),
        languages: profile.languages.map((l) => l.language.name),
        qualifications: profile.qualifications.map((q) => ({
          degree: q.degree,
          institution: q.institution,
          yearObtained: q.yearObtained,
        })),
        bio: profile.bio || "",
      },
    };
  }

  /**
   * Generates a complete portfolio draft using the AI provider.
   * Enforces subscription entitlement.
   */
  static async generateWithAi(
    userId: string,
    options?: { rawBio?: string; preferredTone?: string; styleName?: string }
  ) {
    const profile = await prisma.psychologistProfile.findUnique({
      where: { userId },
      include: {
        specializations: { include: { specialization: true } },
        languages: { include: { language: true } },
        qualifications: true,
      },
    });

    if (!profile) throw new NotFoundError("Psychologist profile not found");

    // Entitlement enforcement
    const hasAiEntitlement = await SubscriptionService.hasEntitlement(
      profile.id,
      "aiPortfolioBuilder"
    );

    if (!hasAiEntitlement) {
      throw new ForbiddenError(
        "AI Portfolio Builder is available on Professional and Elite subscription plans. Please upgrade your subscription."
      );
    }

    const generatedContent = await this.aiProvider.generateStructuredPortfolio({
      psychologistName: profile.fullName,
      professionalTitle: profile.professionalTitle,
      yearsOfExperience: profile.yearsOfExperience,
      specialties: profile.specializations.map((s) => s.specialization.name),
      languages: profile.languages.map((l) => l.language.name),
      qualifications: profile.qualifications.map((q) => ({
        degree: q.degree,
        institution: q.institution,
        yearObtained: q.yearObtained,
      })),
      rawBioOrResumeText: options?.rawBio || profile.bio || "",
      preferredToneStyle: options?.preferredTone || "warm",
    });

    return this.saveNewVersion(
      profile.id,
      generatedContent,
      options?.styleName || "modern",
      "AI Generated Initial Draft"
    );
  }

  /**
   * Saves a new portfolio version.
   */
  static async saveDraft(
    userId: string,
    content: unknown,
    styleName: string = "modern",
    changeNotes: string = "Manual edits"
  ) {
    const validated = PortfolioContentSchema.parse(content);
    const profile = await prisma.psychologistProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError("Psychologist profile not found");

    return this.saveNewVersion(profile.id, validated, styleName, changeNotes);
  }

  /**
   * Internal helper to persist a new version with section order.
   */
  private static async saveNewVersion(
    psychologistProfileId: string,
    content: PortfolioContent,
    styleName: string,
    changeNotes: string
  ) {
    let portfolio = await prisma.portfolio.findUnique({
      where: { psychologistProfileId },
    });

    if (!portfolio) {
      portfolio = await prisma.portfolio.create({
        data: { psychologistProfileId },
      });
    }

    const latestVersion = await prisma.portfolioVersion.findFirst({
      where: { portfolioId: portfolio.id },
      orderBy: { versionNum: "desc" },
    });

    const nextVersionNum = (latestVersion?.versionNum || 0) + 1;

    return prisma.$transaction(async (tx) => {
      const version = await tx.portfolioVersion.create({
        data: {
          portfolioId: portfolio.id,
          versionNum: nextVersionNum,
          styleName,
          contentJson: content as any,
          changeNotes,
        },
      });

      // Populate sections
      const sections = content.sectionOrder.map((sectionType, idx) => ({
        portfolioVersionId: version.id,
        sectionType,
        sectionOrder: idx + 1,
        heading: sectionType.toUpperCase(),
        payloadJson: { type: sectionType },
      }));

      await tx.portfolioSection.createMany({
        data: sections,
      });

      await AuditService.log({
        action: "PORTFOLIO_VERSION_CREATED",
        entityType: "PortfolioVersion",
        entityId: version.id,
        safeMetadata: {
          versionNum: nextVersionNum,
          styleName,
          changeNotes,
        },
      });

      return {
        id: version.id,
        versionNum: version.versionNum,
        styleName: version.styleName,
        content: version.contentJson as unknown as PortfolioContent,
        changeNotes: version.changeNotes,
        createdAt: version.createdAt.toISOString(),
      };
    });
  }

  /**
   * Publishes a specific portfolio version to the live public page.
   */
  static async publishVersion(userId: string, versionNum: number) {
    const profile = await prisma.psychologistProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError("Psychologist profile not found");

    const portfolio = await prisma.portfolio.findUnique({
      where: { psychologistProfileId: profile.id },
    });
    if (!portfolio) throw new NotFoundError("Portfolio not found");

    const version = await prisma.portfolioVersion.findUnique({
      where: {
        portfolioId_versionNum: {
          portfolioId: portfolio.id,
          versionNum,
        },
      },
    });

    if (!version) throw new NotFoundError(`Version ${versionNum} not found`);

    const updated = await prisma.portfolio.update({
      where: { id: portfolio.id },
      data: {
        publishedVersionId: version.id,
        isPublished: true,
      },
    });

    await AuditService.log({
      actorUserId: userId,
      action: "PORTFOLIO_PUBLISHED",
      entityType: "Portfolio",
      entityId: portfolio.id,
      safeMetadata: {
        versionNum,
        publishedVersionId: version.id,
      },
    });

    return updated;
  }

  /**
   * Rollback: Restores an older version as the newest draft version.
   */
  static async rollbackToVersion(userId: string, targetVersionNum: number) {
    const profile = await prisma.psychologistProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError("Psychologist profile not found");

    const portfolio = await prisma.portfolio.findUnique({
      where: { psychologistProfileId: profile.id },
    });
    if (!portfolio) throw new NotFoundError("Portfolio not found");

    const targetVersion = await prisma.portfolioVersion.findUnique({
      where: {
        portfolioId_versionNum: {
          portfolioId: portfolio.id,
          versionNum: targetVersionNum,
        },
      },
    });

    if (!targetVersion) throw new NotFoundError(`Target version ${targetVersionNum} not found`);

    return this.saveNewVersion(
      profile.id,
      targetVersion.contentJson as unknown as PortfolioContent,
      targetVersion.styleName,
      `Rolled back to version ${targetVersionNum}`
    );
  }

  /**
   * Retrieves public published portfolio data for a given slug.
   */
  static async getPublicPortfolioBySlug(slug: string) {
    const profile = await prisma.psychologistProfile.findUnique({
      where: { slug },
      include: {
        services: { where: { isActive: true } },
        specializations: { include: { specialization: true } },
        languages: { include: { language: true } },
        qualifications: true,
        experiences: true,
        portfolio: true,
      },
    });

    if (!profile) return null;

    let publishedContent: PortfolioContent | null = null;
    let templateStyle = "modern";

    if (profile.portfolio?.isPublished && profile.portfolio.publishedVersionId) {
      const version = await prisma.portfolioVersion.findUnique({
        where: { id: profile.portfolio.publishedVersionId },
      });
      if (version) {
        publishedContent = version.contentJson as unknown as PortfolioContent;
        templateStyle = version.styleName;
      }
    }

    return {
      profile,
      publishedContent,
      templateStyle,
    };
  }
}
