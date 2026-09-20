import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/get-current-session";
import { requireRole } from "@/modules/authorization/guards";
import { VerificationService } from "@/modules/verification/services/verification.service";
import { formatSafeError, AppError, ValidationError } from "@/shared/errors";
import { UserRole } from "@prisma/client";
import { z } from "zod";

const reviewSchema = z.object({
  outcomeStatus: z.enum(["VERIFIED", "REJECTED", "SUSPENDED"]),
  notes: z.string().max(1000).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    requireRole(session, UserRole.ADMIN);

    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError("Invalid review outcome. Must be VERIFIED, REJECTED, or SUSPENDED.");
    }

    const result = await VerificationService.reviewApplication(session!, {
      applicationId: params.id,
      outcomeStatus: parsed.data.outcomeStatus,
      notes: parsed.data.notes,
    });

    return NextResponse.json({
      message: `Application status successfully updated to ${parsed.data.outcomeStatus}`,
      application: result.application,
      review: result.review,
    });
  } catch (error: unknown) {
    const safe = formatSafeError(error);
    const status = error instanceof AppError ? error.statusCode : safe.statusCode;
    return NextResponse.json({ error: safe.message, code: safe.code }, { status });
  }
}
