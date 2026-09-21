import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/modules/identity/auth.service";
import { formatSafeError, AppError } from "@/shared/errors";
import { MemoryRateLimiter } from "@/shared/security/rate-limiter";
import { SESSION_COOKIE_NAME, getSessionCookieOptions } from "@/shared/security/cookies";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    MemoryRateLimiter.check(ip, "login");

    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email or password format" },
        { status: 400 }
      );
    }

    const { sessionToken, signedSessionToken, expiresAt, user } = await AuthService.login({
      email: parsed.data.email,
      password: parsed.data.password,
      ipAddress: ip,
      userAgent: req.headers.get("user-agent"),
    });

    // Reset rate limiter on successful authentication
    MemoryRateLimiter.reset(ip, "login");

    const response = NextResponse.json(
      {
        message: "Login successful",
        user,
      },
      { status: 200 }
    );

    const cookieOptions = getSessionCookieOptions(expiresAt);
    response.cookies.set(SESSION_COOKIE_NAME, signedSessionToken || sessionToken, cookieOptions);

    return response;
  } catch (error: unknown) {
    const safe = formatSafeError(error);
    const status = error instanceof AppError ? error.statusCode : safe.statusCode;
    return NextResponse.json({ error: safe.message, code: safe.code }, { status });
  }
}
