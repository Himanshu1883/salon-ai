export type PlatformRole = "SUPER_ADMIN" | "CUSTOMER_SUPPORT";

export const PLATFORM_ROLE_LABELS: Record<PlatformRole, string> = {
  SUPER_ADMIN: "Admin",
  CUSTOMER_SUPPORT: "Customer Support",
};

export function resolvePlatformRole(user: {
  isSuperAdmin?: boolean;
  platformRole?: PlatformRole | null;
  salonId?: string | null;
}): PlatformRole | null {
  if (user.salonId) return null;
  if (user.platformRole) return user.platformRole;
  if (user.isSuperAdmin) return "SUPER_ADMIN";
  return null;
}

export function isPlatformAdmin(user: {
  isSuperAdmin?: boolean;
  platformRole?: PlatformRole | null;
}): boolean {
  return resolvePlatformRole(user) !== null;
}

export function isSuperAdminRole(user: {
  isSuperAdmin?: boolean;
  platformRole?: PlatformRole | null;
}): boolean {
  return resolvePlatformRole(user) === "SUPER_ADMIN";
}

/** Routes customer support may access (read-only where noted). */
const CUSTOMER_SUPPORT_PREFIXES = ["/admin/support", "/admin/salons"];

export function canAccessAdminRoute(
  pathname: string,
  platformRole: PlatformRole | null
): boolean {
  if (!platformRole) return false;
  if (platformRole === "SUPER_ADMIN") return true;

  if (pathname === "/admin" || pathname === "/admin/users") {
    return false;
  }

  return CUSTOMER_SUPPORT_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function defaultAdminHome(platformRole: PlatformRole | null): string {
  if (platformRole === "CUSTOMER_SUPPORT") return "/admin/support";
  return "/admin";
}

export type AdminNavItem = {
  href: string;
  label: string;
  exact?: boolean;
  showUnread?: boolean;
  superAdminOnly?: boolean;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", exact: true, superAdminOnly: true },
  { href: "/admin/salons", label: "Salons" },
  { href: "/admin/support", label: "Support", showUnread: true },
  { href: "/admin/users", label: "Users", superAdminOnly: true },
];

export function getVisibleAdminNavItems(
  platformRole: PlatformRole | null
): AdminNavItem[] {
  if (platformRole === "SUPER_ADMIN") return ADMIN_NAV_ITEMS;
  if (platformRole === "CUSTOMER_SUPPORT") {
    return ADMIN_NAV_ITEMS.filter((item) => !item.superAdminOnly);
  }
  return [];
}
