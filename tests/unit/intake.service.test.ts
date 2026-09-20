import { describe, it, expect, vi, beforeEach } from "vitest";
import { IntakeService } from "@/modules/intake/services/intake.service";
import { prisma } from "@/shared/database/prisma";
import { AuditService } from "@/modules/audit/audit.service";
import { CounselingRequestStatus, VerificationStatus } from "@prisma/client";
import { ValidationError, ForbiddenError } from "@/shared/errors";

vi.mock("@/shared/database/prisma", () => ({
  prisma: {
    clientProfile: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    psychologistProfile: {
      findUnique: vi.fn(),
    },
    counselingRequest: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    intakeResponse: {
      create: vi.fn(),
    },
    counselingRequestStatusHistory: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/modules/audit/audit.service", () => ({
  AuditService: {
    log: vi.fn().mockResolvedValue({ id: "audit-123" }),
  },
}));

describe("IntakeService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("detectCrisisSignals", () => {
    it("should detect emergency keywords", () => {
      expect(IntakeService.detectCrisisSignals("I am having thoughts of suicide")).toBe(true);
      expect(IntakeService.detectCrisisSignals("I feel like I want to die")).toBe(true);
      expect(IntakeService.detectCrisisSignals("I struggle with self-harm")).toBe(true);
      expect(IntakeService.detectCrisisSignals("I need help with workplace anxiety and burnout")).toBe(false);
    });
  });

  describe("submitIntake", () => {
    it("should successfully submit Path B guided intake request", async () => {
      const mockClient = { id: "client-1", userId: "user-1", fullName: "Jane Doe" };
      vi.mocked(prisma.clientProfile.findUnique).mockResolvedValue(mockClient as any);
      vi.mocked(prisma.clientProfile.update).mockResolvedValue(mockClient as any);

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        const tx = {
          counselingRequest: {
            create: vi.fn().mockResolvedValue({
              id: "req-1",
              clientId: "client-1",
              status: CounselingRequestStatus.NEW,
              isDirectBookingRequest: false,
            }),
          },
          intakeResponse: {
            create: vi.fn().mockResolvedValue({ id: "resp-1", requestId: "req-1" }),
          },
          counselingRequestStatusHistory: {
            create: vi.fn().mockResolvedValue({ id: "hist-1" }),
          },
        };
        return callback(tx);
      });

      const res = await IntakeService.submitIntake("user-1", {
        fullName: "Jane Doe",
        ageBand: "25_34",
        contactPreference: "EMAIL",
        preferredLanguage: "English",
        concernCategories: ["Anxiety", "Stress & Burnout"],
        rawConcernSummary: "I have been experiencing acute panic attacks at work recently.",
        preferredDays: ["MONDAY", "WEDNESDAY"],
        preferredTimes: ["EVENING"],
        sessionPreference: "ONLINE_VIDEO",
        hasCrisisConcerns: false,
        isDirectBookingRequest: false,
      });

      expect(res.requestId).toBe("req-1");
      expect(res.isEscalated).toBe(false);
      expect(AuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "INTAKE_REQUEST_CREATED",
          entityId: "req-1",
        })
      );
    });

    it("should flag crisis escalation when crisis signals are present", async () => {
      const mockClient = { id: "client-1", userId: "user-1", fullName: "Jane Doe" };
      vi.mocked(prisma.clientProfile.findUnique).mockResolvedValue(mockClient as any);
      vi.mocked(prisma.clientProfile.update).mockResolvedValue(mockClient as any);

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        const tx = {
          counselingRequest: {
            create: vi.fn().mockResolvedValue({
              id: "req-2",
              clientId: "client-1",
              status: CounselingRequestStatus.NEW,
              isDirectBookingRequest: false,
            }),
          },
          intakeResponse: {
            create: vi.fn().mockResolvedValue({ id: "resp-2", requestId: "req-2" }),
          },
          counselingRequestStatusHistory: {
            create: vi.fn().mockResolvedValue({ id: "hist-2" }),
          },
        };
        return callback(tx);
      });

      const res = await IntakeService.submitIntake("user-1", {
        fullName: "Jane Doe",
        ageBand: "25_34",
        contactPreference: "EMAIL",
        preferredLanguage: "English",
        concernCategories: ["Depression"],
        rawConcernSummary: "I feel hopeless and have been having thoughts of suicide every day.",
        preferredDays: ["MONDAY"],
        preferredTimes: ["MORNING"],
        sessionPreference: "ONLINE_VIDEO",
        hasCrisisConcerns: false,
        isDirectBookingRequest: false,
      });

      expect(res.requestId).toBe("req-2");
      expect(res.isEscalated).toBe(true);
    });

    it("should reject direct booking if target psychologist is not verified", async () => {
      vi.mocked(prisma.clientProfile.findUnique).mockResolvedValue({ id: "c-1", userId: "u-1" } as any);
      vi.mocked(prisma.psychologistProfile.findUnique).mockResolvedValue({
        id: "psych-1",
        verificationStatus: VerificationStatus.PENDING,
        profileState: "DRAFT",
      } as any);

      await expect(
        IntakeService.submitIntake("u-1", {
          fullName: "Jane Doe",
          ageBand: "25_34",
          contactPreference: "EMAIL",
          preferredLanguage: "English",
          concernCategories: ["Anxiety"],
          rawConcernSummary: "Need assistance with general anxiety.",
          targetPsychologistId: "a0000000-0000-0000-0000-000000000001",
          isDirectBookingRequest: true,
          hasCrisisConcerns: false,
          preferredDays: [],
          preferredTimes: [],
          sessionPreference: "ONLINE_VIDEO",
        })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("getClientRequestById", () => {
    it("should enforce client ownership (prevents IDOR)", async () => {
      vi.mocked(prisma.clientProfile.findUnique).mockResolvedValue({
        id: "client-1",
        userId: "user-1",
      } as any);

      vi.mocked(prisma.counselingRequest.findUnique).mockResolvedValue({
        id: "req-99",
        clientId: "client-DIFFERENT",
        status: CounselingRequestStatus.NEW,
        isDirectBookingRequest: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        targetPsychologist: null,
        intakeResponse: null,
      } as any);

      await expect(IntakeService.getClientRequestById("user-1", "req-99")).rejects.toThrow(ForbiddenError);
    });
  });
});
