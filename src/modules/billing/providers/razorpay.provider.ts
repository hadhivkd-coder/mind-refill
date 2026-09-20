import crypto from "crypto";
import {
  PaymentProvider,
  CreatePaymentIntentInput,
  PaymentIntentResult,
  RefundInput,
  RefundResult,
  WebhookEventPayload,
} from "./payment-provider.interface";
import { env } from "@/shared/config/env";
import { createMoney } from "@/shared/types/money";

export class RazorpayProvider implements PaymentProvider {
  private keyId: string;
  private keySecret: string;
  private webhookSecret: string;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_mock_key_id";
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || "rzp_test_mock_key_secret";
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "mock_webhook_secret_key";
  }

  async createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntentResult> {
    // Generate deterministic/mock provider reference ID for Razorpay order
    const orderId = `order_${crypto.randomBytes(8).toString("hex")}`;

    return {
      providerIntentId: orderId,
      clientSecret: `${orderId}_secret`,
      status: "REQUIRES_ACTION",
      amount: input.amount,
    };
  }

  async verifyWebhookSignature(rawBody: string, signature: string, secret?: string): Promise<boolean> {
    const activeSecret = secret || this.webhookSecret;
    if (!signature) return false;

    const expectedSignature = crypto
      .createHmac("sha256", activeSecret)
      .update(rawBody)
      .digest("hex");

    const sigBuf = Buffer.from(signature, "utf-8");
    const expectedBuf = Buffer.from(expectedSignature, "utf-8");

    if (sigBuf.length !== expectedBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(sigBuf, expectedBuf);
  }

  async parseWebhookEvent(rawBody: string, _signature: string): Promise<WebhookEventPayload> {
    const parsed = JSON.parse(rawBody);
    return {
      eventId: parsed.event_id || parsed.id || `evt_${Date.now()}`,
      eventType: parsed.event || "payment.captured",
      providerIntentId: parsed.payload?.payment?.entity?.order_id || parsed.order_id,
      status: parsed.event === "payment.captured" ? "SUCCEEDED" : parsed.event,
      rawPayload: parsed,
    };
  }

  async processRefund(input: RefundInput): Promise<RefundResult> {
    const refundId = `rfnd_${crypto.randomBytes(8).toString("hex")}`;
    return {
      providerRefundId: refundId,
      status: "SUCCEEDED",
      amount: input.amount,
    };
  }
}
