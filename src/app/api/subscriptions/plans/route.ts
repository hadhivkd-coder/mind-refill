import { NextResponse } from "next/server";
import { SubscriptionService } from "@/modules/subscriptions/services/subscription.service";
import { handleApiError } from "@/shared/errors";

export async function GET() {
  try {
    const plans = await SubscriptionService.listPlans();
    return NextResponse.json({ success: true, data: plans });
  } catch (error) {
    return handleApiError(error);
  }
}
