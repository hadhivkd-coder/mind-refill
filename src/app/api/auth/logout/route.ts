import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/modules/identity/auth.service";
import { SESSION_COOKIE_NAME, getExpiredSessionCookieOptions } from "@/shared/security/cookies";

export async function POST(req: NextRequest) {
  const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME);

  if (sessionCookie?.value) {
    await AuthService.logout(sessionCookie.value);
  }

  const response = NextResponse.json(
    { message: "Logged out successfully" },
    { status: 200 }
  );

  response.cookies.set(SESSION_COOKIE_NAME, "", getExpiredSessionCookieOptions());
  return response;
}
