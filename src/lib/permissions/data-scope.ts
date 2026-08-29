import { cache } from "react";
import { getAuthSession, requireSession } from "@/lib/auth";
import { resolveSessionEmployee } from "@/lib/auth/session-employee";
import {
  PermissionDeniedError,
  requirePermission,
} from "@/lib/permissions/require";
import {
  getResolvedPermissions,
  type ResolvedPermissions,
} from "@/lib/permissions/resolve";
import type { PermissionKey } from "@/lib/permissions/catalog";
import type { SystemRoleKey } from "@/lib/permissions/defaults";
import {
  appointmentScopeWhere,
  attendanceScopeWhere,
  customerScopeWhere,
  isAttributedToEmployee,
  resolveDataScope,
  salesInvoiceScopeWhere,
  usesOwnDataScope,
  STAFF_ANALYTICS_PERMISSIONS,
  canAccessStaffAnalyticsPermissions,
  filterEmployeeNavModules,
  isEmployeeHiddenNavHref,
  type DataScope,
} from "@/lib/permissions/data-scope-core";

export type DataScopeContext = {
  userId: string;
  salonId: string;
  userRole: string;
  isOwner: boolean;
  roleKey: SystemRoleKey | null;
  hierarchyLevel: number;
  permissions: Set<PermissionKey>;
  employeeId: string | null;
  employeeName: string | null;
  dataScope: DataScope;
};

export {
  appointmentScopeWhere,
  attendanceScopeWhere,
  customerScopeWhere,
  isAttributedToEmployee,
  resolveDataScope,
  salesInvoiceScopeWhere,
  usesOwnDataScope,
  STAFF_ANALYTICS_PERMISSIONS,
  canAccessStaffAnalyticsPermissions,
  filterEmployeeNavModules,
  isEmployeeHiddenNavHref,
};

export type { DataScope };

async function buildDataScopeContext(session: {
  user: {
    id: string;
    salonId?: string | null;
    role?: string | null;
    email?: string | null;
  };
}): Promise<DataScopeContext> {
  const salonId = session.user.salonId!;
  const userRole = session.user.role ?? "employee";
  const resolved: ResolvedPermissions = await getResolvedPermissions(
    session.user.id,
    salonId
  );
  const employee = await resolveSessionEmployee(
    session.user.id,
    salonId,
    session.user.email
  );
  const dataScope = resolveDataScope({
    isOwner: resolved.isOwner,
    roleKey: resolved.roleKey,
    hierarchyLevel: resolved.hierarchyLevel,
    userRole,
  });

  return {
    userId: session.user.id,
    salonId,
    userRole,
    isOwner: resolved.isOwner,
    roleKey: resolved.roleKey,
    hierarchyLevel: resolved.hierarchyLevel,
    permissions: resolved.permissions,
    employeeId: employee.employeeId,
    employeeName: employee.employeeName,
    dataScope,
  };
}

export const getDataScopeContext = cache(async (): Promise<DataScopeContext> => {
  const session = await requireSession();
  return buildDataScopeContext(session);
});

/** Session lookup without redirect() — safe inside API routes. */
export async function getDataScopeContextFromAuth(): Promise<DataScopeContext | null> {
  const session = await getAuthSession();
  if (!session?.user?.id || !session.user.salonId) return null;
  return buildDataScopeContext(session);
}

export function scopedEmployeeId(ctx: DataScopeContext): string | null {
  if (ctx.dataScope !== "own") return null;
  return ctx.employeeId;
}

export function assertEmployeeResourceAccess(
  ctx: DataScopeContext,
  resourceEmployeeId: string | null | undefined,
  permission: PermissionKey = "appointments.view"
) {
  if (ctx.dataScope !== "own") return;
  if (!ctx.employeeId || resourceEmployeeId !== ctx.employeeId) {
    throw new PermissionDeniedError(permission);
  }
}

export async function requireSalonWidePermission(permission: PermissionKey) {
  const session = await requirePermission(permission);
  const ctx = await getDataScopeContext();
  if (ctx.dataScope === "own") {
    throw new PermissionDeniedError(permission);
  }
  return session;
}
