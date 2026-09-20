export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code: string;

  constructor(message: string, statusCode = 500, code = "INTERNAL_ERROR", isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public readonly errors?: unknown;

  constructor(message = "Validation failed", errors?: unknown) {
    super(message, 400, "VALIDATION_ERROR");
    this.errors = errors;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Access denied: insufficient permissions") {
    super(message, 403, "FORBIDDEN");
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource conflict detected") {
    super(message, 409, "CONFLICT");
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Rate limit exceeded. Please try again later.") {
    super(message, 429, "RATE_LIMITED");
  }
}

export function formatSafeError(error: unknown): { message: string; code: string; statusCode: number } {
  if (error instanceof AppError && error.isOperational) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
    };
  }

  // Hide internal implementation details and raw stack traces in production
  return {
    message: "An unexpected error occurred. Please try again later.",
    code: "INTERNAL_SERVER_ERROR",
    statusCode: 500,
  };
}

import { NextResponse } from "next/server";

export function handleApiError(error: unknown): NextResponse {
  const safe = formatSafeError(error);
  const status = error instanceof AppError ? error.statusCode : safe.statusCode;
  return NextResponse.json({ error: { message: safe.message, code: safe.code } }, { status });
}
