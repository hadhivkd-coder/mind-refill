import { NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/get-current-session";
import { formatSafeError, AppError, UnauthorizedError } from "@/shared/errors";

export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session) {
      throw new UnauthorizedError("Not authenticated");
    }

    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        isEmailVerified: session.user.isEmailVerified,
        roles: session.user.roles,
      },
    });
  } catch (error: unknown) {
    const safe = formatSafeError(error);
    const status = error instanceof AppError ? error.statusCode : safe.statusCode;
    return NextResponse.json({ error: safe.message, code: safe.code }, { status });
  }
}
