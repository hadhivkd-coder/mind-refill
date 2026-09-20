import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/get-current-session";
import { requireAuthenticated } from "@/modules/authorization/guards";
import { VerificationService } from "@/modules/verification/services/verification.service";
import { formatSafeError, AppError } from "@/shared/errors";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    requireAuthenticated(session);

    const signedUrl = await VerificationService.getSignedDocumentUrl(
      params.id,
      session!
    );

    return NextResponse.json({ signedUrl });
  } catch (error: unknown) {
    const safe = formatSafeError(error);
    const status = error instanceof AppError ? error.statusCode : safe.statusCode;
    return NextResponse.json({ error: safe.message, code: safe.code }, { status });
  }
}
