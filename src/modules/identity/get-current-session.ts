import { cookies } from "next/headers";
import { SessionService, SessionWithUser } from "./session.service";
import { SESSION_COOKIE_NAME } from "@/shared/security/cookies";

/**
 * Retrieves and validates the current server session from HttpOnly cookies.
 * Usable inside Server Components, Server Actions, and API Route Handlers.
 */
export async function getCurrentSession(): Promise<SessionWithUser | null> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  return SessionService.validateSession(sessionCookie.value);
}
