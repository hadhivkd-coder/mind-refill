import { NextRequest, NextResponse } from "next/server";
import { storageService } from "@/modules/storage/services/local-storage.service";
import fs from "fs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const bucket = searchParams.get("bucket");
  const key = searchParams.get("key");
  const expires = searchParams.get("expires");
  const sig = searchParams.get("sig");

  if (!bucket || !key || !expires || !sig) {
    return NextResponse.json({ error: "Missing required download credentials" }, { status: 400 });
  }

  const isValid = await storageService.verifySignedDownloadUrl(
    bucket,
    key,
    Number(expires),
    sig
  );

  if (!isValid) {
    return NextResponse.json(
      { error: "Download link is invalid or has expired" },
      { status: 403 }
    );
  }

  try {
    const stream = await storageService.getFileStream(bucket, key);
    // Convert Node ReadStream to Web ReadableStream
    const readable = new ReadableStream({
      start(controller) {
        stream.on("data", (chunk) => controller.enqueue(chunk));
        stream.on("end", () => controller.close());
        stream.on("error", (err) => controller.error(err));
      },
    });

    return new NextResponse(readable, {
      headers: {
        "Content-Disposition": `inline; filename="${encodeURIComponent(key)}"`,
        "Cache-Control": "private, max-age=900",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found on storage" }, { status: 404 });
  }
}
