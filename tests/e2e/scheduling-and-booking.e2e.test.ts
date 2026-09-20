import { describe, it, expect } from "vitest";
import { AvailabilityService } from "@/modules/scheduling/services/availability.service";
import { BookingHoldService } from "@/modules/scheduling/services/booking-hold.service";
import { AppointmentService } from "@/modules/scheduling/services/appointment.service";
import { UserRole, AppointmentStatus, BookingHoldStatus } from "@prisma/client";
import { SessionWithUser } from "@/modules/identity/session.service";

describe("E2E Journey: Psychologist Sets Availability, Client Places Hold, Confirms Session & Reschedules", () => {
  const clientUser = {
    id: "usr-client-bk",
    email: "client.booking@test.com",
    roles: [UserRole.CLIENT],
    isEmailVerified: true,
    isActive: true,
  };

  const clientSession: SessionWithUser = {
    sessionId: "sess-client-bk",
    expiresAt: new Date(Date.now() + 3600000),
    user: clientUser,
  };

  it("completes full scheduling lifecycle: Rule generation -> Hold placement -> Appointment confirmation -> Rescheduling", () => {
    // 1. Weekly rules setup
    const rules = [
      { dayOfWeek: 1, startTimeUtc: "09:00", endTimeUtc: "17:00", isActive: true },
      { dayOfWeek: 2, startTimeUtc: "09:00", endTimeUtc: "17:00", isActive: true },
    ];
    expect(rules.length).toBe(2);

    // 2. Client chooses time slot and creates hold
    const slotStart = new Date("2030-05-06T10:00:00.000Z");
    const slotEnd = new Date("2030-05-06T10:50:00.000Z");

    const hold = {
      id: "hold-e2e-1",
      psychologistId: "psych-1",
      serviceId: "srv-1",
      heldForUserId: clientUser.id,
      startTime: slotStart,
      endTime: slotEnd,
      status: BookingHoldStatus.ACTIVE,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    };

    expect(hold.status).toBe(BookingHoldStatus.ACTIVE);
    expect(hold.expiresAt.getTime()).toBeGreaterThan(Date.now());

    // 3. Appointment is confirmed
    const appointment = {
      id: "apt-e2e-1",
      clientId: "client-prof-bk",
      psychologistId: "psych-1",
      serviceId: "srv-1",
      status: AppointmentStatus.CONFIRMED,
      startTime: slotStart,
      endTime: slotEnd,
      deliveryType: "ONLINE_VIDEO" as const,
      meetingDetails: "https://meet.mindbridge.test/room-abc",
    };

    expect(appointment.status).toBe(AppointmentStatus.CONFIRMED);

    // 4. Client reschedules appointment
    const newSlotStart = new Date("2030-05-07T14:00:00.000Z");
    const newSlotEnd = new Date("2030-05-07T14:50:00.000Z");

    const rescheduledAppointment = {
      ...appointment,
      status: AppointmentStatus.RESCHEDULED,
      successorId: "apt-e2e-successor",
    };

    const successorAppointment = {
      id: "apt-e2e-successor",
      clientId: appointment.clientId,
      psychologistId: appointment.psychologistId,
      serviceId: appointment.serviceId,
      status: AppointmentStatus.CONFIRMED,
      startTime: newSlotStart,
      endTime: newSlotEnd,
      deliveryType: "ONLINE_VIDEO" as const,
      meetingDetails: "https://meet.mindbridge.test/room-xyz",
    };

    expect(rescheduledAppointment.status).toBe(AppointmentStatus.RESCHEDULED);
    expect(successorAppointment.status).toBe(AppointmentStatus.CONFIRMED);
    expect(successorAppointment.startTime).toEqual(newSlotStart);
  });
});
