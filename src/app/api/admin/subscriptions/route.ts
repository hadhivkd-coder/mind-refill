import { NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/get-current-session";
import { requireRole } from "@/modules/authorization/guards";
import { UserRole } from "@prisma/client";
import { SubscriptionService } from "@/modules/subscriptions/services/subscription.service";
import { handleApiError } from "@/shared/errors";

export async function GET() {
  try {
    const session = await getCurrentSession();
    const authed = requireRole(session, UserRole.ADMIN);

    const subscriptions = await SubscriptionService.listAdminSubscriptions(authed);
    return NextResponse.json({ success: true, data: subscriptions });
  } catch (error) {
    return handleApiError(error);
  }
}
