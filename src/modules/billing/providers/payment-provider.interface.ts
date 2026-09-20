import { Money } from "@/shared/types/money";

export interface CreatePaymentIntentInput {
  amount: Money;
  currency: string;
  idempotencyKey: string;
  metadata?: Record<string, string>;
  customerEmail?: string;
  description?: string;
}

export interface PaymentIntentResult {
  providerIntentId: string;
  clientSecret?: string;
  status: "REQUIRES_ACTION" | "PROCESSING" | "SUCCEEDED" | "FAILED";
  amount: Money;
}

export interface RefundInput {
  providerTransactionId: string;
  amount: Money;
  reason?: string;
}

export interface RefundResult {
  providerRefundId: string;
  status: "SUCCEEDED" | "PENDING" | "FAILED";
  amount: Money;
}

export interface WebhookEventPayload {
  eventId: string;
  eventType: string;
  providerIntentId?: string;
  status: string;
  rawPayload: unknown;
}

export interface PaymentProvider {
  createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntentResult>;
  verifyWebhookSignature(rawBody: string, signature: string, secret: string): Promise<boolean>;
  parseWebhookEvent(rawBody: string, signature: string): Promise<WebhookEventPayload>;
  processRefund(input: RefundInput): Promise<RefundResult>;
}
