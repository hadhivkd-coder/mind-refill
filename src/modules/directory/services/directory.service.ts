import { prisma } from "@/shared/database/prisma";
import { toPublicCardDto, PublicPsychologistCardDto } from "@/modules/profiles/dto/public-profile.dto";

export interface DirectorySearchParams {
  query?: string;
  specializationSlug?: string;
  languageCode?: string;
  minExperience?: number;
  page?: number;
  limit?: number;
}

export interface DirectorySearchResult {
  psychologists: PublicPsychologistCardDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class DirectoryService {
  /**
   * Searches and filters public verified psychologists.
   * HARD CONSTRAINT: Only psychologists where isPublic=true AND verificationStatus=VERIFIED AND profileState=ACTIVE.
   */
  static async search(params: DirectorySearchParams): Promise<DirectorySearchResult> {
    const page = Math.max(1, Number(params.page || 1));
    const limit = Math.min(50, Math.max(1, Number(params.limit || 12)));
    const skip = (page - 1) * limit;

    const where: any = {
      isPublic: true,
      verificationStatus: "VERIFIED",
      profileState: "ACTIVE",
    };

    // Text search over name, professional title, and bio
    if (params.query && params.query.trim().length > 0) {
      const q = params.query.trim();
      where.OR = [
        { fullName: { contains: q, mode: "insensitive" } },
        { professionalTitle: { contains: q, mode: "insensitive" } },
        { bio: { contains: q, mode: "insensitive" } },
        {
          specializations: {
            some: {
              specialization: {
                name: { contains: q, mode: "insensitive" },
              },
            },
          },
        },
      ];
    }

    // Filter by specialization
    if (params.specializationSlug) {
      where.specializations = {
        some: {
          specialization: {
            slug: params.specializationSlug.trim().toLowerCase(),
            isActive: true,
          },
        },
      };
    }

    // Filter by language
    if (params.languageCode) {
      where.languages = {
        some: {
          language: {
            code: params.languageCode.trim().toLowerCase(),
            isActive: true,
          },
        },
      };
    }

    // Filter by experience
    if (params.minExperience && params.minExperience > 0) {
      where.yearsOfExperience = {
        gte: Number(params.minExperience),
      };
    }

    const [total, profiles] = await Promise.all([
      prisma.psychologistProfile.count({ where }),
      prisma.psychologistProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ yearsOfExperience: "desc" }, { createdAt: "desc" }],
        include: {
          specializations: {
            where: { specialization: { isActive: true } },
            include: { specialization: true },
          },
          languages: {
            where: { language: { isActive: true } },
            include: { language: true },
          },
        },
      }),
    ]);

    const cards = profiles.map(toPublicCardDto);
    const totalPages = Math.ceil(total / limit);

    return {
      psychologists: cards,
      total,
      page,
      limit,
      totalPages,
    };
  }
}
