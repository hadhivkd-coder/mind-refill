import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/modules/identity/auth.service";
import { formatSafeError, AppError } from "@/shared/errors";
import { MemoryRateLimiter } from "@/shared/security/rate-limiter";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    MemoryRateLimiter.check(ip, "forgotPassword");

    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Valid email address required" }, { status: 400 });
    }

    const result = await AuthService.requestPasswordReset(parsed.data.email);

    // Generic response regardless of whether email exists (enumeration prevention)
    return NextResponse.json(
      {
        message: "If an account exists with this email, a password reset link has been dispatched.",
        resetToken:
          process.env.NODE_ENV !== "production" ? result.rawToken : undefined,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const safe = formatSafeError(error);
    const status = error instanceof AppError ? error.statusCode : safe.statusCode;
    return NextResponse.json({ error: safe.message, code: safe.code }, { status });
  }
}
