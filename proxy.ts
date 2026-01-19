import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./lib/languages/routing";

// Create the i18n middleware
const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookies
  const token = request.cookies.get("travel_token")?.value;

  // Define auth pages that logged-in users should not access
  const authPages = ["/login", "/register"];

  // Define protected pages that guest users should not access
  const protectedPages = ["/my-bookings", "/profile", "/payments", "/orders"];

  // Get current locale
  const localeMatch = pathname.match(/^\/(en|id)/);
  const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;

  // Check if current path is an auth page (accounting for locale prefix)
  const isAuthPage = authPages.some((page) => pathname.includes(page));

  // Check if current path is a protected page
  const isProtectedPage = protectedPages.some((page) => pathname.includes(page));

  // If user is logged in and trying to access auth pages, redirect to home
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  // If user is NOT logged in and trying to access protected pages, redirect to login
  if (!token && isProtectedPage) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  // Continue with i18n middleware
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - /api (API routes)
  // - /_next (Next.js internals)
  // - /_static (inside /public)
  // - all root files (e.g. /favicon.ico)
  matcher: ["/((?!api|_next|_static|_vercel|.*\\..*).*)"]
};
