import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Architecture & Modular Monolith Boundaries", () => {
  const rootSrc = path.resolve(__dirname, "../src");

  const requiredDomainModules = [
    "identity",
    "authorization",
    "profiles",
    "directory",
    "verification",
    "portfolio",
    "intake",
    "coordination",
    "scheduling",
    "billing",
    "payouts",
    "subscriptions",
    "content",
    "commerce",
    "events",
    "notifications",
    "analytics",
    "admin",
    "audit",
    "platform-settings",
    "storage",
    "jobs",
  ];

  const requiredSharedModules = [
    "config",
    "errors",
    "logging",
    "security",
    "types",
    "validation",
  ];

  it("contains all 22 domain modules specified in Section 6", () => {
    for (const mod of requiredDomainModules) {
      const modulePath = path.join(rootSrc, "modules", mod);
      expect(
        fs.existsSync(modulePath),
        `Expected domain module '${mod}' to exist at ${modulePath}`
      ).toBe(true);
    }
  });

  it("contains all 6 shared layers specified in Section 6", () => {
    for (const shared of requiredSharedModules) {
      const sharedPath = path.join(rootSrc, "shared", shared);
      expect(
        fs.existsSync(sharedPath),
        `Expected shared module '${shared}' to exist at ${sharedPath}`
      ).toBe(true);
    }
  });
});
