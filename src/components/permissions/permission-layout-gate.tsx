"use client";

import { usePathname } from "next/navigation";
import { getRequiredPermissionForPath } from "@/lib/permissions/path";
import type { PermissionKey } from "@/lib/permissions/catalog";
import { getRestrictedModuleLabel, getModuleForPath } from "@/lib/plans";
import { PermissionDeniedScreen } from "@/components/permissions/permission-denied-screen";
import { hasPermissionForAttendancePath } from "@/lib/attendance/client-permissions";

export function PermissionLayoutGate({
  permissions,
  isOwner,
  children,
}: {
  permissions: PermissionKey[];
  isOwner: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const required = getRequiredPermissionForPath(pathname);

  const allowed =
    !required ||
    isOwner ||
    permissions.includes(required) ||
    (required.startsWith("attendance.") &&
      hasPermissionForAttendancePath(permissions, isOwner));

  if (allowed) {
    return <>{children}</>;
  }

  const module = getModuleForPath(pathname);
  const featureName = module ? getRestrictedModuleLabel(module) : "This page";

  return <PermissionDeniedScreen featureName={featureName} backHref="/dashboard" />;
}
