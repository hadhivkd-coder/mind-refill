import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/get-current-session";
import { requireRole } from "@/modules/authorization/guards";
import { UserRole } from "@prisma/client";
import { AvailabilityService } from "@/modules/scheduling/services/availability.service";
import { ProfileService } from "@/modules/profiles/services/profile.service";
import { handleApiError } from "@/shared/errors";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    const authed = requireRole(session, UserRole.PSYCHOLOGIST);

    const profile = await ProfileService.getPrivateProfileByUserId(authed.user.id);
    await AvailabilityService.removeException(params.id, profile.id);

    return NextResponse.json({ success: true, message: "Exception removed" });
  } catch (error) {
    return handleApiError(error);
  }
}
