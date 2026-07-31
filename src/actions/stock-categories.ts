"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { stockCategorySchema } from "@/lib/validations";
import { DEFAULT_STOCK_CATEGORY_NAMES } from "@/lib/stock-categories";
import { revalidatePath } from "next/cache";

const STOCK_PATH = "/inventory/stock";

function revalidateStockCategories() {
  revalidatePath(STOCK_PATH);
  revalidatePath("/stock");
  revalidatePath("/catalog/products");
}

export async function ensureDefaultStockCategories(salonId: string) {
  const count = await prisma.stockCategory.count({ where: { salonId } });
  if (count > 0) return;

  await prisma.stockCategory.createMany({
    data: DEFAULT_STOCK_CATEGORY_NAMES.map((name, sortOrder) => ({
      salonId,
      name,
      sortOrder,
    })),
  });
}

export async function getStockCategories() {
  const session = await requireSession();
  const salonId = session.user.salonId;

  await ensureDefaultStockCategories(salonId);

  return prisma.stockCategory.findMany({
    where: { salonId },
    orderBy: { sortOrder: "asc" },
  });
}

export async function createStockCategory(name: string) {
  const session = await requireSession();
  const salonId = session.user.salonId;

  const parsed = stockCategorySchema.safeParse({ name });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const trimmedName = parsed.data.name.trim();
  const normalized = trimmedName.toLowerCase();

  const existing = await prisma.stockCategory.findMany({
    where: { salonId },
    select: { id: true, name: true },
  });

  const duplicate = existing.find(
    (category) => category.name.toLowerCase() === normalized
  );
  if (duplicate) {
    return { error: "A category with this name already exists" };
  }

  const maxOrder = await prisma.stockCategory.aggregate({
    where: { salonId },
    _max: { sortOrder: true },
  });

  const category = await prisma.stockCategory.create({
    data: {
      salonId,
      name: trimmedName,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
  });

  revalidateStockCategories();
  return { success: true, category };
}
