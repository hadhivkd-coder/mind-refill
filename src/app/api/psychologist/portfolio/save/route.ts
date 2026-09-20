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
    if (!body.content) {
      throw new ValidationError("content is required");
    }

    const version = await PortfolioService.saveDraft(
      authed.user.id,
      body.content,
      body.styleName || "modern",
      body.changeNotes || "Manual update"
    );

    return NextResponse.json({
      success: true,
      message: `Version ${version.versionNum} saved as draft`,
      data: version,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
