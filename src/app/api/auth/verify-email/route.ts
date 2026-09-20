import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/modules/identity/auth.service";
import { formatSafeError, AppError } from "@/shared/errors";
import { MemoryRateLimiter } from "@/shared/security/rate-limiter";
import { z } from "zod";

const verifySchema = z.object({
  token: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    MemoryRateLimiter.check(ip, "verifyEmail");

    const body = await req.json();
    const parsed = verifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Verification token is required" }, { status: 400 });
    }

    const result = await AuthService.verifyEmail(parsed.data.token);

    return NextResponse.json(
      {
        message: "Email verified successfully. You can now sign in.",
        email: result.email,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const safe = formatSafeError(error);
    const status = error instanceof AppError ? error.statusCode : safe.statusCode;
    return NextResponse.json({ error: safe.message, code: safe.code }, { status });
  }
}
