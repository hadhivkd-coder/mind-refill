import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/get-current-session";
import { requireAuthenticated } from "@/modules/authorization/guards";
import { CoordinationService } from "@/modules/coordination/services/coordination.service";
import { handleApiError } from "@/shared/errors";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    const authed = requireAuthenticated(session);

    await CoordinationService.releaseAssignment(authed, params.id);
    return NextResponse.json({ success: true, message: "Assignment released to triage pool" });
  } catch (error) {
    return handleApiError(error);
  }
}
