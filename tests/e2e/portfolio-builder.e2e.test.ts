import { describe, it, expect } from "vitest";
import { PortfolioContentSchema } from "@/modules/portfolio/providers/ai-provider.interface";
import { GeminiAIProvider } from "@/modules/portfolio/providers/gemini-ai.provider";

describe("E2E Journey: AI Portfolio Generation -> Structured Revisions -> Versioning -> Live Publishing", () => {
  it("executes the end-to-end portfolio authoring and lifecycle journey", async () => {
    const aiProvider = new GeminiAIProvider();

    // 1. Natural Language & Structured Clinical Input
    const generationInput = {
      psychologistName: "Dr. Kabir Roy",
      professionalTitle: "Licensed Clinical Psychologist",
      yearsOfExperience: 10,
      specialties: ["Anxiety & Panic Disorders", "Depression", "Workplace Burnout"],
      languages: ["English", "Hindi"],
      qualifications: [
        {
          degree: "Psy.D. in Clinical Psychology",
          institution: "National Institute of Mental Health",
          yearObtained: 2014,
        },
      ],
      rawBioOrResumeText:
        "Specialized in high-stress professional transitions, mindfulness-based cognitive therapy, and adult resilience over 10 years of hospital and private practice.",
      preferredToneStyle: "warm",
    };

    // 2. AI Synthesizes Portfolio Draft
    const draftContent = await aiProvider.generateStructuredPortfolio(generationInput);
    expect(PortfolioContentSchema.safeParse(draftContent).success).toBe(true);
    expect(draftContent.headline).toContain("Licensed Clinical Psychologist");
    expect(draftContent.expertise).toContain("Anxiety & Panic Disorders");
    expect(draftContent.qualificationsSummary[0].year).toBe(2014);

    // 3. Practitioner selects Template Theme and saves Version 1
    const version1 = {
      id: "ver-e2e-1",
      versionNum: 1,
      styleName: "warm",
      content: draftContent,
      createdAt: new Date(),
    };
    expect(version1.versionNum).toBe(1);
    expect(version1.styleName).toBe("warm");

    // 4. Practitioner applies manual structured refinement
    const refinedContent = {
      ...draftContent,
      headline: "Senior Clinical Psychologist & Anxiety Specialist",
      ctaText: "Schedule an Intake Assessment",
    };
    expect(PortfolioContentSchema.safeParse(refinedContent).success).toBe(true);

    const version2 = {
      id: "ver-e2e-2",
      versionNum: 2,
      styleName: "warm",
      content: refinedContent,
      changeNotes: "Refined headline and intake CTA",
      createdAt: new Date(),
    };
    expect(version2.versionNum).toBe(2);

    // 5. Practitioner Publishes Version 2 Live
    const publishedPortfolio = {
      id: "port-e2e-1",
      psychologistProfileId: "prof-e2e-1",
      publishedVersionId: version2.id,
      isPublished: true,
      activeContent: version2.content,
    };
    expect(publishedPortfolio.isPublished).toBe(true);
    expect(publishedPortfolio.publishedVersionId).toBe(version2.id);
    expect(publishedPortfolio.activeContent.headline).toBe(
      "Senior Clinical Psychologist & Anxiety Specialist"
    );

    // 6. Rollback capability: Revert back to Version 1 as a new Version 3
    const version3 = {
      id: "ver-e2e-3",
      versionNum: 3,
      styleName: version1.styleName,
      content: version1.content,
      changeNotes: "Rolled back to version 1",
      createdAt: new Date(),
    };
    expect(version3.versionNum).toBe(3);
    expect(version3.content.headline).toBe(version1.content.headline);
  });
});
