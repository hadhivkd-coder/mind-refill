import { describe, it, expect, vi } from "vitest";
import { SlugService } from "@/shared/slug/slug.service";
import { ValidationError } from "@/shared/errors";
import { prisma } from "@/shared/database/prisma";

vi.mock("@/shared/database/prisma", () => ({
  prisma: {
    psychologistProfile: {
      findFirst: vi.fn(),
    },
  },
}));

describe("SlugService", () => {
  it("normalizes text into safe kebab-case slugs", () => {
    expect(SlugService.normalize("Dr. Jane Doe, Ph.D.")).toBe("dr-jane-doe-phd");
    expect(SlugService.normalize("  Trauma & Anxiety Specialist!  ")).toBe("trauma-anxiety-specialist");
    expect(SlugService.normalize("psychologist---expert")).toBe("psychologist-expert");
  });

  it("validates valid slugs and rejects invalid formats", () => {
    expect(() => SlugService.validate("dr-jane-doe")).not.toThrow();
    expect(() => SlugService.validate("ab")).toThrow(ValidationError); // Too short
    expect(() => SlugService.validate("Invalid_Slug!")).toThrow(ValidationError); // Special chars
  });

  it("rejects reserved system keywords from being claimed as slugs", () => {
    expect(() => SlugService.validate("admin")).toThrow(ValidationError);
    expect(() => SlugService.validate("login")).toThrow(ValidationError);
    expect(() => SlugService.validate("psychologists")).toThrow(ValidationError);
    expect(() => SlugService.validate("api")).toThrow(ValidationError);
    expect(() => SlugService.validate("app")).toThrow(ValidationError);
  });

  it("handles slug collisions by appending incremental suffixes", async () => {
    // Simulate collision on "dr-jane-doe" but available on "dr-jane-doe-1"
    vi.mocked(prisma.psychologistProfile.findFirst)
      .mockResolvedValueOnce({ id: "other-profile-id" } as any)
      .mockResolvedValueOnce(null);

    const generated = await SlugService.generateUniqueSlug("Dr. Jane Doe");
    expect(generated).toBe("dr-jane-doe-1");
  });
});
