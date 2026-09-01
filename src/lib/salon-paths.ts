/** First path segments that are app routes, not salon slugs. */
export const RESERVED_SALON_SLUGS = new Set([
  "admin",
  "api",
  "register",
  "signup",
  "login",
  "logout",
  "forgot-password",
  "reset-password",
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
  // Gotix marketing redesign routes
  "modules",
  "platform",
  "solutions",
  "features",
  "ai",
  "testimonials",
  "faq",
  "demo",
  "security",
  "documentation",
  "download",
  "integrations",
  "gotix",
  "invoice",
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
  "/memberships",
  "/reports",
  "/customers",
  "/clients",
  "/stock",
  "/settings",
  "/schedule",
  "/invoice-due",
  "/projects",
  "/support",
  "/hair-consultation",
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

export function salonForgotPasswordPath(slug: string) {
  return salonPath(slug, "/forgot-password");
}

export function salonResetPasswordPath(slug: string, token?: string) {
  const base = salonPath(slug, "/reset-password");
  return token ? `${base}?token=${encodeURIComponent(token)}` : base;
}

/** Alias for relative salon login path (`/{slug}/login`). */
export const getSalonLoginPath = salonLoginPath;

function stripTrailingSlash(url: string) {
  return url.replace(/\/$/, "");
}

/** App origin from env (server or build-time). Prefers NEXT_PUBLIC_APP_URL, then AUTH_URL, then VERCEL_URL. */
export function getAppOrigin(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.AUTH_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

  return fromEnv ? stripTrailingSlash(fromEnv) : "http://localhost:3000";
}

/** Post-logout destination: salon login, admin login, or homepage. */
export function signOutCallbackUrl(options?: {
  salonSlug?: string | null;
  isSuperAdmin?: boolean;
}): string {
  if (options?.isSuperAdmin) return "/admin/login";
  if (options?.salonSlug) return salonLoginPath(options.salonSlug);
  return "/";
}

export function salonDashboardPath(slug: string) {
  return salonPath(slug, "/dashboard");
}

/** Keep post-login redirects inside the current salon workspace. */
export function sanitizeSalonCallbackUrl(
  raw: string | null | undefined,
  salonSlug: string
): string {
  const fallback = salonDashboardPath(salonSlug);
  if (!raw?.trim()) return fallback;

  let path = raw.trim();
  try {
    if (/^https?:\/\//i.test(path)) {
      const url = new URL(path);
      path = `${url.pathname}${url.search}`;
    }
  } catch {
    return fallback;
  }

  if (path.startsWith("/admin")) return fallback;

  const salonPrefix = `/${salonSlug}`;
  if (path === salonPrefix || path.startsWith(`${salonPrefix}/`)) {
    return path;
  }

  const [innerPath] = path.split("?");
  if (innerPath && isSalonProtectedRoute(innerPath)) {
    return salonPath(salonSlug, innerPath);
  }

  return fallback;
}

/** Full public URL for a salon route. Pass `origin` on the client (e.g. window.location.origin). */
export function getSalonPublicUrl(
  slug: string,
  path = "/login",
  origin?: string
) {
  const base = origin ? stripTrailingSlash(origin) : getAppOrigin();
  return `${base}${salonPath(slug, path)}`;
}

export function getPublicInvoicePath(invoiceId: string) {
  return `/invoice/${invoiceId}`;
}

/** Customer-facing invoice URL used in WhatsApp. Does not require login. */
export function getPublicInvoiceUrl(invoiceId: string, origin?: string) {
  const base = origin ? stripTrailingSlash(origin) : getAppOrigin();
  return `${base}${getPublicInvoicePath(invoiceId)}`;
}
