import { describe, it, expect, vi } from "vitest";
import { getSessionCookieOptions, getExpiredSessionCookieOptions } from "@/shared/security/cookies";
import { formatSafeError, AppError } from "@/shared/errors";
import { logger } from "@/shared/logging/logger";
import { SessionService } from "@/modules/identity/session.service";

describe("Security Hardening & Privacy Guards", () => {
  it("enforces HttpOnly, SameSite=Lax, and Path=/ on session cookies", () => {
    const expiresAt = new Date(Date.now() + 600000);
    const options = getSessionCookieOptions(expiresAt);

    expect(options.httpOnly).toBe(true);
    expect(options.sameSite).toBe("lax");
    expect(options.path).toBe("/");
    expect(options.expires).toEqual(expiresAt);
  });

  it("sets epoch expiration to securely clear expired cookies", () => {
    const expiredOptions = getExpiredSessionCookieOptions();
    expect(expiredOptions.expires).toEqual(new Date(0));
    expect(expiredOptions.httpOnly).toBe(true);
  });

  it("redacts sensitive fields (passwords, tokens, cards, intake text) from logs", () => {
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    logger.info("User activity check", {
      userId: "u-123",
      password: "PlainTextPassword!123",
      token: "secret-token-abcdef",
      rawConcernSummary: "Extremely sensitive clinical narrative",
      card: "4111222233334444",
      regularMetadata: "Safe to view",
    });

    expect(consoleSpy).toHaveBeenCalled();
    const logOutput = consoleSpy.mock.calls[0][0];
    const parsed = JSON.parse(logOutput);

    expect(parsed.password).toBe("[REDACTED]");
    expect(parsed.token).toBe("[REDACTED]");
    expect(parsed.rawConcernSummary).toBe("[REDACTED]");
    expect(parsed.card).toBe("[REDACTED]");
    expect(parsed.regularMetadata).toBe("Safe to view");

    consoleSpy.mockRestore();
  });

  it("safely masks low-level database exceptions from end-user visibility", () => {
    const internalDbError = new Error(
      "Connection to postgresql://postgres:SuperSecretPassword@db.production:5432 failed"
    );
    const safeOutput = formatSafeError(internalDbError);

    expect(safeOutput.statusCode).toBe(500);
    expect(safeOutput.code).toBe("INTERNAL_SERVER_ERROR");
    expect(safeOutput.message).toBe("An unexpected error occurred. Please try again later.");
    expect(safeOutput.message).not.toContain("SuperSecretPassword");
    expect(safeOutput.message).not.toContain("postgresql");
  });

  it("rejects invalid, short, or non-hex session tokens server-side", async () => {
    // Malformed/short token rejected immediately without database hit
    const result1 = await SessionService.validateSession("");
    expect(result1).toBeNull();

    const result2 = await SessionService.validateSession("invalid-short-token");
    expect(result2).toBeNull();

    const result3 = await SessionService.validateSession(null as any);
    expect(result3).toBeNull();
  });
});
