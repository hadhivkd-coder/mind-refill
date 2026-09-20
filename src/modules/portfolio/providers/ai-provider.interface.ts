import { z } from "zod";

export const PortfolioContentSchema = z.object({
  headline: z.string().min(3).max(150),
  introduction: z.string().min(20).max(500),
  about: z.string().min(50).max(3000),
  expertise: z.array(z.string().min(2).max(100)).min(1),
  whoTheyHelp: z.array(z.string().min(2).max(150)).min(1),
  experienceSummary: z.string().min(20).max(2000),
  qualificationsSummary: z.array(
    z.object({
      degree: z.string().min(2).max(150),
      institution: z.string().min(2).max(150),
      year: z.number().int().min(1950).max(2100),
    })
  ),
  languages: z.array(z.string().min(2).max(50)).min(1),
  counselingApproach: z.string().min(50).max(2500),
  ctaText: z.string().min(3).max(100).default("Book a Counseling Session"),
  sectionOrder: z.array(z.string()).default([
    "hero",
    "about",
    "expertise",
    "who_they_help",
    "approach",
    "qualifications",
    "services",
    "contact",
  ]),
});

export type PortfolioContent = z.infer<typeof PortfolioContentSchema>;

export interface GeneratePortfolioInput {
  psychologistName: string;
  professionalTitle: string;
  yearsOfExperience: number;
  specialties: string[];
  languages: string[];
  qualifications: Array<{ degree: string; institution: string; yearObtained: number }>;
  rawBioOrResumeText: string;
  preferredToneStyle?: string;
}

export interface PatchPortfolioInput {
  currentContent: PortfolioContent;
  instruction: string; // e.g. "Make the introduction shorter and warmer"
}

export interface AIProvider {
  generateStructuredPortfolio(input: GeneratePortfolioInput): Promise<PortfolioContent>;
  patchStructuredPortfolio(input: PatchPortfolioInput): Promise<PortfolioContent>;
}
