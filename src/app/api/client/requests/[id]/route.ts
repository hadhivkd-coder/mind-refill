import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/get-current-session";
import { requireAuthenticated } from "@/modules/authorization/guards";
import { IntakeService } from "@/modules/intake/services/intake.service";
import { handleApiError } from "@/shared/errors";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    const authed = requireAuthenticated(session);

    const request = await IntakeService.getClientRequestById(authed.user.id, params.id);
    return NextResponse.json({ success: true, data: request });
  } catch (error) {
    return handleApiError(error);
  }
}
