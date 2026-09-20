import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/modules/identity/auth.service";
import { formatSafeError, AppError } from "@/shared/errors";
import { MemoryRateLimiter } from "@/shared/security/rate-limiter";
import { z } from "zod";
import { UserRole } from "@prisma/client";

const registerSchema = z.object({
  fullName: z
    .string({ required_error: "Full name is required" })
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(150, "Full name cannot exceed 150 characters"),
  email: z
    .string({ required_error: "Email address is required" })
    .trim()
    .email("Please enter a valid email address with a domain (e.g. name@example.com)")
    .max(255, "Email address is too long"),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters long")
    .max(100, "Password cannot exceed 100 characters"),
  role: z.enum([UserRole.CLIENT, UserRole.PSYCHOLOGIST]).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    MemoryRateLimiter.check(ip, "register");

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const firstErrorMessage =
        Object.values(fieldErrors).flat()[0] || "Validation failed. Please check the form.";
      return NextResponse.json(
        {
          error: firstErrorMessage,
          details: fieldErrors,
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
