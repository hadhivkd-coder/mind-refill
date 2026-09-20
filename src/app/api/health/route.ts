import { NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const timestamp = new Date().toISOString();
  const uptime = process.uptime();

  try {
    // Probe database connectivity with timeout
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: "ok",
        timestamp,
        database: "connected",
        version: "1.0.0",
        uptime,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Database probe failed";

    return NextResponse.json(
      {
        status: "degraded",
        timestamp,
        database: "disconnected",
        version: "1.0.0",
        uptime,
        error: errorMessage,
      },
      { status: 503 }
    );
  }
}
