import { prisma } from "@/shared/database/prisma";
import { PasswordService } from "./password.service";
import { TokenService } from "./token.service";
import { SessionService } from "./session.service";
import { ResilientAuthStore } from "./resilient-auth-store";
import { AuditService } from "@/modules/audit/audit.service";
import {
  ValidationError,
  UnauthorizedError,
  ConflictError,
} from "@/shared/errors";
import { UserRole } from "@prisma/client";
import { logger } from "@/shared/logging/logger";

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  role?: UserRole;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface LoginInput {
  email: string;
  password: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export class AuthService {
  /**
   * Registers a new user with secure password hashing and issues an email verification token.
   */
  static async register(input: RegisterInput): Promise<{
    userId: string;
    email: string;
    rawVerificationToken: string;
  }> {
    const normalizedEmail = input.email.trim().toLowerCase();
    const assignedRole = input.role ?? UserRole.CLIENT;

    if (!input.password || input.password.length < 8) {
      throw new ValidationError("Password must be at least 8 characters long");
    }

    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        throw new ConflictError("An account with this email address already exists");
      }

      const passwordHash = await PasswordService.hash(input.password);

      // Create user and associated profile within a database transaction
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: normalizedEmail,
            passwordHash,
            isEmailVerified: false,
            roles: {
              create: {
                role: assignedRole,
              },
            },
          },
        });

        // Initialize appropriate profile
        if (assignedRole === UserRole.CLIENT) {
          await tx.clientProfile.create({
            data: {
              userId: user.id,
              fullName: input.fullName.trim(),
            },
          });
        } else if (assignedRole === UserRole.PSYCHOLOGIST) {
          const baseSlug = input.fullName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "-")
            .replace(/-+/g, "-")
            .slice(0, 30);
          const randomSuffix = Math.random().toString(36).substring(2, 7);
          const slug = `${baseSlug}-${randomSuffix}`;

          await tx.psychologistProfile.create({
            data: {
              userId: user.id,
              fullName: input.fullName.trim(),
              professionalTitle: "Clinical Psychologist",
              slug,
              bio: "",
            },
          });
        } else {
          await tx.staffProfile.create({
            data: {
              userId: user.id,
              fullName: input.fullName.trim(),
            },
          });
        }

        // Generate verification token (expires in 24 hours)
        const rawVerificationToken = TokenService.generateRawToken();
        const tokenHash = TokenService.hashToken(rawVerificationToken);
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await tx.emailVerificationToken.create({
          data: {
            email: normalizedEmail,
            tokenHash,
            expiresAt,
          },
        });

        return { user, rawVerificationToken };
      });

      await AuditService.log({
        actorUserId: result.user.id,
        action: "AUTH_REGISTER",
        entityType: "User",
        entityId: result.user.id,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        safeMetadata: {
          role: assignedRole,
        },
      }).catch(() => {});

      logger.info("User registered successfully in database", {
        userId: result.user.id,
        role: assignedRole,
      });

      return {
        userId: result.user.id,
        email: normalizedEmail,
        rawVerificationToken: result.rawVerificationToken,
      };
    } catch (error: any) {
      if (error instanceof ConflictError || error instanceof ValidationError) {
        throw error;
      }

      logger.warn("Database unavailable during registration, saving to resilient fallback store", {
        error: error?.message,
      });

      const existingFallback = ResilientAuthStore.getUser(normalizedEmail);
      if (existingFallback) {
        throw new ConflictError("An account with this email address already exists");
      }

      const passwordHash = await PasswordService.hash(input.password);
      const fallbackUser = ResilientAuthStore.createUser({
        email: normalizedEmail,
        fullName: input.fullName.trim(),
        passwordHash,
        role: assignedRole,
      });

      return {
        userId: fallbackUser.id,
        email: fallbackUser.email,
        rawVerificationToken: TokenService.generateRawToken(),
      };
    }
  }

  /**
   * Authenticates user credentials and generates a secure session.
   */
  static async login(input: LoginInput): Promise<{
    sessionToken: string;
    expiresAt: Date;
    user: { id: string; email: string; isEmailVerified: boolean; roles: UserRole[] };
  }> {
    const normalizedEmail = input.email.trim().toLowerCase();
    let user: any = null;

    try {
      user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: {
          roles: true,
        },
      });
    } catch (dbError: any) {
      logger.warn("Database unavailable during login, checking resilient store", {
        error: dbError?.message,
      });
    }

    if (!user) {
      const fallbackUser = ResilientAuthStore.getUser(normalizedEmail);
      if (fallbackUser) {
        user = fallbackUser;
      }
    }

    if (!user || !user.passwordHash) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (!user.isActive) {
      throw new UnauthorizedError("Your account has been deactivated. Please contact support.");
    }

    const isMatch = await PasswordService.verify(input.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const { rawToken, expiresAt } = await SessionService.createSession({
      userId: user.id,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });

    const roles = user.roles.map((r: any) => (typeof r === "string" ? r : r.role));

    await AuditService.log({
      actorUserId: user.id,
      action: "AUTH_LOGIN",
      entityType: "User",
      entityId: user.id,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    }).catch(() => {});

    return {
      sessionToken: rawToken,
      expiresAt,
      user: {
        id: user.id,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        roles,
      },
    };
  }

  /**
   * Verifies an email address using a one-time token.
   */
  static async verifyEmail(rawToken: string): Promise<{ success: boolean; email: string }> {
    if (!rawToken) {
      throw new ValidationError("Verification token is required");
    }

    const tokenHash = TokenService.hashToken(rawToken);
    const now = new Date();

    const verificationRecord = await prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
    });

    if (!verificationRecord || verificationRecord.expiresAt < now) {
      throw new ValidationError("Verification token is invalid or has expired");
    }

    const user = await prisma.user.findUnique({
      where: { email: verificationRecord.email },
    });

    if (!user) {
      throw new ValidationError("User associated with this token not found");
    }

    // Atomically mark user verified and delete token to prevent reuse
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          isEmailVerified: true,
          emailVerifiedAt: now,
        },
      }),
      prisma.emailVerificationToken.deleteMany({
        where: { email: verificationRecord.email },
      }),
    ]);

    await AuditService.log({
      actorUserId: user.id,
      action: "AUTH_EMAIL_VERIFIED",
      entityType: "User",
      entityId: user.id,
    });

    return { success: true, email: user.email };
  }

  /**
   * Requests a password reset link.
   * Mitigates account enumeration by always returning success.
   */
  static async requestPasswordReset(email: string): Promise<{ success: boolean; rawToken?: string }> {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Account enumeration mitigation: return success without revealing if email exists
    if (!user) {
      return { success: true };
    }

    const rawToken = TokenService.generateRawToken();
    const tokenHash = TokenService.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration

    // Invalidate previous reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    await AuditService.log({
      actorUserId: user.id,
      action: "AUTH_PASSWORD_RESET_REQUESTED",
      entityType: "User",
      entityId: user.id,
    });

    return { success: true, rawToken };
  }

  /**
   * Resets a password, invalidates the token, and terminates all active sessions.
   */
  static async resetPassword(rawToken: string, newPassword: string): Promise<{ success: boolean }> {
    if (!rawToken) {
      throw new ValidationError("Reset token is required");
    }

    if (!newPassword || newPassword.length < 8) {
      throw new ValidationError("Password must be at least 8 characters long");
    }

    const tokenHash = TokenService.hashToken(rawToken);
    const now = new Date();

    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!resetRecord || resetRecord.expiresAt < now) {
      throw new ValidationError("Password reset token is invalid or has expired");
    }

    const newPasswordHash = await PasswordService.hash(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash: newPasswordHash },
      }),
      // One-time use: delete token
      prisma.passwordResetToken.deleteMany({
        where: { id: resetRecord.id },
      }),
    ]);

    // Invalidate all active sessions across devices
    await SessionService.invalidateAllUserSessions(resetRecord.userId);

    await AuditService.log({
      actorUserId: resetRecord.userId,
      action: "AUTH_PASSWORD_RESET_COMPLETED",
      entityType: "User",
      entityId: resetRecord.userId,
    });

    return { success: true };
  }

  /**
   * Logs out a session by token.
   */
  static async logout(rawSessionToken: string): Promise<void> {
    if (!rawSessionToken) return;

    const session = await SessionService.validateSession(rawSessionToken);
    if (session) {
      await AuditService.log({
        actorUserId: session.user.id,
        action: "AUTH_LOGOUT",
        entityType: "Session",
        entityId: session.sessionId,
      });
    }

    await SessionService.invalidateSession(rawSessionToken);
  }
}
