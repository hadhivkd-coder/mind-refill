import { describe, it, expect } from "vitest";
import { PasswordService } from "@/modules/identity/password.service";

describe("PasswordService", () => {
  it("hashes password with unique salt each time", async () => {
    const pwd = "SecurePassword123!";
    const hash1 = await PasswordService.hash(pwd);
    const hash2 = await PasswordService.hash(pwd);

    expect(hash1).not.toBe(pwd);
    expect(hash2).not.toBe(pwd);
    expect(hash1).not.toBe(hash2); // Different salts ensure different hashes
    expect(hash1.startsWith("scrypt:")).toBe(true);
  });

  it("verifies correct password against its hash", async () => {
    const pwd = "CorrectHorseBatteryStaple!";
    const hash = await PasswordService.hash(pwd);

    const isMatch = await PasswordService.verify(pwd, hash);
    expect(isMatch).toBe(true);
  });

  it("rejects incorrect password", async () => {
    const pwd = "CorrectPassword123";
    const hash = await PasswordService.hash(pwd);

    const isMatch = await PasswordService.verify("WrongPassword456", hash);
    expect(isMatch).toBe(false);
  });

  it("rejects password shorter than 8 characters", async () => {
    await expect(PasswordService.hash("short")).rejects.toThrow(
      "Password must be at least 8 characters long"
    );
  });

  it("handles malformed stored hash safely without throwing", async () => {
    const isMatch = await PasswordService.verify("somePassword", "not-a-valid-scrypt-hash");
    expect(isMatch).toBe(false);
  });
});
