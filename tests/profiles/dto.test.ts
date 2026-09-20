import { describe, it, expect } from "vitest";
import { toPublicProfileDto, toPublicCardDto } from "@/modules/profiles/dto/public-profile.dto";

describe("Public Data Sanitization & DTO Masking", () => {
  const rawDbPsychologist = {
    id: "uuid-profile-1",
    userId: "uuid-user-1",
    slug: "dr-jane-doe",
    fullName: "Dr. Jane Doe",
    professionalTitle: "Licensed Clinical Psychologist",
    profilePhotoUrl: "https://storage.local/photo.jpg",
    shortIntro: "Dedicated to trauma healing.",
    bio: "Over 12 years of specialized practice in clinical psychology and neuroscience.",
    professionalApproach: "Client-led cognitive behavioral therapy.",
    areasTheyHelpWith: ["Anxiety", "Adult Trauma", "Workplace Stress"],
    yearsOfExperience: 12,
    timezone: "Asia/Kolkata",
    location: "Kochi, India",
    isPublic: true,
    verificationStatus: "VERIFIED",
    profileState: "ACTIVE",
    // Internal/private data that MUST NEVER be exposed in public DTO
    internalStaffNotes: "Privileged clinical background check notes",
    verificationDocuments: [{ id: "doc-1", secretFileKey: "private-license.pdf" }],
    qualifications: [
      {
        id: "q-1",
        degree: "Ph.D. in Clinical Psychology",
        institution: "NIMHANS",
        yearObtained: 2012,
        isPublic: true,
      },
      {
        id: "q-2",
        degree: "Private Internal Certification",
        institution: "Private Institution",
        yearObtained: 2015,
        isPublic: false, // Marked private!
      },
    ],
    experiences: [
      {
        id: "e-1",
        organization: "General Hospital",
        roleTitle: "Consultant Psychologist",
        startDate: new Date("2015-01-01"),
        isPublic: true,
      },
      {
        id: "e-2",
        organization: "Confidential Project",
        roleTitle: "Researcher",
        startDate: new Date("2013-01-01"),
        isPublic: false, // Marked private!
      },
    ],
    specializations: [
      {
        specialization: { id: "s1", name: "Trauma Therapy", slug: "trauma" },
      },
    ],
    languages: [
      {
        language: { id: "l1", code: "en", name: "English" },
      },
    ],
    socialLinks: [{ platform: "linkedin", url: "https://linkedin.com/in/janedoe" }],
  };

  it("toPublicProfileDto strips private qualifications and experiences", () => {
    const dto = toPublicProfileDto(rawDbPsychologist);

    // Public qualification retained
    expect(dto.qualifications).toHaveLength(1);
    expect(dto.qualifications[0].degree).toBe("Ph.D. in Clinical Psychology");

    // Private qualification excluded
    expect(dto.qualifications.some((q) => q.degree === "Private Internal Certification")).toBe(false);

    // Public experience retained
    expect(dto.experiences).toHaveLength(1);
    expect(dto.experiences[0].organization).toBe("General Hospital");

    // Private experience excluded
    expect(dto.experiences.some((e) => e.organization === "Confidential Project")).toBe(false);

    // Raw internal staff notes and documents not present on DTO
    expect((dto as any).internalStaffNotes).toBeUndefined();
    expect((dto as any).verificationDocuments).toBeUndefined();
  });

  it("toPublicCardDto creates a concise, safe summary representation", () => {
    const cardDto = toPublicCardDto(rawDbPsychologist);

    expect(cardDto.fullName).toBe("Dr. Jane Doe");
    expect(cardDto.isVerified).toBe(true);
    expect(cardDto.specializations[0].name).toBe("Trauma Therapy");
    expect((cardDto as any).bio).toBeUndefined();
    expect((cardDto as any).internalStaffNotes).toBeUndefined();
  });
});
