import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/api/health/route";
import { prisma } from "@/shared/database/prisma";

vi.mock("@/shared/database/prisma", () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}));

describe("Health Check API (/api/health)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 and status ok when database is responsive", async () => {
    (prisma.$queryRaw as any).mockResolvedValueOnce([{ "?column?": 1 }]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe("ok");
    expect(data.database).toBe("connected");
    expect(data.version).toBe("1.0.0");
    expect(typeof data.uptime).toBe("number");
    expect(typeof data.timestamp).toBe("string");
  });

  it("returns 503 and degraded status when database is unreachable", async () => {
    (prisma.$queryRaw as any).mockRejectedValueOnce(new Error("Connection refused to postgresql:5432"));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.status).toBe("degraded");
    expect(data.database).toBe("disconnected");
    expect(data.error).toBe("Connection refused to postgresql:5432");
  });
});
