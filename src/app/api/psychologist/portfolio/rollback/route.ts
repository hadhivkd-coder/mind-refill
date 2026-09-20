import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/get-current-session";
import { requireRole } from "@/modules/authorization/guards";
import { UserRole } from "@prisma/client";
import { PortfolioService } from "@/modules/portfolio/services/portfolio.service";
import { handleApiError, ValidationError } from "@/shared/errors";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const authed = requireRole(session, UserRole.PSYCHOLOGIST);

    const body = await req.json();
    if (typeof body.targetVersionNum !== "number") {
      throw new ValidationError("targetVersionNum (number) is required");
    }

    const version = await PortfolioService.rollbackToVersion(authed.user.id, body.targetVersionNum);
    return NextResponse.json({
      success: true,
      message: `Rolled back to version ${body.targetVersionNum} as new draft Version ${version.versionNum}`,
      data: version,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
