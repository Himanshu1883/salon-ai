"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/auth";
import { logPlatformAdminAction } from "@/lib/platform-admin-access";
import type { PlatformRole } from "@/lib/platform-permissions";

const platformRoleSchema = z.enum(["SUPER_ADMIN", "CUSTOMER_SUPPORT"]);

const createPlatformUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: platformRoleSchema,
});

const updatePlatformUserSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Invalid email"),
  role: platformRoleSchema,
  password: z.string().min(8).optional().or(z.literal("")),
  isActive: z.boolean(),
});

export type PlatformUserRow = {
  id: string;
  name: string;
  email: string;
  platformRole: PlatformRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export async function listPlatformUsers(): Promise<
  { users: PlatformUserRow[] } | { error: string }
> {
  try {
    await requireSuperAdmin();

    const users = await prisma.user.findMany({
      where: {
        OR: [{ isSuperAdmin: true }, { platformRole: { not: null } }],
        salonId: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        platformRole: true,
        isSuperAdmin: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return {
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        platformRole:
          user.platformRole ??
          (user.isSuperAdmin ? "SUPER_ADMIN" : "CUSTOMER_SUPPORT"),
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
    };
  } catch {
    return { error: "Unauthorized" };
  }
}

export async function createPlatformUser(input: {
  name: string;
  email: string;
  password: string;
  role: PlatformRole;
}): Promise<{ success: true; userId: string } | { error: string }> {
  try {
    const session = await requireSuperAdmin();
    const parsed = createPlatformUserSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
    }

    const { name, email, password, role } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      return { error: "A user with this email already exists" };
    }

    const hashed = await bcrypt.hash(password, 10);
    const isSuperAdmin = role === "SUPER_ADMIN";

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashed,
        role: "owner",
        isSuperAdmin,
        platformRole: role,
        isActive: true,
        salonId: null,
      },
    });

    await logPlatformAdminAction({
      action: "platform_user_created",
      adminUserId: session.user.id,
      targetUserId: user.id,
      metadata: { role, email: normalizedEmail },
    });

    revalidatePath("/admin/users");
    return { success: true, userId: user.id };
  } catch {
    return { error: "Unauthorized" };
  }
}

export async function updatePlatformUser(input: {
  id: string;
  name: string;
  email: string;
  role: PlatformRole;
  password?: string;
  isActive: boolean;
}): Promise<{ success: true } | { error: string }> {
  try {
    const session = await requireSuperAdmin();
    const parsed = updatePlatformUserSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
    }

    const { id, name, email, role, password, isActive } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing || existing.salonId) {
      return { error: "Platform user not found" };
    }

    const platformUser =
      existing.isSuperAdmin || existing.platformRole !== null;
    if (!platformUser) {
      return { error: "Platform user not found" };
    }

    if (existing.email === "admin@salon.ai" && role !== "SUPER_ADMIN") {
      return { error: "The primary super admin cannot be demoted" };
    }

    if (existing.email === "admin@salon.ai" && !isActive) {
      return { error: "The primary super admin cannot be deactivated" };
    }

    const emailTaken = await prisma.user.findFirst({
      where: { email: normalizedEmail, NOT: { id } },
    });
    if (emailTaken) {
      return { error: "A user with this email already exists" };
    }

    const isSuperAdmin = role === "SUPER_ADMIN";
    const data: {
      name: string;
      email: string;
      platformRole: PlatformRole;
      isSuperAdmin: boolean;
      isActive: boolean;
      password?: string;
    } = {
      name,
      email: normalizedEmail,
      platformRole: role,
      isSuperAdmin,
      isActive,
    };

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    await prisma.user.update({ where: { id }, data });

    await logPlatformAdminAction({
      action: "platform_user_updated",
      adminUserId: session.user.id,
      targetUserId: id,
      metadata: { role, isActive, email: normalizedEmail },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch {
    return { error: "Unauthorized" };
  }
}

export async function deletePlatformUser(
  id: string
): Promise<{ success: true } | { error: string }> {
  try {
    const session = await requireSuperAdmin();

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing || existing.salonId) {
      return { error: "Platform user not found" };
    }

    if (existing.email === "admin@salon.ai") {
      return { error: "The primary super admin cannot be deleted" };
    }

    const platformUser =
      existing.isSuperAdmin || existing.platformRole !== null;
    if (!platformUser) {
      return { error: "Platform user not found" };
    }

    await prisma.user.delete({ where: { id } });

    await logPlatformAdminAction({
      action: "platform_user_deleted",
      adminUserId: session.user.id,
      targetUserId: id,
      metadata: { email: existing.email },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch {
    return { error: "Unauthorized" };
  }
}
