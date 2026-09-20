import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validateCsrfOrigin, CsrfValidationError } from "./shared/security/csrf";

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");

  try {
    validateCsrfOrigin({
      method: request.method,
      url: request.url,
      origin,
      referer,
      host,
    });
  } catch (err: unknown) {
    if (err instanceof CsrfValidationError) {
      return new NextResponse(
        JSON.stringify({
          statusCode: 403,
          code: "FORBIDDEN_CSRF",
          message: err.message,
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    throw err;
  }

  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
