import { NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/get-current-session";
import { requireRole } from "@/modules/authorization/guards";
import { UserRole } from "@prisma/client";
import { SubscriptionService } from "@/modules/subscriptions/services/subscription.service";
import { handleApiError } from "@/shared/errors";

export async function POST() {
  try {
    const session = await getCurrentSession();
    const authed = requireRole(session, UserRole.PSYCHOLOGIST);

    const cancelled = await SubscriptionService.cancelSubscription(authed.user.id);
    return NextResponse.json({
      success: true,
      message: "Subscription set to cancel at end of current period",
      data: cancelled,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
