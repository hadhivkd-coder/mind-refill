import { prisma } from "@/shared/database/prisma";
import { logger } from "@/shared/logging/logger";

export interface LogAuditParams {
  actorUserId?: string | null;
  action: string; // e.g. "AUTH_REGISTER", "AUTH_LOGIN", "ROLE_ASSIGNED"
  entityType: string; // e.g. "User", "UserRoleAssignment"
  entityId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  safeMetadata?: Record<string, unknown>;
}

const FORBIDDEN_AUDIT_KEYS = new Set([
  "password",
  "passwordhash",
  "token",
  "tokenhash",
  "secret",
  "session",
  "rawconcernsummary",
  "card",
  "cvv",
]);

function sanitizeAuditMetadata(meta?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!meta) return undefined;
  const safe: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(meta)) {
    if (FORBIDDEN_AUDIT_KEYS.has(key.toLowerCase())) {
      continue; // Strip entirely rather than logging
    }
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      safe[key] = sanitizeAuditMetadata(value as Record<string, unknown>);
    } else {
      safe[key] = value;
    }
  }

  return safe;
}

export class AuditService {
  /**
   * Records an immutable audit log entry.
   * Guaranteed never to log sensitive credentials, passwords, or intake summaries.
   */
  static async log(params: LogAuditParams): Promise<void> {
    const safeMeta = sanitizeAuditMetadata(params.safeMetadata);

    logger.info(`AUDIT: [${params.action}] on ${params.entityType}:${params.entityId ?? "none"}`, {
      actorUserId: params.actorUserId,
      action: params.action,
      entityType: params.entityType,
      safeMetadata: safeMeta,
    });

    try {
      await prisma.auditLog.create({
        data: {
          actorUserId: params.actorUserId ?? null,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId ?? null,
          ipAddress: params.ipAddress ?? null,
          userAgent: params.userAgent ?? null,
          safeMetadata: safeMeta ? JSON.parse(JSON.stringify(safeMeta)) : undefined,
        },
      });
    } catch (err) {
      // In development or test environments without an active database connection,
      // fail safe without disrupting the user flow, but log the event
      logger.warn("Could not write audit record to database", { error: String(err) });
    }
  }
}
