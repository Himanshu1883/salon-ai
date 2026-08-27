import NextAuth from "next-auth";
import { NextResponse, type NextRequest } from "next/server";
import { authConfig } from "@/lib/auth.config";
import {
  isSalonProtectedRoute,
  parseSalonPrefixedPath,
} from "@/lib/salon-paths";
import {
  canAccessAdminRoute,
  defaultAdminHome,
  resolvePlatformRole,
} from "@/lib/platform-permissions";

const { auth } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET,
  trustHost: true,
});

function rewriteWithSalonSlug(
  req: NextRequest,
  innerPath: string,
  salonSlug: string
) {
  const url = req.nextUrl.clone();
  url.pathname = innerPath;
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-salon-slug", salonSlug);
  const response = NextResponse.rewrite(url, {
    request: { headers: requestHeaders },
  });
  response.cookies.set("salon-slug", salonSlug, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth?.user;
  const sessionSalonSlug = req.auth?.user?.salonSlug;
  const sessionSalonId = req.auth?.user?.salonId;
  const isSalonWorkspaceSession = Boolean(sessionSalonId && sessionSalonSlug);
  const isSuperAdmin = isSalonWorkspaceSession
    ? false
    : !!req.auth?.user?.isSuperAdmin;
  const platformRole = isSalonWorkspaceSession
    ? null
    : resolvePlatformRole(req.auth?.user ?? {});
  const isPlatformAdmin = platformRole !== null;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      if (isPlatformAdmin) {
        return NextResponse.redirect(
          new URL(defaultAdminHome(platformRole), req.url)
        );
      }
      return NextResponse.next();
    }

    if (!isPlatformAdmin) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!canAccessAdminRoute(pathname, platformRole)) {
      return NextResponse.redirect(
        new URL(defaultAdminHome(platformRole), req.url)
      );
    }

    return NextResponse.next();
  }

  if (pathname === "/register") {
    return NextResponse.redirect(new URL("/signup", req.url));
  }

  const salonPath = parseSalonPrefixedPath(pathname);

  if (salonPath) {
    const { salonSlug, innerPath } = salonPath;

    if (innerPath === "/appointments" || innerPath.startsWith("/appointments/")) {
      const suffix = innerPath.slice("/appointments".length);
      return rewriteWithSalonSlug(req, `/sales/appointments${suffix}`, salonSlug);
    }

    if (innerPath === "/services" || innerPath.startsWith("/services/")) {
      const suffix = innerPath.slice("/services".length);
      return rewriteWithSalonSlug(req, `/catalog/services${suffix}`, salonSlug);
    }

    if (innerPath === "/employees" || innerPath.startsWith("/employees/")) {
      const suffix = innerPath.slice("/employees".length);
      return rewriteWithSalonSlug(req, `/team/members${suffix}`, salonSlug);
    }

    if (innerPath === "/customers" || innerPath.startsWith("/customers/")) {
      const suffix = innerPath.slice("/customers".length);
      return rewriteWithSalonSlug(req, `/clients${suffix}`, salonSlug);
    }

    if (innerPath === "/stock" || innerPath.startsWith("/stock/")) {
      const suffix = innerPath.slice("/stock".length);
      return rewriteWithSalonSlug(req, `/inventory/stock${suffix}`, salonSlug);
    }

    if (innerPath === "/login") {
      if (isLoggedIn && !isSuperAdmin && sessionSalonSlug === salonSlug) {
        return NextResponse.redirect(
          new URL(`/${salonSlug}/dashboard`, req.url)
        );
      }
      return rewriteWithSalonSlug(req, "/login", salonSlug);
    }

    if (innerPath === "/forgot-password" || innerPath === "/reset-password") {
      if (isLoggedIn && !isSuperAdmin && sessionSalonSlug === salonSlug) {
        return NextResponse.redirect(
          new URL(`/${salonSlug}/dashboard`, req.url)
        );
      }
      return rewriteWithSalonSlug(req, innerPath, salonSlug);
    }

    if (isSalonProtectedRoute(innerPath)) {
      if (!isLoggedIn) {
        const loginUrl = new URL(`/${salonSlug}/login`, req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }

      if (isPlatformAdmin) {
        return NextResponse.redirect(
          new URL(defaultAdminHome(platformRole), req.url)
        );
      }

      if (sessionSalonSlug && sessionSalonSlug !== salonSlug) {
        return NextResponse.redirect(
          new URL(`/${sessionSalonSlug}${innerPath}`, req.url)
        );
      }

      return rewriteWithSalonSlug(req, innerPath, salonSlug);
    }

    return NextResponse.next();
  }

  if (pathname === "/login") {
    if (isLoggedIn && !isSuperAdmin && sessionSalonSlug) {
      return NextResponse.redirect(
        new URL(`/${sessionSalonSlug}/dashboard`, req.url)
      );
    }
    return NextResponse.next();
  }

  if (isSalonProtectedRoute(pathname)) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (isPlatformAdmin) {
      return NextResponse.redirect(
        new URL(defaultAdminHome(platformRole), req.url)
      );
    }

    if (sessionSalonSlug) {
      return NextResponse.redirect(
        new URL(`/${sessionSalonSlug}${pathname}`, req.url)
      );
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
