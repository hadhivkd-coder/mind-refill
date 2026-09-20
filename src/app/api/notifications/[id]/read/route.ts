import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/get-current-session";
import { requireAuthenticated } from "@/modules/authorization/guards";
import { NotificationService } from "@/modules/notifications/services/notification.service";
import { handleApiError } from "@/shared/errors";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    const authed = requireAuthenticated(session);

    const notification = await NotificationService.markAsRead(authed.user.id, params.id);
    return NextResponse.json({ success: true, data: notification });
  } catch (error) {
    return handleApiError(error);
  }
}
