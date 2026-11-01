import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALES = ["ar", "en"] as const;
const DEFAULT_LOCALE = "ar";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Skip API routes, Admin dashboard, Next.js internals, and static public files
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/uploads") ||
    pathname.startsWith("/fonts") ||
    pathname === "/favicon.ico" ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Check if pathname already starts with /ar or /en
  const matchedLocale = LOCALES.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (matchedLocale) {
    const response = NextResponse.next();
    response.cookies.set("NEXT_LOCALE", matchedLocale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return response;
  }

  // Otherwise redirect unprefixed public route to preferred or default locale
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  const targetLocale =
    cookieLocale === "en" || cookieLocale === "ar"
      ? cookieLocale
      : DEFAULT_LOCALE;

  const targetPath =
    pathname === "/" ? `/${targetLocale}` : `/${targetLocale}${pathname}`;

  const redirectUrl = new URL(`${targetPath}${search}`, request.url);
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/((?!api|admin|_next/static|_next/image|images|uploads|fonts|favicon.ico).*)"],
};

