import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/get-current-session";
import { requireRole } from "@/modules/authorization/guards";
import { UserRole } from "@prisma/client";
import { PortfolioService } from "@/modules/portfolio/services/portfolio.service";
import { handleApiError } from "@/shared/errors";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const authed = requireRole(session, UserRole.PSYCHOLOGIST);

    let body = {};
    try {
      body = await req.json();
    } catch {
      // Body is optional
    }

    const version = await PortfolioService.generateWithAi(authed.user.id, body);
    return NextResponse.json({
      success: true,
      message: `Version ${version.versionNum} generated successfully with AI`,
      data: version,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
