import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventService } from "@/modules/events/services/event.service";
import { prisma } from "@/shared/database/prisma";
import { ConflictError, NotFoundError, ValidationError } from "@/shared/errors";

vi.mock("@/shared/database/prisma", () => ({
  prisma: {
    psychologistProfile: {
      findUnique: vi.fn(),
    },
    clientProfile: {
      findUnique: vi.fn(),
    },
    event: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    eventRegistration: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/modules/audit/audit.service", () => ({
  AuditService: {
    log: vi.fn().mockResolvedValue({ id: "audit-123" }),
  },
}));

describe("EventService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("registerForEvent", () => {
    it("rejects registration when event is at maximum capacity (sold out)", async () => {
      vi.mocked(prisma.clientProfile.findUnique).mockResolvedValue({ id: "client-1" } as any);

      vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => {
        const tx = {
          event: {
            findUnique: vi.fn().mockResolvedValue({
              id: "evt-1",
              title: "Mindfulness Workshop",
              maxCapacity: 20,
              isPublished: true,
              _count: { registrations: 20 }, // Full capacity
            }),
          },
        };
        return cb(tx);
      });

      await expect(
        EventService.registerForEvent("u-client-1", "evt-1")
      ).rejects.toThrow(ConflictError);
    });

    it("rejects duplicate registration for the same client and event", async () => {
      vi.mocked(prisma.clientProfile.findUnique).mockResolvedValue({ id: "client-1" } as any);

      vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => {
        const tx = {
          event: {
            findUnique: vi.fn().mockResolvedValue({
              id: "evt-1",
              title: "Mindfulness Workshop",
              maxCapacity: 20,
              isPublished: true,
              _count: { registrations: 10 },
            }),
          },
          eventRegistration: {
            findUnique: vi.fn().mockResolvedValue({ id: "existing-reg-1" }),
          },
        };
        return cb(tx);
      });

      await expect(
        EventService.registerForEvent("u-client-1", "evt-1")
      ).rejects.toThrow(ConflictError);
    });

    it("creates registration when capacity is available", async () => {
      vi.mocked(prisma.clientProfile.findUnique).mockResolvedValue({ id: "client-1" } as any);

      vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => {
        const tx = {
          event: {
            findUnique: vi.fn().mockResolvedValue({
              id: "evt-1",
              title: "Mindfulness Workshop",
              maxCapacity: 20,
              isPublished: true,
              _count: { registrations: 5 },
            }),
          },
          eventRegistration: {
            findUnique: vi.fn().mockResolvedValue(null),
            create: vi.fn().mockResolvedValue({
              id: "reg-new-1",
              registeredAt: new Date(),
            }),
          },
        };
        return cb(tx);
      });

      const res = await EventService.registerForEvent("u-client-1", "evt-1");
      expect(res.registrationId).toBe("reg-new-1");
      expect(res.eventTitle).toBe("Mindfulness Workshop");
    });
  });
});
