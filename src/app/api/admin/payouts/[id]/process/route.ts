import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/get-current-session";
import { requireRole } from "@/modules/authorization/guards";
import { UserRole } from "@prisma/client";
import { PayoutService } from "@/modules/payouts/services/payout.service";
import { handleApiError, ValidationError } from "@/shared/errors";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    const authed = requireRole(session, UserRole.ADMIN);

    const body = await req.json();
    if (!body.payoutReference) {
      throw new ValidationError("payoutReference is required");
    }

    const payout = await PayoutService.processPayout(authed, params.id, body.payoutReference);
    return NextResponse.json({ success: true, message: "Payout marked as processed and paid", data: payout });
  } catch (error) {
    return handleApiError(error);
  }
}
