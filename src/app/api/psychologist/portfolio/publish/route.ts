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
    if (typeof body.versionNum !== "number") {
      throw new ValidationError("versionNum (number) is required");
    }

    const portfolio = await PortfolioService.publishVersion(authed.user.id, body.versionNum);
    return NextResponse.json({
      success: true,
      message: `Version ${body.versionNum} published to live profile!`,
      data: portfolio,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
