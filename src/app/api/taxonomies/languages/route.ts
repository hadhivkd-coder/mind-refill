import { NextResponse } from "next/server";
import { TaxonomyService } from "@/modules/profiles/services/taxonomy.service";
import { formatSafeError, AppError } from "@/shared/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const languages = await TaxonomyService.getActiveLanguages();
    return NextResponse.json(languages);
  } catch (error: unknown) {
    const safe = formatSafeError(error);
    const status = error instanceof AppError ? error.statusCode : safe.statusCode;
    return NextResponse.json({ error: safe.message, code: safe.code }, { status });
  }
}
