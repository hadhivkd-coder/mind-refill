import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/get-current-session";
import { requireRole } from "@/modules/authorization/guards";
import { UserRole } from "@prisma/client";
import { AvailabilityService } from "@/modules/scheduling/services/availability.service";
import { ProfileService } from "@/modules/profiles/services/profile.service";
import { handleApiError } from "@/shared/errors";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const authed = requireRole(session, UserRole.PSYCHOLOGIST);

    const profile = await ProfileService.getPrivateProfileByUserId(authed.user.id);
    const body = await req.json();

    const exception = await AvailabilityService.addException(profile.id, body);
    return NextResponse.json({ success: true, message: "Exception added", data: exception }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
