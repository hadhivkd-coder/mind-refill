import fs from "fs";
import path from "path";
import crypto from "crypto";
import {
  StorageProvider,
  UploadFileInput,
  StoredFileInfo,
} from "../providers/storage-provider.interface";
import { env } from "@/shared/config/env";
import { ValidationError, UnauthorizedError } from "@/shared/errors";
import { platformConfig } from "@/shared/config/platform";

export class LocalStorageService implements StorageProvider {
  private baseDir: string;
  private secret: string;

  constructor(baseDir?: string, secret?: string) {
    const defaultDir =
      process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
        ? path.join("/tmp", "uploads")
        : path.resolve(process.cwd(), "uploads");
    this.baseDir = baseDir || defaultDir;
    this.secret = secret || env.SESSION_SECRET;

    // Ensure uploads directory exists safely in serverless & local envs
    try {
      if (!fs.existsSync(this.baseDir)) {
        fs.mkdirSync(this.baseDir, { recursive: true });
      }
    } catch {
      // Safe fallback for read-only serverless filesystems
    }
  }

  private getBucketPath(bucket: string): string {
    const bucketPath = path.join(this.baseDir, bucket);
    try {
      if (!fs.existsSync(bucketPath)) {
        fs.mkdirSync(bucketPath, { recursive: true });
      }
    } catch {
      // Safe fallback
    }
    return bucketPath;
  }

  /**
   * Generates a tamper-proof HMAC-SHA256 signature for a file download/upload token.
   */
  private sign(payload: string): string {
    return crypto.createHmac("sha256", this.secret).update(payload).digest("hex");
  }

  async uploadFile(input: UploadFileInput): Promise<StoredFileInfo> {
    // Validate file size
    const maxSizeBytes = platformConfig.maxFileSizeMb * 1024 * 1024;
    if (input.sizeBytes > maxSizeBytes) {
      throw new ValidationError(`File size exceeds maximum allowed limit of ${platformConfig.maxFileSizeMb}MB`);
    }

    // Validate MIME type
    if (!platformConfig.allowedMimeTypes.includes(input.mimeType)) {
      throw new ValidationError(`File type '${input.mimeType}' is not supported`);
    }

    const bucketPath = this.getBucketPath(input.bucket);
    const safeKey = path.basename(input.key); // Prevent path traversal
    const filePath = path.join(bucketPath, safeKey);

    await fs.promises.writeFile(filePath, input.content);

    return {
      key: safeKey,
      bucket: input.bucket,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
    };
  }

  async getSignedDownloadUrl(
    bucket: string,
    key: string,
    expiresInSeconds = 900 // 15 minutes default
  ): Promise<string> {
    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const payload = `get:${bucket}:${key}:${expiresAt}`;
    const signature = this.sign(payload);

    return `/api/storage/download?bucket=${encodeURIComponent(bucket)}&key=${encodeURIComponent(
      key
    )}&expires=${expiresAt}&sig=${signature}`;
  }

  async getSignedUploadUrl(
    bucket: string,
    key: string,
    mimeType: string,
    expiresInSeconds = 900
  ): Promise<string> {
    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const payload = `put:${bucket}:${key}:${mimeType}:${expiresAt}`;
    const signature = this.sign(payload);

    return `/api/storage/upload?bucket=${encodeURIComponent(bucket)}&key=${encodeURIComponent(
      key
    )}&mime=${encodeURIComponent(mimeType)}&expires=${expiresAt}&sig=${signature}`;
  }

  async verifySignedDownloadUrl(
    bucket: string,
    key: string,
    expiresAt: number,
    signature: string
  ): Promise<boolean> {
    if (Math.floor(Date.now() / 1000) > expiresAt) {
      return false; // Expired
    }
    const payload = `get:${bucket}:${key}:${expiresAt}`;
    const expectedSig = this.sign(payload);

    try {
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig));
    } catch {
      return false;
    }
  }

  async deleteFile(bucket: string, key: string): Promise<void> {
    const safeKey = path.basename(key);
    const filePath = path.join(this.getBucketPath(bucket), safeKey);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }

  async fileExists(bucket: string, key: string): Promise<boolean> {
    const safeKey = path.basename(key);
    const filePath = path.join(this.getBucketPath(bucket), safeKey);
    return fs.existsSync(filePath);
  }

  async getFileStream(bucket: string, key: string): Promise<fs.ReadStream> {
    const safeKey = path.basename(key);
    const filePath = path.join(this.getBucketPath(bucket), safeKey);
    if (!fs.existsSync(filePath)) {
      throw new ValidationError("Requested file does not exist on storage");
    }
    return fs.createReadStream(filePath);
  }
}

export const storageService = new LocalStorageService();
