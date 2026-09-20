import { NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/get-current-session";
import { requireAuthenticated } from "@/modules/authorization/guards";
import { AppointmentService } from "@/modules/scheduling/services/appointment.service";
import { handleApiError } from "@/shared/errors";

export async function GET() {
  try {
    const session = await getCurrentSession();
    const authed = requireAuthenticated(session);

    const appointments = await AppointmentService.getCoordinatorAppointments(authed);
    return NextResponse.json({ success: true, data: appointments });
  } catch (error) {
    return handleApiError(error);
  }
}
