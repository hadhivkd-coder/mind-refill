import { NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/get-current-session";
import { requireRole } from "@/modules/authorization/guards";
import { UserRole } from "@prisma/client";
import { AnalyticsService } from "@/modules/analytics/services/analytics.service";
import { handleApiError } from "@/shared/errors";

export async function GET() {
  try {
    const session = await getCurrentSession();
    const authed = requireRole(session, UserRole.ADMIN);

    const stats = await AnalyticsService.getAdminPlatformAnalytics(authed);
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    return handleApiError(error);
  }
}
