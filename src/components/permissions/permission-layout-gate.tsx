"use client";

import { usePathname } from "next/navigation";
import { getRequiredPermissionForPath } from "@/lib/permissions/path";
import type { PermissionKey } from "@/lib/permissions/catalog";
import {
  getRestrictedModuleLabel,
  getModuleForPath,
  isEmployeeNavUser,
} from "@/lib/plans";
import { PermissionDeniedScreen } from "@/components/permissions/permission-denied-screen";
import { hasPermissionForAttendancePath } from "@/lib/attendance/client-permissions";
import { canAccessStaffAnalyticsPermissions } from "@/lib/permissions/data-scope-core";

export function PermissionLayoutGate({
  permissions,
  isOwner,
  roleKey = null,
  userRole = "owner",
  children,
}: {
  permissions: PermissionKey[];
  isOwner: boolean;
  roleKey?: string | null;
  userRole?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const required = getRequiredPermissionForPath(pathname);
  const employeeNav = isEmployeeNavUser(userRole, isOwner, roleKey);
  const analyticsPath =
    pathname.includes("/team/analytics") ||
    pathname.includes("/employee/analytics");
  const teamMembersPath = pathname.includes("/team/members");

  const allowed =
    !required ||
    isOwner ||
    permissions.includes(required) ||
    (required.startsWith("attendance.") &&
      hasPermissionForAttendancePath(permissions, isOwner)) ||
    (analyticsPath &&
      canAccessStaffAnalyticsPermissions(permissions, isOwner)) ||
    (employeeNav && teamMembersPath);

  if (allowed) {
    return <>{children}</>;
  }

  const module = getModuleForPath(pathname);
  const featureName = module ? getRestrictedModuleLabel(module) : "This page";

  return <PermissionDeniedScreen featureName={featureName} backHref="/dashboard" />;
}
