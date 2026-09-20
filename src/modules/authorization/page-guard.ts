import { redirect } from "next/navigation";
import { getCurrentSession } from "@/modules/identity/get-current-session";
import { UserRole } from "@prisma/client";
import { SessionWithUser } from "@/modules/identity/session.service";

/**
 * Server-side guard for App Router page components.
 * Redirects unauthenticated users to /login and unauthorized roles to /app/forbidden.
 */
export async function enforcePageRole(requiredRole: UserRole): Promise<SessionWithUser> {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (!session.user.roles.includes(requiredRole)) {
    redirect("/app/forbidden");
  }

  return session;
}
