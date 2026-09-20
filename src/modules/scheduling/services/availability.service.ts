import { prisma } from "@/shared/database/prisma";
import {
  SetAvailabilityRulesInput,
  SetAvailabilityRulesSchema,
  AvailabilityExceptionInput,
  AvailabilityExceptionSchema,
  TimeSlotDto,
} from "../dto/scheduling.dto";
import { NotFoundError, ValidationError } from "@/shared/errors";
import { BookingHoldStatus, AppointmentStatus } from "@prisma/client";

export class AvailabilityService {
  /**
   * Sets or updates recurring weekly availability rules for a psychologist.
   */
  static async setAvailabilityRules(
    psychologistProfileId: string,
    input: SetAvailabilityRulesInput
  ) {
    const validated = SetAvailabilityRulesSchema.parse(input);

    const profile = await prisma.psychologistProfile.findUnique({
      where: { id: psychologistProfileId },
    });
    if (!profile) throw new NotFoundError("Psychologist profile not found");

    return prisma.$transaction(async (tx) => {
      // Update psychologist timezone if provided
      if (validated.timezone) {
        await tx.psychologistProfile.update({
          where: { id: psychologistProfileId },
          data: { timezone: validated.timezone },
        });
      }

      // Replace existing rules with new rules
      await tx.availabilityRule.deleteMany({
        where: { psychologistId: psychologistProfileId },
      });

      if (validated.rules.length > 0) {
        await tx.availabilityRule.createMany({
          data: validated.rules.map((r) => ({
            psychologistId: psychologistProfileId,
            dayOfWeek: r.dayOfWeek,
            startTimeUtc: r.startTimeUtc,
            endTimeUtc: r.endTimeUtc,
            isActive: r.isActive,
          })),
        });
      }

      return tx.availabilityRule.findMany({
        where: { psychologistId: psychologistProfileId },
        orderBy: [{ dayOfWeek: "asc" }, { startTimeUtc: "asc" }],
      });
    });
  }

  /**
   * Gets recurring rules and exceptions for a psychologist.
   */
  static async getPsychologistAvailability(psychologistProfileId: string) {
    const [rules, exceptions] = await Promise.all([
      prisma.availabilityRule.findMany({
        where: { psychologistId: psychologistProfileId },
        orderBy: [{ dayOfWeek: "asc" }, { startTimeUtc: "asc" }],
      }),
      prisma.availabilityException.findMany({
        where: {
          psychologistId: psychologistProfileId,
          endDateTime: { gte: new Date() },
        },
        orderBy: { startDateTime: "asc" },
      }),
    ]);

    return { rules, exceptions };
  }

  /**
   * Adds an availability exception (holiday, manual block, or extra hours).
   */
  static async addException(
    psychologistProfileId: string,
    input: AvailabilityExceptionInput
  ) {
    const validated = AvailabilityExceptionSchema.parse(input);
    const start = new Date(validated.startDateTime);
    const end = new Date(validated.endDateTime);

    if (end <= start) {
      throw new ValidationError("End datetime must be strictly after start datetime");
    }

    return prisma.availabilityException.create({
      data: {
        psychologistId: psychologistProfileId,
        startDateTime: start,
        endDateTime: end,
        isUnavailable: validated.isUnavailable,
        reason: validated.reason ?? null,
      },
    });
  }

  /**
   * Deletes an availability exception.
   */
  static async removeException(exceptionId: string, psychologistProfileId: string) {
    const exception = await prisma.availabilityException.findUnique({
      where: { id: exceptionId },
    });

    if (!exception || exception.psychologistId !== psychologistProfileId) {
      throw new NotFoundError("Availability exception not found");
    }

    await prisma.availabilityException.delete({ where: { id: exceptionId } });
  }

  /**
   * Computes available bookable slots for a specific date and service duration.
   */
  static async getAvailableSlotsForDate(
    psychologistProfileId: string,
    dateStr: string, // YYYY-MM-DD
    durationMinutes: number = 50
  ): Promise<TimeSlotDto[]> {
    const targetDate = new Date(`${dateStr}T00:00:00.000Z`);
    const dayOfWeek = targetDate.getUTCDay(); // 0 = Sunday, 6 = Saturday
    const dayEnd = new Date(`${dateStr}T23:59:59.999Z`);

    // 1. Fetch recurring rules for this day of week
    const rules = await prisma.availabilityRule.findMany({
      where: {
        psychologistId: psychologistProfileId,
        dayOfWeek,
        isActive: true,
      },
      orderBy: { startTimeUtc: "asc" },
    });

    if (rules.length === 0) {
      return [];
    }

    // 2. Fetch exceptions covering this date
    const exceptions = await prisma.availabilityException.findMany({
      where: {
        psychologistId: psychologistProfileId,
        startDateTime: { lte: dayEnd },
        endDateTime: { gte: targetDate },
      },
    });

    // 3. Fetch confirmed/pending appointments on this date
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        psychologistId: psychologistProfileId,
        status: {
          in: [
            AppointmentStatus.CONFIRMED,
            AppointmentStatus.AWAITING_PAYMENT,
            AppointmentStatus.AWAITING_AVAILABILITY,
            AppointmentStatus.REQUESTED,
          ],
        },
        startTime: { lte: dayEnd },
        endTime: { gte: targetDate },
      },
    });

    // 4. Fetch active booking holds on this date
    const activeHolds = await prisma.bookingHold.findMany({
      where: {
        psychologistId: psychologistProfileId,
        status: BookingHoldStatus.ACTIVE,
        expiresAt: { gt: new Date() },
        startTime: { lte: dayEnd },
        endTime: { gte: targetDate },
      },
    });

    // 5. Generate discrete slots for each rule interval
    const slots: TimeSlotDto[] = [];
    const stepMs = durationMinutes * 60 * 1000;

    for (const rule of rules) {
      const [startHour, startMin] = rule.startTimeUtc.split(":").map(Number);
      const [endHour, endMin] = rule.endTimeUtc.split(":").map(Number);

      const ruleStart = new Date(targetDate);
      ruleStart.setUTCHours(startHour, startMin, 0, 0);

      const ruleEnd = new Date(targetDate);
      ruleEnd.setUTCHours(endHour, endMin, 0, 0);

      let slotStart = new Date(ruleStart);
      while (slotStart.getTime() + stepMs <= ruleEnd.getTime()) {
        const slotEnd = new Date(slotStart.getTime() + stepMs);

        // Check if slot overlaps with any unavailable exception
        const isBlockedByException = exceptions.some(
          (ex) => ex.isUnavailable && slotStart < ex.endDateTime && slotEnd > ex.startDateTime
        );

        // Check if slot overlaps with an existing appointment
        const isBlockedByAppointment = existingAppointments.some(
          (apt) => slotStart < apt.endTime && slotEnd > apt.startTime
        );

        // Check if slot overlaps with an active hold
        const isBlockedByHold = activeHolds.some(
          (h) => slotStart < h.endTime && slotEnd > h.startTime
        );

        const isAvailable =
          !isBlockedByException &&
          !isBlockedByAppointment &&
          !isBlockedByHold &&
          slotStart.getTime() > Date.now(); // Must be in future

        slots.push({
          startTime: slotStart.toISOString(),
          endTime: slotEnd.toISOString(),
          isAvailable,
        });

        // Advance to next slot
        slotStart = new Date(slotEnd);
      }
    }

    return slots;
  }
}
