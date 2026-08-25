import type { PrismaClient } from "@/generated/prisma/client";
import { PERMISSION_DEFINITIONS } from "@/lib/permissions/catalog";
import {
  DEFAULT_ROLE_PERMISSIONS,
  mapLegacyUserRoleToSystemKey,
  SYSTEM_ROLE_DEFINITIONS,
  type SystemRoleKey,
} from "@/lib/permissions/defaults";

const systemRoleCount = Object.keys(SYSTEM_ROLE_DEFINITIONS).length;
const ensuredSalonIds = new Set<string>();
let globalPermissionsReady = false;

async function ensureGlobalPermissions(prisma: PrismaClient) {
  if (globalPermissionsReady) return;

  const count = await prisma.permission.count();
  if (count >= PERMISSION_DEFINITIONS.length) {
    globalPermissionsReady = true;
    return;
  }

  await seedGlobalPermissions(prisma);
  globalPermissionsReady = true;
}

export async function seedGlobalPermissions(prisma: PrismaClient) {
  for (const def of PERMISSION_DEFINITIONS) {
    await prisma.permission.upsert({
      where: { key: def.key },
      create: {
        key: def.key,
        name: def.name,
        description: undefined,
        module: def.module,
        action: def.action,
      },
      update: {
        name: def.name,
        description: undefined,
        module: def.module,
        action: def.action,
      },
    });
  }
}

export async function ensureSalonSystemRoles(
  prisma: PrismaClient,
  salonId: string
) {
  if (ensuredSalonIds.has(salonId)) return;

  const existingRoles = await prisma.salonRole.count({
    where: { salonId, isSystemRole: true },
  });
  if (existingRoles >= systemRoleCount) {
    ensuredSalonIds.add(salonId);
    return;
  }

  await ensureGlobalPermissions(prisma);

  const permissions = await prisma.permission.findMany({
    select: { id: true, key: true },
  });
  const permissionIdByKey = new Map(permissions.map((p) => [p.key, p.id]));

  const roleKeys = Object.keys(SYSTEM_ROLE_DEFINITIONS) as SystemRoleKey[];

  for (const key of roleKeys) {
    const meta = SYSTEM_ROLE_DEFINITIONS[key];
    const role = await prisma.salonRole.upsert({
      where: { salonId_key: { salonId, key } },
      create: {
        salonId,
        key,
        name: meta.name,
        description: meta.description,
        hierarchyLevel: meta.hierarchyLevel,
        isSystemRole: true,
      },
      update: {
        name: meta.name,
        description: meta.description,
        hierarchyLevel: meta.hierarchyLevel,
        isSystemRole: true,
      },
    });

    const desiredKeys = DEFAULT_ROLE_PERMISSIONS[key];
    const desiredPermissionIds = desiredKeys
      .map((k) => permissionIdByKey.get(k))
      .filter((id): id is string => Boolean(id));

    await prisma.salonRolePermission.deleteMany({
      where: { roleId: role.id },
    });

    if (desiredPermissionIds.length > 0) {
      await prisma.salonRolePermission.createMany({
        data: desiredPermissionIds.map((permissionId) => ({
          roleId: role.id,
          permissionId,
        })),
        skipDuplicates: true,
      });
    }
  }

  ensuredSalonIds.add(salonId);
}

export async function assignUserSalonRoleFromLegacy(
  prisma: PrismaClient,
  userId: string,
  salonId: string,
  legacyRole: string
) {
  await ensureSalonSystemRoles(prisma, salonId);

  const systemKey = mapLegacyUserRoleToSystemKey(legacyRole);
  const salonRole = await prisma.salonRole.findUnique({
    where: { salonId_key: { salonId, key: systemKey } },
    select: { id: true },
  });

  if (!salonRole) return;

  await prisma.user.update({
    where: { id: userId },
    data: { salonRoleId: salonRole.id },
  });
}

export async function backfillSalonUserRoles(
  prisma: PrismaClient,
  salonId: string
) {
  await ensureSalonSystemRoles(prisma, salonId);

  const users = await prisma.user.findMany({
    where: { salonId, isSuperAdmin: false, platformRole: null },
    select: { id: true, role: true, salonRoleId: true },
  });

  for (const user of users) {
    if (user.salonRoleId) continue;
    await assignUserSalonRoleFromLegacy(
      prisma,
      user.id,
      salonId,
      user.role
    );
  }
}

export async function backfillAllSalonRoles(prisma: PrismaClient) {
  await ensureGlobalPermissions(prisma);
  const salons = await prisma.salon.findMany({ select: { id: true } });
  for (const salon of salons) {
    await backfillSalonUserRoles(prisma, salon.id);
  }
}
