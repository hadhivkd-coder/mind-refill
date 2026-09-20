import { prisma } from "@/shared/database/prisma";
import { SessionWithUser } from "@/modules/identity/session.service";
import { requireRole } from "@/modules/authorization/guards";
import { UserRole, CounselingRequestStatus, VerificationStatus } from "@prisma/client";
import { NotFoundError, ForbiddenError, ValidationError } from "@/shared/errors";
import { AuditService } from "@/modules/audit/audit.service";
import { CoordinationStateMachine } from "../coordination.state-machine";
import { CoordinatorRequestCardDto, CoordinatorRequestDetailDto } from "@/modules/intake/dto/intake.dto";

export interface CoordinatorQueueFilter {
  status?: CounselingRequestStatus;
  assignedToMe?: boolean;
  unassigned?: boolean;
  page?: number;
  limit?: number;
}

export class CoordinationService {
  /**
   * Resolves staff profile for an authenticated coordinator/admin user.
   * Auto-provisions staff profile if not yet created.
   */
  static async getOrCreateStaffProfile(userId: string, email: string): Promise<{ id: string; userId: string; fullName: string }> {
    let staff = await prisma.staffProfile.findUnique({
      where: { userId },
    });

    if (!staff) {
      staff = await prisma.staffProfile.create({
        data: {
          userId,
          fullName: email.split("@")[0] || "Coordinator",
          department: "Care Coordination",
        },
      });
    }

    return staff;
  }

  /**
   * Retrieves the care coordination queue with filtering and pagination.
   */
  static async getQueue(
    session: SessionWithUser,
    filter: CoordinatorQueueFilter = {}
  ): Promise<{ items: CoordinatorRequestCardDto[]; total: number; page: number; totalPages: number }> {
    // Only COORDINATOR and ADMIN roles can access coordination queue
    if (!session.user.roles.includes(UserRole.COORDINATOR) && !session.user.roles.includes(UserRole.ADMIN)) {
      throw new ForbiddenError("Access denied: Requires Coordinator or Admin role");
    }

    const staff = await this.getOrCreateStaffProfile(session.user.id, session.user.email);
    const page = Math.max(1, filter.page ?? 1);
    const limit = Math.min(50, Math.max(1, filter.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filter.status) {
      where.status = filter.status;
    }

    if (filter.unassigned) {
      where.assignments = {
        none: {
          releasedAt: null,
        },
      };
    } else if (filter.assignedToMe) {
      where.assignments = {
        some: {
          coordinatorId: staff.id,
          releasedAt: null,
        },
      };
    } else if (!session.user.roles.includes(UserRole.ADMIN)) {
      // Ordinary coordinators see their own assigned requests OR unassigned requests available to claim
      where.OR = [
        {
          assignments: {
            some: {
              coordinatorId: staff.id,
              releasedAt: null,
            },
          },
        },
        {
          assignments: {
            none: {
              releasedAt: null,
            },
          },
        },
      ];
    }

    const [total, requests] = await Promise.all([
      prisma.counselingRequest.count({ where }),
      prisma.counselingRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ intakeResponse: { isEscalated: "desc" } }, { createdAt: "desc" }],
        include: {
          client: {
            include: {
              user: { select: { email: true } },
            },
          },
          targetPsychologist: {
            select: { id: true, fullName: true },
          },
          intakeResponse: true,
          assignments: {
            where: { releasedAt: null },
            include: { coordinator: true },
            take: 1,
          },
        },
      }),
    ]);

    const items: CoordinatorRequestCardDto[] = requests.map((req) => {
      const activeAssignment = req.assignments[0];
      return {
        id: req.id,
        status: req.status,
        isDirectBookingRequest: req.isDirectBookingRequest,
        createdAt: req.createdAt.toISOString(),
        clientName: req.client.fullName,
        clientEmail: req.client.user.email,
        preferredLanguage: req.client.preferredLanguage,
        concernCategories: Array.isArray(req.intakeResponse?.concernCategories)
          ? (req.intakeResponse?.concernCategories as string[])
          : [],
        isEscalated: req.intakeResponse?.isEscalated ?? false,
        assignedCoordinator: activeAssignment
          ? {
              id: activeAssignment.coordinator.id,
              fullName: activeAssignment.coordinator.fullName,
            }
          : null,
        targetPsychologist: req.targetPsychologist
          ? {
              id: req.targetPsychologist.id,
              fullName: req.targetPsychologist.fullName,
            }
          : null,
      };
    });

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Retrieves single request details enforcing assignment-level authorization.
   */
  static async getRequestDetails(session: SessionWithUser, requestId: string): Promise<CoordinatorRequestDetailDto> {
    if (!session.user.roles.includes(UserRole.COORDINATOR) && !session.user.roles.includes(UserRole.ADMIN)) {
      throw new ForbiddenError("Access denied: Requires Coordinator or Admin role");
    }

    const staff = await this.getOrCreateStaffProfile(session.user.id, session.user.email);

    const req = await prisma.counselingRequest.findUnique({
      where: { id: requestId },
      include: {
        client: {
          include: {
            user: { select: { email: true } },
          },
        },
        targetPsychologist: {
          select: {
            id: true,
            fullName: true,
            professionalTitle: true,
            slug: true,
            profilePhotoUrl: true,
            isPublic: true,
            verificationStatus: true,
          },
        },
        intakeResponse: true,
        assignments: {
          where: { releasedAt: null },
          include: { coordinator: true },
          take: 1,
        },
        notes: {
          orderBy: { createdAt: "desc" },
          include: { author: true },
        },
        statusHistory: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!req) {
      throw new NotFoundError("Counseling request not found");
    }

    const activeAssignment = req.assignments[0];

    // Enforce Assignment Authorization:
    // If assigned to another coordinator and user is not admin, deny access!
    if (
      activeAssignment &&
      activeAssignment.coordinatorId !== staff.id &&
      !session.user.roles.includes(UserRole.ADMIN)
    ) {
      throw new ForbiddenError("Access denied: This request is assigned to another care coordinator");
    }

    return {
      id: req.id,
      status: req.status,
      isDirectBookingRequest: req.isDirectBookingRequest,
      createdAt: req.createdAt.toISOString(),
      updatedAt: req.updatedAt.toISOString(),
      client: {
        id: req.client.id,
        userId: req.client.userId,
        fullName: req.client.fullName,
        email: req.client.user.email,
        phoneNumber: req.client.phoneNumber,
        preferredLanguage: req.client.preferredLanguage,
        timezone: req.client.timezone,
      },
      intakeResponse: req.intakeResponse
        ? {
            id: req.intakeResponse.id,
            requestId: req.intakeResponse.requestId,
            ageBand: req.intakeResponse.ageBand,
            contactPreference: req.intakeResponse.contactPreference,
            preferredLanguage: req.intakeResponse.preferredLanguage,
            concernCategories: Array.isArray(req.intakeResponse.concernCategories)
              ? (req.intakeResponse.concernCategories as string[])
              : [],
            rawConcernSummary: req.intakeResponse.rawConcernSummary,
            preferredTimeWindows: req.intakeResponse.preferredTimeWindows as any,
            isEscalated: req.intakeResponse.isEscalated,
            createdAt: req.intakeResponse.createdAt.toISOString(),
          }
        : null,
      activeAssignment: activeAssignment
        ? {
            id: activeAssignment.id,
            coordinatorId: activeAssignment.coordinator.id,
            coordinatorName: activeAssignment.coordinator.fullName,
            assignedAt: activeAssignment.assignedAt.toISOString(),
          }
        : null,
      targetPsychologist: req.targetPsychologist
        ? {
            id: req.targetPsychologist.id,
            fullName: req.targetPsychologist.fullName,
            professionalTitle: req.targetPsychologist.professionalTitle,
            slug: req.targetPsychologist.slug,
            profilePhotoUrl: req.targetPsychologist.profilePhotoUrl,
            isPublic: req.targetPsychologist.isPublic,
            verificationStatus: req.targetPsychologist.verificationStatus,
          }
        : null,
      notes: req.notes.map((n) => ({
        id: n.id,
        authorId: n.authorId,
        authorName: n.author.fullName,
        noteText: n.noteText,
        createdAt: n.createdAt.toISOString(),
      })),
      statusHistory: req.statusHistory.map((h) => ({
        id: h.id,
        oldStatus: h.oldStatus,
        newStatus: h.newStatus,
        actorUserId: h.actorUserId,
        reason: h.reason,
        createdAt: h.createdAt.toISOString(),
      })),
    };
  }

  /**
   * Assigns coordinator to request (claiming or admin delegating).
   */
  static async assignCoordinator(
    session: SessionWithUser,
    requestId: string,
    targetCoordinatorStaffId?: string
  ): Promise<void> {
    if (!session.user.roles.includes(UserRole.COORDINATOR) && !session.user.roles.includes(UserRole.ADMIN)) {
      throw new ForbiddenError("Access denied: Requires Coordinator or Admin role");
    }

    const currentStaff = await this.getOrCreateStaffProfile(session.user.id, session.user.email);
    const assignToStaffId =
      targetCoordinatorStaffId && session.user.roles.includes(UserRole.ADMIN)
        ? targetCoordinatorStaffId
        : currentStaff.id;

    const req = await prisma.counselingRequest.findUnique({
      where: { id: requestId },
      include: {
        assignments: { where: { releasedAt: null } },
      },
    });

    if (!req) {
      throw new NotFoundError("Counseling request not found");
    }

    await prisma.$transaction(async (tx) => {
      // Release any currently active assignments
      if (req.assignments.length > 0) {
        await tx.coordinatorAssignment.updateMany({
          where: { requestId, releasedAt: null },
          data: { releasedAt: new Date() },
        });
      }

      // Create new assignment
      await tx.coordinatorAssignment.create({
        data: {
          requestId,
          coordinatorId: assignToStaffId,
        },
      });

      // If status is NEW, automatically advance to CONTACTED upon claiming
      if (req.status === CounselingRequestStatus.NEW) {
        await tx.counselingRequest.update({
          where: { id: requestId },
          data: { status: CounselingRequestStatus.CONTACTED },
        });

        await tx.counselingRequestStatusHistory.create({
          data: {
            requestId,
            oldStatus: CounselingRequestStatus.NEW,
            newStatus: CounselingRequestStatus.CONTACTED,
            actorUserId: session.user.id,
            reason: "Coordinator claimed request",
          },
        });
      }
    });

    await AuditService.log({
      actorUserId: session.user.id,
      action: "COORDINATOR_ASSIGNED",
      entityType: "CounselingRequest",
      entityId: requestId,
      safeMetadata: { assignedStaffId: assignToStaffId },
    });
  }

  /**
   * Releases an assignment back to unassigned triage pool.
   */
  static async releaseAssignment(session: SessionWithUser, requestId: string): Promise<void> {
    const details = await this.getRequestDetails(session, requestId);

    if (!details.activeAssignment) {
      return;
    }

    await prisma.coordinatorAssignment.updateMany({
      where: { requestId, releasedAt: null },
      data: { releasedAt: new Date() },
    });

    await AuditService.log({
      actorUserId: session.user.id,
      action: "COORDINATOR_RELEASED",
      entityType: "CounselingRequest",
      entityId: requestId,
    });
  }

  /**
   * Updates counseling request status with state machine validation and history tracking.
   */
  static async updateStatus(
    session: SessionWithUser,
    requestId: string,
    newStatus: CounselingRequestStatus,
    reason?: string
  ): Promise<void> {
    const details = await this.getRequestDetails(session, requestId);
    const currentStatus = details.status;

    CoordinationStateMachine.validateTransition(currentStatus, newStatus);

    await prisma.$transaction(async (tx) => {
      await tx.counselingRequest.update({
        where: { id: requestId },
        data: { status: newStatus },
      });

      await tx.counselingRequestStatusHistory.create({
        data: {
          requestId,
          oldStatus: currentStatus,
          newStatus,
          actorUserId: session.user.id,
          reason: reason ?? `Coordinator updated status to ${newStatus}`,
        },
      });
    });

    await AuditService.log({
      actorUserId: session.user.id,
      action: "COORDINATION_STATUS_CHANGED",
      entityType: "CounselingRequest",
      entityId: requestId,
      safeMetadata: { oldStatus: currentStatus, newStatus, reason },
    });
  }

  /**
   * Matches and assigns a verified psychologist to the counseling request.
   */
  static async matchPsychologist(
    session: SessionWithUser,
    requestId: string,
    psychologistProfileId: string
  ): Promise<void> {
    await this.getRequestDetails(session, requestId);

    // Verify psychologist is verified & active
    const psychologist = await prisma.psychologistProfile.findUnique({
      where: { id: psychologistProfileId },
      select: { id: true, fullName: true, verificationStatus: true, profileState: true },
    });

    if (
      !psychologist ||
      psychologist.verificationStatus !== VerificationStatus.VERIFIED ||
      psychologist.profileState !== "ACTIVE"
    ) {
      throw new ValidationError("Selected psychologist must have VERIFIED status and ACTIVE profile");
    }

    const currentReq = await prisma.counselingRequest.findUniqueOrThrow({ where: { id: requestId } });

    await prisma.$transaction(async (tx) => {
      await tx.counselingRequest.update({
        where: { id: requestId },
        data: {
          targetPsychologistId: psychologist.id,
          status: CounselingRequestStatus.PSYCHOLOGIST_SELECTED,
        },
      });

      await tx.counselingRequestStatusHistory.create({
        data: {
          requestId,
          oldStatus: currentReq.status,
          newStatus: CounselingRequestStatus.PSYCHOLOGIST_SELECTED,
          actorUserId: session.user.id,
          reason: `Matched with psychologist ${psychologist.fullName}`,
        },
      });
    });

    await AuditService.log({
      actorUserId: session.user.id,
      action: "COORDINATOR_MATCHED_PSYCHOLOGIST",
      entityType: "CounselingRequest",
      entityId: requestId,
      safeMetadata: { psychologistId: psychologist.id, psychologistName: psychologist.fullName },
    });
  }

  /**
   * Appends an operational coordination note to the request.
   */
  static async addNote(session: SessionWithUser, requestId: string, noteText: string): Promise<void> {
    if (!noteText || noteText.trim().length === 0) {
      throw new ValidationError("Note content cannot be empty");
    }

    await this.getRequestDetails(session, requestId);
    const staff = await this.getOrCreateStaffProfile(session.user.id, session.user.email);

    await prisma.coordinationNote.create({
      data: {
        requestId,
        authorId: staff.id,
        noteText: noteText.trim(),
      },
    });

    await AuditService.log({
      actorUserId: session.user.id,
      action: "COORDINATION_NOTE_ADDED",
      entityType: "CounselingRequest",
      entityId: requestId,
    });
  }

  /**
   * Retrieves follow-up requests queue.
   */
  static async getFollowUps(session: SessionWithUser) {
    return this.getQueue(session, {
      status: CounselingRequestStatus.FOLLOW_UP,
      assignedToMe: true,
    });
  }
}
