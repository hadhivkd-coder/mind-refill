import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "@/modules/identity/auth.service";
import { SessionService } from "@/modules/identity/session.service";
import { PasswordService } from "@/modules/identity/password.service";
import { TokenService } from "@/modules/identity/token.service";
import { prisma } from "@/shared/database/prisma";
import { ConflictError, UnauthorizedError, ValidationError } from "@/shared/errors";
import { UserRole } from "@prisma/client";

vi.mock("@/shared/database/prisma", () => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    clientProfile: {
      create: vi.fn(),
    },
    psychologistProfile: {
      create: vi.fn(),
    },
    staffProfile: {
      create: vi.fn(),
    },
    emailVerificationToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      deleteMany: vi.fn(),
    },
    passwordResetToken: {
      create: vi.fn(),
      findUnique: vi.fn(),
      deleteMany: vi.fn(),
    },
    session: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
    },
    $transaction: vi.fn((callback) => {
      if (typeof callback === "function") {
        return callback(mockPrisma);
      }
      return Promise.all(callback);
    }),
  };
  return { prisma: mockPrisma };
});

describe("AuthService & Session Lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. registers a new user, hashes password, and creates verification token", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: "u-100",
      email: "client@example.com",
      passwordHash: "scrypt:mock",
      isEmailVerified: false,
      emailVerifiedAt: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const result = await AuthService.register({
      email: "Client@Example.com",
      password: "StrongPassword123!",
      fullName: "Alex Client",
      role: UserRole.CLIENT,
    });

    expect(result.userId).toBe("u-100");
    expect(result.email).toBe("client@example.com"); // Normalized to lowercase
    expect(result.rawVerificationToken).toBeDefined();
    expect(result.rawVerificationToken).toHaveLength(64);

    // Verify password was hashed and not stored plaintext
    const createCall = vi.mocked(prisma.user.create).mock.calls[0][0];
    const storedHash = createCall.data.passwordHash as string;
    expect(storedHash).not.toBe("StrongPassword123!");
    expect(storedHash.startsWith("scrypt:")).toBe(true);
  });

  it("2. rejects duplicate email registration safely", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "existing-id",
      email: "existing@example.com",
    } as any);

    await expect(
      AuthService.register({
        email: "existing@example.com",
        password: "Password123!",
        fullName: "Another User",
      })
    ).rejects.toThrow(ConflictError);
  });

  it("3. verifies passwords are never stored in plaintext", async () => {
    const rawPassword = "TopSecretPassword123!";
    const hash = await PasswordService.hash(rawPassword);
    expect(hash).not.toContain(rawPassword);
  });

  it("4. logs in with valid credentials and creates a session", async () => {
    const password = "ValidPassword123!";
    const passwordHash = await PasswordService.hash(password);

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "u-200",
      email: "therapist@example.com",
      passwordHash,
      isActive: true,
      isEmailVerified: true,
      roles: [{ role: UserRole.PSYCHOLOGIST }],
    } as any);

    vi.mocked(prisma.session.create).mockResolvedValue({} as any);

    const result = await AuthService.login({
      email: "therapist@example.com",
      password,
    });

    expect(result.sessionToken).toHaveLength(64);
    expect(result.user.id).toBe("u-200");
    expect(result.user.roles).toContain(UserRole.PSYCHOLOGIST);
    expect(prisma.session.create).toHaveBeenCalledTimes(1);
  });

  it("5. rejects invalid credentials safely without leaking state", async () => {
    const passwordHash = await PasswordService.hash("CorrectPassword123!");

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "u-200",
      email: "therapist@example.com",
      passwordHash,
      isActive: true,
      roles: [],
    } as any);

    await expect(
      AuthService.login({
        email: "therapist@example.com",
        password: "WrongPassword456!",
      })
    ).rejects.toThrow(UnauthorizedError);

    // Non-existent email also throws same UnauthorizedError (mitigating enumeration)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    await expect(
      AuthService.login({
        email: "unknown@example.com",
        password: "Password123!",
      })
    ).rejects.toThrow(UnauthorizedError);
  });

  it("6. logout invalidates the session in the database", async () => {
    const rawToken = TokenService.generateRawToken();
    const tokenHash = TokenService.hashToken(rawToken);

    vi.mocked(prisma.session.deleteMany).mockResolvedValue({ count: 1 });
    vi.mocked(prisma.session.findUnique).mockResolvedValue({
      id: "sess-1",
      tokenHash,
      expiresAt: new Date(Date.now() + 100000),
      user: { id: "u-1", email: "user@test.com", isActive: true, roles: [] },
    } as any);

    await AuthService.logout(rawToken);

    expect(prisma.session.deleteMany).toHaveBeenCalledWith({
      where: { tokenHash },
    });
  });

  it("7 & 8. verifies email with valid token and marks account verified", async () => {
    const rawToken = TokenService.generateRawToken();
    const tokenHash = TokenService.hashToken(rawToken);

    vi.mocked(prisma.emailVerificationToken.findUnique).mockResolvedValue({
      id: "evt-1",
      email: "client@test.com",
      tokenHash,
      expiresAt: new Date(Date.now() + 3600000), // Valid for 1 hr
    } as any);

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "u-100",
      email: "client@test.com",
    } as any);

    vi.mocked(prisma.user.update).mockResolvedValue({} as any);
    vi.mocked(prisma.emailVerificationToken.deleteMany).mockResolvedValue({ count: 1 });

    const result = await AuthService.verifyEmail(rawToken);
    expect(result.success).toBe(true);
    expect(result.email).toBe("client@test.com");

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "u-100" },
        data: expect.objectContaining({ isEmailVerified: true }),
      })
    );
    // Token deleted to prevent reuse
    expect(prisma.emailVerificationToken.deleteMany).toHaveBeenCalledWith({
      where: { email: "client@test.com" },
    });
  });

  it("9. rejects expired verification token", async () => {
    const rawToken = TokenService.generateRawToken();

    vi.mocked(prisma.emailVerificationToken.findUnique).mockResolvedValue({
      id: "evt-expired",
      email: "client@test.com",
      expiresAt: new Date(Date.now() - 1000), // Expired 1 second ago
    } as any);

    await expect(AuthService.verifyEmail(rawToken)).rejects.toThrow(ValidationError);
  });

  it("10. prevents verification token reuse (second attempt fails)", async () => {
    const rawToken = TokenService.generateRawToken();

    // First attempt: found; subsequent attempt: token deleted -> null
    vi.mocked(prisma.emailVerificationToken.findUnique).mockResolvedValue(null);

    await expect(AuthService.verifyEmail(rawToken)).rejects.toThrow(ValidationError);
  });

  it("11, 12, 13. password reset flow validates token, updates hash, and invalidates all sessions", async () => {
    const rawToken = TokenService.generateRawToken();
    const tokenHash = TokenService.hashToken(rawToken);

    // 11. Valid reset
    vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue({
      id: "prt-1",
      userId: "user-target",
      tokenHash,
      expiresAt: new Date(Date.now() + 1800000), // Valid
    } as any);

    vi.mocked(prisma.user.update).mockResolvedValue({} as any);
    vi.mocked(prisma.passwordResetToken.deleteMany).mockResolvedValue({ count: 1 });
    vi.mocked(prisma.session.deleteMany).mockResolvedValue({ count: 3 });

    const result = await AuthService.resetPassword(rawToken, "NewSecurePassword123!");
    expect(result.success).toBe(true);

    // 13. Invalidate all user sessions across devices
    expect(prisma.session.deleteMany).toHaveBeenCalledWith({
      where: { userId: "user-target" },
    });
    // Token deleted after single use
    expect(prisma.passwordResetToken.deleteMany).toHaveBeenCalledWith({
      where: { id: "prt-1" },
    });

    // 12. Expired reset token fails
    vi.mocked(prisma.passwordResetToken.findUnique).mockResolvedValue({
      id: "prt-exp",
      userId: "user-target",
      expiresAt: new Date(Date.now() - 10000),
    } as any);

    await expect(
      AuthService.resetPassword("expired-token", "NewPassword123!")
    ).rejects.toThrow(ValidationError);
  });

  it("14. forgot password mitigates account enumeration", async () => {
    // Non-existent user returns success without leaking presence
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const result = await AuthService.requestPasswordReset("unknown@user.com");
    expect(result.success).toBe(true);
    expect(result.rawToken).toBeUndefined(); // No token created for non-existent user
  });
});
