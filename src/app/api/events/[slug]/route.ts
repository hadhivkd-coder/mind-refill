import { NextRequest, NextResponse } from "next/server";
import { EventService } from "@/modules/events/services/event.service";
import { handleApiError } from "@/shared/errors";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const event = await EventService.getPublicEventBySlug(params.slug);
    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    return handleApiError(error);
  }
}
