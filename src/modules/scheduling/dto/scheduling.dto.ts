import { z } from "zod";
import { AppointmentStatus, BookingHoldStatus, SessionDeliveryType } from "@prisma/client";

export const AvailabilityRuleSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTimeUtc: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be HH:MM in UTC"),
  endTimeUtc: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be HH:MM in UTC"),
  isActive: z.boolean().default(true),
});

export const SetAvailabilityRulesSchema = z.object({
  rules: z.array(AvailabilityRuleSchema),
  timezone: z.string().min(1).default("UTC"),
});

export const AvailabilityExceptionSchema = z.object({
  startDateTime: z.string().datetime(),
  endDateTime: z.string().datetime(),
  isUnavailable: z.boolean().default(true),
  reason: z.string().max(255).optional().nullable(),
});

export const CreateBookingHoldSchema = z.object({
  psychologistId: z.string().uuid(),
  serviceId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
});

export const CreateAppointmentSchema = z.object({
  counselingRequestId: z.string().uuid().optional().nullable(),
  psychologistId: z.string().uuid(),
  serviceId: z.string().uuid(),
  holdId: z.string().uuid().optional().nullable(),
  deliveryType: z.nativeEnum(SessionDeliveryType).default(SessionDeliveryType.ONLINE_VIDEO),
  meetingDetails: z.string().max(1000).optional().nullable(),
  inPersonAddress: z.string().max(255).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  timezone: z.string().default("UTC"),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
});

export const RescheduleAppointmentSchema = z.object({
  newStartTime: z.string().datetime(),
  newEndTime: z.string().datetime(),
  reason: z.string().min(3).max(255),
});

export const CancelAppointmentSchema = z.object({
  reason: z.string().min(3).max(255),
});

export type AvailabilityRuleInput = z.infer<typeof AvailabilityRuleSchema>;
export type SetAvailabilityRulesInput = z.infer<typeof SetAvailabilityRulesSchema>;
export type AvailabilityExceptionInput = z.infer<typeof AvailabilityExceptionSchema>;
export type CreateBookingHoldInput = z.infer<typeof CreateBookingHoldSchema>;
export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>;
export type RescheduleAppointmentInput = z.infer<typeof RescheduleAppointmentSchema>;
export type CancelAppointmentInput = z.infer<typeof CancelAppointmentSchema>;

export interface TimeSlotDto {
  startTime: string; // ISO string
  endTime: string;   // ISO string
  isAvailable: boolean;
}

export interface AppointmentDto {
  id: string;
  counselingRequestId: string | null;
  status: AppointmentStatus;
  deliveryType: SessionDeliveryType;
  meetingDetails: string | null;
  inPersonAddress: string | null;
  notes: string | null;
  timezone: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  client: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string | null;
  };
  psychologist: {
    id: string;
    fullName: string;
    professionalTitle: string;
    slug: string;
    profilePhotoUrl: string | null;
  };
  service: {
    id: string;
    name: string;
    durationMinutes: number;
    priceAmountMinor: string;
    priceCurrency: string;
  };
  coordinator: {
    id: string;
    fullName: string;
  } | null;
  statusHistory: {
    id: string;
    oldStatus: AppointmentStatus;
    newStatus: AppointmentStatus;
    actorUserId: string | null;
    reason: string | null;
    changedAt: string;
  }[];
}
