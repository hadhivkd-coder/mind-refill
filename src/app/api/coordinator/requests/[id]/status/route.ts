import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/get-current-session";
import { requireAuthenticated } from "@/modules/authorization/guards";
import { CoordinationService } from "@/modules/coordination/services/coordination.service";
import { CounselingRequestStatus } from "@prisma/client";
import { handleApiError, ValidationError } from "@/shared/errors";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    const authed = requireAuthenticated(session);

    const body = await req.json();
    if (!body.status || !Object.values(CounselingRequestStatus).includes(body.status)) {
      throw new ValidationError("Valid status is required");
    }

    await CoordinationService.updateStatus(authed, params.id, body.status, body.reason);
    return NextResponse.json({ success: true, message: `Status updated to ${body.status}` });
  } catch (error) {
    return handleApiError(error);
  }
}
