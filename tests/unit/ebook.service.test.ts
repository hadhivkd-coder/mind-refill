import { describe, it, expect, vi, beforeEach } from "vitest";
import { EbookService } from "@/modules/content/services/ebook.service";
import { prisma } from "@/shared/database/prisma";
import { ForbiddenError, NotFoundError, ValidationError } from "@/shared/errors";
import { SessionWithUser } from "@/modules/identity/session.service";
import { UserRole } from "@prisma/client";

vi.mock("@/shared/database/prisma", () => ({
  prisma: {
    psychologistProfile: {
      findUnique: vi.fn(),
    },
    clientProfile: {
      findUnique: vi.fn(),
    },
    storedFile: {
      findUnique: vi.fn(),
    },
    ebook: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    purchase: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
    },
    order: {
      create: vi.fn(),
    },
    orderItem: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/modules/storage/services/local-storage.service", () => ({
  storageService: {
    getSignedDownloadUrl: vi.fn().mockResolvedValue("/api/storage/download?mock=true"),
  },
}));

vi.mock("@/modules/audit/audit.service", () => ({
  AuditService: {
    log: vi.fn().mockResolvedValue({ id: "audit-123" }),
  },
}));

describe("EbookService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockClientSession: SessionWithUser = {
    sessionId: "a0000000-0000-0000-0000-000000000001",
    user: {
      id: "a0000000-0000-0000-0000-000000000002",
      email: "client@mindflow.test",
      isEmailVerified: true,
      isActive: true,
      roles: [UserRole.CLIENT],
    },
    expiresAt: new Date(Date.now() + 86400000),
  };

  describe("purchaseEbook", () => {
    it("creates order, order item, and purchase atomically", async () => {
      vi.mocked(prisma.clientProfile.findUnique).mockResolvedValue({ id: "client-1", userId: "u-1" } as any);
      vi.mocked(prisma.ebook.findUnique).mockResolvedValue({
        id: "eb-1",
        title: "Burnout Recovery",
        priceMinor: 49900n,
        currency: "INR",
        isPublished: true,
      } as any);

      vi.mocked(prisma.purchase.findUnique).mockResolvedValue(null); // Not already owned

      vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => {
        const tx = {
          order: { create: vi.fn().mockResolvedValue({ id: "order-1" }) },
          orderItem: { create: vi.fn() },
          purchase: { create: vi.fn().mockResolvedValue({ id: "purchase-1" }) },
        };
        return cb(tx);
      });

      const res = await EbookService.purchaseEbook("u-1", "eb-1");
      expect(res.purchaseId).toBe("purchase-1");
      expect(res.alreadyOwned).toBe(false);
    });

    it("returns existing purchase if client already owns the ebook", async () => {
      vi.mocked(prisma.clientProfile.findUnique).mockResolvedValue({ id: "client-1", userId: "u-1" } as any);
      vi.mocked(prisma.ebook.findUnique).mockResolvedValue({
        id: "eb-1",
        isPublished: true,
      } as any);

      vi.mocked(prisma.purchase.findUnique).mockResolvedValue({ id: "existing-pur-1" } as any);

      const res = await EbookService.purchaseEbook("u-1", "eb-1");
      expect(res.purchaseId).toBe("existing-pur-1");
      expect(res.alreadyOwned).toBe(true);
    });
  });

  describe("getSecureDownloadUrl", () => {
    it("denies access if user has not purchased the ebook and is not author/admin", async () => {
      vi.mocked(prisma.ebook.findUnique).mockResolvedValue({
        id: "eb-1",
        file: { bucket: "ebooks", storageKey: "file.pdf" },
        author: { userId: "other-psych" },
      } as any);

      vi.mocked(prisma.clientProfile.findUnique).mockResolvedValue({ id: "client-1" } as any);
      vi.mocked(prisma.purchase.findUnique).mockResolvedValue(null); // Not purchased

      await expect(
        EbookService.getSecureDownloadUrl(mockClientSession, "eb-1")
      ).rejects.toThrow(ForbiddenError);
    });

    it("grants signed download URL if client has a confirmed purchase record", async () => {
      vi.mocked(prisma.ebook.findUnique).mockResolvedValue({
        id: "eb-1",
        file: { bucket: "ebooks", storageKey: "file.pdf" },
        author: { userId: "other-psych" },
      } as any);

      vi.mocked(prisma.clientProfile.findUnique).mockResolvedValue({ id: "client-1" } as any);
      vi.mocked(prisma.purchase.findUnique).mockResolvedValue({ id: "pur-1" } as any);

      const url = await EbookService.getSecureDownloadUrl(mockClientSession, "eb-1");
      expect(url).toContain("/api/storage/download");
    });
  });
});
