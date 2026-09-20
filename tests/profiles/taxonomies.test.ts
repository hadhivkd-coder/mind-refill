import { describe, it, expect, vi } from "vitest";
import { TaxonomyService } from "@/modules/profiles/services/taxonomy.service";
import { QualificationService } from "@/modules/profiles/services/qualification.service";
import { ExperienceService } from "@/modules/profiles/services/experience.service";
import { prisma } from "@/shared/database/prisma";
import { ConflictError, ForbiddenError } from "@/shared/errors";

vi.mock("@/shared/database/prisma", () => ({
  prisma: {
    specialization: {
      findFirst: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    language: {
      findFirst: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    psychologistProfile: {
      findUnique: vi.fn(),
    },
    qualification: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    professionalExperience: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe("Taxonomies, Qualifications & Experiences", () => {
  it("rejects duplicate specialization creation safely", async () => {
    vi.mocked(prisma.specialization.findFirst).mockResolvedValue({
      id: "spec-1",
      name: "Anxiety",
      slug: "anxiety",
    } as any);

    await expect(
      TaxonomyService.createSpecialization({ name: "Anxiety" })
    ).rejects.toThrow(ConflictError);
  });

  it("enforces ownership when adding qualifications", async () => {
    vi.mocked(prisma.psychologistProfile.findUnique).mockResolvedValue({
      id: "prof-1",
      userId: "user-legit",
    } as any);

    // Attacker tries to add qualification to prof-1
    await expect(
      QualificationService.addQualification("prof-1", "user-attacker", {
        degree: "Ph.D.",
        institution: "University",
        yearObtained: 2020,
      })
    ).rejects.toThrow(ForbiddenError);
  });

  it("enforces ownership when adding professional experiences", async () => {
    vi.mocked(prisma.psychologistProfile.findUnique).mockResolvedValue({
      id: "prof-1",
      userId: "user-legit",
    } as any);

    // Attacker tries to add experience to prof-1
    await expect(
      ExperienceService.addExperience("prof-1", "user-attacker", {
        organization: "Hospital",
        roleTitle: "Clinician",
        startDate: "2020-01-01",
      })
    ).rejects.toThrow(ForbiddenError);
  });
});
