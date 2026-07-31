import NextAuth from "next-auth";
import { NextResponse, type NextRequest } from "next/server";
import { authConfig } from "@/lib/auth.config";
import {
  isSalonProtectedRoute,
  parseSalonPrefixedPath,
} from "@/lib/salon-paths";

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

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth?.user;
  const isSuperAdmin = !!req.auth?.user?.isSuperAdmin;
  const sessionSalonSlug = req.auth?.user?.salonSlug;

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

  if (pathname === "/register") {
    return NextResponse.redirect(new URL("/signup", req.url));
  }

  const salonPath = parseSalonPrefixedPath(pathname);

  if (salonPath) {
    const { salonSlug, innerPath } = salonPath;

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

      if (isSuperAdmin) {
        return NextResponse.redirect(new URL("/admin", req.url));
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
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isSalonProtectedRoute(pathname)) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (isSuperAdmin) {
      return NextResponse.redirect(new URL("/admin", req.url));
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
