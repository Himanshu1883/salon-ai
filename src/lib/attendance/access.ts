import { requireSession } from "@/lib/auth";
import { resolveSessionEmployee } from "@/lib/auth/session-employee";
import { getResolvedPermissions } from "@/lib/permissions/resolve";
import type { PermissionKey } from "@/lib/permissions/catalog";
import { PermissionDeniedError } from "@/lib/permissions/require";
import { resolveDataScope, type DataScope } from "@/lib/permissions/data-scope-core";

export { resolveSessionEmployee };

export type AttendanceAccessContext = {
  userId: string;
  salonId: string;
  isOwner: boolean;
  employeeId: string | null;
  employeeName: string | null;
  permissions: Set<PermissionKey>;
  dataScope: DataScope;
};

export async function getAttendanceAccessContext(): Promise<AttendanceAccessContext> {
  const session = await requireSession();
  const salonId = session.user.salonId!;
  const resolved = await getResolvedPermissions(session.user.id, salonId);
  const employee = await resolveSessionEmployee(
    session.user.id,
    salonId,
    session.user.email
  );

  return {
    userId: session.user.id,
    salonId,
    isOwner: resolved.isOwner,
    employeeId: employee.employeeId,
    employeeName: employee.employeeName,
    permissions: resolved.permissions,
    dataScope: resolveDataScope({
      isOwner: resolved.isOwner,
      roleKey: resolved.roleKey,
      hierarchyLevel: resolved.hierarchyLevel,
      userRole: session.user.role ?? "employee",
    }),
  };
}

export function hasAttendancePermission(
  ctx: AttendanceAccessContext,
  permission: PermissionKey
): boolean {
  if (ctx.isOwner) return true;
  return ctx.permissions.has(permission);
}

export function canViewAllAttendance(ctx: AttendanceAccessContext): boolean {
  if (ctx.dataScope === "own") return false;
  return (
    ctx.isOwner ||
    ctx.permissions.has("attendance.view") ||
    ctx.permissions.has("attendance.manage")
  );
}

export function canViewOwnAttendance(ctx: AttendanceAccessContext): boolean {
  return (
    canViewAllAttendance(ctx) ||
    ctx.permissions.has("attendance.view_own") ||
    ctx.permissions.has("attendance.check_in") ||
    ctx.permissions.has("attendance.check_out")
  );
}

export function canCheckIn(ctx: AttendanceAccessContext): boolean {
  return (
    ctx.isOwner ||
    ctx.permissions.has("attendance.check_in") ||
    ctx.permissions.has("attendance.manage")
  );
}

export function canCheckOut(ctx: AttendanceAccessContext): boolean {
  return (
    ctx.isOwner ||
    ctx.permissions.has("attendance.check_out") ||
    ctx.permissions.has("attendance.manage")
  );
}

export function canManageAttendance(ctx: AttendanceAccessContext): boolean {
  return ctx.isOwner || ctx.permissions.has("attendance.manage");
}

export function canExportAttendance(ctx: AttendanceAccessContext): boolean {
  return (
    ctx.isOwner ||
    ctx.permissions.has("attendance.export") ||
    ctx.permissions.has("attendance.manage")
  );
}

export function canViewReports(ctx: AttendanceAccessContext): boolean {
  if (ctx.dataScope === "own") return false;
  return (
    ctx.isOwner ||
    ctx.permissions.has("attendance.reports") ||
    ctx.permissions.has("attendance.view") ||
    ctx.permissions.has("attendance.manage")
  );
}

export async function requireAttendancePermission(
  ctx: AttendanceAccessContext,
  permission: PermissionKey
) {
  if (!hasAttendancePermission(ctx, permission)) {
    throw new PermissionDeniedError(permission);
  }
}

/** Ensure caller may access a specific employee's attendance data. */
export function assertEmployeeAttendanceAccess(
  ctx: AttendanceAccessContext,
  targetEmployeeId: string
) {
  if (canViewAllAttendance(ctx)) return;
  if (
    ctx.employeeId === targetEmployeeId &&
    canViewOwnAttendance(ctx)
  ) {
    return;
  }
  throw new PermissionDeniedError("attendance.view");
}

export function canAccessAttendanceModule(ctx: AttendanceAccessContext): boolean {
  return (
    canViewAllAttendance(ctx) ||
    canViewOwnAttendance(ctx) ||
    canCheckIn(ctx) ||
    canCheckOut(ctx)
  );
}
