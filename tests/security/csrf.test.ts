import { describe, it, expect } from "vitest";
import { validateCsrfOrigin, CsrfValidationError } from "@/shared/security/csrf";

describe("CSRF & Origin Security Verification", () => {
  it("allows safe read-only methods regardless of origin headers", () => {
    expect(
      validateCsrfOrigin({
        method: "GET",
        url: "http://localhost:3000/api/profile",
        origin: "https://evil-attacker.com",
        host: "localhost:3000",
      })
    ).toBe(true);

    expect(
      validateCsrfOrigin({
        method: "HEAD",
        url: "http://localhost:3000/api/profile",
        origin: "https://evil-attacker.com",
        host: "localhost:3000",
      })
    ).toBe(true);

    expect(
      validateCsrfOrigin({
        method: "OPTIONS",
        url: "http://localhost:3000/api/profile",
        origin: "https://evil-attacker.com",
        host: "localhost:3000",
      })
    ).toBe(true);
  });

  it("permits cryptographically signed webhooks without browser origin checks", () => {
    expect(
      validateCsrfOrigin({
        method: "POST",
        url: "http://localhost:3000/api/webhooks/razorpay",
        origin: "https://razorpay.com",
        host: "localhost:3000",
      })
    ).toBe(true);
  });

  it("blocks state-mutating requests with an untrusted Origin header", () => {
    expect(() =>
      validateCsrfOrigin({
        method: "POST",
        url: "http://localhost:3000/api/appointments",
        origin: "https://malicious-phishing.site",
        host: "localhost:3000",
      })
    ).toThrow(CsrfValidationError);

    expect(() =>
      validateCsrfOrigin({
        method: "DELETE",
        url: "http://localhost:3000/api/availability/slot-1",
        origin: "https://attacker.org",
        host: "app.mindbridge.health",
      })
    ).toThrow("Origin mismatch: 'attacker.org' is not an authorized host");
  });

  it("blocks state-mutating requests with an untrusted Referer header when Origin is absent", () => {
    expect(() =>
      validateCsrfOrigin({
        method: "POST",
        url: "http://localhost:3000/api/client/intake",
        referer: "https://malicious-phishing.site/attack-page",
        host: "localhost:3000",
      })
    ).toThrow(CsrfValidationError);
  });

  it("allows matching origin and host for valid state-mutating requests", () => {
    expect(
      validateCsrfOrigin({
        method: "POST",
        url: "http://localhost:3000/api/appointments",
        origin: "http://localhost:3000",
        host: "localhost:3000",
      })
    ).toBe(true);

    expect(
      validateCsrfOrigin({
        method: "PATCH",
        url: "https://mindbridge.health/api/profile",
        origin: "https://mindbridge.health",
        host: "mindbridge.health",
      })
    ).toBe(true);
  });

  it("supports explicit allowedHosts list", () => {
    expect(
      validateCsrfOrigin({
        method: "PUT",
        url: "https://api.mindbridge.health/api/services",
        origin: "https://app.mindbridge.health",
        host: "api.mindbridge.health",
        allowedHosts: ["app.mindbridge.health"],
      })
    ).toBe(true);
  });
});
