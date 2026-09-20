import { NextRequest, NextResponse } from "next/server";
import { PaymentService } from "@/modules/billing/services/payment.service";
import { handleApiError } from "@/shared/errors";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";

    const result = await PaymentService.handleWebhook(rawBody, signature);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return handleApiError(error);
  }
}
