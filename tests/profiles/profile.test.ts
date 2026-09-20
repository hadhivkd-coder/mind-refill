import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProfileService } from "@/modules/profiles/services/profile.service";
import { prisma } from "@/shared/database/prisma";
import { ForbiddenError, NotFoundError } from "@/shared/errors";

vi.mock("@/shared/database/prisma", () => {
  const mockPrisma = {
    psychologistProfile: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    psychologistSpecialization: {
      deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
      createMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    psychologistLanguage: {
      deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
      createMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    socialLink: {
      deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
      createMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    $transaction: vi.fn((callback) => {
      if (typeof callback === "function") return callback(mockPrisma);
      return Promise.all(callback);
    }),
  };
  return { prisma: mockPrisma };
});

describe("ProfileService & Ownership Protection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("enforces ownership: Psychologist A cannot update Psychologist B's profile", async () => {
    vi.mocked(prisma.psychologistProfile.findUnique).mockResolvedValue({
      id: "profile-b",
      userId: "user-b", // Owned by User B
      slug: "psychologist-b",
    } as any);

    // User A attempts to update Profile B -> ForbiddenError
    await expect(
      ProfileService.updateProfile("profile-b", "user-a", {
        fullName: "Malicious Edit",
      })
    ).rejects.toThrow(ForbiddenError);
  });

  it("allows owner to update their own profile", async () => {
    vi.mocked(prisma.psychologistProfile.findUnique).mockResolvedValue({
      id: "profile-a",
      userId: "user-a",
      slug: "psychologist-a",
    } as any);

    vi.mocked(prisma.psychologistProfile.update).mockResolvedValue({
      id: "profile-a",
      userId: "user-a",
      fullName: "Dr. Alice Updated",
    } as any);

    const updated = await ProfileService.updateProfile("profile-a", "user-a", {
      fullName: "Dr. Alice Updated",
    });

    expect(updated.fullName).toBe("Dr. Alice Updated");
  });

  it("calculates profile completion score accurately based on clinical sections", () => {
    const emptyProfile = {
      bio: "",
      profilePhotoUrl: null,
      specializations: [],
      languages: [],
      qualifications: [],
      experiences: [],
    };
    expect(ProfileService.calculateCompletionPercentage(emptyProfile)).toBe(0);

    const completedProfile = {
      bio: "A comprehensive clinical background exceeding fifty characters for full score.",
      profilePhotoUrl: "https://example.com/photo.jpg",
      shortIntro: "Compassionate psychological care.",
      specializations: [{ id: "s1" }],
      languages: [{ id: "l1" }],
      qualifications: [{ id: "q1" }],
      experiences: [{ id: "e1" }],
    };
    expect(ProfileService.calculateCompletionPercentage(completedProfile)).toBe(100);
  });

  it("rejects public access to unverified psychologist profiles", async () => {
    // findFirst returns null because verificationStatus is PENDING rather than VERIFIED
    vi.mocked(prisma.psychologistProfile.findFirst).mockResolvedValue(null);

    await expect(
      ProfileService.getPublicProfileBySlug("unverified-dr")
    ).rejects.toThrow(NotFoundError);
  });
});
