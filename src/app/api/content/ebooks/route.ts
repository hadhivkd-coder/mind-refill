import { NextResponse } from "next/server";
import { EbookService } from "@/modules/content/services/ebook.service";
import { handleApiError } from "@/shared/errors";

export async function GET() {
  try {
    const ebooks = await EbookService.listPublicEbooks();
    return NextResponse.json({ success: true, data: ebooks });
  } catch (error) {
    return handleApiError(error);
  }
}
