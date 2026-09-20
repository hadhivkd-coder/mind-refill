import { describe, it, expect, vi, beforeEach } from "vitest";
import { BookingHoldService } from "@/modules/scheduling/services/booking-hold.service";
import { prisma } from "@/shared/database/prisma";
import { ConflictError } from "@/shared/errors";
import { BookingHoldStatus, AppointmentStatus } from "@prisma/client";

vi.mock("@/shared/database/prisma", () => ({
  prisma: {
    bookingHold: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    appointment: {
      findFirst: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/modules/audit/audit.service", () => ({
  AuditService: {
    log: vi.fn().mockResolvedValue({ id: "audit-123" }),
  },
}));

describe("BookingHoldService", () => {
  const psychId = "a0000000-0000-0000-0000-000000000001";
  const serviceId = "b0000000-0000-0000-0000-000000000001";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create hold when no active hold or appointment conflicts", async () => {
    const futureStart = new Date(Date.now() + 86400000);
    const futureEnd = new Date(futureStart.getTime() + 50 * 60 * 1000);

    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => {
      const tx = {
        bookingHold: {
          updateMany: vi.fn(),
          findFirst: vi.fn().mockResolvedValue(null), // No conflicting hold
          create: vi.fn().mockResolvedValue({
            id: "hold-1",
            psychologistId: psychId,
            status: BookingHoldStatus.ACTIVE,
          }),
        },
        appointment: {
          findFirst: vi.fn().mockResolvedValue(null), // No conflicting appointment
        },
      };
      return cb(tx);
    });

    const hold = await BookingHoldService.createHold("user-1", {
      psychologistId: psychId,
      serviceId,
      startTime: futureStart.toISOString(),
      endTime: futureEnd.toISOString(),
    });

    expect(hold.id).toBe("hold-1");
  });

  it("should reject hold if conflicting active hold exists (race condition prevention)", async () => {
    const futureStart = new Date(Date.now() + 86400000);
    const futureEnd = new Date(futureStart.getTime() + 50 * 60 * 1000);

    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => {
      const tx = {
        bookingHold: {
          updateMany: vi.fn(),
          findFirst: vi.fn().mockResolvedValue({ id: "hold-existing", status: BookingHoldStatus.ACTIVE }),
        },
        appointment: {
          findFirst: vi.fn().mockResolvedValue(null),
        },
      };
      return cb(tx);
    });

    await expect(
      BookingHoldService.createHold("user-2", {
        psychologistId: psychId,
        serviceId,
        startTime: futureStart.toISOString(),
        endTime: futureEnd.toISOString(),
      })
    ).rejects.toThrow(ConflictError);
  });

  it("should reject hold if conflicting confirmed appointment exists", async () => {
    const futureStart = new Date(Date.now() + 86400000);
    const futureEnd = new Date(futureStart.getTime() + 50 * 60 * 1000);

    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => {
      const tx = {
        bookingHold: {
          updateMany: vi.fn(),
          findFirst: vi.fn().mockResolvedValue(null),
        },
        appointment: {
          findFirst: vi.fn().mockResolvedValue({ id: "apt-booked", status: AppointmentStatus.CONFIRMED }),
        },
      };
      return cb(tx);
    });

    await expect(
      BookingHoldService.createHold("user-1", {
        psychologistId: psychId,
        serviceId,
        startTime: futureStart.toISOString(),
        endTime: futureEnd.toISOString(),
      })
    ).rejects.toThrow(ConflictError);
  });
});
