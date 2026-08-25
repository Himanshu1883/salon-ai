import { requireSession } from "@/lib/auth";
import {
  getResolvedPermissions,
  hasResolvedPermission,
} from "@/lib/permissions/resolve";

export async function getInventoryAccess() {
  const session = await requireSession();
  const resolved = await getResolvedPermissions(
    session.user.id,
    session.user.salonId!
  );

  const canRead =
    resolved.isOwner || hasResolvedPermission(resolved, "inventory.view");
  const canWrite =
    resolved.isOwner ||
    hasResolvedPermission(resolved, "inventory.create") ||
    hasResolvedPermission(resolved, "inventory.update") ||
    hasResolvedPermission(resolved, "inventory.adjust");

  return {
    session,
    role: session.user.role ?? "staff",
    canWrite,
    canRead,
  };
}

export async function requireInventoryWrite() {
  const access = await getInventoryAccess();
  if (!access.canWrite) {
    throw new Error("Forbidden: inventory write access required");
  }
  return access;
}
