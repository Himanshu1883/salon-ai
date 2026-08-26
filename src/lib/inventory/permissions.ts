import { requireSession } from "@/lib/auth";
import {
  getResolvedPermissions,
  hasResolvedPermission,
} from "@/lib/permissions/resolve";

export async function getInventoryAccess() {
  const session = await requireSession();
  const salonId = session.user.salonId!;
  const role = session.user.role ?? "staff";

  if (role === "owner") {
    return {
      session,
      role,
      canWrite: true,
      canRead: true,
    };
  }

  const resolved = await getResolvedPermissions(session.user.id, salonId);

  const canRead =
    resolved.isOwner || hasResolvedPermission(resolved, "inventory.view");
  const canWrite =
    resolved.isOwner ||
    hasResolvedPermission(resolved, "inventory.create") ||
    hasResolvedPermission(resolved, "inventory.update") ||
    hasResolvedPermission(resolved, "inventory.adjust");

  return {
    session,
    role,
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
