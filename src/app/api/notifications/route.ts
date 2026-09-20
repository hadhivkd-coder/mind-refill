import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/get-current-session";
import { requireAuthenticated } from "@/modules/authorization/guards";
import { NotificationService } from "@/modules/notifications/services/notification.service";
import { handleApiError } from "@/shared/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const authed = requireAuthenticated(session);

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    const [notifications, unreadCount] = await Promise.all([
      NotificationService.getUserNotifications(authed.user.id, unreadOnly),
      NotificationService.getUnreadCount(authed.user.id),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
