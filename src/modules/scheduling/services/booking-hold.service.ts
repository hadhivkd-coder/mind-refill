import { prisma } from "@/shared/database/prisma";
import { CreateBookingHoldInput, CreateBookingHoldSchema } from "../dto/scheduling.dto";
import { ConflictError, NotFoundError, ValidationError } from "@/shared/errors";
import { BookingHoldStatus, AppointmentStatus } from "@prisma/client";
import { AuditService } from "@/modules/audit/audit.service";

// Configurable hold duration in minutes
export const DEFAULT_HOLD_DURATION_MINUTES = 15;

export class BookingHoldService {
  /**
   * Atomically places a temporary hold on a psychologist's slot.
   * Enforces anti-double-booking at the database transaction level.
   */
  static async createHold(
    userId: string,
    input: CreateBookingHoldInput,
    holdDurationMinutes: number = DEFAULT_HOLD_DURATION_MINUTES
  ) {
    const validated = CreateBookingHoldSchema.parse(input);
    const start = new Date(validated.startTime);
    const end = new Date(validated.endTime);

    if (end <= start) {
      throw new ValidationError("End time must be after start time");
    }

    if (start.getTime() <= Date.now()) {
      throw new ValidationError("Cannot hold a slot in the past");
    }

    const expiresAt = new Date(Date.now() + holdDurationMinutes * 60 * 1000);

    return prisma.$transaction(async (tx) => {
      // 1. Clean up any expired holds in background
      await tx.bookingHold.updateMany({
        where: {
          psychologistId: validated.psychologistId,
          status: BookingHoldStatus.ACTIVE,
          expiresAt: { lte: new Date() },
        },
        data: { status: BookingHoldStatus.EXPIRED },
      });

      // 2. Check for conflicting active booking holds
      const conflictingHold = await tx.bookingHold.findFirst({
        where: {
          psychologistId: validated.psychologistId,
          status: BookingHoldStatus.ACTIVE,
          expiresAt: { gt: new Date() },
          startTime: { lt: end },
          endTime: { gt: start },
        },
      });

      if (conflictingHold) {
        throw new ConflictError(
          "This time slot is temporarily held by another client. Please select another slot or try again in a few minutes."
        );
      }

      // 3. Check for conflicting confirmed/pending appointments
      const conflictingAppointment = await tx.appointment.findFirst({
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

      if (conflictingAppointment) {
        throw new ConflictError("This time slot is already booked.");
      }

      // 4. Create the booking hold
      const hold = await tx.bookingHold.create({
        data: {
          psychologistId: validated.psychologistId,
          serviceId: validated.serviceId,
          heldForUserId: userId,
          startTime: start,
          endTime: end,
          expiresAt,
          status: BookingHoldStatus.ACTIVE,
        },
      });

      await AuditService.log({
        actorUserId: userId,
        action: "BOOKING_HOLD_CREATED",
        entityType: "BookingHold",
        entityId: hold.id,
        safeMetadata: {
          psychologistId: validated.psychologistId,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
        },
      });

      return hold;
    });
  }

  /**
   * Releases an active hold (e.g. user cancelled selection or payment window closed).
   */
  static async releaseHold(holdId: string, userId: string): Promise<void> {
    const hold = await prisma.bookingHold.findUnique({
      where: { id: holdId },
    });

    if (!hold) return;

    if (hold.heldForUserId !== userId) {
      throw new ValidationError("Cannot release a hold created by another user");
    }

    if (hold.status === BookingHoldStatus.ACTIVE) {
      await prisma.bookingHold.update({
        where: { id: holdId },
        data: { status: BookingHoldStatus.RELEASED },
      });

      await AuditService.log({
        actorUserId: userId,
        action: "BOOKING_HOLD_RELEASED",
        entityType: "BookingHold",
        entityId: holdId,
      });
    }
  }

  /**
   * Consumes a hold upon successful appointment creation.
   */
  static async consumeHold(tx: any, holdId: string): Promise<void> {
    await tx.bookingHold.update({
      where: { id: holdId },
      data: { status: BookingHoldStatus.CONSUMED },
    });
  }
}
