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
    if (!body.title) {
      throw new ValidationError("title is required");
    }

    const payload = {
      title: body.title,
      summary: body.summary || (body.mediaUrl ? JSON.stringify({ mediaUrl: body.mediaUrl, tag: body.tag }) : body.tag || null),
      body: body.body || body.title,
      contentType: body.contentType || "POST",
      publishImmediately: body.publishImmediately !== false, // default publish to profile
    };

    const article = await ContentService.createArticle(authed.user.id, payload);
    return NextResponse.json(
      { success: true, message: "Published to your profile", data: article },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const authed = requireRole(session, UserRole.PSYCHOLOGIST);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      throw new ValidationError("id parameter is required");
    }

    await ContentService.deleteArticle(authed, id);
    return NextResponse.json({ success: true, message: "Item deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
