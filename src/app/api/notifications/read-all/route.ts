import { NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/get-current-session";
import { requireAuthenticated } from "@/modules/authorization/guards";
import { NotificationService } from "@/modules/notifications/services/notification.service";
import { handleApiError } from "@/shared/errors";

export async function POST() {
  try {
    const session = await getCurrentSession();
    const authed = requireAuthenticated(session);

    await NotificationService.markAllAsRead(authed.user.id);
    return NextResponse.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    return handleApiError(error);
  }
}
