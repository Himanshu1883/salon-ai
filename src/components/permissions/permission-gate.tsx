import { getRequiredPermissionForPath } from "@/lib/permissions/path";
import {
  getResolvedPermissions,
  hasResolvedPermission,
} from "@/lib/permissions/resolve";
import { getRestrictedModuleLabel, getModuleForPath } from "@/lib/plans";
import { PermissionDeniedScreen } from "@/components/permissions/permission-denied-screen";

export async function PermissionGate({
  pathname,
  userId,
  salonId,
  children,
}: {
  pathname: string;
  userId: string;
  salonId: string;
  children: React.ReactNode;
}) {
  const required = getRequiredPermissionForPath(pathname);
  if (!required) {
    return <>{children}</>;
  }

  const resolved = await getResolvedPermissions(userId, salonId);
  if (hasResolvedPermission(resolved, required)) {
    return <>{children}</>;
  }

  const module = getModuleForPath(pathname);
  const featureName = module
    ? getRestrictedModuleLabel(module)
    : "this page";

  return (
    <PermissionDeniedScreen featureName={featureName} backHref="/dashboard" />
  );
}
