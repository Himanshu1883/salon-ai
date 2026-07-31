/** First path segments that are app routes, not salon slugs. */
export const RESERVED_SALON_SLUGS = new Set([
  "admin",
  "api",
  "register",
  "signup",
  "login",
  "logout",
  "_next",
  "assets",
  "static",
  "public",
  "pricing",
  "about",
  "contact",
  "terms",
  "privacy",
  "favicon.ico",
]);

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

export function isSalonProtectedRoute(pathname: string) {
  return SALON_ROUTE_MATCHERS.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function parseSalonPrefixedPath(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  const salonSlug = segments[0];
  if (RESERVED_SALON_SLUGS.has(salonSlug)) return null;

  const rest = segments.slice(1);
  const innerPath = rest.length === 0 ? "/" : `/${rest.join("/")}`;

  return { salonSlug, innerPath };
}

export function salonPath(slug: string, path = "/dashboard") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `/${slug}${normalized === "/" ? "" : normalized}`;
}

export function salonLoginPath(slug: string) {
  return salonPath(slug, "/login");
}

export function salonDashboardPath(slug: string) {
  return salonPath(slug, "/dashboard");
}

export function getSalonPublicUrl(slug: string, path = "/login") {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";
  return `${base}${salonPath(slug, path)}`;
}
