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
    if (!body.noteText || typeof body.noteText !== "string" || body.noteText.trim().length === 0) {
      throw new ValidationError("noteText is required");
    }

    await CoordinationService.addNote(authed, params.id, body.noteText);
    return NextResponse.json({ success: true, message: "Coordination note recorded" }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
