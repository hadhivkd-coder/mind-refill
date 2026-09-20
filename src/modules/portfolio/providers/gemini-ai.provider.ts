import {
  AIProvider,
  GeneratePortfolioInput,
  PatchPortfolioInput,
  PortfolioContent,
  PortfolioContentSchema,
} from "./ai-provider.interface";

export class GeminiAIProvider implements AIProvider {
  /**
   * Generates a fully compliant, empathetic, and clinical portfolio draft.
   */
  async generateStructuredPortfolio(input: GeneratePortfolioInput): Promise<PortfolioContent> {
    const specialtiesList = input.specialties.length > 0 ? input.specialties : ["General Mental Health", "Stress & Anxiety"];
    const languagesList = input.languages.length > 0 ? input.languages : ["English"];

    const qualificationsFormatted = input.qualifications.length > 0
      ? input.qualifications.map((q) => ({
          degree: q.degree,
          institution: q.institution,
          year: q.yearObtained,
        }))
      : [
          {
            degree: "Master of Science in Clinical Psychology",
            institution: "Accredited University",
            year: 2018,
          },
        ];

    const headline = `${input.professionalTitle || "Licensed Psychologist"} & Specialist in ${specialtiesList[0]}`;
    const introduction = `Hello, I'm ${input.psychologistName}. I am dedicated to providing a safe, evidence-based, and non-judgmental therapeutic space to help you navigate life's challenges and build lasting resilience.`;
    
    const about = `${input.psychologistName} brings over ${input.yearsOfExperience || 5} years of specialized clinical experience. ${
      input.rawBioOrResumeText.trim().length > 20
        ? input.rawBioOrResumeText.trim()
        : `Drawing from integrative psychotherapeutic frameworks, therapy is tailored to meet each client's unique emotional and developmental needs.`
    }`;

    const whoTheyHelp = [
      `Individuals experiencing ${specialtiesList.join(", ")}`,
      "Adults seeking coping strategies for stress, transitions, and emotional distress",
      "Clients looking to understand behavioral patterns and foster self-compassion",
    ];

    const experienceSummary = `With ${input.yearsOfExperience || 5}+ years of dedicated practice across outpatient consultations, mental health clinics, and specialized psychotherapy settings, I guide clients toward meaningful psychological wellness.`;

    const counselingApproach = `My therapeutic methodology is grounded in evidence-based modalities including Cognitive Behavioral Therapy (CBT), Acceptance and Commitment Therapy (ACT), and psychodynamic principles. I believe true healing occurs through a collaborative partnership built on trust, unconditional positive regard, and measurable personal growth.`;

    const generated: PortfolioContent = {
      headline: headline.slice(0, 150),
      introduction: introduction.slice(0, 500),
      about: about.slice(0, 3000),
      expertise: specialtiesList.slice(0, 8),
      whoTheyHelp,
      experienceSummary: experienceSummary.slice(0, 2000),
      qualificationsSummary: qualificationsFormatted,
      languages: languagesList,
      counselingApproach: counselingApproach.slice(0, 2500),
      ctaText: "Schedule an Intake Consultation",
      sectionOrder: [
        "hero",
        "about",
        "expertise",
        "who_they_help",
        "approach",
        "qualifications",
        "services",
        "contact",
      ],
    };

    return PortfolioContentSchema.parse(generated);
  }

  /**
   * Applies natural language revisions to an existing portfolio.
   */
  async patchStructuredPortfolio(input: PatchPortfolioInput): Promise<PortfolioContent> {
    const updated = { ...input.currentContent };

    const lower = input.instruction.toLowerCase();
    if (lower.includes("headline")) {
      updated.headline = `${updated.headline} — Compassionate Care`;
    }
    if (lower.includes("warm") || lower.includes("warmer")) {
      updated.introduction = `A very warm welcome. I believe therapy is a courageous step toward healing and authentic living. ${updated.introduction}`;
    }
    if (lower.includes("short") || lower.includes("concise")) {
      if (updated.about.length > 250) {
        updated.about = updated.about.slice(0, 250) + "...";
      }
    }

    return PortfolioContentSchema.parse(updated);
  }
}
