import { describe, it, expect, beforeEach } from "vitest";
import { MemoryRateLimiter, RATE_LIMIT_RULES } from "@/shared/security/rate-limiter";
import { RateLimitError } from "@/shared/errors";

describe("MemoryRateLimiter", () => {
  beforeEach(() => {
    MemoryRateLimiter.clearAll();
  });

  it("permits requests within configured threshold", () => {
    const key = "192.168.1.10";
    const rule = RATE_LIMIT_RULES.login;

    for (let i = 0; i < rule.maxRequests; i++) {
      const res = MemoryRateLimiter.check(key, "login");
      expect(res.remaining).toBe(rule.maxRequests - (i + 1));
    }
  });

  it("throws RateLimitError when threshold is exceeded", () => {
    const key = "192.168.1.20";
    const rule = RATE_LIMIT_RULES.login;

    for (let i = 0; i < rule.maxRequests; i++) {
      MemoryRateLimiter.check(key, "login");
    }

    // Next attempt exceeds limit
    expect(() => MemoryRateLimiter.check(key, "login")).toThrow(RateLimitError);
  });

  it("resets limit count for an action key when explicitly reset", () => {
    const key = "192.168.1.30";
    const rule = RATE_LIMIT_RULES.login;

    for (let i = 0; i < rule.maxRequests; i++) {
      MemoryRateLimiter.check(key, "login");
    }

    expect(() => MemoryRateLimiter.check(key, "login")).toThrow(RateLimitError);

    // Successful login triggers reset
    MemoryRateLimiter.reset(key, "login");

    // Request is now allowed again
    const res = MemoryRateLimiter.check(key, "login");
    expect(res.remaining).toBe(rule.maxRequests - 1);
  });

  it("isolates different actions under the same key", () => {
    const key = "192.168.1.40";

    // Exceed forgotPassword limit (3 requests)
    for (let i = 0; i < RATE_LIMIT_RULES.forgotPassword.maxRequests; i++) {
      MemoryRateLimiter.check(key, "forgotPassword");
    }
    expect(() => MemoryRateLimiter.check(key, "forgotPassword")).toThrow(RateLimitError);

    // Login action should remain unaffected
    expect(() => MemoryRateLimiter.check(key, "login")).not.toThrow();
  });
});
