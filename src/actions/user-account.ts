"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import {
  updateUserEmailSchema,
  updateUserPasswordSchema,
} from "@/lib/validations";

async function verifyCurrentPassword(userId: string, currentPassword: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true, isActive: true },
  });

  if (!user || !user.isActive) {
    return { error: "Account not found" };
  }

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) {
    return { error: "Current password is incorrect" };
  }

  return { success: true as const };
}

export async function updateUserEmail(data: unknown) {
  const session = await requireSession();
  const parsed = updateUserEmailSchema.safeParse(data);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { newEmail, currentPassword } = parsed.data;

  if (newEmail === session.user.email?.toLowerCase()) {
    return { error: "This is already your login email" };
  }

  const verify = await verifyCurrentPassword(session.user.id, currentPassword);
  if ("error" in verify) return verify;

  const existing = await prisma.user.findUnique({
    where: { email: newEmail },
    select: { id: true },
  });

  if (existing && existing.id !== session.user.id) {
    return { error: "This email is already registered" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { email: newEmail },
  });

  revalidatePath("/settings/salon");
  return { success: true, requiresReLogin: true, newEmail };
}

export async function updateUserPassword(data: unknown) {
  const session = await requireSession();
  const parsed = updateUserPasswordSchema.safeParse(data);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { currentPassword, newPassword } = parsed.data;

  const verify = await verifyCurrentPassword(session.user.id, currentPassword);
  if ("error" in verify) return verify;

  const hashed = await bcrypt.hash(newPassword, 10);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: session.user.id },
      data: { password: hashed },
    });

    await tx.passwordResetToken.deleteMany({
      where: { userId: session.user.id, usedAt: null },
    });
  });

  revalidatePath("/settings/salon");
  return { success: true };
}
