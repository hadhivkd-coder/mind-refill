import { NextRequest, NextResponse } from "next/server";
import { TaxonomyService } from "@/modules/profiles/services/taxonomy.service";
import { getCurrentSession } from "@/modules/identity/get-current-session";
import { requireRole } from "@/modules/authorization/guards";
import { formatSafeError, AppError } from "@/shared/errors";
import { UserRole } from "@prisma/client";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createSpecSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(1000).optional(),
  isHighRisk: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
});

export async function GET() {
  try {
    const specializations = await TaxonomyService.getActiveSpecializations();
    return NextResponse.json(specializations);
  } catch (error: unknown) {
    const safe = formatSafeError(error);
    const status = error instanceof AppError ? error.statusCode : safe.statusCode;
    return NextResponse.json({ error: safe.message, code: safe.code }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    requireRole(session, UserRole.ADMIN);

    const body = await req.json();
    const parsed = createSpecSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid specialization data", details: parsed.error.format() }, { status: 400 });
    }

    const created = await TaxonomyService.createSpecialization(parsed.data);
    return NextResponse.json(created, { status: 201 });
  } catch (error: unknown) {
    const safe = formatSafeError(error);
    const status = error instanceof AppError ? error.statusCode : safe.statusCode;
    return NextResponse.json({ error: safe.message, code: safe.code }, { status });
  }
}
