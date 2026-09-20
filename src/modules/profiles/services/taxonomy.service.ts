import { prisma } from "@/shared/database/prisma";
import { SlugService } from "@/shared/slug/slug.service";
import { ValidationError, NotFoundError, ConflictError } from "@/shared/errors";

export interface CreateSpecializationInput {
  name: string;
  description?: string;
  isHighRisk?: boolean;
  displayOrder?: number;
}

export interface CreateLanguageInput {
  code: string;
  name: string;
  nativeName?: string;
}

export const INITIAL_SPECIALIZATIONS = [
  { name: "Anxiety & Panic Disorders", isHighRisk: false, displayOrder: 1 },
  { name: "Depression & Mood Disorders", isHighRisk: false, displayOrder: 2 },
  { name: "Relationship & Marital Concerns", isHighRisk: false, displayOrder: 3 },
  { name: "Family Systems & Parenting", isHighRisk: false, displayOrder: 4 },
  { name: "Adolescent Psychology", isHighRisk: false, displayOrder: 5 },
  { name: "Occupational Stress & Burnout", isHighRisk: false, displayOrder: 6 },
  { name: "Grief & Bereavement", isHighRisk: false, displayOrder: 7 },
  { name: "Trauma & PTSD", isHighRisk: false, displayOrder: 8 },
  { name: "Suicide-Related Concerns & Crisis", isHighRisk: true, displayOrder: 9 },
];

export const INITIAL_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
];

export class TaxonomyService {
  /**
   * Retrieves all active specializations ordered for display.
   */
  static async getActiveSpecializations() {
    return prisma.specialization.findMany({
      where: { isActive: true },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    });
  }

  /**
   * Retrieves all specializations (for admin management).
   */
  static async getAllSpecializations() {
    return prisma.specialization.findMany({
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    });
  }

  /**
   * Creates a new specialization.
   */
  static async createSpecialization(input: CreateSpecializationInput) {
    const slug = SlugService.normalize(input.name);
    if (!slug) {
      throw new ValidationError("Specialization name is required");
    }

    const existing = await prisma.specialization.findFirst({
      where: {
        OR: [{ slug }, { name: input.name.trim() }],
      },
    });

    if (existing) {
      throw new ConflictError("A specialization with this name or slug already exists");
    }

    return prisma.specialization.create({
      data: {
        name: input.name.trim(),
        slug,
        description: input.description?.trim() ?? null,
        isHighRisk: input.isHighRisk ?? false,
        displayOrder: input.displayOrder ?? 0,
        isActive: true,
      },
    });
  }

  /**
   * Updates or soft-deactivates a specialization.
   */
  static async updateSpecialization(
    id: string,
    updates: { name?: string; description?: string; isActive?: boolean; isHighRisk?: boolean; displayOrder?: number }
  ) {
    const spec = await prisma.specialization.findUnique({ where: { id } });
    if (!spec) {
      throw new NotFoundError("Specialization");
    }

    let slug = spec.slug;
    if (updates.name && updates.name.trim() !== spec.name) {
      slug = SlugService.normalize(updates.name);
    }

    return prisma.specialization.update({
      where: { id },
      data: {
        name: updates.name ? updates.name.trim() : undefined,
        slug,
        description: updates.description !== undefined ? updates.description?.trim() ?? null : undefined,
        isActive: updates.isActive !== undefined ? updates.isActive : undefined,
        isHighRisk: updates.isHighRisk !== undefined ? updates.isHighRisk : undefined,
        displayOrder: updates.displayOrder !== undefined ? updates.displayOrder : undefined,
      },
    });
  }

  /**
   * Retrieves active languages.
   */
  static async getActiveLanguages() {
    return prisma.language.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
  }

  /**
   * Creates a new language.
   */
  static async createLanguage(input: CreateLanguageInput) {
    const code = input.code.trim().toLowerCase();
    const existing = await prisma.language.findFirst({
      where: {
        OR: [{ code }, { name: input.name.trim() }],
      },
    });

    if (existing) {
      throw new ConflictError("Language code or name already registered");
    }

    return prisma.language.create({
      data: {
        code,
        name: input.name.trim(),
        nativeName: input.nativeName?.trim() ?? null,
        isActive: true,
      },
    });
  }

  /**
   * Soft-deactivates or updates a language.
   */
  static async updateLanguage(id: string, updates: { name?: string; nativeName?: string; isActive?: boolean }) {
    const lang = await prisma.language.findUnique({ where: { id } });
    if (!lang) {
      throw new NotFoundError("Language");
    }

    return prisma.language.update({
      where: { id },
      data: updates,
    });
  }
}
