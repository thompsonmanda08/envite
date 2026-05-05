import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

import { verifySession } from "@/lib/auth";

const AUTH_ROUTES = ["/login", "/forgot-password", "/reset-password"];
const PUBLIC_ROUTES = ["/", "/support", ...AUTH_ROUTES];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/web-app-manifest") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/logo") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/manifest.json")
  ) {
    return NextResponse.next();
  }

  const { isAuthenticated } = await verifySession();
  const isAuthPage = AUTH_ROUTES.includes(pathname);
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // Allow public routes regardless of auth state.
  if (isPublicRoute && !isAuthenticated) return NextResponse.next();

  // Logged-in user on auth page → bounce home.
  if (isAuthenticated && isAuthPage) {
    const url = request.nextUrl.clone();

    url.pathname = "/";

    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|images|favicon.ico|web-app-manifest-192x192.png|web-app-manifest-512x512.png|manifest.json).*)",
  ],
};
