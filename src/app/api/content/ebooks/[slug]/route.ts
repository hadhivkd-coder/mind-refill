import { NextRequest, NextResponse } from "next/server";
import { EbookService } from "@/modules/content/services/ebook.service";
import { handleApiError } from "@/shared/errors";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const ebook = await EbookService.getPublicEbookBySlug(params.slug);
    return NextResponse.json({ success: true, data: ebook });
  } catch (error) {
    return handleApiError(error);
  }
}
