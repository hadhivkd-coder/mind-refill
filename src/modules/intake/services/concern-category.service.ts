import { prisma } from "@/shared/database/prisma";
import { SlugService } from "@/shared/slug/slug.service";
import { ConflictError, NotFoundError } from "@/shared/errors";

export const DEFAULT_CONCERN_CATEGORIES = [
  { name: "Anxiety", description: "Generalized anxiety, panic attacks, social anxiety, and phobias" },
  { name: "Depression", description: "Low mood, persistent sadness, loss of interest, and lethargy" },
  { name: "Relationships", description: "Couples counseling, communication issues, breakups, and intimacy" },
  { name: "Family", description: "Family dynamics, conflict, boundaries, and caregiving stress" },
  { name: "Student Mental Health", description: "Academic pressure, perfectionism, exam stress, and career anxiety" },
  { name: "Parenting", description: "Parenting challenges, child behavior, postpartum changes, and family transitions" },
  { name: "Grief & Loss", description: "Bereavement, major life adjustments, and processing profound loss" },
  { name: "Trauma & PTSD", description: "Past traumatic experiences, emotional wounds, and recovery" },
  { name: "Self-esteem & Identity", description: "Self-worth, imposter syndrome, body image, and personal growth" },
  { name: "Stress & Burnout", description: "Workplace burnout, chronic exhaustion, and work-life balance" },
];

export class ConcernCategoryService {
  /**
   * Seeds default concern categories if table is empty.
   */
  static async seedDefaults(): Promise<void> {
    const count = await prisma.concernCategory.count();
    if (count > 0) return;

    for (let i = 0; i < DEFAULT_CONCERN_CATEGORIES.length; i++) {
      const item = DEFAULT_CONCERN_CATEGORIES[i];
      const slug = SlugService.normalize(item.name);
      await prisma.concernCategory.create({
        data: {
          name: item.name,
          slug,
          description: item.description,
          displayOrder: i,
          isActive: true,
        },
      });
    }
  }

  /**
   * Lists active concern categories for intake selection.
   */
  static async listActive(): Promise<{ id: string; name: string; slug: string; description: string | null }[]> {
    await this.seedDefaults();
    return prisma.concernCategory.findMany({
      where: { isActive: true },
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
      },
    });
  }

  /**
   * Lists all categories (including inactive) for admin management.
   */
  static async listAll() {
    await this.seedDefaults();
    return prisma.concernCategory.findMany({
      orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
    });
  }

  /**
   * Creates a new concern category (Admin only).
   */
  static async createCategory(data: { name: string; description?: string; displayOrder?: number }) {
    const slug = SlugService.normalize(data.name);
    const existing = await prisma.concernCategory.findFirst({
      where: {
        OR: [{ name: { equals: data.name, mode: "insensitive" } }, { slug }],
      },
    });
    if (existing) {
      throw new ConflictError(`Concern category '${data.name}' already exists`);
    }

    return prisma.concernCategory.create({
      data: {
        name: data.name.trim(),
        slug,
        description: data.description?.trim() || null,
        displayOrder: data.displayOrder ?? 0,
        isActive: true,
      },
    });
  }

  /**
   * Toggles active status of a category.
   */
  static async toggleActive(id: string, isActive: boolean) {
    const existing = await prisma.concernCategory.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError("Concern category not found");
    }
    return prisma.concernCategory.update({
      where: { id },
      data: { isActive },
    });
  }
}
