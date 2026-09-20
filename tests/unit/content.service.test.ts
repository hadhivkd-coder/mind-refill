import { describe, it, expect, vi, beforeEach } from "vitest";
import { ContentService } from "@/modules/content/services/content.service";
import { prisma } from "@/shared/database/prisma";
import { ContentStatus, UserRole } from "@prisma/client";
import { ForbiddenError, NotFoundError, ValidationError } from "@/shared/errors";
import { SessionWithUser } from "@/modules/identity/session.service";

vi.mock("@/shared/database/prisma", () => ({
  prisma: {
    psychologistProfile: {
      findUnique: vi.fn(),
    },
    contentItem: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
  },
}));

vi.mock("@/modules/audit/audit.service", () => ({
  AuditService: {
    log: vi.fn().mockResolvedValue({ id: "audit-123" }),
  },
}));

describe("ContentService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockAdminSession: SessionWithUser = {
    sessionId: "a0000000-0000-0000-0000-000000000001",
    user: {
      id: "a0000000-0000-0000-0000-000000000002",
      email: "admin@mindflow.test",
      isEmailVerified: true,
      isActive: true,
      roles: [UserRole.ADMIN],
    },
    expiresAt: new Date(Date.now() + 86400000),
  };

  const mockPsychSession: SessionWithUser = {
    sessionId: "a0000000-0000-0000-0000-000000000003",
    user: {
      id: "a0000000-0000-0000-0000-000000000004",
      email: "psych@mindflow.test",
      isEmailVerified: true,
      isActive: true,
      roles: [UserRole.PSYCHOLOGIST],
    },
    expiresAt: new Date(Date.now() + 86400000),
  };

  describe("createArticle", () => {
    it("validates title and body length requirements", async () => {
      vi.mocked(prisma.psychologistProfile.findUnique).mockResolvedValue({ id: "p-1" } as any);

      await expect(
        ContentService.createArticle(mockPsychSession.user.id, {
          title: "Tiny",
          body: "Too short",
        })
      ).rejects.toThrow(ValidationError);
    });

    it("creates article in DRAFT status with unique slug", async () => {
      vi.mocked(prisma.psychologistProfile.findUnique).mockResolvedValue({ id: "p-1" } as any);
      vi.mocked(prisma.contentItem.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.contentItem.create).mockResolvedValue({
        id: "art-1",
        title: "Understanding Panic Attacks and Recovery",
        slug: "understanding-panic-attacks-and-recovery",
        status: ContentStatus.DRAFT,
      } as any);

      const res = await ContentService.createArticle(mockPsychSession.user.id, {
        title: "Understanding Panic Attacks and Recovery",
        body: "This is a detailed clinical guide about panic attacks with more than 50 characters of depth.",
      });

      expect(res.id).toBe("art-1");
      expect(res.status).toBe(ContentStatus.DRAFT);
    });
  });

  describe("publishArticle", () => {
    it("denies non-admin users from publishing articles", async () => {
      await expect(
        ContentService.publishArticle(mockPsychSession, "art-1")
      ).rejects.toThrow(ForbiddenError);
    });

    it("updates status to PUBLISHED and sets publishedAt date", async () => {
      vi.mocked(prisma.contentItem.findUnique).mockResolvedValue({ id: "art-1" } as any);
      vi.mocked(prisma.contentItem.update).mockResolvedValue({
        id: "art-1",
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
      } as any);

      const published = await ContentService.publishArticle(mockAdminSession, "art-1");
      expect(published.status).toBe(ContentStatus.PUBLISHED);
      expect(published.publishedAt).toBeDefined();
    });
  });
});
