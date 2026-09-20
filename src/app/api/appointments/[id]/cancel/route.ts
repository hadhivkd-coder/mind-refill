import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/get-current-session";
import { requireAuthenticated } from "@/modules/authorization/guards";
import { AppointmentService } from "@/modules/scheduling/services/appointment.service";
import { handleApiError } from "@/shared/errors";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentSession();
    const authed = requireAuthenticated(session);

    const body = await req.json();
    await AppointmentService.cancelAppointment(authed, params.id, body);

    return NextResponse.json({ success: true, message: "Appointment cancelled" });
  } catch (error) {
    return handleApiError(error);
  }
}
