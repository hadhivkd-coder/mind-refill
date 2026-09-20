import { describe, it, expect } from "vitest";
import { platformConfig } from "@/shared/config/platform";

describe("Platform Configuration", () => {
  it("has sensible default currency and supported currencies", () => {
    expect(platformConfig.defaultCurrency).toBeDefined();
    expect(platformConfig.supportedCurrencies).toContain("INR");
    expect(platformConfig.supportedCurrencies).toContain("USD");
  });

  it("configures non-zero default commission percentage", () => {
    expect(platformConfig.defaultCommissionPercentage).toBeGreaterThanOrEqual(5);
    expect(platformConfig.defaultCommissionPercentage).toBeLessThanOrEqual(20);
  });

  it("has reserved slugs protecting system routes", () => {
    expect(platformConfig.reservedSlugs).toContain("app");
    expect(platformConfig.reservedSlugs).toContain("admin");
    expect(platformConfig.reservedSlugs).toContain("login");
    expect(platformConfig.reservedSlugs).toContain("psychologists");
  });

  it("enforces allowed upload MIME types for security", () => {
    expect(platformConfig.allowedMimeTypes).toContain("application/pdf");
    expect(platformConfig.allowedMimeTypes).toContain("image/jpeg");
    expect(platformConfig.allowedMimeTypes).not.toContain("application/x-msdownload");
  });
});
