import { describe, it, expect, vi, beforeEach } from "vitest";
import { VerificationService } from "@/modules/verification/services/verification.service";
import { prisma } from "@/shared/database/prisma";
import { storageService } from "@/modules/storage/services/local-storage.service";
import { ForbiddenError, ValidationError } from "@/shared/errors";
import { UserRole, VerificationStatus } from "@prisma/client";

vi.mock("@/shared/database/prisma", () => {
  const mockPrisma = {
    psychologistProfile: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    verificationApplication: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    verificationDocument: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    verificationReview: {
      create: vi.fn(),
    },
    storedFile: {
      create: vi.fn(),
    },
    staffProfile: {
      findUnique: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn((callback) => {
      if (typeof callback === "function") return callback(mockPrisma);
      return Promise.all(callback);
    }),
  };
  return { prisma: mockPrisma };
});

vi.mock("@/modules/storage/services/local-storage.service", () => ({
  storageService: {
    uploadFile: vi.fn().mockResolvedValue({
      key: "verif-opaque.pdf",
      bucket: "private-docs",
      mimeType: "application/pdf",
      sizeBytes: 1024,
    }),
    getSignedDownloadUrl: vi.fn().mockResolvedValue("/api/storage/download?signed=true"),
  },
}));

function mockSession(userId: string, role: UserRole) {
  return {
    sessionId: "sess-1",
    expiresAt: new Date(Date.now() + 10000),
    user: {
      id: userId,
      email: "user@example.com",
      isEmailVerified: true,
      isActive: true,
      roles: [role],
    },
  };
}

describe("Verification Workflow & Private Document Protection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("denies access to private verification document for unrelated client", async () => {
    vi.mocked(prisma.verificationDocument.findUnique).mockResolvedValue({
      id: "doc-1",
      file: { bucket: "private-bucket", storageKey: "opaque.pdf" },
      application: {
        psychologist: { userId: "psychologist-owner-id" },
      },
    } as any);

    const clientSession = mockSession("unrelated-client-id", UserRole.CLIENT);

    await expect(
      VerificationService.getSignedDocumentUrl("doc-1", clientSession as any)
    ).rejects.toThrow(ForbiddenError);
  });

  it("permits owning psychologist and platform administrator to inspect document", async () => {
    vi.mocked(prisma.verificationDocument.findUnique).mockResolvedValue({
      id: "doc-1",
      file: { bucket: "private-bucket", storageKey: "opaque.pdf" },
      application: {
        psychologist: { userId: "psychologist-owner-id" },
      },
    } as any);

    const ownerSession = mockSession("psychologist-owner-id", UserRole.PSYCHOLOGIST);
    const adminSession = mockSession("admin-reviewer-id", UserRole.ADMIN);

    const url1 = await VerificationService.getSignedDocumentUrl("doc-1", ownerSession as any);
    expect(url1).toContain("download");

    const url2 = await VerificationService.getSignedDocumentUrl("doc-1", adminSession as any);
    expect(url2).toContain("download");
  });

  it("blocks submitting verification application without attached documents", async () => {
    vi.mocked(prisma.psychologistProfile.findUnique).mockResolvedValue({
      id: "prof-1",
      userId: "user-1",
      verificationApps: [{ id: "app-1", documents: [] }],
    } as any);

    await expect(
      VerificationService.submitApplication("prof-1", "user-1")
    ).rejects.toThrow(ValidationError);
  });

  it("allows admin to review and approve verification application", async () => {
    vi.mocked(prisma.verificationApplication.findUnique).mockResolvedValue({
      id: "app-1",
      psychologistId: "prof-1",
    } as any);

    vi.mocked(prisma.staffProfile.findUnique).mockResolvedValue({
      id: "staff-1",
    } as any);

    vi.mocked(prisma.verificationApplication.update).mockResolvedValue({
      id: "app-1",
      status: VerificationStatus.VERIFIED,
    } as any);

    vi.mocked(prisma.verificationReview.create).mockResolvedValue({
      id: "rev-1",
      outcomeStatus: VerificationStatus.VERIFIED,
    } as any);

    const adminSession = mockSession("admin-user-id", UserRole.ADMIN);

    const result = await VerificationService.reviewApplication(adminSession as any, {
      applicationId: "app-1",
      outcomeStatus: "VERIFIED",
      notes: "License verified against state council records.",
    });

    expect(result.application.status).toBe(VerificationStatus.VERIFIED);
    expect(result.review.outcomeStatus).toBe(VerificationStatus.VERIFIED);
  });
});
