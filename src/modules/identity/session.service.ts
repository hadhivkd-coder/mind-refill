import { prisma } from "@/shared/database/prisma";
import { TokenService } from "./token.service";
import { ResilientAuthStore } from "./resilient-auth-store";
import { env } from "@/shared/config/env";
import { UserRole } from "@prisma/client";
import crypto from "crypto";

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
  user?: AuthenticatedUser;
}

export class SessionService {
  /**
   * Creates a new persistent session in the database and generates an HMAC-signed token.
   * Returns the secret token to set as an HttpOnly cookie.
   */
  static async createSession(params: CreateSessionParams): Promise<{ rawToken: string; signedToken?: string; expiresAt: Date }> {
    const baseRawToken = TokenService.generateRawToken();
    const tokenHash = TokenService.hashToken(baseRawToken);
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

    // Embed signed session payload if user details are available for serverless cross-container resilience
    let signedToken: string | undefined = undefined;
    if (params.user) {
      const payloadObj = {
        sub: params.userId,
        email: params.user.email,
        roles: params.user.roles,
        exp: expiresAt.getTime(),
        tid: baseRawToken,
      };
      const payloadB64 = Buffer.from(JSON.stringify(payloadObj)).toString("base64url");
      const sig = crypto
        .createHmac("sha256", env.SESSION_SECRET)
        .update(`${baseRawToken}.${payloadB64}`)
        .digest("hex");
      signedToken = `${baseRawToken}.${payloadB64}.${sig}`;
    }

    return { rawToken: baseRawToken, signedToken, expiresAt };
  }

  /**
   * Validates an active session from a raw token.
   * Supports both HMAC-signed stateless serverless tokens and raw 64-char database tokens.
   */
  static async validateSession(rawToken: string): Promise<SessionWithUser | null> {
    if (!rawToken || typeof rawToken !== "string") {
      return null;
    }

    // Check for HMAC signed serverless token format: <rawToken>.<payloadB64>.<sig>
    if (rawToken.includes(".")) {
      const parts = rawToken.split(".");
      if (parts.length === 3) {
        const [baseToken, payloadB64, sig] = parts;
        const expectedSig = crypto
          .createHmac("sha256", env.SESSION_SECRET)
          .update(`${baseToken}.${payloadB64}`)
          .digest("hex");

        if (sig === expectedSig) {
          try {
            const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));
            const now = Date.now();
            if (payload.exp && payload.exp > now && payload.sub) {
              return {
                sessionId: `sess-${baseToken.slice(0, 16)}`,
                expiresAt: new Date(payload.exp),
                user: {
                  id: payload.sub,
                  email: payload.email,
                  isEmailVerified: true,
                  isActive: true,
                  roles: payload.roles || [],
                },
              };
            }
          } catch {
            // Invalid JSON in payload, fall through
          }
        }
      }
    }

    if (rawToken.length !== 64) {
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
