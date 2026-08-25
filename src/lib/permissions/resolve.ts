import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { cachedRead, invalidateMemoryCachePrefix } from "@/lib/memory-cache";
import type { PermissionKey } from "@/lib/permissions/catalog";
import {
  DEFAULT_ROLE_PERMISSIONS,
  mapLegacyUserRoleToSystemKey,
  type SystemRoleKey,
} from "@/lib/permissions/defaults";
import { assignUserSalonRoleFromLegacy } from "@/lib/permissions/seed";

export type PermissionSource = "owner" | "role" | "grant" | "deny" | "legacy";

export type ResolvedPermissionEntry = {
  granted: boolean;
  source: PermissionSource;
};

export type ResolvedPermissions = {
  userId: string;
  salonId: string;
  isOwner: boolean;
  roleKey: SystemRoleKey | null;
  hierarchyLevel: number;
  permissions: Set<PermissionKey>;
  details: Map<PermissionKey, ResolvedPermissionEntry>;
};

function legacyPermissionsForRole(role: string): Set<PermissionKey> {
  const key = mapLegacyUserRoleToSystemKey(role);
  return new Set(DEFAULT_ROLE_PERMISSIONS[key]);
}

export function resolveOwnerPermissions(
  userId: string,
  salonId: string
): ResolvedPermissions {
  const permissions = new Set(DEFAULT_ROLE_PERMISSIONS.OWNER);
  const details = new Map<PermissionKey, ResolvedPermissionEntry>();
  for (const key of DEFAULT_ROLE_PERMISSIONS.OWNER) {
    details.set(key, { granted: true, source: "owner" });
  }
  return {
    userId,
    salonId,
    isOwner: true,
    roleKey: "OWNER",
    hierarchyLevel: 100,
    permissions,
    details,
  };
}

async function loadUserPermissionContext(userId: string, salonId: string) {
  const userSelect = {
    id: true,
    role: true,
    salonRoleId: true,
    salonRole: {
      select: {
        key: true,
        hierarchyLevel: true,
        permissions: {
          select: { permission: { select: { key: true } } },
        },
      },
    },
    permissionOverrides: {
      select: {
        granted: true,
        permission: { select: { key: true } },
      },
    },
  } as const;

  try {
    const user = await prisma.user.findFirst({
      where: { id: userId, salonId },
      select: userSelect,
    });

    if (!user) return null;

    if (!user.salonRoleId) {
      try {
        await assignUserSalonRoleFromLegacy(
          prisma,
          userId,
          salonId,
          user.role
        );
        const refreshed = await prisma.user.findFirst({
          where: { id: userId, salonId },
          select: userSelect,
        });
        if (refreshed?.salonRoleId) return refreshed;
      } catch {
        return loadLegacyUserPermissionContext(userId, salonId);
      }
    }

    return user;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[permissions] RBAC columns unavailable, using legacy role fallback", error);
    }
    return loadLegacyUserPermissionContext(userId, salonId);
  }
}

async function loadLegacyUserPermissionContext(userId: string, salonId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId, salonId },
    select: { id: true, role: true },
  });
  if (!user) return null;
  return {
    id: user.id,
    role: user.role,
    salonRoleId: null,
    salonRole: null,
    permissionOverrides: [] as Array<{
      granted: boolean;
      permission: { key: string };
    }>,
  };
}

function resolveFromContext(
  user: NonNullable<Awaited<ReturnType<typeof loadUserPermissionContext>>>,
  salonId: string
): ResolvedPermissions {
  const isOwner =
    user.role === "owner" ||
    user.salonRole?.key === "OWNER";

  const roleKey = (user.salonRole?.key ?? null) as SystemRoleKey | null;
  const hierarchyLevel = user.salonRole?.hierarchyLevel ?? 0;

  const permissions = new Set<PermissionKey>();
  const details = new Map<PermissionKey, ResolvedPermissionEntry>();

  if (isOwner) {
    for (const key of DEFAULT_ROLE_PERMISSIONS.OWNER) {
      permissions.add(key);
      details.set(key, { granted: true, source: "owner" });
    }
    return {
      userId: user.id,
      salonId,
      isOwner: true,
      roleKey: "OWNER",
      hierarchyLevel: 100,
      permissions,
      details,
    };
  }

  const rolePermissionKeys = user.salonRole
    ? user.salonRole.permissions.map(
        (rp) => rp.permission.key as PermissionKey
      )
    : [];

  if (rolePermissionKeys.length === 0) {
    const legacy = legacyPermissionsForRole(user.role);
    for (const key of legacy) {
      permissions.add(key);
      details.set(key, { granted: true, source: "legacy" });
    }
  } else {
    for (const key of rolePermissionKeys) {
      permissions.add(key);
      details.set(key, { granted: true, source: "role" });
    }
  }

  for (const override of user.permissionOverrides) {
    const key = override.permission.key as PermissionKey;
    if (override.granted) {
      permissions.add(key);
      details.set(key, { granted: true, source: "grant" });
    } else {
      permissions.delete(key);
      details.set(key, { granted: false, source: "deny" });
    }
  }

  return {
    userId: user.id,
    salonId,
    isOwner: false,
    roleKey,
    hierarchyLevel,
    permissions,
    details,
  };
}

export const getResolvedPermissions = cache(
  async (userId: string, salonId: string): Promise<ResolvedPermissions> => {
    return cachedRead(`perms:${salonId}:${userId}`, 90, async () => {
      const user = await loadUserPermissionContext(userId, salonId);
      if (!user) {
        return {
          userId,
          salonId,
          isOwner: false,
          roleKey: null,
          hierarchyLevel: 0,
          permissions: new Set(),
          details: new Map(),
        };
      }
      return resolveFromContext(user, salonId);
    });
  }
);

export function hasResolvedPermission(
  resolved: ResolvedPermissions,
  permission: PermissionKey
): boolean {
  if (resolved.isOwner) return true;
  return resolved.permissions.has(permission);
}

export function invalidateResolvedPermissionsCache(
  salonId: string,
  userId?: string
) {
  if (userId) {
    invalidateMemoryCachePrefix(`perms:${salonId}:${userId}`);
    return;
  }
  invalidateMemoryCachePrefix(`perms:${salonId}:`);
}
