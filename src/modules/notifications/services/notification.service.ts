import { prisma } from "@/shared/database/prisma";
import { NotFoundError, ValidationError } from "@/shared/errors";
import { MockEmailProvider } from "../providers/mock-email.provider";
import { EmailProvider } from "../providers/email-provider.interface";
import { AuditService } from "@/modules/audit/audit.service";

export interface SendNotificationInput {
  userId: string;
  title: string;
  message: string;
  linkUrl?: string;
  channels?: Array<"IN_APP" | "EMAIL">;
}

export class NotificationService {
  private static emailProvider: EmailProvider = new MockEmailProvider();

  /**
   * Dispatches a multi-channel notification (in-app and/or email).
   */
  static async sendNotification(input: SendNotificationInput) {
    if (!input.title || input.title.trim().length === 0) {
      throw new ValidationError("Notification title is required");
    }
    if (!input.message || input.message.trim().length === 0) {
      throw new ValidationError("Notification message is required");
    }

    const user = await prisma.user.findUnique({
      where: { id: input.userId },
      select: { id: true, email: true },
    });

    if (!user) throw new NotFoundError("Target notification recipient user not found");

    const channels = input.channels && input.channels.length > 0 ? input.channels : ["IN_APP"];

    return prisma.$transaction(async (tx) => {
      // 1. Create base Notification
      const notification = await tx.notification.create({
        data: {
          userId: input.userId,
          title: input.title.trim(),
          message: input.message.trim(),
          linkUrl: input.linkUrl?.trim() || null,
        },
      });

      // 2. Deliver via requested channels
      for (const channel of channels) {
        let status = "DELIVERED";

        if (channel === "EMAIL") {
          try {
            await this.emailProvider.sendEmail({
              to: user.email,
              subject: input.title,
              html: `<p>${input.message}</p>${
                input.linkUrl ? `<p><a href="${input.linkUrl}">View details</a></p>` : ""
              }`,
            });
          } catch {
            status = "FAILED";
          }
        }

        await tx.notificationDelivery.create({
          data: {
            notificationId: notification.id,
            channel,
            status,
          },
        });
      }

      await AuditService.log({
        actorUserId: input.userId,
        action: "NOTIFICATION_DISPATCHED",
        entityType: "Notification",
        entityId: notification.id,
        safeMetadata: { channels, title: input.title },
      });

      return notification;
    });
  }

  /**
   * Retrieves notifications for an authenticated user.
   */
  static async getUserNotifications(userId: string, unreadOnly = false) {
    const where: any = { userId };
    if (unreadOnly) where.isRead = false;

    return prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        deliveries: {
          select: { channel: true, status: true, sentAt: true },
        },
      },
    });
  }

  /**
   * Marks a specific notification as read.
   */
  static async markAsRead(userId: string, notificationId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      throw new NotFoundError("Notification not found");
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Marks all notifications as read for a user.
   */
  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Retrieves unread notification count.
   */
  static async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  }
}
