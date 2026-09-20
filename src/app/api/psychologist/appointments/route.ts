import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/get-current-session";
import { requireRole } from "@/modules/authorization/guards";
import { UserRole } from "@prisma/client";
import { AppointmentService } from "@/modules/scheduling/services/appointment.service";
import { handleApiError } from "@/shared/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const authed = requireRole(session, UserRole.PSYCHOLOGIST);

    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    const startDate = start ? new Date(start) : undefined;
    const endDate = end ? new Date(end) : undefined;

    const appointments = await AppointmentService.getPsychologistAppointments(
      authed.user.id,
      startDate,
      endDate
    );

    return NextResponse.json({ success: true, data: appointments });
  } catch (error) {
    return handleApiError(error);
  }
}
