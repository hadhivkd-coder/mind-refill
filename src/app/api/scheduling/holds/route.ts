import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/get-current-session";
import { requireAuthenticated } from "@/modules/authorization/guards";
import { BookingHoldService } from "@/modules/scheduling/services/booking-hold.service";
import { handleApiError } from "@/shared/errors";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const authed = requireAuthenticated(session);

    const body = await req.json();
    const hold = await BookingHoldService.createHold(authed.user.id, body);

    return NextResponse.json({ success: true, data: hold }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
