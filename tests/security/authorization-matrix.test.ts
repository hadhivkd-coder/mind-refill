import { describe, it, expect } from "vitest";
import { UserRole } from "@prisma/client";
import {
  requireAuthenticated,
  requireVerifiedEmail,
  requireRole,
  requireAnyRole,
  requireCapability,
  requireOwner,
  requireOwnerOrAdmin,
  requireAssignedCoordinator,
} from "@/modules/authorization/guards";
import { UnauthorizedError, ForbiddenError } from "@/shared/errors";
import { SessionWithUser } from "@/modules/identity/session.service";
import { hasCapability, Capability } from "@/modules/authorization/capabilities";

function createMockSession(role: UserRole, overrides?: Partial<SessionWithUser["user"]>): SessionWithUser {
  return {
    sessionId: "sess-test-123",
    expiresAt: new Date(Date.now() + 3600000),
    user: {
      id: `usr-${role.toLowerCase()}-1`,
      email: `${role.toLowerCase()}@example.com`,
      roles: [role],
      isEmailVerified: true,
      isActive: true,
      ...overrides,
    },
  };
}

describe("Security Authorization Matrix & RBAC Boundaries", () => {
  const clientSession = createMockSession(UserRole.CLIENT);
  const psychologistSession = createMockSession(UserRole.PSYCHOLOGIST);
  const coordinatorSession = createMockSession(UserRole.COORDINATOR);
  const adminSession = createMockSession(UserRole.ADMIN);

  describe("Authentication State Enforcements", () => {
    it("rejects null or missing sessions with UnauthorizedError", () => {
      expect(() => requireAuthenticated(null)).toThrow(UnauthorizedError);
      expect(() => requireRole(null, UserRole.CLIENT)).toThrow(UnauthorizedError);
      expect(() => requireCapability(null, "clients.read")).toThrow(UnauthorizedError);
    });

    it("rejects deactivated users with UnauthorizedError", () => {
      const inactiveSession = createMockSession(UserRole.CLIENT, { isActive: false });
      expect(() => requireAuthenticated(inactiveSession)).toThrow(UnauthorizedError);
    });

    it("rejects unverified email accounts from sensitive actions", () => {
      const unverifiedSession = createMockSession(UserRole.PSYCHOLOGIST, { isEmailVerified: false });
      expect(() => requireVerifiedEmail(unverifiedSession)).toThrow(ForbiddenError);
      expect(() => requireVerifiedEmail(psychologistSession)).not.toThrow();
    });
  });

  describe("Role Boundaries (Matrix)", () => {
    it("CLIENT cannot access coordinator, psychologist, or admin privileges", () => {
      expect(() => requireRole(clientSession, UserRole.PSYCHOLOGIST)).toThrow(ForbiddenError);
      expect(() => requireRole(clientSession, UserRole.COORDINATOR)).toThrow(ForbiddenError);
      expect(() => requireRole(clientSession, UserRole.ADMIN)).toThrow(ForbiddenError);
      expect(() => requireAnyRole(clientSession, [UserRole.PSYCHOLOGIST, UserRole.ADMIN])).toThrow(ForbiddenError);

      expect(hasCapability(clientSession.user.roles, "psychologists.verify")).toBe(false);
      expect(hasCapability(clientSession.user.roles, "coordination.manage")).toBe(false);
      expect(hasCapability(clientSession.user.roles, "payments.manage")).toBe(false);
    });

    it("PSYCHOLOGIST cannot access coordinator or admin privileges", () => {
      expect(() => requireRole(psychologistSession, UserRole.COORDINATOR)).toThrow(ForbiddenError);
      expect(() => requireRole(psychologistSession, UserRole.ADMIN)).toThrow(ForbiddenError);

      expect(hasCapability(psychologistSession.user.roles, "coordination.manage")).toBe(false);
      expect(hasCapability(psychologistSession.user.roles, "psychologists.verify")).toBe(false);
      expect(hasCapability(psychologistSession.user.roles, "payments.manage")).toBe(false);
    });

    it("COORDINATOR cannot access admin-only operations or psychologist private payout records", () => {
      expect(() => requireRole(coordinatorSession, UserRole.ADMIN)).toThrow(ForbiddenError);
      expect(() => requireRole(coordinatorSession, UserRole.PSYCHOLOGIST)).toThrow(ForbiddenError);

      expect(hasCapability(coordinatorSession.user.roles, "payments.manage")).toBe(false);
      expect(hasCapability(coordinatorSession.user.roles, "settings.manage")).toBe(false);
    });

    it("ADMIN has supreme operational capabilities across all domains", () => {
      expect(() => requireRole(adminSession, UserRole.ADMIN)).not.toThrow();
      expect(hasCapability(adminSession.user.roles, "psychologists.verify")).toBe(true);
      expect(hasCapability(adminSession.user.roles, "coordination.manage")).toBe(true);
      expect(hasCapability(adminSession.user.roles, "payments.manage")).toBe(true);
      expect(hasCapability(adminSession.user.roles, "settings.manage")).toBe(true);
      expect(hasCapability(adminSession.user.roles, "audit.read")).toBe(true);
    });
  });

  describe("IDOR (Insecure Direct Object Reference) Protection", () => {
    const ownerId = "usr-owner-100";
    const foreignUserId = "usr-stranger-200";

    it("strictly blocks cross-user resource modifications (requireOwner)", () => {
      expect(() => requireOwner(ownerId, foreignUserId)).toThrow(ForbiddenError);
      expect(() => requireOwner(ownerId, ownerId)).not.toThrow();
    });

    it("allows resource owner or admin override, but blocks unrelated users (requireOwnerOrAdmin)", () => {
      expect(() => requireOwnerOrAdmin(ownerId, clientSession.user)).toThrow(ForbiddenError);

      const ownerSession = createMockSession(UserRole.CLIENT, { id: ownerId });
      expect(() => requireOwnerOrAdmin(ownerId, ownerSession.user)).not.toThrow();

      expect(() => requireOwnerOrAdmin(ownerId, adminSession.user)).not.toThrow();
    });

    it("enforces assigned coordinator isolation while permitting admin oversight", () => {
      const assignedCoordId = "usr-coord-assigned";
      const otherCoordId = "usr-coord-unrelated";

      // Unassigned coordinator is rejected
      expect(() =>
        requireAssignedCoordinator(assignedCoordId, otherCoordId, [UserRole.COORDINATOR])
      ).toThrow(ForbiddenError);

      // Assigned coordinator is permitted
      expect(() =>
        requireAssignedCoordinator(assignedCoordId, assignedCoordId, [UserRole.COORDINATOR])
      ).not.toThrow();

      // Admin can oversee unassigned cases
      expect(() =>
        requireAssignedCoordinator(assignedCoordId, otherCoordId, [UserRole.ADMIN])
      ).not.toThrow();
    });
  });
});
