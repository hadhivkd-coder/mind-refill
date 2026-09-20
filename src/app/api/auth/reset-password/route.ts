import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/modules/identity/auth.service";
import { formatSafeError, AppError } from "@/shared/errors";
import { MemoryRateLimiter } from "@/shared/security/rate-limiter";
import { z } from "zod";

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    MemoryRateLimiter.check(ip, "resetPassword");

    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Valid reset token and password (min 8 characters) are required" },
        { status: 400 }
      );
    }

    await AuthService.resetPassword(parsed.data.token, parsed.data.password);

    return NextResponse.json(
      { message: "Password has been successfully updated. You can now log in." },
      { status: 200 }
    );
  } catch (error: unknown) {
    const safe = formatSafeError(error);
    const status = error instanceof AppError ? error.statusCode : safe.statusCode;
    return NextResponse.json({ error: safe.message, code: safe.code }, { status });
  }
}
