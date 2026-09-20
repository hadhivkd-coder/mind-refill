import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/get-current-session";
import { requireAuthenticated } from "@/modules/authorization/guards";
import { CoordinationService } from "@/modules/coordination/services/coordination.service";
import { handleApiError } from "@/shared/errors";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    const authed = requireAuthenticated(session);

    let targetCoordinatorStaffId: string | undefined;
    try {
      const body = await req.json();
      targetCoordinatorStaffId = body.targetCoordinatorStaffId;
    } catch {
      // Body is optional (self-assign)
    }

    await CoordinationService.assignCoordinator(authed, params.id, targetCoordinatorStaffId);
    return NextResponse.json({ success: true, message: "Coordinator assigned successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
