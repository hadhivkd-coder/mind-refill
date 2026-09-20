import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { LocalStorageService } from "@/modules/storage/services/local-storage.service";
import path from "path";
import fs from "fs";

describe("Storage Access Control & Cryptographic Guard Tests", () => {
  const testBaseDir = path.resolve(process.cwd(), "scratch", "test-storage-security");
  const testSecret = "test-secret-key-32-chars-long-abc!!";
  let storage: LocalStorageService;

  beforeEach(() => {
    storage = new LocalStorageService(testBaseDir, testSecret);
  });

  afterEach(() => {
    if (fs.existsSync(testBaseDir)) {
      fs.rmSync(testBaseDir, { recursive: true, force: true });
    }
  });

  it("prevents directory traversal attacks in upload and retrieval keys", async () => {
    const maliciousKey = "../../../etc/passwd";
    const uploadResult = await storage.uploadFile({
      bucket: "documents",
      key: maliciousKey,
      mimeType: "application/pdf",
      sizeBytes: 1024,
      content: Buffer.from("Safe content"),
    });

    // The key must be sanitized by path.basename to prevent escape
    expect(uploadResult.key).toBe("passwd");
    expect(uploadResult.key).not.toContain("..");

    // Verify file is contained inside the sandbox bucket directory
    const expectedBucketPath = path.join(testBaseDir, "documents", "passwd");
    expect(fs.existsSync(expectedBucketPath)).toBe(true);
  });

  it("generates signed download URLs and successfully verifies unmodified tokens", async () => {
    const signedUrl = await storage.getSignedDownloadUrl("ebooks", "anxiety-handbook.pdf", 600);
    expect(signedUrl).toContain("/api/storage/download?");
    expect(signedUrl).toContain("bucket=ebooks");
    expect(signedUrl).toContain("key=anxiety-handbook.pdf");

    const urlObj = new URL(signedUrl, "http://localhost");
    const bucket = urlObj.searchParams.get("bucket")!;
    const key = urlObj.searchParams.get("key")!;
    const expires = parseInt(urlObj.searchParams.get("expires")!, 10);
    const sig = urlObj.searchParams.get("sig")!;

    const isValid = await storage.verifySignedDownloadUrl(bucket, key, expires, sig);
    expect(isValid).toBe(true);
  });

  it("rejects tampered signatures, tampered bucket/key, or tampered expiry timestamps", async () => {
    const signedUrl = await storage.getSignedDownloadUrl("ebooks", "anxiety-handbook.pdf", 600);
    const urlObj = new URL(signedUrl, "http://localhost");
    const bucket = urlObj.searchParams.get("bucket")!;
    const key = urlObj.searchParams.get("key")!;
    const expires = parseInt(urlObj.searchParams.get("expires")!, 10);
    const sig = urlObj.searchParams.get("sig")!;

    // 1. Tampered signature
    const tamperedSig = sig.slice(0, -4) + "dead";
    expect(await storage.verifySignedDownloadUrl(bucket, key, expires, tamperedSig)).toBe(false);

    // 2. Tampered key (attempting to download another user's file with valid sig for different file)
    expect(await storage.verifySignedDownloadUrl(bucket, "confidential-intake.pdf", expires, sig)).toBe(false);

    // 3. Tampered bucket
    expect(await storage.verifySignedDownloadUrl("verification-docs", key, expires, sig)).toBe(false);

    // 4. Tampered expiry
    expect(await storage.verifySignedDownloadUrl(bucket, key, expires + 3600, sig)).toBe(false);
  });

  it("rejects expired download URLs", async () => {
    // Generate signature that expired in the past
    const pastExpiresAt = Math.floor(Date.now() / 1000) - 10;
    // Calling verify directly with past timestamp
    const signedUrl = await storage.getSignedDownloadUrl("ebooks", "anxiety-handbook.pdf", -10);
    const urlObj = new URL(signedUrl, "http://localhost");
    const sig = urlObj.searchParams.get("sig")!;

    const isValid = await storage.verifySignedDownloadUrl("ebooks", "anxiety-handbook.pdf", pastExpiresAt, sig);
    expect(isValid).toBe(false);
  });

  it("enforces allowed MIME types and file size restrictions", async () => {
    // Unsupported MIME
    await expect(
      storage.uploadFile({
        bucket: "verification-docs",
        key: "exploit.exe",
        mimeType: "application/x-msdownload",
        sizeBytes: 500,
        content: Buffer.from("MZ..."),
      })
    ).rejects.toThrow("is not supported");

    // Oversized file
    await expect(
      storage.uploadFile({
        bucket: "verification-docs",
        key: "huge-archive.zip",
        mimeType: "application/pdf",
        sizeBytes: 50 * 1024 * 1024, // 50MB exceeds default 10MB limit
        content: Buffer.alloc(100),
      })
    ).rejects.toThrow("File size exceeds maximum allowed limit");
  });
});
