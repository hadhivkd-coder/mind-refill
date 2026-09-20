import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/get-current-session";
import { requireAuthenticated } from "@/modules/authorization/guards";
import { EbookService } from "@/modules/content/services/ebook.service";
import { handleApiError } from "@/shared/errors";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getCurrentSession();
    const authed = requireAuthenticated(session);

    const downloadUrl = await EbookService.getSecureDownloadUrl(authed, params.slug);
    return NextResponse.json({ success: true, downloadUrl });
  } catch (error) {
    return handleApiError(error);
  }
}
