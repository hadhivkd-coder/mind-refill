type LogLevel = "debug" | "info" | "warn" | "error";

const SENSITIVE_KEYS = new Set([
  "password",
  "passwordhash",
  "token",
  "session",
  "secret",
  "authorization",
  "card",
  "cvv",
  "rawconcernsummary",
  "apikey",
  "webhooksecret",
]);

function redactSensitiveData(data: unknown): unknown {
  if (data === null || data === undefined) return data;
  if (typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map(redactSensitiveData);
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = redactSensitiveData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export const logger = {
  log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
    const timestamp = new Date().toISOString();
    const safeMeta = meta ? redactSensitiveData(meta) : undefined;
    const output = JSON.stringify({
      timestamp,
      level,
      message,
      ...(safeMeta && typeof safeMeta === "object" ? safeMeta : {}),
    });

    if (level === "error") {
      console.error(output);
    } else if (level === "warn") {
      console.warn(output);
    } else {
      console.log(output);
    }
  },

  debug(message: string, meta?: Record<string, unknown>) {
    if (process.env.NODE_ENV !== "production") {
      this.log("debug", message, meta);
    }
  },

  info(message: string, meta?: Record<string, unknown>) {
    this.log("info", message, meta);
  },

  warn(message: string, meta?: Record<string, unknown>) {
    this.log("warn", message, meta);
  },

  error(message: string, meta?: Record<string, unknown>) {
    this.log("error", message, meta);
  },
};
