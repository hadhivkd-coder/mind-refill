import { NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/get-current-session";
import { requireRole } from "@/modules/authorization/guards";
import { UserRole } from "@prisma/client";
import { SettlementService } from "@/modules/payouts/services/settlement.service";
import { handleApiError } from "@/shared/errors";

export async function GET() {
  try {
    const session = await getCurrentSession();
    const authed = requireRole(session, UserRole.PSYCHOLOGIST);

    const earnings = await SettlementService.getPsychologistEarnings(authed.user.id);
    return NextResponse.json({ success: true, data: earnings });
  } catch (error) {
    return handleApiError(error);
  }
}
