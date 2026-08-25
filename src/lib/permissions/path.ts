import { getModuleForPath } from "@/lib/plans";
import type { PermissionKey } from "@/lib/permissions/catalog";
import { MODULE_VIEW_PERMISSION } from "@/lib/permissions/nav";

const PATH_PERMISSION_OVERRIDES: Array<{
  match: (path: string) => boolean;
  permission: PermissionKey;
}> = [
  {
    match: (path) =>
      path.startsWith("/team/attendance") ||
      path.startsWith("/team/shifts") ||
      path.startsWith("/team/timesheets") ||
      path.startsWith("/team/pay-runs"),
    permission: "attendance.view",
  },
  {
    match: (path) => path.startsWith("/team/access"),
    permission: "permissions.manage",
  },
  {
    match: (path) => path.startsWith("/team/roles"),
    permission: "roles.view",
  },
  {
    match: (path) =>
      path.includes("/permissions") && path.startsWith("/team"),
    permission: "permissions.manage",
  },
  {
    match: (path) => path.startsWith("/settings/subscription"),
    permission: "subscription.view",
  },
  {
    match: (path) => path.startsWith("/support"),
    permission: "support.view",
  },
  {
    match: (path) => path === "/invoice-due" || path.startsWith("/invoice-due/"),
    permission: "billing.view",
  },
];

function normalizeDashboardPath(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length > 0 && !pathname.startsWith("/admin")) {
    const reserved = new Set([
      "admin",
      "api",
      "login",
      "signup",
      "pricing",
      "about",
      "contact",
    ]);
    if (!reserved.has(segments[0])) {
      return `/${segments.slice(1).join("/")}` || "/";
    }
  }
  return pathname;
}

export function getRequiredPermissionForPath(
  pathname: string
): PermissionKey | null {
  const path = normalizeDashboardPath(pathname);

  for (const rule of PATH_PERMISSION_OVERRIDES) {
    if (rule.match(path)) return rule.permission;
  }

  const module = getModuleForPath(path);
  if (!module) return null;
  return MODULE_VIEW_PERMISSION[module] ?? null;
}
