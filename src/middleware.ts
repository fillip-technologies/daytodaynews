import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { defaultLocale, isLocale, LOCALE_COOKIE, localeOf, type Locale } from "@/i18n/config";
import { getJwtSecret } from "@/lib/session-secret";

const SESSION_COOKIE_NAME = "admin_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    return guardAdmin(request);
  }

  // Public pages live under /en or /hi.
  if (localeOf(pathname)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  if (pathname === "/") {
    // The home page follows the reader's saved choice, then their browser language.
    url.pathname = `/${preferredLocale(request)}`;
    const response = NextResponse.redirect(url, 307);
    response.headers.set("Vary", "Cookie, Accept-Language");
    return response;
  }

  // Older unprefixed links ("/blog", "/articles/x") were English pages: move them permanently.
  url.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.redirect(url, 308);
}

async function guardAdmin(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  let isValid = false;

  if (sessionToken) {
    try {
      const { payload } = await jwtVerify(sessionToken, getJwtSecret());
      if (payload?.id && payload?.role && (payload.role === "ADMIN" || payload.role === "EDITOR")) {
        isValid = true;
      }
    } catch {
      isValid = false;
    }
  }

  // Login page: always reachable. Whether the user is still signed in is decided
  // by the admin layout against the database (a token can outlive its user, and
  // redirecting on the token alone would loop between /admin and /admin/login).
  if (pathname === "/admin/login") {
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

function preferredLocale(request: NextRequest): Locale {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(saved)) return saved;
  return negotiateLocale(request.headers.get("accept-language")) ?? defaultLocale;
}

/** Highest-weighted supported language in an Accept-Language header ("hi-IN,hi;q=0.9,en;q=0.8" → "hi"). */
function negotiateLocale(header: string | null): Locale | null {
  if (!header) return null;
  const ranked = header
    .split(",")
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      return { base: tag.trim().toLowerCase().split("-")[0], weight: q ? Number(q.slice(2)) : 1, index };
    })
    .filter((entry) => entry.weight > 0)
    .sort((a, b) => b.weight - a.weight || a.index - b.index);
  return ranked.map((entry) => entry.base).find(isLocale) ?? null;
}

export const config = {
  // Everything except API routes, Next.js internals and files (paths with a dot).
  matcher: ["/((?!api|_next|__nextjs|.*\\..*).*)"],
};
