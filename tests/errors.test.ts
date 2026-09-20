import { describe, it, expect } from "vitest";
import {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  formatSafeError,
} from "@/shared/errors";

describe("Error Handling and Sanitization", () => {
  it("assigns appropriate HTTP status codes", () => {
    expect(new ValidationError().statusCode).toBe(400);
    expect(new UnauthorizedError().statusCode).toBe(401);
    expect(new ForbiddenError().statusCode).toBe(403);
    expect(new NotFoundError("Psychologist").statusCode).toBe(404);
  });

  it("formats operational AppError safely for public consumption", () => {
    const error = new NotFoundError("Appointment");
    const formatted = formatSafeError(error);

    expect(formatted.statusCode).toBe(404);
    expect(formatted.code).toBe("NOT_FOUND");
    expect(formatted.message).toBe("Appointment not found");
  });

  it("masks unhandled internal exceptions to prevent leaking internals", () => {
    const rawError = new Error("Database connection timeout at postgres:5432 with password secret123");
    const formatted = formatSafeError(rawError);

    expect(formatted.statusCode).toBe(500);
    expect(formatted.code).toBe("INTERNAL_SERVER_ERROR");
    expect(formatted.message).toBe("An unexpected error occurred. Please try again later.");
    expect(formatted.message).not.toContain("password");
  });
});
