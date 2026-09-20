import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/get-current-session";
import { requireRole } from "@/modules/authorization/guards";
import { UserRole } from "@prisma/client";
import { ContentService } from "@/modules/content/services/content.service";
import { handleApiError, ValidationError } from "@/shared/errors";

export async function GET() {
  try {
    const session = await getCurrentSession();
    const authed = requireRole(session, UserRole.PSYCHOLOGIST);

    const articles = await ContentService.listPsychologistArticles(authed.user.id);
    return NextResponse.json({ success: true, data: articles });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const authed = requireRole(session, UserRole.PSYCHOLOGIST);

    const body = await req.json();
    if (!body.title || !body.body) {
      throw new ValidationError("title and body are required");
    }

    const article = await ContentService.createArticle(authed.user.id, body);
    return NextResponse.json({ success: true, message: "Draft article created", data: article }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
