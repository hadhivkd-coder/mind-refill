import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/get-current-session";
import { requireRole } from "@/modules/authorization/guards";
import { UserRole } from "@prisma/client";
import { EventService } from "@/modules/events/services/event.service";
import { handleApiError } from "@/shared/errors";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    const authed = requireRole(session, UserRole.CLIENT);

    const result = await EventService.registerForEvent(authed.user.id, params.id);
    return NextResponse.json({
      success: true,
      message: `Successfully registered for ${result.eventTitle}`,
      data: result,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
