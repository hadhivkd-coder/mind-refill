import { describe, it, expect, vi, beforeEach } from "vitest";
import { DirectoryService } from "@/modules/directory/services/directory.service";
import { prisma } from "@/shared/database/prisma";

vi.mock("@/shared/database/prisma", () => ({
  prisma: {
    psychologistProfile: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

describe("DirectoryService & Public Discovery Guardrails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("enforces strict public verified visibility in all directory searches", async () => {
    vi.mocked(prisma.psychologistProfile.count).mockResolvedValue(1);
    vi.mocked(prisma.psychologistProfile.findMany).mockResolvedValue([
      {
        id: "prof-1",
        slug: "dr-jane",
        fullName: "Dr. Jane Doe",
        professionalTitle: "Clinical Psychologist",
        isPublic: true,
        verificationStatus: "VERIFIED",
        profileState: "ACTIVE",
        yearsOfExperience: 10,
        specializations: [],
        languages: [],
      } as any,
    ]);

    const result = await DirectoryService.search({ query: "Jane" });

    expect(result.psychologists).toHaveLength(1);
    expect(result.psychologists[0].isVerified).toBe(true);

    // Verify findMany was executed with the mandatory verificationStatus constraint
    const findCall = vi.mocked(prisma.psychologistProfile.findMany).mock.calls[0][0];
    expect(findCall?.where?.verificationStatus).toBe("VERIFIED");
    expect(findCall?.where?.isPublic).toBe(true);
    expect(findCall?.where?.profileState).toBe("ACTIVE");
  });

  it("applies specialization and language filters accurately", async () => {
    vi.mocked(prisma.psychologistProfile.count).mockResolvedValue(0);
    vi.mocked(prisma.psychologistProfile.findMany).mockResolvedValue([]);

    await DirectoryService.search({
      specializationSlug: "trauma",
      languageCode: "ml",
    });

    const findCall = vi.mocked(prisma.psychologistProfile.findMany).mock.calls[0][0];
    expect(findCall?.where?.specializations?.some?.specialization?.slug).toBe("trauma");
    expect(findCall?.where?.languages?.some?.language?.code).toBe("ml");
  });

  it("caps maximum pagination limit at 50 to prevent unbounded queries", async () => {
    vi.mocked(prisma.psychologistProfile.count).mockResolvedValue(0);
    vi.mocked(prisma.psychologistProfile.findMany).mockResolvedValue([]);

    const result = await DirectoryService.search({ limit: 1000 });
    expect(result.limit).toBe(50);
  });
});
