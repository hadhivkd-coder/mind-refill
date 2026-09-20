import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/get-current-session";
import { requireRole } from "@/modules/authorization/guards";
import { UserRole } from "@prisma/client";
import { PaymentService } from "@/modules/billing/services/payment.service";
import { handleApiError, ValidationError } from "@/shared/errors";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const authed = requireRole(session, UserRole.CLIENT);

    const body = await req.json();
    if (!body.appointmentId) {
      throw new ValidationError("appointmentId is required");
    }

    const intent = await PaymentService.createIntentForAppointment(authed.user.id, body.appointmentId);
    return NextResponse.json({ success: true, data: intent }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
