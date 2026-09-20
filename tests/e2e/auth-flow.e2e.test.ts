import { describe, it, expect, vi } from "vitest";
import { AuthService } from "@/modules/identity/auth.service";
import { SessionService } from "@/modules/identity/session.service";
import { requireRole, requireVerifiedEmail } from "@/modules/authorization/guards";
import { UserRole } from "@prisma/client";
import { ForbiddenError } from "@/shared/errors";
import { TokenService } from "@/modules/identity/token.service";
import { PasswordService } from "@/modules/identity/password.service";
import { prisma } from "@/shared/database/prisma";

vi.mock("@/shared/database/prisma", () => {
  const inMemoryUsers: any[] = [];
  const inMemoryTokens: any[] = [];
  const inMemorySessions: any[] = [];

  return {
    prisma: {
      user: {
        findUnique: vi.fn(({ where }) => {
          return Promise.resolve(inMemoryUsers.find((u) => u.email === where.email || u.id === where.id) || null);
        }),
        create: vi.fn(({ data }) => {
          const newUser = {
            id: `usr-${Date.now()}-${Math.random()}`,
            email: data.email,
            passwordHash: data.passwordHash,
            isEmailVerified: data.isEmailVerified ?? false,
            emailVerifiedAt: null,
            isActive: true,
            roles: data.roles?.create ? [{ role: data.roles.create.role }] : [],
          };
          inMemoryUsers.push(newUser);
          return Promise.resolve(newUser);
        }),
        update: vi.fn(({ where, data }) => {
          const user = inMemoryUsers.find((u) => u.id === where.id);
          if (user) {
            Object.assign(user, data);
          }
          return Promise.resolve(user);
        }),
      },
      clientProfile: { create: vi.fn().mockResolvedValue({}) },
      psychologistProfile: { create: vi.fn().mockResolvedValue({}) },
      staffProfile: { create: vi.fn().mockResolvedValue({}) },
      emailVerificationToken: {
        create: vi.fn(({ data }) => {
          inMemoryTokens.push(data);
          return Promise.resolve(data);
        }),
        findUnique: vi.fn(({ where }) => {
          return Promise.resolve(inMemoryTokens.find((t) => t.tokenHash === where.tokenHash) || null);
        }),
        deleteMany: vi.fn(({ where }) => {
          const idx = inMemoryTokens.findIndex((t) => t.email === where.email);
          if (idx !== -1) inMemoryTokens.splice(idx, 1);
          return Promise.resolve({ count: 1 });
        }),
      },
      passwordResetToken: {
        create: vi.fn(({ data }) => {
          inMemoryTokens.push(data);
          return Promise.resolve(data);
        }),
        findUnique: vi.fn(({ where }) => {
          return Promise.resolve(inMemoryTokens.find((t) => t.tokenHash === where.tokenHash) || null);
        }),
        deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      session: {
        create: vi.fn(({ data }) => {
          inMemorySessions.push(data);
          return Promise.resolve(data);
        }),
        findUnique: vi.fn(({ where }) => {
          const sess = inMemorySessions.find((s) => s.tokenHash === where.tokenHash);
          if (!sess) return Promise.resolve(null);
          const user = inMemoryUsers.find((u) => u.id === sess.userId);
          return Promise.resolve({ ...sess, id: "sess-id-1", user });
        }),
        update: vi.fn().mockResolvedValue({}),
        deleteMany: vi.fn(({ where }) => {
          const initialLen = inMemorySessions.length;
          for (let i = inMemorySessions.length - 1; i >= 0; i--) {
            if (inMemorySessions[i].userId === where?.userId || inMemorySessions[i].tokenHash === where?.tokenHash) {
              inMemorySessions.splice(i, 1);
            }
          }
          return Promise.resolve({ count: initialLen - inMemorySessions.length });
        }),
      },
      auditLog: { create: vi.fn().mockResolvedValue({}) },
      $transaction: vi.fn((arg) => {
        if (typeof arg === "function") {
          return arg(prisma);
        }
        return Promise.all(arg);
      }),
    },
  };
});

describe("E2E Authentication & Authorization Journey", () => {
  it("executes full lifecycle: Register -> Email Verification -> Login -> RBAC Gate -> Logout", async () => {
    // 1. Client registers
    const registration = await AuthService.register({
      fullName: "E2E Test Client",
      email: "e2e_client@platform.test",
      password: "SuperSecretPassword123!",
      role: UserRole.CLIENT,
    });

    expect(registration.userId).toBeDefined();
    expect(registration.rawVerificationToken).toHaveLength(64);

    // 2. Try logging in before email verification
    const loginResult = await AuthService.login({
      email: "e2e_client@platform.test",
      password: "SuperSecretPassword123!",
    });
    expect(loginResult.sessionToken).toBeDefined();

    // Validate session server-side
    const initialSession = await SessionService.validateSession(loginResult.sessionToken);
    expect(initialSession).not.toBeNull();
    expect(initialSession!.user.isEmailVerified).toBe(false);

    // Guard rejects unverified access for verified-only capabilities
    expect(() => requireVerifiedEmail(initialSession!)).toThrow(ForbiddenError);

    // 3. User verifies their email via link token
    const verification = await AuthService.verifyEmail(registration.rawVerificationToken);
    expect(verification.success).toBe(true);

    // Validate session now reflects verified status
    const verifiedSession = await SessionService.validateSession(loginResult.sessionToken);
    expect(verifiedSession!.user.isEmailVerified).toBe(true);
    expect(() => requireVerifiedEmail(verifiedSession!)).not.toThrow();

    // 4. Role-based access control tests
    // Client can access client dashboard
    expect(() => requireRole(verifiedSession, UserRole.CLIENT)).not.toThrow();

    // Client is blocked from psychologist and admin dashboards
    expect(() => requireRole(verifiedSession, UserRole.PSYCHOLOGIST)).toThrow(ForbiddenError);
    expect(() => requireRole(verifiedSession, UserRole.ADMIN)).toThrow(ForbiddenError);

    // 5. User logs out
    await AuthService.logout(loginResult.sessionToken);

    // Session is immediately invalidated server-side
    const postLogoutSession = await SessionService.validateSession(loginResult.sessionToken);
    expect(postLogoutSession).toBeNull();
  });
});
