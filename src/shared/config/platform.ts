import { env } from "./env";

export interface PlatformConfig {
  defaultCurrency: string;
  supportedCurrencies: string[];
  supportedCountries: string[];
  defaultCommissionPercentage: number; // e.g. 10 for 10%
  settlementPeriodDays: number;
  bookingHoldDurationMinutes: number;
  maxFileSizeMb: number;
  allowedMimeTypes: string[];
  reservedSlugs: string[];
}

export const platformConfig: PlatformConfig = {
  defaultCurrency: env.DEFAULT_CURRENCY,
  supportedCurrencies: ["INR", "USD", "EUR", "GBP", "AED", "SGD"],
  supportedCountries: ["IN", "US", "GB", "AE", "SG", "CA", "AU"],
  defaultCommissionPercentage: env.DEFAULT_COMMISSION_PERCENT,
  settlementPeriodDays: env.DEFAULT_SETTLEMENT_DAYS,
  bookingHoldDurationMinutes: env.DEFAULT_BOOKING_HOLD_MINUTES,
  maxFileSizeMb: 10,
  allowedMimeTypes: [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "video/mp4",
    "video/webm",
    "video/quicktime",
  ],
  reservedSlugs: [
    "app",
    "api",
    "admin",
    "client",
    "psychologist",
    "coordinator",
    "login",
    "register",
    "auth",
    "find-a-psychologist",
    "psychologists",
    "resources",
    "ebooks",
    "events",
    "legal",
    "privacy",
    "terms",
    "settings",
    "checkout",
    "webhook",
    "static",
  ],
};
