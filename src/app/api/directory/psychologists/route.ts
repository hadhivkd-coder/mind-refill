import { NextRequest, NextResponse } from "next/server";
import { DirectoryService } from "@/modules/directory/services/directory.service";
import { formatSafeError, AppError } from "@/shared/errors";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") ?? undefined;
    const specializationSlug = searchParams.get("specialization") ?? undefined;
    const languageCode = searchParams.get("language") ?? undefined;
    const minExperience = searchParams.get("experience") ? Number(searchParams.get("experience")) : undefined;
    const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 12;

    const result = await DirectoryService.search({
      query,
      specializationSlug,
      languageCode,
      minExperience,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const safe = formatSafeError(error);
    const status = error instanceof AppError ? error.statusCode : safe.statusCode;
    return NextResponse.json({ error: safe.message, code: safe.code }, { status });
  }
}
