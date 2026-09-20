import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/get-current-session";
import { requireRole } from "@/modules/authorization/guards";
import { UserRole } from "@prisma/client";
import { SubscriptionService } from "@/modules/subscriptions/services/subscription.service";
import { handleApiError, ValidationError } from "@/shared/errors";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const authed = requireRole(session, UserRole.PSYCHOLOGIST);

    const body = await req.json();
    if (!body.planCode) {
      throw new ValidationError("planCode is required");
    }

    const result = await SubscriptionService.subscribeToPlan(authed.user.id, body.planCode);
    return NextResponse.json({ success: true, message: `Subscribed to ${result.planName}`, data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
