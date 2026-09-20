import { NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/get-current-session";
import { requireAuthenticated } from "@/modules/authorization/guards";
import { IntakeService } from "@/modules/intake/services/intake.service";
import { handleApiError } from "@/shared/errors";

export async function GET() {
  try {
    const session = await getCurrentSession();
    const authed = requireAuthenticated(session);

    const requests = await IntakeService.getClientRequests(authed.user.id);
    return NextResponse.json({ success: true, data: requests });
  } catch (error) {
    return handleApiError(error);
  }
}
