import { NextRequest, NextResponse } from "next/server";
import { ContentService } from "@/modules/content/services/content.service";
import { handleApiError } from "@/shared/errors";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const contentType = searchParams.get("contentType") || undefined;

    const data = await ContentService.listPublicArticles(page, limit, contentType);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleApiError(error);
  }
}
