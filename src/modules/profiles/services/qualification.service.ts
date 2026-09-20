import { prisma } from "@/shared/database/prisma";
import { requireOwner } from "@/modules/authorization/guards";
import { NotFoundError, ValidationError } from "@/shared/errors";

export interface CreateQualificationInput {
  degree: string;
  institution: string;
  yearObtained: number;
  description?: string;
  isPublic?: boolean;
}

export class QualificationService {
  static async addQualification(
    psychologistProfileId: string,
    currentUserId: string,
    input: CreateQualificationInput
  ) {
    const profile = await prisma.psychologistProfile.findUnique({
      where: { id: psychologistProfileId },
    });

    if (!profile) {
      throw new NotFoundError("Psychologist profile");
    }

    requireOwner(profile.userId, currentUserId);

    if (!input.degree || !input.institution || !input.yearObtained) {
      throw new ValidationError("Degree, institution, and year obtained are required");
    }

    const currentYear = new Date().getFullYear();
    if (input.yearObtained < 1950 || input.yearObtained > currentYear + 1) {
      throw new ValidationError(`Year obtained must be between 1950 and ${currentYear + 1}`);
    }

    return prisma.qualification.create({
      data: {
        psychologistId: psychologistProfileId,
        degree: input.degree.trim(),
        institution: input.institution.trim(),
        yearObtained: input.yearObtained,
        description: input.description?.trim() ?? null,
        isPublic: input.isPublic !== undefined ? input.isPublic : true,
      },
    });
  }

  static async updateQualification(
    qualificationId: string,
    currentUserId: string,
    input: Partial<CreateQualificationInput>
  ) {
    const qual = await prisma.qualification.findUnique({
      where: { id: qualificationId },
      include: { psychologist: true },
    });

    if (!qual) {
      throw new NotFoundError("Qualification");
    }

    requireOwner(qual.psychologist.userId, currentUserId);

    return prisma.qualification.update({
      where: { id: qualificationId },
      data: {
        degree: input.degree ? input.degree.trim() : undefined,
        institution: input.institution ? input.institution.trim() : undefined,
        yearObtained: input.yearObtained !== undefined ? input.yearObtained : undefined,
        description: input.description !== undefined ? input.description?.trim() ?? null : undefined,
        isPublic: input.isPublic !== undefined ? input.isPublic : undefined,
      },
    });
  }

  static async deleteQualification(qualificationId: string, currentUserId: string) {
    const qual = await prisma.qualification.findUnique({
      where: { id: qualificationId },
      include: { psychologist: true },
    });

    if (!qual) {
      throw new NotFoundError("Qualification");
    }

    requireOwner(qual.psychologist.userId, currentUserId);

    return prisma.qualification.delete({
      where: { id: qualificationId },
    });
  }
}
