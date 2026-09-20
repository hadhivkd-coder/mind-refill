import { prisma } from "@/shared/database/prisma";
import {
  CreateAppointmentInput,
  CreateAppointmentSchema,
  RescheduleAppointmentInput,
  RescheduleAppointmentSchema,
  CancelAppointmentInput,
  CancelAppointmentSchema,
  AppointmentDto,
} from "../dto/scheduling.dto";
import { BookingHoldService } from "./booking-hold.service";
import { ConflictError, NotFoundError, ForbiddenError, ValidationError } from "@/shared/errors";
import { AppointmentStatus, BookingHoldStatus, UserRole } from "@prisma/client";
import { AuditService } from "@/modules/audit/audit.service";
import { SessionWithUser } from "@/modules/identity/session.service";

export class AppointmentService {
  /**
   * Creates an appointment with anti-double-booking database locks.
   * Can be initiated by client with an active hold, or directly scheduled by a coordinator.
   */
  static async createAppointment(
    session: SessionWithUser,
    input: CreateAppointmentInput
  ): Promise<AppointmentDto> {
    const validated = CreateAppointmentSchema.parse(input);
    const start = new Date(validated.startTime);
    const end = new Date(validated.endTime);

    if (end <= start) {
      throw new ValidationError("End time must be after start time");
    }

    // Resolve client profile
    let clientProfileId: string;
    if (session.user.roles.includes(UserRole.CLIENT)) {
      const client = await prisma.clientProfile.findUnique({
        where: { userId: session.user.id },
      });
      if (!client) throw new NotFoundError("Client profile not found");
      clientProfileId = client.id;
    } else if (
      (session.user.roles.includes(UserRole.COORDINATOR) || session.user.roles.includes(UserRole.ADMIN)) &&
      validated.counselingRequestId
    ) {
      const req = await prisma.counselingRequest.findUnique({
        where: { id: validated.counselingRequestId },
      });
      if (!req) throw new NotFoundError("Counseling request not found");
      clientProfileId = req.clientId;
    } else {
      throw new ValidationError("Valid client association required");
    }

    // Resolve coordinator staff profile if created by staff
    let coordinatorId: string | null = null;
    if (session.user.roles.includes(UserRole.COORDINATOR) || session.user.roles.includes(UserRole.ADMIN)) {
      const staff = await prisma.staffProfile.findUnique({ where: { userId: session.user.id } });
      coordinatorId = staff?.id ?? null;
    }

    return prisma.$transaction(async (tx) => {
      // 1. If holdId provided, verify and consume hold
      if (validated.holdId) {
        const hold = await tx.bookingHold.findUnique({
          where: { id: validated.holdId },
        });

        if (!hold || hold.status !== BookingHoldStatus.ACTIVE || hold.expiresAt <= new Date()) {
          throw new ConflictError("Booking hold has expired. Please select a time slot again.");
        }

        await BookingHoldService.consumeHold(tx, hold.id);
      } else {
        // Direct creation: verify no conflicting appointment
        const conflict = await tx.appointment.findFirst({
          where: {
            psychologistId: validated.psychologistId,
            status: {
              in: [
                AppointmentStatus.CONFIRMED,
                AppointmentStatus.AWAITING_PAYMENT,
                AppointmentStatus.AWAITING_AVAILABILITY,
                AppointmentStatus.REQUESTED,
              ],
            },
            startTime: { lt: end },
            endTime: { gt: start },
          },
        });

        if (conflict) {
          throw new ConflictError("This appointment slot conflicts with an existing session.");
        }
      }

      // Initial status depends on caller role
      const initialStatus = session.user.roles.includes(UserRole.CLIENT)
        ? AppointmentStatus.AWAITING_PAYMENT
        : AppointmentStatus.CONFIRMED;

      const appointment = await tx.appointment.create({
        data: {
          counselingRequestId: validated.counselingRequestId ?? null,
          clientId: clientProfileId,
          psychologistId: validated.psychologistId,
          coordinatorId,
          serviceId: validated.serviceId,
          status: initialStatus,
          deliveryType: validated.deliveryType,
          meetingDetails: validated.meetingDetails ?? null,
          inPersonAddress: validated.inPersonAddress ?? null,
          notes: validated.notes ?? null,
          timezone: validated.timezone,
          startTime: start,
          endTime: end,
        },
        include: {
          client: { include: { user: true } },
          psychologist: true,
          service: true,
          coordinator: true,
          statusHistory: true,
        },
      });

      // Immutable status history
      await tx.appointmentStatusHistory.create({
        data: {
          appointmentId: appointment.id,
          oldStatus: initialStatus,
          newStatus: initialStatus,
          actorUserId: session.user.id,
          reason: "Appointment initially created",
        },
      });

      // If associated with a counseling request, advance request status
      if (validated.counselingRequestId) {
        await tx.counselingRequest.update({
          where: { id: validated.counselingRequestId },
          data: {
            status:
              initialStatus === AppointmentStatus.CONFIRMED
                ? "BOOKED"
                : "AVAILABILITY_CONFIRMED",
          },
        });
      }

      await AuditService.log({
        actorUserId: session.user.id,
        action: "APPOINTMENT_CREATED",
        entityType: "Appointment",
        entityId: appointment.id,
        safeMetadata: {
          psychologistId: validated.psychologistId,
          status: initialStatus,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
        },
      });

      return this.mapToDto(appointment);
    });
  }

  /**
   * Reschedules an appointment by transitioning current appointment to RESCHEDULED
   * and creating a linked successor appointment.
   */
  static async rescheduleAppointment(
    session: SessionWithUser,
    appointmentId: string,
    input: RescheduleAppointmentInput
  ): Promise<AppointmentDto> {
    const validated = RescheduleAppointmentSchema.parse(input);
    const newStart = new Date(validated.newStartTime);
    const newEnd = new Date(validated.newEndTime);

    const apt = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { client: true, psychologist: true },
    });

    if (!apt) throw new NotFoundError("Appointment not found");

    // Ownership / authorization check
    if (session.user.roles.includes(UserRole.CLIENT) && apt.client.userId !== session.user.id) {
      throw new ForbiddenError("You can only reschedule your own appointments");
    }
    if (
      session.user.roles.includes(UserRole.PSYCHOLOGIST) &&
      apt.psychologist.userId !== session.user.id
    ) {
      throw new ForbiddenError("You can only reschedule your own sessions");
    }

    return prisma.$transaction(async (tx) => {
      // Check conflict for new slot
      const conflict = await tx.appointment.findFirst({
        where: {
          psychologistId: apt.psychologistId,
          status: {
            in: [AppointmentStatus.CONFIRMED, AppointmentStatus.AWAITING_PAYMENT],
          },
          startTime: { lt: newEnd },
          endTime: { gt: newStart },
        },
      });

      if (conflict) {
        throw new ConflictError("The new requested time slot is not available.");
      }

      // Create successor appointment
      const successor = await tx.appointment.create({
        data: {
          counselingRequestId: apt.counselingRequestId,
          clientId: apt.clientId,
          psychologistId: apt.psychologistId,
          coordinatorId: apt.coordinatorId,
          serviceId: apt.serviceId,
          status: AppointmentStatus.CONFIRMED,
          deliveryType: apt.deliveryType,
          meetingDetails: apt.meetingDetails,
          inPersonAddress: apt.inPersonAddress,
          timezone: apt.timezone,
          startTime: newStart,
          endTime: newEnd,
        },
        include: {
          client: { include: { user: true } },
          psychologist: true,
          service: true,
          coordinator: true,
          statusHistory: true,
        },
      });

      // Update old appointment to RESCHEDULED and link successor
      await tx.appointment.update({
        where: { id: apt.id },
        data: {
          status: AppointmentStatus.RESCHEDULED,
          successorId: successor.id,
        },
      });

      // Record status histories
      await tx.appointmentStatusHistory.create({
        data: {
          appointmentId: apt.id,
          oldStatus: apt.status,
          newStatus: AppointmentStatus.RESCHEDULED,
          actorUserId: session.user.id,
          reason: `Rescheduled to ${newStart.toISOString()}: ${validated.reason}`,
        },
      });

      await tx.appointmentStatusHistory.create({
        data: {
          appointmentId: successor.id,
          oldStatus: AppointmentStatus.CONFIRMED,
          newStatus: AppointmentStatus.CONFIRMED,
          actorUserId: session.user.id,
          reason: `Created as rescheduled successor of ${apt.id}`,
        },
      });

      await AuditService.log({
        actorUserId: session.user.id,
        action: "APPOINTMENT_RESCHEDULED",
        entityType: "Appointment",
        entityId: apt.id,
        safeMetadata: { successorId: successor.id, reason: validated.reason },
      });

      return this.mapToDto(successor);
    });
  }

  /**
   * Cancels an appointment with policy justification.
   */
  static async cancelAppointment(
    session: SessionWithUser,
    appointmentId: string,
    input: CancelAppointmentInput
  ): Promise<void> {
    const validated = CancelAppointmentSchema.parse(input);
    const apt = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { client: true, psychologist: true },
    });

    if (!apt) throw new NotFoundError("Appointment not found");

    if (session.user.roles.includes(UserRole.CLIENT) && apt.client.userId !== session.user.id) {
      throw new ForbiddenError("Cannot cancel an appointment belonging to another client");
    }

    await prisma.$transaction(async (tx) => {
      await tx.appointment.update({
        where: { id: appointmentId },
        data: { status: AppointmentStatus.CANCELLED },
      });

      await tx.appointmentStatusHistory.create({
        data: {
          appointmentId,
          oldStatus: apt.status,
          newStatus: AppointmentStatus.CANCELLED,
          actorUserId: session.user.id,
          reason: validated.reason,
        },
      });
    });

    await AuditService.log({
      actorUserId: session.user.id,
      action: "APPOINTMENT_CANCELLED",
      entityType: "Appointment",
      entityId: appointmentId,
      safeMetadata: { reason: validated.reason },
    });
  }

  /**
   * Retrieves client's appointments (separated into upcoming and past).
   */
  static async getClientAppointments(userId: string) {
    const client = await prisma.clientProfile.findUnique({ where: { userId } });
    if (!client) return { upcoming: [], past: [] };

    const now = new Date();
    const appointments = await prisma.appointment.findMany({
      where: { clientId: client.id },
      orderBy: { startTime: "asc" },
      include: {
        client: { include: { user: true } },
        psychologist: true,
        service: true,
        coordinator: true,
        statusHistory: { orderBy: { changedAt: "desc" } },
      },
    });

    const dtos = appointments.map((a) => this.mapToDto(a));
    return {
      upcoming: dtos.filter(
        (a) =>
          new Date(a.startTime) >= now &&
          a.status !== AppointmentStatus.CANCELLED &&
          a.status !== AppointmentStatus.RESCHEDULED
      ),
      past: dtos.filter(
        (a) =>
          new Date(a.startTime) < now ||
          a.status === AppointmentStatus.CANCELLED ||
          a.status === AppointmentStatus.RESCHEDULED ||
          a.status === AppointmentStatus.COMPLETED
      ),
    };
  }

  /**
   * Retrieves psychologist's appointments for calendar views.
   */
  static async getPsychologistAppointments(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<AppointmentDto[]> {
    const profile = await prisma.psychologistProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError("Psychologist profile not found");

    const where: any = { psychologistId: profile.id };
    if (startDate && endDate) {
      where.startTime = { gte: startDate, lte: endDate };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: { startTime: "asc" },
      include: {
        client: { include: { user: true } },
        psychologist: true,
        service: true,
        coordinator: true,
        statusHistory: { orderBy: { changedAt: "desc" } },
      },
    });

    return appointments.map((a) => this.mapToDto(a));
  }

  /**
   * Retrieves coordinator appointments overview (today, upcoming, pending).
   */
  static async getCoordinatorAppointments(session: SessionWithUser) {
    if (!session.user.roles.includes(UserRole.COORDINATOR) && !session.user.roles.includes(UserRole.ADMIN)) {
      throw new ForbiddenError("Access denied: Requires Coordinator or Admin role");
    }

    const now = new Date();
    const todayStart = new Date(now.toISOString().slice(0, 10) + "T00:00:00.000Z");
    const todayEnd = new Date(now.toISOString().slice(0, 10) + "T23:59:59.999Z");

    const [todaySessions, upcoming, pendingScheduling] = await Promise.all([
      prisma.appointment.findMany({
        where: {
          startTime: { gte: todayStart, lte: todayEnd },
          status: AppointmentStatus.CONFIRMED,
        },
        include: {
          client: { include: { user: true } },
          psychologist: true,
          service: true,
          coordinator: true,
          statusHistory: true,
        },
        orderBy: { startTime: "asc" },
      }),
      prisma.appointment.findMany({
        where: {
          startTime: { gt: todayEnd },
          status: AppointmentStatus.CONFIRMED,
        },
        include: {
          client: { include: { user: true } },
          psychologist: true,
          service: true,
          coordinator: true,
          statusHistory: true,
        },
        take: 30,
        orderBy: { startTime: "asc" },
      }),
      prisma.counselingRequest.findMany({
        where: {
          status: { in: ["PSYCHOLOGIST_SELECTED", "MATCHING"] },
        },
        include: {
          client: { include: { user: true } },
          targetPsychologist: true,
        },
      }),
    ]);

    return {
      today: todaySessions.map((a) => this.mapToDto(a)),
      upcoming: upcoming.map((a) => this.mapToDto(a)),
      pendingSchedulingCount: pendingScheduling.length,
    };
  }

  private static mapToDto(apt: any): AppointmentDto {
    return {
      id: apt.id,
      counselingRequestId: apt.counselingRequestId,
      status: apt.status,
      deliveryType: apt.deliveryType,
      meetingDetails: apt.meetingDetails,
      inPersonAddress: apt.inPersonAddress,
      notes: apt.notes,
      timezone: apt.timezone,
      startTime: apt.startTime.toISOString(),
      endTime: apt.endTime.toISOString(),
      createdAt: apt.createdAt.toISOString(),
      client: {
        id: apt.client.id,
        fullName: apt.client.fullName,
        email: apt.client.user.email,
        phoneNumber: apt.client.phoneNumber,
      },
      psychologist: {
        id: apt.psychologist.id,
        fullName: apt.psychologist.fullName,
        professionalTitle: apt.psychologist.professionalTitle,
        slug: apt.psychologist.slug,
        profilePhotoUrl: apt.psychologist.profilePhotoUrl,
      },
      service: {
        id: apt.service.id,
        name: apt.service.name,
        durationMinutes: apt.service.durationMinutes,
        priceAmountMinor: apt.service.priceAmountMinor.toString(),
        priceCurrency: apt.service.priceCurrency,
      },
      coordinator: apt.coordinator
        ? {
            id: apt.coordinator.id,
            fullName: apt.coordinator.fullName,
          }
        : null,
      statusHistory: (apt.statusHistory || []).map((h: any) => ({
        id: h.id,
        oldStatus: h.oldStatus,
        newStatus: h.newStatus,
        actorUserId: h.actorUserId,
        reason: h.reason,
        changedAt: h.changedAt.toISOString(),
      })),
    };
  }
}
