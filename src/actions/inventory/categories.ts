"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireInventoryWrite } from "@/lib/inventory/permissions";
import { createStockCategory } from "@/actions/stock-categories";
import { stockCategorySchema } from "@/lib/validations";

const PATH = "/inventory/categories";

export async function createCategory(formData: FormData) {
  await requireInventoryWrite();
  const name = formData.get("name") as string;
  return createStockCategory(name);
}

export async function updateCategory(id: string, formData: FormData) {
  await requireInventoryWrite();
  const session = await (await import("@/lib/inventory/permissions")).getInventoryAccess();
  const parsed = stockCategorySchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const category = await prisma.stockCategory.findFirst({
    where: { id, salonId: session.session.user.salonId },
  });
  if (!category) return { error: "Category not found" };

  await prisma.stockCategory.update({
    where: { id },
    data: { name: parsed.data.name.trim() },
  });
  revalidatePath(PATH);
  revalidatePath("/inventory/products");
  return { success: true };
}

export async function deleteCategory(id: string) {
  await requireInventoryWrite();
  const session = await (await import("@/lib/inventory/permissions")).getInventoryAccess();
  const category = await prisma.stockCategory.findFirst({
    where: { id, salonId: session.session.user.salonId },
    include: { _count: { select: { stockItems: true } } },
  });
  if (!category) return { error: "Category not found" };
  if (category._count.stockItems > 0) {
    return { error: "Cannot delete category with products" };
  }

  await prisma.stockCategory.delete({ where: { id } });
  revalidatePath(PATH);
  return { success: true };
}
