import { requireSession } from "@/lib/auth";
import type { PermissionKey } from "@/lib/permissions/catalog";
import {
  getResolvedPermissions,
  hasResolvedPermission,
} from "@/lib/permissions/resolve";

export class PermissionDeniedError extends Error {
  code = "PERMISSION_DENIED" as const;

  constructor(permission: PermissionKey) {
    super(`Forbidden: missing permission ${permission}`);
    this.name = "PermissionDeniedError";
  }
}

export async function getSessionPermissions() {
  const session = await requireSession();
  const salonId = session.user.salonId!;
  return getResolvedPermissions(session.user.id, salonId);
}

export async function hasPermission(permission: PermissionKey): Promise<boolean> {
  const session = await requireSession();
  if (session.user.role === "owner") {
    return true;
  }
  const resolved = await getResolvedPermissions(
    session.user.id,
    session.user.salonId!
  );
  return hasResolvedPermission(resolved, permission);
}

export async function requirePermission(permission: PermissionKey) {
  const session = await requireSession();
  if (session.user.role === "owner") {
    return session;
  }
  const resolved = await getResolvedPermissions(
    session.user.id,
    session.user.salonId!
  );
  if (!hasResolvedPermission(resolved, permission)) {
    throw new PermissionDeniedError(permission);
  }
  return session;
}

export async function requireAnyPermission(permissions: PermissionKey[]) {
  const session = await requireSession();
  if (session.user.role === "owner") {
    return session;
  }
  const resolved = await getResolvedPermissions(
    session.user.id,
    session.user.salonId!
  );
  const allowed = permissions.some((p) =>
    hasResolvedPermission(resolved, p)
  );
  if (!allowed) {
    throw new PermissionDeniedError(permissions[0]);
  }
  return session;
}

export async function requireAllPermissions(permissions: PermissionKey[]) {
  const session = await requireSession();
  if (session.user.role === "owner") {
    return session;
  }
  const resolved = await getResolvedPermissions(
    session.user.id,
    session.user.salonId!
  );
  for (const permission of permissions) {
    if (!hasResolvedPermission(resolved, permission)) {
      throw new PermissionDeniedError(permission);
    }
  }
  return session;
}
