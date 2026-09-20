import { NextRequest, NextResponse } from "next/server";
import { ProfileService } from "@/modules/profiles/services/profile.service";
import { formatSafeError, AppError } from "@/shared/errors";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const profile = await ProfileService.getPublicProfileBySlug(params.slug);
    return NextResponse.json(profile);
  } catch (error: unknown) {
    const safe = formatSafeError(error);
    const status = error instanceof AppError ? error.statusCode : safe.statusCode;
    return NextResponse.json({ error: safe.message, code: safe.code }, { status });
  }
}
