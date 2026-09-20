import { describe, it, expect } from "vitest";
import { TokenService } from "@/modules/identity/token.service";

describe("TokenService", () => {
  it("generates cryptographically random 64-character (256-bit) hex tokens", () => {
    const token1 = TokenService.generateRawToken();
    const token2 = TokenService.generateRawToken();

    expect(token1).toHaveLength(64);
    expect(token2).toHaveLength(64);
    expect(token1).not.toBe(token2);
    expect(/^[0-9a-f]{64}$/.test(token1)).toBe(true);
  });

  it("produces deterministic SHA-256 hash for raw tokens", () => {
    const raw = "9f8c10c1e1aa4d92a9f9308806d3cce9418688475569326c6e2a5759233d3f11";
    const hash1 = TokenService.hashToken(raw);
    const hash2 = TokenService.hashToken(raw);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
    expect(hash1).not.toBe(raw);
  });
});
