import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/get-current-session";
import { requireAuthenticated } from "@/modules/authorization/guards";
import { CoordinationService } from "@/modules/coordination/services/coordination.service";
import { handleApiError, ValidationError } from "@/shared/errors";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    const authed = requireAuthenticated(session);

    const body = await req.json();
    if (!body.psychologistProfileId) {
      throw new ValidationError("psychologistProfileId is required");
    }

    await CoordinationService.matchPsychologist(authed, params.id, body.psychologistProfileId);
    return NextResponse.json({ success: true, message: "Psychologist matched and assigned to request" });
  } catch (error) {
    return handleApiError(error);
  }
}
