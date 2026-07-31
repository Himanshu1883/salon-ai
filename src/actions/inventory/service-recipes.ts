"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getInventoryAccess, requireInventoryWrite } from "@/lib/inventory/permissions";
import { recordStockMovement } from "@/lib/inventory/ledger";
import { z } from "zod";

const recipeSchema = z.object({
  serviceId: z.string().min(1),
  stockItemId: z.string().min(1),
  quantity: z.coerce.number().positive(),
  unit: z.string().min(1),
});

const PATH = "/inventory/service-recipes";

export async function getServiceRecipes(serviceId?: string) {
  const { session } = await getInventoryAccess();
  return prisma.serviceRecipe.findMany({
    where: {
      salonId: session.user.salonId,
      ...(serviceId ? { serviceId } : {}),
    },
    include: {
      service: { select: { id: true, name: true } },
      stockItem: { select: { id: true, name: true, unit: true, quantityOnHand: true } },
    },
    orderBy: { service: { name: "asc" } },
  });
}

export async function getServicesForRecipes() {
  const { session } = await getInventoryAccess();
  return prisma.service.findMany({
    where: { salonId: session.user.salonId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function createServiceRecipe(formData: FormData) {
  await requireInventoryWrite();
  const { session } = await getInventoryAccess();
  const parsed = recipeSchema.safeParse({
    serviceId: formData.get("serviceId"),
    stockItemId: formData.get("stockItemId"),
    quantity: formData.get("quantity"),
    unit: formData.get("unit"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const existing = await prisma.serviceRecipe.findUnique({
    where: {
      serviceId_stockItemId: {
        serviceId: parsed.data.serviceId,
        stockItemId: parsed.data.stockItemId,
      },
    },
  });
  if (existing) return { error: "Recipe already exists for this product" };

  await prisma.serviceRecipe.create({
    data: { salonId: session.user.salonId, ...parsed.data },
  });
  revalidatePath(PATH);
  revalidatePath("/catalog/services");
  return { success: true };
}

export async function updateServiceRecipe(id: string, formData: FormData) {
  await requireInventoryWrite();
  const { session } = await getInventoryAccess();
  const parsed = recipeSchema.safeParse({
    serviceId: formData.get("serviceId"),
    stockItemId: formData.get("stockItemId"),
    quantity: formData.get("quantity"),
    unit: formData.get("unit"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const recipe = await prisma.serviceRecipe.findFirst({
    where: { id, salonId: session.user.salonId },
  });
  if (!recipe) return { error: "Recipe not found" };

  await prisma.serviceRecipe.update({
    where: { id },
    data: parsed.data,
  });
  revalidatePath(PATH);
  return { success: true };
}

export async function deleteServiceRecipe(id: string) {
  await requireInventoryWrite();
  const { session } = await getInventoryAccess();
  const recipe = await prisma.serviceRecipe.findFirst({
    where: { id, salonId: session.user.salonId },
  });
  if (!recipe) return { error: "Recipe not found" };

  await prisma.serviceRecipe.delete({ where: { id } });
  revalidatePath(PATH);
  return { success: true };
}

export async function getConsumptionHistory(limit = 50) {
  const { session } = await getInventoryAccess();
  return prisma.stockLedgerEntry.findMany({
    where: {
      salonId: session.user.salonId,
      movementType: "consumption",
    },
    include: {
      stockItem: { select: { name: true, unit: true } },
      appointment: {
        select: {
          id: true,
          scheduledAt: true,
          service: { select: { name: true } },
          customer: { select: { name: true } },
        },
      },
      employee: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
