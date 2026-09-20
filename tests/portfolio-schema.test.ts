import { describe, it, expect } from "vitest";
import { PortfolioContentSchema } from "@/modules/portfolio/providers/ai-provider.interface";

describe("AI Portfolio Schema Strictness", () => {
  const validContent = {
    headline: "Licensed Clinical Psychologist & Trauma Specialist",
    introduction: "Dedicated to providing compassionate, evidence-based psychological care.",
    about: "Dr. Jane Doe has over 12 years of clinical experience specializing in trauma and cognitive behavioral therapy.",
    expertise: ["Trauma Therapy", "Anxiety & Depression", "Mindfulness"],
    whoTheyHelp: ["Adults undergoing major transitions", "Individuals experiencing acute burnout"],
    experienceSummary: "12 years in clinical hospital settings and private community practice.",
    qualificationsSummary: [
      {
        degree: "Ph.D. in Clinical Psychology",
        institution: "University of Delhi",
        year: 2012,
      },
    ],
    languages: ["English", "Hindi"],
    counselingApproach: "Integrative Cognitive Behavioral Therapy rooted in empathetic, client-led dialogue.",
    ctaText: "Schedule an Intake Consultation",
    sectionOrder: ["hero", "about", "expertise", "approach", "qualifications", "services", "contact"],
  };

  it("validates compliant structured portfolio data", () => {
    const result = PortfolioContentSchema.safeParse(validContent);
    expect(result.success).toBe(true);
  });

  it("rejects invalid portfolios with missing required fields", () => {
    const invalid = { ...validContent, headline: "" };
    const result = PortfolioContentSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects invalid qualification years", () => {
    const invalid = {
      ...validContent,
      qualificationsSummary: [
        {
          degree: "M.Sc.",
          institution: "University",
          year: 1800, // Before minimum 1950
        },
      ],
    };
    const result = PortfolioContentSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
