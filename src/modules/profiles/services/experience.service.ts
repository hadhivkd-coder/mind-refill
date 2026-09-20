import { prisma } from "@/shared/database/prisma";
import { requireOwner } from "@/modules/authorization/guards";
import { NotFoundError, ValidationError } from "@/shared/errors";

export interface CreateExperienceInput {
  organization: string;
  roleTitle: string;
  startDate: string; // ISO date or YYYY-MM
  endDate?: string | null;
  isCurrent?: boolean;
  description?: string;
  isPublic?: boolean;
}

export class ExperienceService {
  static async addExperience(
    psychologistProfileId: string,
    currentUserId: string,
    input: CreateExperienceInput
  ) {
    const profile = await prisma.psychologistProfile.findUnique({
      where: { id: psychologistProfileId },
    });

    if (!profile) {
      throw new NotFoundError("Psychologist profile");
    }

    requireOwner(profile.userId, currentUserId);

    if (!input.organization || !input.roleTitle || !input.startDate) {
      throw new ValidationError("Organization, role title, and start date are required");
    }

    const startDate = new Date(input.startDate);
    if (isNaN(startDate.getTime())) {
      throw new ValidationError("Invalid start date");
    }

    let endDate: Date | null = null;
    if (input.endDate && !input.isCurrent) {
      endDate = new Date(input.endDate);
      if (isNaN(endDate.getTime())) {
        throw new ValidationError("Invalid end date");
      }
      if (endDate < startDate) {
        throw new ValidationError("End date cannot be earlier than start date");
      }
    }

    return prisma.professionalExperience.create({
      data: {
        psychologistId: psychologistProfileId,
        organization: input.organization.trim(),
        roleTitle: input.roleTitle.trim(),
        startDate,
        endDate: input.isCurrent ? null : endDate,
        isCurrent: input.isCurrent ?? false,
        description: input.description?.trim() ?? null,
        isPublic: input.isPublic !== undefined ? input.isPublic : true,
      },
    });
  }

  static async updateExperience(
    experienceId: string,
    currentUserId: string,
    input: Partial<CreateExperienceInput>
  ) {
    const exp = await prisma.professionalExperience.findUnique({
      where: { id: experienceId },
      include: { psychologist: true },
    });

    if (!exp) {
      throw new NotFoundError("Professional experience");
    }

    requireOwner(exp.psychologist.userId, currentUserId);

    let startDate: Date | undefined = undefined;
    if (input.startDate) {
      startDate = new Date(input.startDate);
      if (isNaN(startDate.getTime())) {
        throw new ValidationError("Invalid start date");
      }
    }

    let endDate: Date | null | undefined = undefined;
    if (input.endDate !== undefined) {
      if (input.endDate) {
        endDate = new Date(input.endDate);
        if (isNaN(endDate.getTime())) {
          throw new ValidationError("Invalid end date");
        }
      } else {
        endDate = null;
      }
    }

    return prisma.professionalExperience.update({
      where: { id: experienceId },
      data: {
        organization: input.organization ? input.organization.trim() : undefined,
        roleTitle: input.roleTitle ? input.roleTitle.trim() : undefined,
        startDate,
        endDate: input.isCurrent ? null : endDate,
        isCurrent: input.isCurrent !== undefined ? input.isCurrent : undefined,
        description: input.description !== undefined ? input.description?.trim() ?? null : undefined,
        isPublic: input.isPublic !== undefined ? input.isPublic : undefined,
      },
    });
  }

  static async deleteExperience(experienceId: string, currentUserId: string) {
    const exp = await prisma.professionalExperience.findUnique({
      where: { id: experienceId },
      include: { psychologist: true },
    });

    if (!exp) {
      throw new NotFoundError("Professional experience");
    }

    requireOwner(exp.psychologist.userId, currentUserId);

    return prisma.professionalExperience.delete({
      where: { id: experienceId },
    });
  }
}
