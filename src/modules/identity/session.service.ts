import { prisma } from "@/shared/database/prisma";
import { TokenService } from "./token.service";
import { ResilientAuthStore } from "./resilient-auth-store";
import { env } from "@/shared/config/env";
import { UserRole } from "@prisma/client";

export interface AuthenticatedUser {
  id: string;
  email: string;
  isEmailVerified: boolean;
  isActive: boolean;
  roles: UserRole[];
}

export interface SessionWithUser {
  sessionId: string;
  user: AuthenticatedUser;
  expiresAt: Date;
}

export interface CreateSessionParams {
  userId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export class SessionService {
  /**
   * Creates a new persistent session in the database.
   * Returns the raw secret token to set as an HttpOnly cookie.
   */
  static async createSession(params: CreateSessionParams): Promise<{ rawToken: string; expiresAt: Date }> {
    const rawToken = TokenService.generateRawToken();
    const tokenHash = TokenService.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + env.SESSION_COOKIE_MAX_AGE_SECONDS * 1000);

    try {
      await prisma.session.create({
        data: {
          userId: params.userId,
          tokenHash,
          ipAddress: params.ipAddress ?? null,
          userAgent: params.userAgent ?? null,
          expiresAt,
        },
      });
    } catch {
      // If database is offline or unreachable, save session to resilient store
      ResilientAuthStore.saveSession({
        userId: params.userId,
        tokenHash,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        expiresAt,
      });
    }

    return { rawToken, expiresAt };
  }

  /**
   * Validates an active session from a raw token.
   * Updates lastActiveAt and returns the associated user with roles.
   */
  static async validateSession(rawToken: string): Promise<SessionWithUser | null> {
    if (!rawToken || typeof rawToken !== "string" || rawToken.length !== 64) {
      return null;
    }

    const tokenHash = TokenService.hashToken(rawToken);
    const now = new Date();

    try {
      const session = await prisma.session.findUnique({
        where: { tokenHash },
        include: {
          user: {
            include: {
              roles: true,
            },
          },
        },
      });

      if (session && session.expiresAt >= now && session.user.isActive) {
        // Touch lastActiveAt (swallowing non-critical errors)
        Promise.resolve(
          prisma.session.update({
            where: { id: session.id },
            data: { lastActiveAt: now },
          })
        ).catch(() => {});

        const roles = session.user.roles.map((r) => r.role);

        return {
          sessionId: session.id,
          expiresAt: session.expiresAt,
          user: {
            id: session.user.id,
            email: session.user.email,
            isEmailVerified: session.user.isEmailVerified,
            isActive: session.user.isActive,
            roles,
          },
        };
      }
    } catch {
      // Database is offline or unreachable - check resilient store
    }

    // Resilient fallback check
    return ResilientAuthStore.validateSession(rawToken);
  }

  /**
   * Invalidates a single session by raw token.
   */
  static async invalidateSession(rawToken: string): Promise<void> {
    if (!rawToken) return;
    const tokenHash = TokenService.hashToken(rawToken);

    try {
      await prisma.session.deleteMany({
        where: { tokenHash },
      });
    } catch {
      // Prisma offline
    }

    ResilientAuthStore.deleteSession(rawToken);
  }

  /**
   * Invalidates all active sessions for a user (e.g. upon password reset or suspension).
   */
  static async invalidateAllUserSessions(userId: string): Promise<void> {
    try {
      await prisma.session.deleteMany({
        where: { userId },
      });
    } catch {
      // Prisma offline
    }
  }
}
