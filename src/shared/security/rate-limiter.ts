import { RateLimitError } from "@/shared/errors";

export interface RateLimitRule {
  maxRequests: number;
  windowSeconds: number;
}

export const RATE_LIMIT_RULES: Record<string, RateLimitRule> = {
  login: { maxRequests: 5, windowSeconds: 900 }, // 5 attempts per 15 mins
  register: { maxRequests: 5, windowSeconds: 3600 }, // 5 registrations per hour
  forgotPassword: { maxRequests: 3, windowSeconds: 3600 }, // 3 reset requests per hour
  resetPassword: { maxRequests: 5, windowSeconds: 900 }, // 5 password submit attempts per 15 mins
  verifyEmail: { maxRequests: 10, windowSeconds: 3600 }, // 10 verification checks per hour
  resendVerification: { maxRequests: 3, windowSeconds: 900 }, // 3 resends per 15 mins
};

interface WindowEntry {
  timestamps: number[];
}

export class MemoryRateLimiter {
  private static store = new Map<string, WindowEntry>();

  /**
   * Checks if an action key has exceeded the sliding window limit.
   * Throws RateLimitError if exceeded.
   */
  static check(key: string, action: keyof typeof RATE_LIMIT_RULES): { remaining: number; resetTime: number } {
    const rule = RATE_LIMIT_RULES[action] ?? { maxRequests: 20, windowSeconds: 60 };
    const now = Date.now();
    const windowStart = now - rule.windowSeconds * 1000;
    const bucketKey = `${action}:${key}`;

    const current = this.store.get(bucketKey) ?? { timestamps: [] };

    // Clean up timestamps outside current sliding window
    const validTimestamps = current.timestamps.filter((ts) => ts > windowStart);

    if (validTimestamps.length >= rule.maxRequests) {
      const oldestValid = validTimestamps[0];
      const resetTime = Math.ceil((oldestValid + rule.windowSeconds * 1000 - now) / 1000);
      throw new RateLimitError(`Too many attempts. Please try again in ${resetTime} seconds.`);
    }

    validTimestamps.push(now);
    this.store.set(bucketKey, { timestamps: validTimestamps });

    return {
      remaining: rule.maxRequests - validTimestamps.length,
      resetTime: rule.windowSeconds,
    };
  }

  /**
   * Clears state for a key upon successful action (e.g. successful login resets fail count).
   */
  static reset(key: string, action: keyof typeof RATE_LIMIT_RULES): void {
    const bucketKey = `${action}:${key}`;
    this.store.delete(bucketKey);
  }

  /**
   * For testing purposes: clears the entire in-memory store.
   */
  static clearAll(): void {
    this.store.clear();
  }
}
