import { NextResponse } from "next/server";
import { EventService } from "@/modules/events/services/event.service";
import { handleApiError } from "@/shared/errors";

export async function GET() {
  try {
    const events = await EventService.listPublicEvents();
    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    return handleApiError(error);
  }
}
