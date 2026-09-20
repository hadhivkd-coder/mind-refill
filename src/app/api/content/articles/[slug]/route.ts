import { NextRequest, NextResponse } from "next/server";
import { ContentService } from "@/modules/content/services/content.service";
import { handleApiError } from "@/shared/errors";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const article = await ContentService.getPublicArticleBySlug(params.slug);
    return NextResponse.json({ success: true, data: article });
  } catch (error) {
    return handleApiError(error);
  }
}
