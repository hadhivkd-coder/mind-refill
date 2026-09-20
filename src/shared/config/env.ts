import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(3000),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1).default("postgresql://postgres:postgres@localhost:5432/psychology_platform?schema=public"),
  DIRECT_URL: z.string().min(1).optional(),
  SESSION_SECRET: z.string().min(32).default("default-session-secret-key-that-is-at-least-32-chars-long"),
  SESSION_COOKIE_NAME: z.string().default("psy_session"),
  SESSION_COOKIE_MAX_AGE_SECONDS: z.coerce.number().default(604800),

  // Storage
  STORAGE_PROVIDER: z.enum(["local", "s3"]).default("local"),
  STORAGE_BUCKET: z.string().default("psychology-platform-private-documents"),
  STORAGE_REGION: z.string().default("auto"),
  STORAGE_ENDPOINT: z.string().optional().default(""),
  STORAGE_ACCESS_KEY: z.string().optional().default(""),
  STORAGE_SECRET_KEY: z.string().optional().default(""),

  // Payment
  PAYMENT_PROVIDER: z.enum(["mock", "stripe", "razorpay"]).default("mock"),
  PAYMENT_API_KEY: z.string().optional().default(""),
  PAYMENT_API_SECRET: z.string().optional().default(""),
  PAYMENT_WEBHOOK_SECRET: z.string().default("whsec_mock_test_key"),

  // AI (Controlled structured output only, never diagnoses)
  AI_PROVIDER: z.enum(["mock", "openai", "gemini"]).default("mock"),
  AI_API_KEY: z.string().optional().default(""),
  AI_MODEL_NAME: z.string().default("gemini-1.5-pro"),

  // Email
  EMAIL_PROVIDER: z.enum(["mock", "resend", "ses"]).default("mock"),
  EMAIL_API_KEY: z.string().optional().default(""),
  EMAIL_FROM: z.string().default("Mind Refill <support@mindrefill.com>"),

  // Platform Defaults
  DEFAULT_COUNTRY: z.string().length(2).default("IN"),
  DEFAULT_CURRENCY: z.string().length(3).default("INR"),
  DEFAULT_COMMISSION_PERCENT: z.coerce.number().min(0).max(100).default(10),
  DEFAULT_SETTLEMENT_DAYS: z.coerce.number().min(1).default(7),
  DEFAULT_BOOKING_HOLD_MINUTES: z.coerce.number().min(1).default(15),
});

export type Env = z.infer<typeof envSchema>;

export function getEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("Invalid environment variables:", result.error.format());
    throw new Error("Configuration error: Invalid environment variables");
  }
  return result.data;
}

export const env = getEnv();
