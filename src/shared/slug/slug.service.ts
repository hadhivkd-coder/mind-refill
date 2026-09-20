import { platformConfig } from "@/shared/config/platform";
import { ValidationError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma";

export class SlugService {
  /**
   * Normalizes a text string into a clean, safe, URL-friendly kebab-case slug.
   */
  static normalize(text: string): string {
    return text
      .trim()
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/[\s_-]+/g, "-") // Collapse whitespace and underscores to single hyphen
      .replace(/^-+|-+$/g, ""); // Trim leading/trailing hyphens
  }

  /**
   * Validates if a slug adheres to format and is not a reserved system keyword.
   */
  static validate(slug: string): void {
    if (!slug || slug.length < 3) {
      throw new ValidationError("Slug must be at least 3 characters long");
    }

    if (slug.length > 80) {
      throw new ValidationError("Slug cannot exceed 80 characters");
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      throw new ValidationError("Slug must contain only lowercase alphanumeric characters separated by single hyphens");
    }

    if (platformConfig.reservedSlugs.includes(slug)) {
      throw new ValidationError(`'${slug}' is a reserved system path and cannot be claimed`);
    }
  }

  /**
   * Checks if a slug is available for a psychologist, optionally excluding their own current profile ID.
   */
  static async isAvailable(slug: string, excludeProfileId?: string): Promise<boolean> {
    const normalized = this.normalize(slug);
    if (platformConfig.reservedSlugs.includes(normalized)) {
      return false;
    }

    const existing = await prisma.psychologistProfile.findFirst({
      where: {
        slug: {
          equals: normalized,
          mode: "insensitive",
        },
        id: excludeProfileId ? { not: excludeProfileId } : undefined,
      },
      select: { id: true },
    });

    return !existing;
  }

  /**
   * Generates a collision-free unique slug from a base text name.
   */
  static async generateUniqueSlug(baseText: string, excludeProfileId?: string): Promise<string> {
    let candidate = this.normalize(baseText);
    if (!candidate || candidate.length < 3) {
      candidate = "psychologist";
    }

    if (platformConfig.reservedSlugs.includes(candidate)) {
      candidate = `${candidate}-dr`;
    }

    let isFree = await this.isAvailable(candidate, excludeProfileId);
    if (isFree) return candidate;

    let counter = 1;
    while (!isFree && counter < 100) {
      const numberedCandidate = `${candidate}-${counter}`;
      isFree = await this.isAvailable(numberedCandidate, excludeProfileId);
      if (isFree) return numberedCandidate;
      counter++;
    }

    // Fallback: random hex suffix
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    return `${candidate}-${randomSuffix}`;
  }
}
