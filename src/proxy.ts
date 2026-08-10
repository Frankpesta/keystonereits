import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, USER_SESSION_COOKIE } from "@/lib/auth/session";

/**
 * Coarse gate: cookie presence only (the browser already refuses to send an
 * expired cookie, since its Max-Age/Expires matches the session's
 * `expiresAt`). This is NOT the source of truth — every protected Server
 * Component/Action still calls getCurrentUser/getCurrentAdmin against Convex,
 * which is what actually validates and can reject a revoked-but-unexpired
 * session. Do not add a Convex lookup here; keep proxy fast and coarse.
 */

const ADMIN_PUBLIC_ROUTES = ["/admin/login", "/admin/forgot-password", "/admin/reset-password", "/admin/verify-login"];

function isAdminPublicRoute(pathname: string) {
  return ADMIN_PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function redirectTo(req: NextRequest, pathname: string) {
  const url = req.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  url.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (isAdminPublicRoute(pathname)) return NextResponse.next();
    const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (!token) return redirectTo(req, "/admin/login");
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard")) {
    const token = req.cookies.get(USER_SESSION_COOKIE)?.value;
    if (!token) return redirectTo(req, "/login");
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
