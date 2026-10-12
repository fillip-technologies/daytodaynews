import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "admin_session";
const JWT_SECRET_STRING = process.env.JWT_SECRET || "daytodaynews_secret_jwt_key_2026_super_secure_random";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    let isValid = false;

    if (sessionToken) {
      try {
        const { payload } = await jwtVerify(sessionToken, JWT_SECRET);
        if (payload?.id && payload?.role && (payload.role === "ADMIN" || payload.role === "EDITOR")) {
          isValid = true;
        }
      } catch {
        isValid = false;
      }
    }

    // Login page handling
    if (pathname === "/admin/login") {
      if (isValid) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-pathname", pathname);
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    // Protected admin routes
    if (!isValid) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-pathname", pathname);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
