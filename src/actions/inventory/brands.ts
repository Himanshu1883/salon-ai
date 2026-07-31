"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getInventoryAccess, requireInventoryWrite } from "@/lib/inventory/permissions";
import { z } from "zod";

const brandSchema = z.object({
  name: z.string().trim().min(2, "Brand name is required"),
});

const PATH = "/inventory/brands";

export async function getBrands() {
  const { session } = await getInventoryAccess();
  return prisma.productBrand.findMany({
    where: { salonId: session.user.salonId },
    orderBy: { name: "asc" },
    include: { _count: { select: { stockItems: true } } },
  });
}

export async function createBrand(formData: FormData) {
  await requireInventoryWrite();
  const { session } = await getInventoryAccess();
  const parsed = brandSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  await prisma.productBrand.create({
    data: { salonId: session.user.salonId, name: parsed.data.name },
  });
  revalidatePath(PATH);
  revalidatePath("/inventory/products");
  return { success: true };
}

export async function updateBrand(id: string, formData: FormData) {
  await requireInventoryWrite();
  const { session } = await getInventoryAccess();
  const parsed = brandSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const brand = await prisma.productBrand.findFirst({
    where: { id, salonId: session.user.salonId },
  });
  if (!brand) return { error: "Brand not found" };

  await prisma.productBrand.update({
    where: { id },
    data: { name: parsed.data.name },
  });
  revalidatePath(PATH);
  return { success: true };
}

export async function deleteBrand(id: string) {
  await requireInventoryWrite();
  const { session } = await getInventoryAccess();
  const brand = await prisma.productBrand.findFirst({
    where: { id, salonId: session.user.salonId },
  });
  if (!brand) return { error: "Brand not found" };

  await prisma.productBrand.delete({ where: { id } });
  revalidatePath(PATH);
  return { success: true };
}
