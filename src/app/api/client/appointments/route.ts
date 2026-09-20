import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/get-current-session";
import { requireRole } from "@/modules/authorization/guards";
import { UserRole } from "@prisma/client";
import { AppointmentService } from "@/modules/scheduling/services/appointment.service";
import { handleApiError } from "@/shared/errors";

export async function GET() {
  try {
    const session = await getCurrentSession();
    const authed = requireRole(session, UserRole.CLIENT);

    const appointments = await AppointmentService.getClientAppointments(authed.user.id);
    return NextResponse.json({ success: true, data: appointments });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const authed = requireRole(session, UserRole.CLIENT);

    const body = await req.json();
    const appointment = await AppointmentService.createAppointment(authed, body);

    return NextResponse.json({ success: true, data: appointment }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
