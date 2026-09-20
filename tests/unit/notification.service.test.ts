import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotificationService } from "@/modules/notifications/services/notification.service";
import { prisma } from "@/shared/database/prisma";
import { NotFoundError, ValidationError } from "@/shared/errors";

vi.mock("@/shared/database/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    notification: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      count: vi.fn(),
    },
    notificationDelivery: {
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

describe("NotificationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sendNotification", () => {
    it("validates required title and message", async () => {
      await expect(
        NotificationService.sendNotification({
          userId: "u-1",
          title: "",
          message: "Test message",
        })
      ).rejects.toThrow(ValidationError);
    });

    it("throws NotFoundError if target user does not exist", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(
        NotificationService.sendNotification({
          userId: "u-nonexistent",
          title: "Session Reminder",
          message: "Your counseling session is in 1 hour",
        })
      ).rejects.toThrow(NotFoundError);
    });

    it("creates multi-channel deliveries for in-app and email", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "u-1",
        email: "client@example.com",
      } as any);

      vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => {
        const tx = {
          notification: {
            create: vi.fn().mockResolvedValue({
              id: "notif-1",
              title: "Session Confirmed",
              message: "Your session is scheduled.",
            }),
          },
          notificationDelivery: {
            create: vi.fn(),
          },
        };
        return cb(tx);
      });

      const notif = await NotificationService.sendNotification({
        userId: "u-1",
        title: "Session Confirmed",
        message: "Your session is scheduled.",
        channels: ["IN_APP", "EMAIL"],
      });

      expect(notif.id).toBe("notif-1");
    });
  });

  describe("markAsRead", () => {
    it("throws NotFoundError if notification belongs to another user", async () => {
      vi.mocked(prisma.notification.findUnique).mockResolvedValue({
        id: "notif-1",
        userId: "other-user",
      } as any);

      await expect(
        NotificationService.markAsRead("my-user", "notif-1")
      ).rejects.toThrow(NotFoundError);
    });

    it("marks notification as read", async () => {
      vi.mocked(prisma.notification.findUnique).mockResolvedValue({
        id: "notif-1",
        userId: "my-user",
      } as any);
      vi.mocked(prisma.notification.update).mockResolvedValue({
        id: "notif-1",
        isRead: true,
      } as any);

      const res = await NotificationService.markAsRead("my-user", "notif-1");
      expect(res.isRead).toBe(true);
    });
  });
});
