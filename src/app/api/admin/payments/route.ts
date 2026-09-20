import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/get-current-session";
import { requireRole } from "@/modules/authorization/guards";
import { UserRole } from "@prisma/client";
import { PaymentService } from "@/modules/billing/services/payment.service";
import { handleApiError } from "@/shared/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const authed = requireRole(session, UserRole.ADMIN);

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const data = await PaymentService.listAdminTransactions(authed, page, limit);
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    return handleApiError(error);
  }
}
