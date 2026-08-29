import type { PermissionKey } from "@/lib/permissions/catalog";
import type { PlanModule } from "@/lib/plans";

export type DataScope = "all" | "own";

export function resolveDataScope(input: {
  isOwner: boolean;
  roleKey: string | null;
  hierarchyLevel?: number;
  userRole: string;
}): DataScope {
  if (input.isOwner) return "all";

  const key = input.roleKey;
  if (key === "OWNER" || key === "MANAGER" || key === "RECEPTIONIST") {
    return "all";
  }

  const userRole = input.userRole.toLowerCase();
  if (
    userRole === "owner" ||
    userRole === "manager" ||
    userRole === "receptionist"
  ) {
    return "all";
  }

  if (key === "EMPLOYEE") return "own";
  if (userRole === "employee" || userRole === "staff") return "own";

  const hierarchy = input.hierarchyLevel ?? 0;
  if (hierarchy >= 50) return "all";

  return "own";
}

export function usesOwnDataScope(ctx: {
  dataScope: DataScope;
  employeeId?: string | null;
}): boolean {
  return ctx.dataScope === "own";
}

export type DataScopeIdentity = {
  salonId: string;
  employeeId: string | null;
  dataScope: DataScope;
};

export function appointmentScopeWhere(ctx: DataScopeIdentity) {
  const where: { salonId: string; employeeId?: string } = {
    salonId: ctx.salonId,
  };
  if (ctx.dataScope === "own") {
    where.employeeId = ctx.employeeId ?? "__unlinked__";
  }
  return where;
}

export function attendanceScopeWhere(ctx: DataScopeIdentity) {
  return appointmentScopeWhere(ctx);
}

export function customerScopeWhere(ctx: DataScopeIdentity) {
  const where: Record<string, unknown> = { salonId: ctx.salonId };
  if (ctx.dataScope === "own") {
    const employeeId = ctx.employeeId ?? "__unlinked__";
    where.OR = [
      { appointments: { some: { employeeId, salonId: ctx.salonId } } },
      { invoices: { some: { employeeId, salonId: ctx.salonId } } },
      {
        invoices: {
          some: {
            salonId: ctx.salonId,
            lineItems: { some: { employeeId } },
          },
        },
      },
      { queueEntries: { some: { employeeId, salonId: ctx.salonId } } },
    ];
  }
  return where;
}

export function salesInvoiceScopeWhere(ctx: DataScopeIdentity) {
  const where: Record<string, unknown> = { salonId: ctx.salonId };
  if (ctx.dataScope === "own") {
    const employeeId = ctx.employeeId ?? "__unlinked__";
    where.OR = [
      { employeeId },
      { lineItems: { some: { employeeId } } },
    ];
  }
  return where;
}

export function isAttributedToEmployee(
  employeeId: string,
  record: {
    employeeId?: string | null;
    lineItems?: Array<{ employeeId?: string | null }>;
  }
) {
  if (record.employeeId === employeeId) return true;
  return Boolean(
    record.lineItems?.some((item) => item.employeeId === employeeId)
  );
}

export const STAFF_ANALYTICS_PERMISSIONS: PermissionKey[] = [
  "team.analytics.view",
  "team.analytics.view_all",
  "team.analytics.view_own",
];

export function canAccessStaffAnalyticsPermissions(
  permissions: Set<PermissionKey> | PermissionKey[],
  isOwner: boolean
) {
  if (isOwner) return true;
  const set = permissions instanceof Set ? permissions : new Set(permissions);
  return STAFF_ANALYTICS_PERMISSIONS.some((key) => set.has(key));
}

const EMPLOYEE_SALON_WIDE_MODULES = new Set<PlanModule>([
  "reports",
  "analytics",
  "expense",
  "sales",
  "settings",
  "projects",
]);

export function isEmployeeHiddenNavHref(href: string, label: string) {
  if (label === "Calendar" || label === "My Time") return true;
  if (href === "/settings/billing" || href === "/settings/subscription") {
    return true;
  }
  return false;
}

export function filterEmployeeNavModules<
  T extends { href: string; label: string; module: PlanModule },
>(items: T[], permissions: Set<PermissionKey>): T[] {
  return items.filter((item) => {
    if (isEmployeeHiddenNavHref(item.href, item.label)) return false;
    if (EMPLOYEE_SALON_WIDE_MODULES.has(item.module)) return false;
    if (item.module === "staff") return permissions.has("team.view");
    return true;
  });
}
