import { NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/get-current-session";
import { requireRole } from "@/modules/authorization/guards";
import { VerificationService } from "@/modules/verification/services/verification.service";
import { ProfileService } from "@/modules/profiles/services/profile.service";
import { formatSafeError, AppError } from "@/shared/errors";
import { UserRole } from "@prisma/client";

export async function POST() {
  try {
    const session = await getCurrentSession();
    requireRole(session, UserRole.PSYCHOLOGIST);

    const profile = await ProfileService.getPrivateProfileByUserId(session!.user.id);
    const updatedApp = await VerificationService.submitApplication(profile.id, session!.user.id);

    return NextResponse.json({
      message: "Verification application submitted successfully for administrative review",
      application: updatedApp,
    });
  } catch (error: unknown) {
    const safe = formatSafeError(error);
    const status = error instanceof AppError ? error.statusCode : safe.statusCode;
    return NextResponse.json({ error: safe.message, code: safe.code }, { status });
  }
}
