import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/get-current-session";
import { requireRole } from "@/modules/authorization/guards";
import { UserRole } from "@prisma/client";
import { storageService } from "@/modules/storage/services/local-storage.service";
import { prisma } from "@/shared/database/prisma";
import { formatSafeError, AppError, ValidationError } from "@/shared/errors";
import { randomUUID } from "crypto";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const authed = requireRole(session, UserRole.PSYCHOLOGIST);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      throw new ValidationError("No media file attached");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ext = path.extname(file.name).toLowerCase() || ".mp4";
    const safeKey = `media-${Date.now()}-${randomUUID().slice(0, 8)}${ext}`;
    const bucket = "psychologist-media";

    // Upload to platform storage
    await storageService.uploadFile({
      bucket,
      key: safeKey,
      content: buffer,
      mimeType: file.type || "video/mp4",
      sizeBytes: buffer.length,
    });

    // Optionally record in database
    try {
      await prisma.storedFile.create({
        data: {
          storageKey: `${bucket}/${safeKey}`,
          bucket,
          originalName: file.name,
          mimeType: file.type || "video/mp4",
          sizeBytes: BigInt(buffer.length),
          isScannedSafe: true,
          uploadedById: authed.user.id,
        },
      });
    } catch {
      // Non-blocking if database is offline
    }

    // Generate stream/download URL
    const mediaUrl = await storageService.getSignedDownloadUrl(bucket, safeKey, 86400 * 30); // 30-day signed URL

    return NextResponse.json({
      success: true,
      message: "Media uploaded successfully",
      data: {
        url: mediaUrl,
        storageKey: safeKey,
        originalName: file.name,
        mimeType: file.type || "video/mp4",
        sizeBytes: buffer.length,
      },
    });
  } catch (error: unknown) {
    const safe = formatSafeError(error);
    const status = error instanceof AppError ? error.statusCode : safe.statusCode;
    return NextResponse.json({ error: safe.message, code: safe.code }, { status });
  }
}
