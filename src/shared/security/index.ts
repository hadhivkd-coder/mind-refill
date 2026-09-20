/**
 * Shared Security Utilities
 * Enforces sanitization, header guards, and safe tokens.
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}

export * from "./csrf";
export * from "./cookies";
export * from "./rate-limiter";

