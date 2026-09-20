import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/get-current-session";
import { requireAuthenticated } from "@/modules/authorization/guards";
import { BookingHoldService } from "@/modules/scheduling/services/booking-hold.service";
import { handleApiError } from "@/shared/errors";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    const authed = requireAuthenticated(session);

    await BookingHoldService.releaseHold(params.id, authed.user.id);
    return NextResponse.json({ success: true, message: "Booking hold released" });
  } catch (error) {
    return handleApiError(error);
  }
}
