import { describe, it, expect, vi, beforeEach } from "vitest";
import { AvailabilityService } from "@/modules/scheduling/services/availability.service";
import { prisma } from "@/shared/database/prisma";
import { ValidationError, NotFoundError } from "@/shared/errors";
import { AppointmentStatus, BookingHoldStatus } from "@prisma/client";

vi.mock("@/shared/database/prisma", () => ({
  prisma: {
    psychologistProfile: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    availabilityRule: {
      findMany: vi.fn(),
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    availabilityException: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    appointment: {
      findMany: vi.fn(),
    },
    bookingHold: {
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe("AvailabilityService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("setAvailabilityRules", () => {
    it("should update rules and timezone in transaction", async () => {
      vi.mocked(prisma.psychologistProfile.findUnique).mockResolvedValue({
        id: "psych-1",
      } as any);

      vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => {
        const tx = {
          psychologistProfile: { update: vi.fn() },
          availabilityRule: {
            deleteMany: vi.fn(),
            createMany: vi.fn(),
            findMany: vi.fn().mockResolvedValue([
              { id: "r-1", dayOfWeek: 1, startTimeUtc: "09:00", endTimeUtc: "17:00", isActive: true },
            ]),
          },
        };
        return cb(tx);
      });

      const rules = await AvailabilityService.setAvailabilityRules("psych-1", {
        timezone: "Asia/Kolkata",
        rules: [{ dayOfWeek: 1, startTimeUtc: "09:00", endTimeUtc: "17:00", isActive: true }],
      });

      expect(rules).toHaveLength(1);
    });
  });

  describe("addException", () => {
    it("should reject exception if end date is before start date", async () => {
      await expect(
        AvailabilityService.addException("psych-1", {
          startDateTime: "2026-10-10T15:00:00.000Z",
          endDateTime: "2026-10-10T14:00:00.000Z",
          isUnavailable: true,
        })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("getAvailableSlotsForDate", () => {
    it("should generate discrete slots and exclude overlapping appointments and holds", async () => {
      // Monday rules: 09:00 to 11:00 UTC (two 50 min slots: 09:00-09:50, 09:50-10:40)
      vi.mocked(prisma.availabilityRule.findMany).mockResolvedValue([
        {
          id: "r-1",
          psychologistId: "psych-1",
          dayOfWeek: 1, // Monday
          startTimeUtc: "09:00",
          endTimeUtc: "11:00",
          isActive: true,
        },
      ] as any);

      vi.mocked(prisma.availabilityException.findMany).mockResolvedValue([]);

      // Overlapping appointment from 09:00 to 09:50 on 2030-01-07 (future Monday)
      vi.mocked(prisma.appointment.findMany).mockResolvedValue([
        {
          id: "apt-1",
          startTime: new Date("2030-01-07T09:00:00.000Z"),
          endTime: new Date("2030-01-07T09:50:00.000Z"),
          status: AppointmentStatus.CONFIRMED,
        },
      ] as any);

      vi.mocked(prisma.bookingHold.findMany).mockResolvedValue([]);

      const slots = await AvailabilityService.getAvailableSlotsForDate(
        "psych-1",
        "2030-01-07",
        50
      );

      expect(slots).toHaveLength(2);
      // First slot is blocked by appointment
      expect(slots[0].isAvailable).toBe(false);
      // Second slot is free
      expect(slots[1].isAvailable).toBe(true);
    });
  });
});
