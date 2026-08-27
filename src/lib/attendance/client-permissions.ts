import type { PermissionKey } from "@/lib/permissions/catalog";

/** Client-safe attendance path permission check (no server imports). */
export function hasPermissionForAttendancePath(
  permissions: PermissionKey[],
  isOwner: boolean
): boolean {
  if (isOwner) return true;
  const set = new Set(permissions);
  return (
    set.has("attendance.view") ||
    set.has("attendance.view_own") ||
    set.has("attendance.check_in") ||
    set.has("attendance.check_out") ||
    set.has("attendance.manage") ||
    set.has("attendance.reports")
  );
}
