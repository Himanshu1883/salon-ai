import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import {
  generatePasswordResetToken,
  hashPasswordResetToken,
} from "@/lib/password-reset";
import {
  canPlatformAdminAccessSalon,
  IMPERSONATION_TOKEN_EXPIRY_MS,
} from "@/lib/platform-admin-access-shared";

export {
  canPlatformAdminAccessSalon,
  generateTemporaryPassword,
  IMPERSONATION_TOKEN_EXPIRY_MS,
} from "@/lib/platform-admin-access-shared";

export function generateTemporaryPasswordServer(length = 12): string {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$";
  const bytes = randomBytes(length);
  return Array.from(bytes, (byte) => chars[byte % chars.length]).join("");
}

export function getImpersonationTokenExpiry(): Date {
  return new Date(Date.now() + IMPERSONATION_TOKEN_EXPIRY_MS);
}

export async function logPlatformAdminAction(input: {
  action: string;
  adminUserId: string;
  salonId?: string;
  targetUserId?: string;
  metadata?: Record<string, unknown>;
}) {
  await prisma.platformAdminAuditLog.create({
    data: {
      action: input.action,
      adminUserId: input.adminUserId,
      salonId: input.salonId,
      targetUserId: input.targetUserId,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
    },
  });
}

export async function createAdminImpersonationToken(input: {
  salonId: string;
  ownerUserId: string;
  adminUserId: string;
}) {
  const rawToken = generatePasswordResetToken();
  const tokenHash = hashPasswordResetToken(rawToken);
  const expiresAt = getImpersonationTokenExpiry();

  await prisma.adminImpersonationToken.create({
    data: {
      tokenHash,
      salonId: input.salonId,
      ownerUserId: input.ownerUserId,
      adminUserId: input.adminUserId,
      expiresAt,
    },
  });

  return rawToken;
}

export async function consumeAdminImpersonationToken(rawToken: string) {
  const tokenHash = hashPasswordResetToken(rawToken);
  const now = new Date();

  const token = await prisma.adminImpersonationToken.findUnique({
    where: { tokenHash },
    include: {
      salon: {
        select: {
          id: true,
          slug: true,
          name: true,
          plan: true,
          subscription: { select: { status: true } },
        },
      },
    },
  });

  if (
    !token ||
    token.usedAt ||
    token.expiresAt < now ||
    !canPlatformAdminAccessSalon(token.salon.subscription?.status)
  ) {
    return null;
  }

  const owner = await prisma.user.findUnique({
    where: { id: token.ownerUserId },
    include: {
      salon: { select: { id: true, name: true, plan: true, slug: true } },
    },
  });

  if (
    !owner ||
    owner.isSuperAdmin ||
    !owner.salonId ||
    owner.salonId !== token.salonId ||
    !owner.salon
  ) {
    return null;
  }

  await prisma.$transaction([
    prisma.adminImpersonationToken.update({
      where: { id: token.id },
      data: { usedAt: now },
    }),
    prisma.platformAdminAuditLog.create({
      data: {
        action: "impersonation_login",
        adminUserId: token.adminUserId,
        salonId: token.salonId,
        targetUserId: owner.id,
        metadata: JSON.stringify({
          salonSlug: token.salon.slug,
          ownerEmail: owner.email,
        }),
      },
    }),
  ]);

  return {
    owner,
    salon: token.salon,
    adminUserId: token.adminUserId,
  };
}
