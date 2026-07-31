import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET,
  trustHost: true,
});

const SALON_ROUTE_MATCHERS = [
  "/dashboard",
  "/employees",
  "/team",
  "/services",
  "/catalog",
  "/inventory",
  "/seats",
  "/queue",
  "/check-in",
  "/appointments",
  "/billing",
  "/sales",
  "/reports",
  "/customers",
  "/clients",
  "/stock",
  "/settings",
  "/schedule",
  "/invoice-due",
];

function isSalonProtectedRoute(pathname: string) {
  return SALON_ROUTE_MATCHERS.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth?.user;
  const isSuperAdmin = !!req.auth?.user?.isSuperAdmin;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      if (isSuperAdmin) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      return NextResponse.next();
    }

    if (!isSuperAdmin) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  if (isSalonProtectedRoute(pathname)) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isSuperAdmin) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/employees/:path*",
    "/team/:path*",
    "/services/:path*",
    "/catalog/:path*",
    "/inventory/:path*",
    "/seats/:path*",
    "/queue/:path*",
    "/check-in/:path*",
    "/appointments/:path*",
    "/billing/:path*",
    "/sales/:path*",
    "/reports/:path*",
    "/customers/:path*",
    "/clients/:path*",
    "/stock/:path*",
    "/settings/:path*",
    "/schedule/:path*",
    "/invoice-due/:path*",
  ],
};
