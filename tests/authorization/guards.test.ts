import { describe, it, expect } from "vitest";
import {
  requireAuthenticated,
  requireRole,
  requireAnyRole,
  requireCapability,
  requireOwner,
  requireOwnerOrAdmin,
  requireVerifiedEmail,
  requireAssignedCoordinator,
} from "@/modules/authorization/guards";
import { UnauthorizedError, ForbiddenError } from "@/shared/errors";
import { UserRole } from "@prisma/client";
import { SessionWithUser } from "@/modules/identity/session.service";

function createMockSession(role: UserRole, isVerified = true, userId = "user-1"): SessionWithUser {
  return {
    sessionId: "sess-1",
    expiresAt: new Date(Date.now() + 10000),
    user: {
      id: userId,
      email: `${role.toLowerCase()}@example.com`,
      isEmailVerified: isVerified,
      isActive: true,
      roles: [role],
    },
  };
}

describe("Server-Side Authorization Guards", () => {
  it("14. denies access to unauthenticated sessions", () => {
    expect(() => requireAuthenticated(null)).toThrow(UnauthorizedError);
  });

  it("15, 16, 17. denies client from accessing psychologist, coordinator, and admin roles", () => {
    const clientSession = createMockSession(UserRole.CLIENT);

    // Client allowed client role
    expect(() => requireRole(clientSession, UserRole.CLIENT)).not.toThrow();

    // 15. Client denied psychologist role
    expect(() => requireRole(clientSession, UserRole.PSYCHOLOGIST)).toThrow(ForbiddenError);

    // 16. Client denied coordinator role
    expect(() => requireRole(clientSession, UserRole.COORDINATOR)).toThrow(ForbiddenError);

    // 17. Client denied admin role
    expect(() => requireRole(clientSession, UserRole.ADMIN)).toThrow(ForbiddenError);
  });

  it("18. denies psychologist from accessing admin dashboard", () => {
    const psychSession = createMockSession(UserRole.PSYCHOLOGIST);
    expect(() => requireRole(psychSession, UserRole.ADMIN)).toThrow(ForbiddenError);
  });

  it("19. denies coordinator from accessing admin dashboard", () => {
    const coordSession = createMockSession(UserRole.COORDINATOR);
    expect(() => requireRole(coordSession, UserRole.ADMIN)).toThrow(ForbiddenError);
  });

  it("20. prevents IDOR cross-user resource access via requireOwner", () => {
    const currentUserId = "user-alice";
    const foreignResourceId = "user-bob";

    // Same user: allowed
    expect(() => requireOwner(currentUserId, currentUserId)).not.toThrow();

    // Different user ID: denied
    expect(() => requireOwner(foreignResourceId, currentUserId)).toThrow(ForbiddenError);
  });

  it("21. requireOwnerOrAdmin allows owner or administrator, denies unauthorized third party", () => {
    const clientUser = createMockSession(UserRole.CLIENT, true, "user-client").user;
    const adminUser = createMockSession(UserRole.ADMIN, true, "user-admin").user;
    const attackerUser = createMockSession(UserRole.CLIENT, true, "user-attacker").user;

    const resourceOwnerId = "user-client";

    // Owner allowed
    expect(() => requireOwnerOrAdmin(resourceOwnerId, clientUser)).not.toThrow();

    // Admin allowed
    expect(() => requireOwnerOrAdmin(resourceOwnerId, adminUser)).not.toThrow();

    // Attacker denied
    expect(() => requireOwnerOrAdmin(resourceOwnerId, attackerUser)).toThrow(ForbiddenError);
  });

  it("22. enforces fine-grained capability checks", () => {
    const clientSession = createMockSession(UserRole.CLIENT);
    const adminSession = createMockSession(UserRole.ADMIN);

    expect(() => requireCapability(adminSession, "settings.manage")).not.toThrow();
    expect(() => requireCapability(clientSession, "settings.manage")).toThrow(ForbiddenError);
  });

  it("23. blocks unverified users when email verification is required", () => {
    const unverifiedSession = createMockSession(UserRole.CLIENT, false);
    const verifiedSession = createMockSession(UserRole.CLIENT, true);

    expect(() => requireVerifiedEmail(unverifiedSession)).toThrow(ForbiddenError);
    expect(() => requireVerifiedEmail(verifiedSession)).not.toThrow();
  });

  it("24. enforces coordinator assignment scope", () => {
    const coordinatorId = "coord-1";
    const otherCoordinatorId = "coord-2";

    // Assigned coordinator: allowed
    expect(() =>
      requireAssignedCoordinator(coordinatorId, coordinatorId, [UserRole.COORDINATOR])
    ).not.toThrow();

    // Unassigned coordinator: denied
    expect(() =>
      requireAssignedCoordinator(coordinatorId, otherCoordinatorId, [UserRole.COORDINATOR])
    ).toThrow(ForbiddenError);

    // Admin: allowed bypass
    expect(() =>
      requireAssignedCoordinator(coordinatorId, "admin-id", [UserRole.ADMIN])
    ).not.toThrow();
  });
});
