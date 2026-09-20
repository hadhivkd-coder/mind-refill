import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/modules/identity/auth.service";
import { formatSafeError, AppError } from "@/shared/errors";
import { MemoryRateLimiter } from "@/shared/security/rate-limiter";
import { z } from "zod";
import { UserRole } from "@prisma/client";

const registerSchema = z.object({
  fullName: z.string().min(2).max(150),
  email: z.string().email().max(255),
  password: z.string().min(8).max(100),
  role: z.enum([UserRole.CLIENT, UserRole.PSYCHOLOGIST]).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    MemoryRateLimiter.check(ip, "register");

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const result = await AuthService.register({
      ...parsed.data,
      ipAddress: ip,
      userAgent: req.headers.get("user-agent"),
    });

    return NextResponse.json(
      {
        message: "Registration successful. Please check your email to verify your account.",
        userId: result.userId,
        email: result.email,
        // In local/test environments, output preview verification token
        verificationToken:
          process.env.NODE_ENV !== "production" ? result.rawVerificationToken : undefined,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const safe = formatSafeError(error);
    const status = error instanceof AppError ? error.statusCode : safe.statusCode;
    return NextResponse.json({ error: safe.message, code: safe.code }, { status });
  }
}
