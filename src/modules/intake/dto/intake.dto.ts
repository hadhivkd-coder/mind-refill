import { z } from "zod";
import { CounselingRequestStatus, SessionDeliveryType } from "@prisma/client";

export const AGE_BANDS = [
  "UNDER_18",
  "18_24",
  "25_34",
  "35_44",
  "45_54",
  "55_PLUS",
] as const;

export const CONTACT_PREFERENCES = ["EMAIL", "PHONE", "WHATSAPP"] as const;

export const PREFERRED_DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

export const PREFERRED_TIMES = [
  "MORNING", // 09:00 - 12:00
  "AFTERNOON", // 12:00 - 17:00
  "EVENING", // 17:00 - 21:00
] as const;

export const CreateIntakeRequestSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(150),
  phoneNumber: z.string().max(30).optional().nullable(),
  ageBand: z.enum(AGE_BANDS),
  contactPreference: z.enum(CONTACT_PREFERENCES).default("EMAIL"),
  preferredLanguage: z.string().min(2).max(50).default("English"),
  concernCategories: z.array(z.string().min(1)).min(1, "Select at least one area of concern"),
  rawConcernSummary: z.string().min(10, "Please provide a brief description of what you're experiencing (min 10 chars)").max(2000),
  preferredDays: z.array(z.enum(PREFERRED_DAYS)).optional().default([]),
  preferredTimes: z.array(z.enum(PREFERRED_TIMES)).optional().default([]),
  sessionPreference: z.nativeEnum(SessionDeliveryType).default(SessionDeliveryType.ONLINE_VIDEO),
  targetPsychologistId: z.string().uuid("Invalid psychologist ID").optional().nullable(),
  isDirectBookingRequest: z.boolean().default(false),
  hasCrisisConcerns: z.boolean().default(false),
});

export type CreateIntakeRequestInput = z.infer<typeof CreateIntakeRequestSchema>;

export interface IntakeResponseSummaryDto {
  id: string;
  requestId: string;
  ageBand: string | null;
  contactPreference: string | null;
  preferredLanguage: string | null;
  concernCategories: string[];
  rawConcernSummary: string;
  preferredTimeWindows: {
    days?: string[];
    times?: string[];
    sessionPreference?: string;
  } | null;
  isEscalated: boolean;
  createdAt: string;
}

export interface ClientCounselingRequestDto {
  id: string;
  status: CounselingRequestStatus;
  isDirectBookingRequest: boolean;
  createdAt: string;
  updatedAt: string;
  targetPsychologist: {
    id: string;
    fullName: string;
    professionalTitle: string;
    slug: string;
    profilePhotoUrl: string | null;
  } | null;
  intakeResponse: IntakeResponseSummaryDto | null;
}

export interface CoordinatorRequestCardDto {
  id: string;
  status: CounselingRequestStatus;
  isDirectBookingRequest: boolean;
  createdAt: string;
  clientName: string;
  clientEmail: string;
  preferredLanguage: string | null;
  concernCategories: string[];
  isEscalated: boolean;
  assignedCoordinator: {
    id: string;
    fullName: string;
  } | null;
  targetPsychologist: {
    id: string;
    fullName: string;
  } | null;
}

export interface CoordinatorRequestDetailDto {
  id: string;
  status: CounselingRequestStatus;
  isDirectBookingRequest: boolean;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    userId: string;
    fullName: string;
    email: string;
    phoneNumber: string | null;
    preferredLanguage: string | null;
    timezone: string;
  };
  intakeResponse: IntakeResponseSummaryDto | null;
  activeAssignment: {
    id: string;
    coordinatorId: string;
    coordinatorName: string;
    assignedAt: string;
  } | null;
  targetPsychologist: {
    id: string;
    fullName: string;
    professionalTitle: string;
    slug: string;
    profilePhotoUrl: string | null;
    isPublic: boolean;
    verificationStatus: string;
  } | null;
  notes: {
    id: string;
    authorId: string;
    authorName: string;
    noteText: string;
    createdAt: string;
  }[];
  statusHistory: {
    id: string;
    oldStatus: CounselingRequestStatus;
    newStatus: CounselingRequestStatus;
    actorUserId: string | null;
    reason: string | null;
    createdAt: string;
  }[];
}
