"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import {
  ALL_PERMISSION_KEYS,
  getPermissionsByModule,
  type PermissionKey,
} from "@/lib/permissions/catalog";
import {
  mapLegacyUserRoleToSystemKey,
  SYSTEM_ROLE_DEFINITIONS,
  type SystemRoleKey,
} from "@/lib/permissions/defaults";
import {
  getResolvedPermissions,
  type PermissionSource,
} from "@/lib/permissions/resolve";
import { requirePermission } from "@/lib/permissions/require";
import {
  assignUserSalonRoleFromLegacy,
  ensureSalonSystemRoles,
} from "@/lib/permissions/seed";
import { z } from "zod";

const updateRoleSchema = z.object({
  userId: z.string().min(1),
  roleKey: z.enum(["OWNER", "MANAGER", "RECEPTIONIST", "EMPLOYEE"]),
});

const permissionOverrideEntrySchema = z.object({
  permissionKey: z.enum(
    ALL_PERMISSION_KEYS as [PermissionKey, ...PermissionKey[]]
  ),
  granted: z.boolean(),
});

const updateOverridesSchema = z.object({
  userId: z.string().min(1),
  overrides: z.array(permissionOverrideEntrySchema),
});

const createSalonLoginUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  roleKey: z.enum(["MANAGER", "RECEPTIONIST", "EMPLOYEE"]),
  overrides: z.array(permissionOverrideEntrySchema).optional(),
});

function legacyRoleFromSystemKey(key: SystemRoleKey): string {
  switch (key) {
    case "OWNER":
      return "owner";
    case "MANAGER":
      return "manager";
    case "RECEPTIONIST":
      return "receptionist";
    default:
      return "staff";
  }
}

async function assertCanManageTargetUser(
  actorId: string,
  salonId: string,
  targetUserId: string
) {
  if (actorId === targetUserId) {
    throw new Error("You cannot modify your own permissions");
  }

  const [actor, target] = await Promise.all([
    prisma.user.findFirst({
      where: { id: actorId, salonId },
      select: {
        role: true,
        salonRole: { select: { hierarchyLevel: true, key: true } },
      },
    }),
    prisma.user.findFirst({
      where: { id: targetUserId, salonId },
      select: { id: true, role: true },
    }),
  ]);

  if (!target) throw new Error("User not found");

  const actorLevel =
    actor?.role === "owner"
      ? 100
      : (actor?.salonRole?.hierarchyLevel ?? 0);

  if (target.role === "owner" && actor?.role !== "owner") {
    throw new Error("Only the owner can manage the owner account");
  }

  return { actorLevel, target };
}

export async function getSalonRolesAction() {
  const session = await requireSession();
  await requirePermission("roles.view");
  const salonId = session.user.salonId!;
  await ensureSalonSystemRoles(prisma, salonId);

  const roles = await prisma.salonRole.findMany({
    where: { salonId },
    orderBy: { hierarchyLevel: "desc" },
    include: {
      _count: { select: { users: true, permissions: true } },
    },
  });

  return roles.map((role) => ({
    id: role.id,
    key: role.key,
    name: role.name,
    description: role.description,
    hierarchyLevel: role.hierarchyLevel,
    isSystemRole: role.isSystemRole,
    userCount: role._count.users,
    permissionCount: role._count.permissions,
  }));
}

export async function getSalonUsersForPermissionsAction() {
  const session = await requireSession();
  await requirePermission("permissions.manage");
  const salonId = session.user.salonId!;

  const users = await prisma.user.findMany({
    where: { salonId, isActive: true },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      salonRole: { select: { key: true, name: true } },
    },
    orderBy: { name: "asc" },
  });

  return users;
}

export async function getUserPermissionDetailsAction(userId: string) {
  const session = await requireSession();
  await requirePermission("permissions.manage");
  const salonId = session.user.salonId!;

  const user = await prisma.user.findFirst({
    where: { id: userId, salonId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      salonRole: { select: { key: true, name: true, hierarchyLevel: true } },
    },
  });

  if (!user) return { error: "User not found" as const };

  const resolved = await getResolvedPermissions(userId, salonId);
  const grouped = getPermissionsByModule();

  const modules = Object.entries(grouped).map(([module, defs]) => ({
    module,
    permissions: defs.map((def) => {
      const key = def.key as PermissionKey;
      const entry = resolved.details.get(key);
      return {
        key,
        name: def.name,
        granted: resolved.permissions.has(key),
        source: (entry?.source ?? "deny") as PermissionSource | "deny",
      };
    }),
  }));

  return {
    user,
    roleKey: resolved.roleKey,
    isOwner: resolved.isOwner,
    modules,
  };
}

export async function updateUserSalonRoleAction(data: unknown) {
  const session = await requireSession();
  await requirePermission("permissions.manage");
  const salonId = session.user.salonId!;

  const parsed = updateRoleSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { userId, roleKey } = parsed.data;

  try {
    const { actorLevel } = await assertCanManageTargetUser(
      session.user.id,
      salonId,
      userId
    );

    const targetRoleLevel = SYSTEM_ROLE_DEFINITIONS[roleKey].hierarchyLevel;
    if (targetRoleLevel >= actorLevel && session.user.role !== "owner") {
      return { error: "You cannot assign a role at or above your own level" };
    }

    if (roleKey === "OWNER" && session.user.role !== "owner") {
      return { error: "Only the owner can assign the owner role" };
    }

    await ensureSalonSystemRoles(prisma, salonId);
    await assignUserSalonRoleFromLegacy(
      prisma,
      userId,
      salonId,
      legacyRoleFromSystemKey(roleKey)
    );

    await prisma.user.update({
      where: { id: userId },
      data: { role: legacyRoleFromSystemKey(roleKey) },
    });

    revalidatePath("/team");
    return { success: true as const };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to update role",
    };
  }
}

async function applyUserPermissionOverrides(
  userId: string,
  salonId: string,
  overrides: Array<{ permissionKey: PermissionKey; granted: boolean }>
) {
  const roleDefaults = await getRolePermissionKeys(userId, salonId);
  const permissions = await prisma.permission.findMany({
    select: { id: true, key: true },
  });
  const idByKey = new Map(permissions.map((p) => [p.key, p.id]));

  await prisma.userPermissionOverride.deleteMany({ where: { userId } });

  const toCreate: Array<{
    userId: string;
    permissionId: string;
    granted: boolean;
  }> = [];

  for (const { permissionKey, granted } of overrides) {
    const permissionId = idByKey.get(permissionKey);
    if (!permissionId) continue;
    const roleHas = roleDefaults.has(permissionKey);
    if (granted === roleHas) continue;
    toCreate.push({ userId, permissionId, granted });
  }

  if (toCreate.length > 0) {
    await prisma.userPermissionOverride.createMany({ data: toCreate });
  }
}

async function getRolePermissionKeys(
  userId: string,
  salonId: string
): Promise<Set<PermissionKey>> {
  const user = await prisma.user.findFirst({
    where: { id: userId, salonId },
    select: {
      role: true,
      salonRole: {
        select: {
          permissions: {
            select: { permission: { select: { key: true } } },
          },
        },
      },
    },
  });

  if (!user?.salonRole) {
    const { mapLegacyUserRoleToSystemKey, DEFAULT_ROLE_PERMISSIONS } =
      await import("@/lib/permissions/defaults");
    const key = mapLegacyUserRoleToSystemKey(user?.role ?? "staff");
    return new Set(DEFAULT_ROLE_PERMISSIONS[key]);
  }

  return new Set(
    user.salonRole.permissions.map(
      (entry) => entry.permission.key as PermissionKey
    )
  );
}

export async function updateUserPermissionOverridesAction(data: unknown) {
  const session = await requireSession();
  await requirePermission("permissions.manage");
  const salonId = session.user.salonId!;

  const parsed = updateOverridesSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { userId, overrides } = parsed.data;

  try {
    await assertCanManageTargetUser(session.user.id, salonId, userId);

    const target = await prisma.user.findFirst({
      where: { id: userId, salonId },
      select: { role: true, salonRole: { select: { key: true } } },
    });

    if (
      target?.role === "owner" ||
      target?.salonRole?.key === "OWNER"
    ) {
      return { error: "Owner permissions cannot be customized" };
    }

    await applyUserPermissionOverrides(userId, salonId, overrides);

    revalidatePath("/team");
    return { success: true as const };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to update permissions",
    };
  }
}

export async function resetUserPermissionsToRoleDefaultsAction(userId: string) {
  const session = await requireSession();
  await requirePermission("permissions.manage");
  const salonId = session.user.salonId!;

  try {
    await assertCanManageTargetUser(session.user.id, salonId, userId);
    await prisma.userPermissionOverride.deleteMany({ where: { userId } });
    revalidatePath("/team");
    return { success: true as const };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "Unable to reset permissions",
    };
  }
}

export async function getCurrentUserPermissionKeysAction() {
  const session = await requireSession();
  const salonId = session.user.salonId!;
  const resolved = await getResolvedPermissions(session.user.id, salonId);
  return {
    isOwner: resolved.isOwner,
    permissions: Array.from(resolved.permissions),
  };
}

export async function createSalonLoginUserAction(data: unknown) {
  const session = await requireSession();
  await requirePermission("permissions.manage");
  const salonId = session.user.salonId!;

  const parsed = createSalonLoginUserSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { name, email, password, roleKey, overrides = [] } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const actor = await prisma.user.findFirst({
    where: { id: session.user.id, salonId },
    select: {
      role: true,
      salonRole: { select: { hierarchyLevel: true } },
    },
  });

  const actorLevel =
    actor?.role === "owner" ? 100 : (actor?.salonRole?.hierarchyLevel ?? 0);
  const targetRoleLevel = SYSTEM_ROLE_DEFINITIONS[roleKey].hierarchyLevel;

  if (targetRoleLevel >= actorLevel && session.user.role !== "owner") {
    return { error: "You cannot create a user with this role level" };
  }

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, salonId: true, isActive: true },
  });

  if (existing) {
    if (existing.salonId === salonId && existing.isActive) {
      return { error: "A login account with this email already exists" };
    }
    if (existing.salonId && existing.salonId !== salonId) {
      return { error: "This email is already registered to another salon" };
    }
    if (!existing.salonId && existing.isActive) {
      return { error: "This email is already used by a platform account" };
    }
  }

  const legacyRole = legacyRoleFromSystemKey(roleKey);
  const hashed = await bcrypt.hash(password, 10);

  try {
    await ensureSalonSystemRoles(prisma, salonId);

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashed,
        role: legacyRole,
        salonId,
        isActive: true,
        isSuperAdmin: false,
        platformRole: null,
      },
      select: { id: true },
    });

    await assignUserSalonRoleFromLegacy(
      prisma,
      user.id,
      salonId,
      legacyRole
    );

    if (overrides.length > 0) {
      await applyUserPermissionOverrides(user.id, salonId, overrides);
    }

    revalidatePath("/team");
    revalidatePath("/team/access");

    return {
      success: true as const,
      userId: user.id,
      email: normalizedEmail,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to create login account",
    };
  }
}