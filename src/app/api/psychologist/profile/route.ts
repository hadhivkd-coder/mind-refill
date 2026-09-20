import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/get-current-session";
import { requireAuthenticated, requireRole } from "@/modules/authorization/guards";
import { ProfileService } from "@/modules/profiles/services/profile.service";
import { formatSafeError, AppError } from "@/shared/errors";
import { UserRole } from "@prisma/client";

export async function GET() {
  try {
    const session = await getCurrentSession();
    requireRole(session, UserRole.PSYCHOLOGIST);

    const profile = await ProfileService.getPrivateProfileByUserId(session!.user.id);
    return NextResponse.json(profile);
  } catch (error: unknown) {
    const safe = formatSafeError(error);
    const status = error instanceof AppError ? error.statusCode : safe.statusCode;
    return NextResponse.json({ error: safe.message, code: safe.code }, { status });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    requireRole(session, UserRole.PSYCHOLOGIST);

    const currentProfile = await ProfileService.getPrivateProfileByUserId(session!.user.id);
    const body = await req.json();

    const updated = await ProfileService.updateProfile(
      currentProfile.id,
      session!.user.id,
      body
    );

    return NextResponse.json({
      message: "Profile updated successfully",
      profile: updated,
    });
  } catch (error: unknown) {
    const safe = formatSafeError(error);
    const status = error instanceof AppError ? error.statusCode : safe.statusCode;
    return NextResponse.json({ error: safe.message, code: safe.code }, { status });
  }
}
