import { NextRequest, NextResponse } from "next/server";
import { ProfileService } from "@/modules/profiles/services/profile.service";
import { AvailabilityService } from "@/modules/scheduling/services/availability.service";
import { handleApiError, ValidationError } from "@/shared/errors";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date"); // YYYY-MM-DD
    const duration = parseInt(searchParams.get("duration") || "50", 10);

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new ValidationError("Valid date in YYYY-MM-DD format is required");
    }

    const profile = await ProfileService.getPublicProfileBySlug(params.slug);
    const slots = await AvailabilityService.getAvailableSlotsForDate(profile.id, date, duration);

    return NextResponse.json({ success: true, data: slots });
  } catch (error) {
    return handleApiError(error);
  }
}
