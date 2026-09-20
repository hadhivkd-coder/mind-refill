export interface UploadFileInput {
  bucket: string;
  key: string;
  content: Buffer | Uint8Array;
  mimeType: string;
  sizeBytes: number;
}

export interface StoredFileInfo {
  key: string;
  bucket: string;
  mimeType: string;
  sizeBytes: number;
}

export interface StorageProvider {
  uploadFile(input: UploadFileInput): Promise<StoredFileInfo>;
  getSignedDownloadUrl(bucket: string, key: string, expiresInSeconds?: number): Promise<string>;
  getSignedUploadUrl(bucket: string, key: string, mimeType: string, expiresInSeconds?: number): Promise<string>;
  deleteFile(bucket: string, key: string): Promise<void>;
  fileExists(bucket: string, key: string): Promise<boolean>;
}
