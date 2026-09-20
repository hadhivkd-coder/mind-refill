/**
 * Cross-Site Request Forgery (CSRF) & Origin Defense Utilities
 *
 * Provides origin verification for state-changing HTTP requests.
 * Exempts safe HTTP methods and cryptographically verified webhooks.
 */

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export interface CsrfCheckOptions {
  method: string;
  url: string;
  origin?: string | null;
  referer?: string | null;
  host?: string | null;
  allowedHosts?: string[];
}

export class CsrfValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CsrfValidationError";
  }
}

/**
 * Validates request origin against allowed host/origin headers for state-changing requests.
 */
export function validateCsrfOrigin(options: CsrfCheckOptions): boolean {
  const method = options.method.toUpperCase();

  // 1. Safe methods do not mutate state
  if (SAFE_METHODS.has(method)) {
    return true;
  }

  // 2. Webhooks have dedicated HMAC signatures and are exempt from browser origin checks
  const pathname = new URL(options.url, "http://localhost").pathname;
  if (pathname.startsWith("/api/webhooks/")) {
    return true;
  }

  const { origin, referer, host, allowedHosts = [] } = options;

  // If no host header is provided, cannot verify origin
  if (!host && allowedHosts.length === 0) {
    return true;
  }

  const targetHost = host?.toLowerCase();
  const validHosts = new Set<string>();
  if (targetHost) validHosts.add(targetHost);
  for (const h of allowedHosts) {
    validHosts.add(h.toLowerCase());
  }

  // 3. Inspect Origin header if present
  if (origin) {
    try {
      const originUrl = new URL(origin);
      if (!validHosts.has(originUrl.host.toLowerCase())) {
        throw new CsrfValidationError(`Origin mismatch: '${originUrl.host}' is not an authorized host`);
      }
      return true;
    } catch (err: unknown) {
      if (err instanceof CsrfValidationError) throw err;
      throw new CsrfValidationError("Malformed Origin header");
    }
  }

  // 4. Inspect Referer header if Origin is absent
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (!validHosts.has(refererUrl.host.toLowerCase())) {
        throw new CsrfValidationError(`Referer mismatch: '${refererUrl.host}' is not an authorized host`);
      }
      return true;
    } catch (err: unknown) {
      if (err instanceof CsrfValidationError) throw err;
      throw new CsrfValidationError("Malformed Referer header");
    }
  }

  // If neither Origin nor Referer is present (e.g. direct server-to-server or testing), permit request
  return true;
}
