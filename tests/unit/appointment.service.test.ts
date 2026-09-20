import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppointmentService } from "@/modules/scheduling/services/appointment.service";
import { prisma } from "@/shared/database/prisma";
import { UserRole, AppointmentStatus, BookingHoldStatus } from "@prisma/client";
import { ConflictError, ForbiddenError, ValidationError } from "@/shared/errors";
import { SessionWithUser } from "@/modules/identity/session.service";

vi.mock("@/shared/database/prisma", () => ({
  prisma: {
    clientProfile: {
      findUnique: vi.fn(),
    },
    staffProfile: {
      findUnique: vi.fn(),
    },
    psychologistProfile: {
      findUnique: vi.fn(),
    },
    counselingRequest: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    appointment: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    bookingHold: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    appointmentStatusHistory: {
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

describe("AppointmentService", () => {
  const psychId = "a0000000-0000-0000-0000-000000000001";
  const serviceId = "b0000000-0000-0000-0000-000000000001";

  const clientSession: SessionWithUser = {
    sessionId: "sess-1",
    expiresAt: new Date(Date.now() + 3600000),
    user: {
      id: "client-u1",
      email: "client@test.com",
      roles: [UserRole.CLIENT],
      isEmailVerified: true,
      isActive: true,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createAppointment", () => {
    it("should atomically create appointment and record status history", async () => {
      const futureStart = new Date(Date.now() + 86400000);
      const futureEnd = new Date(futureStart.getTime() + 50 * 60 * 1000);

      vi.mocked(prisma.clientProfile.findUnique).mockResolvedValue({
        id: "client-prof-1",
        userId: "client-u1",
      } as any);

      vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => {
        const tx = {
          bookingHold: {
            findUnique: vi.fn(),
            update: vi.fn(),
          },
          appointment: {
            findFirst: vi.fn().mockResolvedValue(null),
            create: vi.fn().mockResolvedValue({
              id: "apt-1",
              counselingRequestId: null,
              clientId: "client-prof-1",
              psychologistId: psychId,
              serviceId,
              status: AppointmentStatus.AWAITING_PAYMENT,
              deliveryType: "ONLINE_VIDEO",
              meetingDetails: null,
              inPersonAddress: null,
              notes: null,
              timezone: "UTC",
              startTime: futureStart,
              endTime: futureEnd,
              createdAt: new Date(),
              client: { id: "client-prof-1", fullName: "Jane", user: { email: "jane@test.com" } },
              psychologist: { id: psychId, fullName: "Dr. Smith", professionalTitle: "Psychologist", slug: "dr-smith", profilePhotoUrl: null },
              service: { id: serviceId, name: "Therapy", durationMinutes: 50, priceAmountMinor: BigInt(50000), priceCurrency: "INR" },
              coordinator: null,
              statusHistory: [],
            }),
          },
          appointmentStatusHistory: {
            create: vi.fn().mockResolvedValue({ id: "hist-1" }),
          },
        };
        return cb(tx);
      });

      const apt = await AppointmentService.createAppointment(clientSession, {
        psychologistId: psychId,
        serviceId,
        startTime: futureStart.toISOString(),
        endTime: futureEnd.toISOString(),
        deliveryType: "ONLINE_VIDEO",
        timezone: "UTC",
      });

      expect(apt.id).toBe("apt-1");
      expect(apt.status).toBe(AppointmentStatus.AWAITING_PAYMENT);
    });
  });

  describe("cancelAppointment", () => {
    it("should prevent unauthorized client from cancelling someone else's appointment", async () => {
      vi.mocked(prisma.appointment.findUnique).mockResolvedValue({
        id: "apt-other",
        client: { userId: "someone-else" },
        psychologist: { userId: "psych-u1" },
        status: AppointmentStatus.CONFIRMED,
      } as any);

      await expect(
        AppointmentService.cancelAppointment(clientSession, "apt-other", {
          reason: "Not feeling well",
        })
      ).rejects.toThrow(ForbiddenError);
    });
  });
});
