import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/get-current-session";
import { requireAuthenticated } from "@/modules/authorization/guards";
import { CoordinationService } from "@/modules/coordination/services/coordination.service";
import { CounselingRequestStatus } from "@prisma/client";
import { handleApiError } from "@/shared/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const authed = requireAuthenticated(session);

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");
    const assignedToMe = searchParams.get("assignedToMe") === "true";
    const unassigned = searchParams.get("unassigned") === "true";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const queue = await CoordinationService.getQueue(authed, {
      status: statusParam ? (statusParam as CounselingRequestStatus) : undefined,
      assignedToMe,
      unassigned,
      page,
      limit,
    });

    return NextResponse.json({ success: true, ...queue });
  } catch (error) {
    return handleApiError(error);
  }
}
