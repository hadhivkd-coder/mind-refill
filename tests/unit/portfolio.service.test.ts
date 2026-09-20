import { describe, it, expect, vi, beforeEach } from "vitest";
import { PortfolioService } from "@/modules/portfolio/services/portfolio.service";
import { prisma } from "@/shared/database/prisma";
import { ForbiddenError, NotFoundError } from "@/shared/errors";
import { SubscriptionService } from "@/modules/subscriptions/services/subscription.service";

vi.mock("@/shared/database/prisma", () => ({
  prisma: {
    psychologistProfile: {
      findUnique: vi.fn(),
    },
    portfolio: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    portfolioVersion: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    portfolioSection: {
      createMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/modules/subscriptions/services/subscription.service", () => ({
  SubscriptionService: {
    hasEntitlement: vi.fn(),
  },
}));

vi.mock("@/modules/audit/audit.service", () => ({
  AuditService: {
    log: vi.fn().mockResolvedValue({ id: "audit-123" }),
  },
}));

describe("PortfolioService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockProfile = {
    id: "a0000000-0000-0000-0000-000000000001",
    userId: "u-psych-1",
    fullName: "Dr. Ananya Roy",
    professionalTitle: "Clinical Psychologist",
    slug: "dr-ananya-roy",
    yearsOfExperience: 8,
    bio: "Clinical practitioner specialized in adult psychotherapy.",
    specializations: [{ specialization: { name: "Anxiety & Panic" } }],
    languages: [{ language: { name: "English" } }],
    qualifications: [{ degree: "M.Phil Clinical Psychology", institution: "NIMHANS", yearObtained: 2016 }],
  };

  describe("getPsychologistPortfolio", () => {
    it("returns portfolio and initializes one if not present", async () => {
      vi.mocked(prisma.psychologistProfile.findUnique).mockResolvedValue(mockProfile as any);
      vi.mocked(prisma.portfolio.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.portfolio.create).mockResolvedValue({
        id: "port-1",
        psychologistProfileId: mockProfile.id,
        isPublished: false,
        publishedVersionId: null,
        versions: [],
      } as any);

      const res = await PortfolioService.getPsychologistPortfolio(mockProfile.userId);
      expect(res.portfolioId).toBe("port-1");
      expect(res.isPublished).toBe(false);
      expect(res.profileSummary.fullName).toBe("Dr. Ananya Roy");
    });
  });

  describe("generateWithAi", () => {
    it("blocks psychologists without aiPortfolioBuilder subscription entitlement", async () => {
      vi.mocked(prisma.psychologistProfile.findUnique).mockResolvedValue(mockProfile as any);
      vi.mocked(SubscriptionService.hasEntitlement).mockResolvedValue(false);

      await expect(
        PortfolioService.generateWithAi(mockProfile.userId)
      ).rejects.toThrow(ForbiddenError);
    });

    it("generates compliant portfolio draft when entitlement is present", async () => {
      vi.mocked(prisma.psychologistProfile.findUnique).mockResolvedValue(mockProfile as any);
      vi.mocked(SubscriptionService.hasEntitlement).mockResolvedValue(true);
      vi.mocked(prisma.portfolio.findUnique).mockResolvedValue({ id: "port-1" } as any);
      vi.mocked(prisma.portfolioVersion.findFirst).mockResolvedValue(null); // First version

      vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => {
        const tx = {
          portfolioVersion: {
            create: vi.fn().mockResolvedValue({
              id: "ver-1",
              versionNum: 1,
              styleName: "modern",
              contentJson: {
                headline: "Clinical Psychologist",
                introduction: "Introduction text",
                about: "About text",
                expertise: ["Anxiety"],
                whoTheyHelp: ["Adults"],
                experienceSummary: "Summary",
                qualificationsSummary: [],
                languages: ["English"],
                counselingApproach: "CBT",
                ctaText: "Book",
                sectionOrder: ["hero", "about"],
              },
              changeNotes: "AI Generated Initial Draft",
              createdAt: new Date(),
            }),
          },
          portfolioSection: {
            createMany: vi.fn().mockResolvedValue({ count: 2 }),
          },
        };
        return cb(tx);
      });

      const draft = await PortfolioService.generateWithAi(mockProfile.userId);
      expect(draft.versionNum).toBe(1);
      expect(draft.styleName).toBe("modern");
    });
  });

  describe("publishVersion", () => {
    it("publishes specified version number", async () => {
      vi.mocked(prisma.psychologistProfile.findUnique).mockResolvedValue(mockProfile as any);
      vi.mocked(prisma.portfolio.findUnique).mockResolvedValue({ id: "port-1", psychologistProfileId: mockProfile.id } as any);
      vi.mocked(prisma.portfolioVersion.findUnique).mockResolvedValue({
        id: "ver-1",
        versionNum: 1,
      } as any);

      vi.mocked(prisma.portfolio.update).mockResolvedValue({
        id: "port-1",
        isPublished: true,
        publishedVersionId: "ver-1",
      } as any);

      const published = await PortfolioService.publishVersion(mockProfile.userId, 1);
      expect(published.isPublished).toBe(true);
      expect(published.publishedVersionId).toBe("ver-1");
    });
  });

  describe("rollbackToVersion", () => {
    it("restores older version as a new draft version", async () => {
      vi.mocked(prisma.psychologistProfile.findUnique).mockResolvedValue(mockProfile as any);
      vi.mocked(prisma.portfolio.findUnique).mockResolvedValue({ id: "port-1", psychologistProfileId: mockProfile.id } as any);
      vi.mocked(prisma.portfolioVersion.findUnique).mockResolvedValue({
        id: "ver-1",
        versionNum: 1,
        styleName: "minimal",
        contentJson: {
          headline: "Minimalist Clinician",
          introduction: "Intro text here with proper length...",
          about: "About text here with proper length...",
          expertise: ["Depression"],
          whoTheyHelp: ["Teens"],
          experienceSummary: "Summary with proper length...",
          qualificationsSummary: [],
          languages: ["English"],
          counselingApproach: "Humanistic approach with proper length...",
          ctaText: "Book now",
          sectionOrder: ["hero", "about"],
        },
      } as any);

      vi.mocked(prisma.portfolioVersion.findFirst).mockResolvedValue({ versionNum: 3 } as any);

      vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => {
        const tx = {
          portfolioVersion: {
            create: vi.fn().mockResolvedValue({
              id: "ver-4",
              versionNum: 4,
              styleName: "minimal",
              contentJson: {},
              changeNotes: "Rolled back to version 1",
              createdAt: new Date(),
            }),
          },
          portfolioSection: {
            createMany: vi.fn(),
          },
        };
        return cb(tx);
      });

      const rollback = await PortfolioService.rollbackToVersion(mockProfile.userId, 1);
      expect(rollback.versionNum).toBe(4);
      expect(rollback.changeNotes).toContain("Rolled back to version 1");
    });
  });
});
