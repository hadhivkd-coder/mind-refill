import crypto from "crypto";

export class TokenService {
  /**
   * Generates a high-entropy cryptographically secure random token (64 hex chars = 256 bits).
   */
  static generateRawToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Computes a deterministic SHA-256 hash of a raw token to store safely in the database.
   */
  static hashToken(rawToken: string): string {
    return crypto.createHash("sha256").update(rawToken).digest("hex");
  }
}
