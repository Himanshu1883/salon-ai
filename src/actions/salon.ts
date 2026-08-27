"use server";

import { prisma } from "@/lib/prisma";
import { requireOwnerOrManager } from "@/lib/auth";
import { saveSalonLogo } from "@/lib/salon-logo-upload";
import { revalidatePath } from "next/cache";
import { revalidateSalonCache } from "@/lib/salon-cache";
import { z } from "zod";

const salonProfileSchema = z.object({
  name: z.string().min(1, "Business name is required"),
  businessType: z.string().optional(),
  gstin: z.string().optional(),
  gstEnabled: z.boolean().optional(),
  addressLine1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  businessPhone: z.string().optional(),
  businessEmail: z.string().email().optional().or(z.literal("")),
});

export async function getSalonProfile() {
  const session = await requireOwnerOrManager();

  return prisma.salon.findUnique({
    where: { id: session.user.salonId },
    select: {
      name: true,
      slug: true,
      businessType: true,
      gstin: true,
      gstEnabled: true,
      addressLine1: true,
      city: true,
      state: true,
      pincode: true,
      businessPhone: true,
      businessEmail: true,
      address: true,
      logoUrl: true,
    },
  });
}

export async function uploadSalonLogo(formData: FormData) {
  try {
    const session = await requireOwnerOrManager();
    const file = formData.get("logo") as File | null;

    if (!file || file.size === 0) {
      return { error: "Select an image to upload" };
    }

    const upload = await saveSalonLogo(file, session.user.salonId);
    if (upload.error) return { error: upload.error };
    if (!upload.path) return { error: "Upload failed" };

    await prisma.salon.update({
      where: { id: session.user.salonId },
      data: { logoUrl: upload.path },
    });

    revalidatePath("/settings/salon");
    revalidatePath("/login");
    revalidateSalonCache(session.user.salonId, "layout-context");
    return { success: true, logoUrl: upload.path };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Logo upload failed";
    return { error: message };
  }
}

export async function removeSalonLogo() {
  try {
    const session = await requireOwnerOrManager();

    await prisma.salon.update({
      where: { id: session.user.salonId },
      data: { logoUrl: null },
    });

    revalidatePath("/settings/salon");
    revalidatePath("/login");
    revalidateSalonCache(session.user.salonId, "layout-context");
    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not remove logo";
    return { error: message };
  }
}

export async function updateSalonProfile(data: unknown) {
  const session = await requireOwnerOrManager();
  const parsed = salonProfileSchema.safeParse(data);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const input = parsed.data;
  const addressParts = [
    input.addressLine1,
    input.city,
    input.state,
    input.pincode,
  ].filter(Boolean);

  await prisma.salon.update({
    where: { id: session.user.salonId },
    data: {
      name: input.name,
      businessType: input.businessType || null,
      gstin: input.gstin || null,
      gstEnabled: input.gstEnabled ?? true,
      addressLine1: input.addressLine1 || null,
      city: input.city || null,
      state: input.state || null,
      pincode: input.pincode || null,
      businessPhone: input.businessPhone || null,
      businessEmail: input.businessEmail || null,
      address: addressParts.length > 0 ? addressParts.join(", ") : null,
    },
  });

  revalidatePath("/settings/salon");
  return { success: true };
}

export async function getUserRole(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role ?? null;
}

export async function canAccessSettings(userId: string) {
  const role = await getUserRole(userId);
  return role === "owner" || role === "manager";
}
