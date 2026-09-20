import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/modules/identity/get-current-session";
import { requireAuthenticated } from "@/modules/authorization/guards";
import { IntakeService } from "@/modules/intake/services/intake.service";
import { ConcernCategoryService } from "@/modules/intake/services/concern-category.service";
import { handleApiError } from "@/shared/errors";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const authed = requireAuthenticated(session);

    const body = await req.json();
    const result = await IntakeService.submitIntake(authed.user.id, body);

    return NextResponse.json(
      {
        success: true,
        data: result,
        message: result.isEscalated
          ? "Request submitted. Our care team will reach out with urgent priority. Crisis resources are available."
          : "Your counseling request has been received. A care coordinator will connect with you shortly.",
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET() {
  try {
    const categories = await ConcernCategoryService.listActive();
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    return handleApiError(error);
  }
}
