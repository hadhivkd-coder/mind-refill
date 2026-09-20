export interface PublicSpecializationDto {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
}

export interface PublicLanguageDto {
  id: string;
  code: string;
  name: string;
  nativeName?: string | null;
}

export interface PublicQualificationDto {
  id: string;
  degree: string;
  institution: string;
  yearObtained: number;
  description?: string | null;
}

export interface PublicExperienceDto {
  id: string;
  organization: string;
  roleTitle: string;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  description?: string | null;
}

export interface PublicSocialLinkDto {
  platform: string;
  url: string;
}

export interface PublicPsychologistCardDto {
  id: string;
  slug: string;
  fullName: string;
  professionalTitle: string;
  profilePhotoUrl?: string | null;
  shortIntro?: string | null;
  yearsOfExperience: number;
  location?: string | null;
  isVerified: boolean;
  specializations: PublicSpecializationDto[];
  languages: PublicLanguageDto[];
}

export interface PublicPsychologistProfileDto {
  id: string;
  slug: string;
  fullName: string;
  professionalTitle: string;
  profilePhotoUrl?: string | null;
  shortIntro?: string | null;
  bio: string;
  professionalApproach?: string | null;
  areasTheyHelpWith?: string[] | null;
  yearsOfExperience: number;
  timezone: string;
  location?: string | null;
  isVerified: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  specializations: PublicSpecializationDto[];
  languages: PublicLanguageDto[];
  qualifications: PublicQualificationDto[];
  experiences: PublicExperienceDto[];
  socialLinks: PublicSocialLinkDto[];
}

/**
 * Maps raw database entity to an explicit, safe PublicCardDto.
 * Guaranteed to never expose private files, unverified documents, or staff notes.
 */
export function toPublicCardDto(entity: any): PublicPsychologistCardDto {
  return {
    id: entity.id,
    slug: entity.slug,
    fullName: entity.fullName,
    professionalTitle: entity.professionalTitle,
    profilePhotoUrl: entity.profilePhotoUrl ?? null,
    shortIntro: entity.shortIntro ?? null,
    yearsOfExperience: entity.yearsOfExperience ?? 0,
    location: entity.location ?? null,
    isVerified: entity.verificationStatus === "VERIFIED",
    specializations: (entity.specializations ?? []).map((ps: any) => ({
      id: ps.specialization?.id ?? ps.id,
      name: ps.specialization?.name ?? ps.name,
      slug: ps.specialization?.slug ?? ps.slug,
      description: ps.specialization?.description ?? ps.description,
    })),
    languages: (entity.languages ?? []).map((pl: any) => ({
      id: pl.language?.id ?? pl.languageId ?? pl.id,
      code: pl.language?.code ?? pl.code,
      name: pl.language?.name ?? pl.name,
      nativeName: pl.language?.nativeName ?? pl.nativeName,
    })),
  };
}

/**
 * Maps raw database entity to an explicit, safe PublicProfileDto.
 * Strips private qualifications and experiences.
 */
export function toPublicProfileDto(entity: any): PublicPsychologistProfileDto {
  return {
    id: entity.id,
    slug: entity.slug,
    fullName: entity.fullName,
    professionalTitle: entity.professionalTitle,
    profilePhotoUrl: entity.profilePhotoUrl ?? null,
    shortIntro: entity.shortIntro ?? null,
    bio: entity.bio ?? "",
    professionalApproach: entity.professionalApproach ?? null,
    areasTheyHelpWith: Array.isArray(entity.areasTheyHelpWith)
      ? entity.areasTheyHelpWith
      : null,
    yearsOfExperience: entity.yearsOfExperience ?? 0,
    timezone: entity.timezone ?? "UTC",
    location: entity.location ?? null,
    isVerified: entity.verificationStatus === "VERIFIED",
    seoTitle: entity.seoTitle ?? null,
    seoDescription: entity.seoDescription ?? null,
    specializations: (entity.specializations ?? []).map((ps: any) => ({
      id: ps.specialization?.id ?? ps.id,
      name: ps.specialization?.name ?? ps.name,
      slug: ps.specialization?.slug ?? ps.slug,
      description: ps.specialization?.description ?? ps.description,
    })),
    languages: (entity.languages ?? []).map((pl: any) => ({
      id: pl.language?.id ?? pl.id,
      code: pl.language?.code ?? pl.code,
      name: pl.language?.name ?? pl.name,
      nativeName: pl.language?.nativeName ?? pl.nativeName,
    })),
    qualifications: (entity.qualifications ?? [])
      .filter((q: any) => q.isPublic)
      .map((q: any) => ({
        id: q.id,
        degree: q.degree,
        institution: q.institution,
        yearObtained: q.yearObtained,
        description: q.description ?? null,
      })),
    experiences: (entity.experiences ?? [])
      .filter((e: any) => e.isPublic)
      .map((e: any) => ({
        id: e.id,
        organization: e.organization,
        roleTitle: e.roleTitle,
        startDate: e.startDate instanceof Date ? e.startDate.toISOString() : String(e.startDate),
        endDate: e.endDate instanceof Date ? e.endDate.toISOString() : e.endDate ? String(e.endDate) : null,
        isCurrent: Boolean(e.isCurrent),
        description: e.description ?? null,
      })),
    socialLinks: (entity.socialLinks ?? []).map((s: any) => ({
      platform: s.platform,
      url: s.url,
    })),
  };
}
