import { env } from "@/shared/config/env";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export const SESSION_COOKIE_NAME = env.SESSION_COOKIE_NAME;

export function getSessionCookieOptions(expiresAt: Date): Partial<ResponseCookie> {
  const isProduction = env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  };
}

export function getExpiredSessionCookieOptions(): Partial<ResponseCookie> {
  const isProduction = env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  };
}
