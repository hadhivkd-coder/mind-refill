import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/get-current-session";
import { requireRole } from "@/modules/authorization/guards";
import { UserRole } from "@prisma/client";
import { PayoutService } from "@/modules/payouts/services/payout.service";
import { handleApiError, ValidationError } from "@/shared/errors";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const authed = requireRole(session, UserRole.ADMIN);

    const body = await req.json();
    if (!body.psychologistProfileId) {
      throw new ValidationError("psychologistProfileId is required");
    }

    const payout = await PayoutService.createPayoutBatch(authed, body.psychologistProfileId);
    return NextResponse.json({ success: true, message: "Payout batch created", data: payout }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
