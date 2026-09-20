import { prisma } from "@/shared/database/prisma";
import { SlugService } from "@/shared/slug/slug.service";
import { requireOwner } from "@/modules/authorization/guards";
import { NotFoundError, ValidationError, ForbiddenError } from "@/shared/errors";
import { toPublicProfileDto, PublicPsychologistProfileDto } from "../dto/public-profile.dto";

export interface UpdateProfileInput {
  fullName?: string;
  professionalTitle?: string;
  slug?: string;
  shortIntro?: string;
  bio?: string;
  professionalApproach?: string;
  areasTheyHelpWith?: string[];
  yearsOfExperience?: number;
  timezone?: string;
  location?: string;
  isPublic?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  profilePhotoUrl?: string;
  specializationIds?: string[];
  languageIds?: string[];
  socialLinks?: Array<{ platform: string; url: string }>;
}

export class ProfileService {
  /**
   * Retrieves the full internal profile for the authenticated psychologist.
   */
  static async getPrivateProfileByUserId(userId: string) {
    const profile = await prisma.psychologistProfile.findUnique({
      where: { userId },
      include: {
        specializations: { include: { specialization: true } },
        languages: { include: { language: true } },
        qualifications: { orderBy: { yearObtained: "desc" } },
        experiences: { orderBy: { startDate: "desc" } },
        socialLinks: true,
        verificationApps: {
          orderBy: { submittedAt: "desc" },
          take: 1,
          include: {
            documents: { include: { file: true } },
            reviews: { orderBy: { createdAt: "desc" } },
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundError("Psychologist profile");
    }

    const completionPercent = this.calculateCompletionPercentage(profile);

    return {
      ...profile,
      completionPercent,
    };
  }

  /**
   * Retrieves the public profile by slug.
   * STRICT VISIBILITY: Profile MUST be verified, active, and marked public.
   */
  static async getPublicProfileBySlug(slug: string): Promise<PublicPsychologistProfileDto> {
    const normalized = SlugService.normalize(slug);

    const profile = await prisma.psychologistProfile.findFirst({
      where: {
        slug: { equals: normalized, mode: "insensitive" },
        isPublic: true,
        verificationStatus: "VERIFIED",
        profileState: "ACTIVE",
      },
      include: {
        specializations: {
          where: { specialization: { isActive: true } },
          include: { specialization: true },
        },
        languages: {
          where: { language: { isActive: true } },
          include: { language: true },
        },
        qualifications: {
          where: { isPublic: true },
          orderBy: { yearObtained: "desc" },
        },
        experiences: {
          where: { isPublic: true },
          orderBy: { startDate: "desc" },
        },
        socialLinks: true,
      },
    });

    if (!profile) {
      throw new NotFoundError("Psychologist profile");
    }

    return toPublicProfileDto(profile);
  }

  /**
   * Updates psychologist profile. Enforces resource ownership server-side.
   */
  static async updateProfile(profileId: string, currentUserId: string, input: UpdateProfileInput) {
    const profile = await prisma.psychologistProfile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      throw new NotFoundError("Psychologist profile");
    }

    // Strict ownership verification preventing IDOR
    requireOwner(profile.userId, currentUserId);

    let updatedSlug = profile.slug;
    if (input.slug && input.slug !== profile.slug) {
      const normalized = SlugService.normalize(input.slug);
      SlugService.validate(normalized);

      const available = await SlugService.isAvailable(normalized, profile.id);
      if (!available) {
        throw new ValidationError(`The URL slug '${normalized}' is already in use`);
      }
      updatedSlug = normalized;
    }

    // Execute atomic update
    return prisma.$transaction(async (tx) => {
      // 1. Update basic scalar profile fields
      const updated = await tx.psychologistProfile.update({
        where: { id: profileId },
        data: {
          fullName: input.fullName?.trim(),
          professionalTitle: input.professionalTitle?.trim(),
          slug: updatedSlug,
          shortIntro: input.shortIntro?.trim(),
          bio: input.bio?.trim(),
          professionalApproach: input.professionalApproach?.trim(),
          areasTheyHelpWith: input.areasTheyHelpWith ? JSON.parse(JSON.stringify(input.areasTheyHelpWith)) : undefined,
          yearsOfExperience: input.yearsOfExperience !== undefined ? Number(input.yearsOfExperience) : undefined,
          timezone: input.timezone,
          location: input.location?.trim(),
          isPublic: input.isPublic !== undefined ? Boolean(input.isPublic) : undefined,
          seoTitle: input.seoTitle?.trim(),
          seoDescription: input.seoDescription?.trim(),
          profilePhotoUrl: input.profilePhotoUrl,
        },
      });

      // 2. Sync specializations if supplied
      if (input.specializationIds) {
        await tx.psychologistSpecialization.deleteMany({
          where: { psychologistId: profileId },
        });

        if (input.specializationIds.length > 0) {
          await tx.psychologistSpecialization.createMany({
            data: input.specializationIds.map((specId) => ({
              psychologistId: profileId,
              specializationId: specId,
            })),
          });
        }
      }

      // 3. Sync languages if supplied
      if (input.languageIds) {
        await tx.psychologistLanguage.deleteMany({
          where: { psychologistId: profileId },
        });

        if (input.languageIds.length > 0) {
          await tx.psychologistLanguage.createMany({
            data: input.languageIds.map((langId) => ({
              psychologistId: profileId,
              languageId: langId,
            })),
          });
        }
      }

      // 4. Sync social links if supplied
      if (input.socialLinks) {
        await tx.socialLink.deleteMany({
          where: { psychologistProfileId: profileId },
        });

        if (input.socialLinks.length > 0) {
          await tx.socialLink.createMany({
            data: input.socialLinks.map((link) => ({
              psychologistProfileId: profileId,
              platform: link.platform.trim(),
              url: link.url.trim(),
            })),
          });
        }
      }

      return updated;
    });
  }

  /**
   * Calculates psychologist profile completion percentage.
   */
  static calculateCompletionPercentage(profile: any): number {
    let score = 0;
    if (profile.profilePhotoUrl) score += 15;
    if (profile.bio && profile.bio.length >= 50) score += 15;
    if (profile.shortIntro || profile.professionalApproach) score += 15;
    if (profile.specializations && profile.specializations.length > 0) score += 15;
    if (profile.languages && profile.languages.length > 0) score += 15;
    if (profile.qualifications && profile.qualifications.length > 0) score += 15;
    if (profile.experiences && profile.experiences.length > 0) score += 10;
    return Math.min(100, score);
  }
}
