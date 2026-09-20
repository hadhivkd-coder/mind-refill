import { NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/get-current-session";
import { requireAuthenticated } from "@/modules/authorization/guards";
import { CoordinationService } from "@/modules/coordination/services/coordination.service";
import { handleApiError } from "@/shared/errors";

export async function GET() {
  try {
    const session = await getCurrentSession();
    const authed = requireAuthenticated(session);

    const followUps = await CoordinationService.getFollowUps(authed);
    return NextResponse.json({ success: true, ...followUps });
  } catch (error) {
    return handleApiError(error);
  }
}
