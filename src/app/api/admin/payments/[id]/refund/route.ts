import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/get-current-session";
import { requireRole } from "@/modules/authorization/guards";
import { UserRole } from "@prisma/client";
import { PaymentService } from "@/modules/billing/services/payment.service";
import { handleApiError, ValidationError } from "@/shared/errors";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    const authed = requireRole(session, UserRole.ADMIN);

    const body = await req.json();
    if (!body.reason || body.reason.trim().length < 3) {
      throw new ValidationError("Valid refund reason is required");
    }

    const refundAmountMinor = body.amountMinor ? BigInt(body.amountMinor) : undefined;
    await PaymentService.refundTransaction(authed, params.id, body.reason, refundAmountMinor);

    return NextResponse.json({ success: true, message: "Refund processed successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
