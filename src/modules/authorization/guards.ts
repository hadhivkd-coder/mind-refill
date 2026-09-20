import { UnauthorizedError, ForbiddenError } from "@/shared/errors";
import { UserRole } from "@prisma/client";
import { Capability, hasCapability } from "./capabilities";
import { hasRole, hasAnyRole } from "./roles";
import { SessionWithUser, AuthenticatedUser } from "@/modules/identity/session.service";

/**
 * Ensures the request is from an authenticated user.
 */
export function requireAuthenticated(session: SessionWithUser | null): SessionWithUser {
  if (!session || !session.user || !session.user.isActive) {
    throw new UnauthorizedError("Authentication required to access this resource");
  }
  return session;
}

/**
 * Ensures the authenticated user has verified their email address.
 */
export function requireVerifiedEmail(session: SessionWithUser): SessionWithUser {
  requireAuthenticated(session);
  if (!session.user.isEmailVerified) {
    throw new ForbiddenError("Email verification is required to perform this action");
  }
  return session;
}

/**
 * Enforces that the user possesses a specific role.
 */
export function requireRole(session: SessionWithUser | null, role: UserRole): SessionWithUser {
  const authed = requireAuthenticated(session);
  if (!hasRole(authed.user.roles, role)) {
    throw new ForbiddenError(`Access denied: Requires ${role} role`);
  }
  return authed;
}

/**
 * Enforces that the user possesses at least one of the specified roles.
 */
export function requireAnyRole(session: SessionWithUser | null, roles: UserRole[]): SessionWithUser {
  const authed = requireAuthenticated(session);
  if (!hasAnyRole(authed.user.roles, roles)) {
    throw new ForbiddenError(`Access denied: Requires one of [${roles.join(", ")}] roles`);
  }
  return authed;
}

/**
 * Enforces fine-grained capability authorization.
 */
export function requireCapability(session: SessionWithUser | null, capability: Capability): SessionWithUser {
  const authed = requireAuthenticated(session);
  if (!hasCapability(authed.user.roles, capability)) {
    throw new ForbiddenError(`Access denied: Missing '${capability}' capability`);
  }
  return authed;
}

/**
 * Enforces resource ownership (prevents IDOR vulnerabilities).
 */
export function requireOwner(resourceOwnerId: string, currentUserId: string): void {
  if (!resourceOwnerId || !currentUserId || resourceOwnerId !== currentUserId) {
    throw new ForbiddenError("Access denied: You do not own this resource");
  }
}

/**
 * Enforces resource ownership with admin bypass.
 */
export function requireOwnerOrAdmin(resourceOwnerId: string, user: AuthenticatedUser): void {
  if (user.roles.includes(UserRole.ADMIN)) {
    return;
  }
  requireOwner(resourceOwnerId, user.id);
}

/**
 * Foundation for Phase 3 assignment-aware authorization.
 * Verifies that a coordinator is actively assigned to the requested resource.
 */
export function requireAssignedCoordinator(
  assignedCoordinatorId: string | null | undefined,
  currentUserId: string,
  userRoles: UserRole[]
): void {
  if (userRoles.includes(UserRole.ADMIN)) {
    return; // Admin can inspect any coordinator assignment
  }
  if (!assignedCoordinatorId || assignedCoordinatorId !== currentUserId) {
    throw new ForbiddenError("Access denied: You are not assigned to this request");
  }
}
