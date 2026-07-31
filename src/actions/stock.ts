"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { stockItemSchema, stockPurchaseSchema } from "@/lib/validations";
import { getStockStatus } from "@/lib/stock";
import { saveBillAttachment } from "@/lib/stock-upload";
import { revalidatePath } from "next/cache";

const STOCK_PATH = "/inventory/stock";

const stockItemInclude = {
  category: {
    select: { id: true, name: true },
  },
  purchases: {
    orderBy: { purchaseDate: "desc" as const },
    take: 1,
  },
};

function mapStockItem(
  item: {
    id: string;
    name: string;
    sku: string | null;
    categoryId: string;
    category: { id: string; name: string };
    unit: string;
    quantityOnHand: number;
    reorderLevel: number | null;
    description: string | null;
    purchases: Array<{ purchaseDate: Date }>;
  }
) {
  return {
    id: item.id,
    name: item.name,
    sku: item.sku,
    categoryId: item.categoryId,
    category: item.category.name,
    unit: item.unit,
    quantityOnHand: item.quantityOnHand,
    reorderLevel: item.reorderLevel,
    description: item.description,
    status: getStockStatus(item),
    lastPurchaseDate: item.purchases[0]?.purchaseDate ?? null,
  };
}

function revalidateStock(id?: string) {
  revalidatePath(STOCK_PATH);
  revalidatePath("/stock");
  revalidatePath("/catalog/products");
  revalidatePath("/dashboard");
  if (id) {
    revalidatePath(`${STOCK_PATH}/${id}`);
    revalidatePath(`/stock/${id}`);
  }
}

function parseReorderLevel(value: FormDataEntryValue | null) {
  if (value == null || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

export async function getStockItems(filters?: {
  query?: string;
  category?: string;
  lowStockOnly?: boolean;
}) {
  const session = await requireSession();
  const salonId = session.user.salonId;

  const where: {
    salonId: string;
    categoryId?: string;
    OR?: Array<{
      name?: { contains: string };
      sku?: { contains: string };
      category?: { name: { contains: string } };
    }>;
  } = { salonId };

  if (filters?.category && filters.category !== "all") {
    where.categoryId = filters.category;
  }

  if (filters?.query?.trim()) {
    const q = filters.query.trim();
    where.OR = [
      { name: { contains: q } },
      { sku: { contains: q } },
      { category: { name: { contains: q } } },
    ];
  }

  const items = await prisma.stockItem.findMany({
    where,
    include: stockItemInclude,
    orderBy: { name: "asc" },
  });

  const mapped = items.map(mapStockItem);

  if (filters?.lowStockOnly) {
    return mapped.filter((item) => item.status === "low" || item.status === "out");
  }

  return mapped;
}

export async function searchStock(
  query: string,
  filters?: { category?: string; lowStockOnly?: boolean }
) {
  return getStockItems({ query, ...filters });
}

export async function getStockAvailability() {
  const session = await requireSession();
  const items = await prisma.stockItem.findMany({
    where: { salonId: session.user.salonId },
    select: {
      id: true,
      name: true,
      sku: true,
      categoryId: true,
      category: { select: { name: true } },
      unit: true,
      quantityOnHand: true,
      reorderLevel: true,
    },
    orderBy: { name: "asc" },
  });

  return items.map((item) => ({
    id: item.id,
    name: item.name,
    sku: item.sku,
    categoryId: item.categoryId,
    category: item.category.name,
    unit: item.unit,
    quantityOnHand: item.quantityOnHand,
    reorderLevel: item.reorderLevel,
    status: getStockStatus(item),
  }));
}

export async function getLowStockCountForSalon(salonId: string) {
  const result = await prisma.$queryRaw<{ count: number }[]>`
    SELECT COUNT(*)::int AS count
    FROM "StockItem"
    WHERE "salonId" = ${salonId}
      AND (
        "quantityOnHand" <= 0
        OR ("reorderLevel" IS NOT NULL AND "quantityOnHand" <= "reorderLevel")
      )
  `;
  return result[0]?.count ?? 0;
}

export async function getLowStockCount() {
  const session = await requireSession();
  return getLowStockCountForSalon(session.user.salonId);
}

export async function getStockItem(id: string) {
  const session = await requireSession();
  const item = await prisma.stockItem.findFirst({
    where: { id, salonId: session.user.salonId },
    include: {
      category: { select: { id: true, name: true } },
      purchases: {
        orderBy: { purchaseDate: "desc" },
      },
    },
  });

  if (!item) return null;

  return {
    id: item.id,
    name: item.name,
    sku: item.sku,
    categoryId: item.categoryId,
    category: item.category.name,
    unit: item.unit,
    quantityOnHand: item.quantityOnHand,
    reorderLevel: item.reorderLevel,
    description: item.description,
    status: getStockStatus(item),
    purchases: item.purchases,
  };
}

export async function getPurchaseHistory(stockItemId?: string) {
  const session = await requireSession();
  return prisma.stockPurchase.findMany({
    where: {
      salonId: session.user.salonId,
      ...(stockItemId ? { stockItemId } : {}),
    },
    include: {
      stockItem: {
        select: { id: true, name: true, unit: true },
      },
    },
    orderBy: { purchaseDate: "desc" },
  });
}

export async function createStockItem(formData: FormData) {
  const session = await requireSession();

  const raw = {
    name: formData.get("name") as string,
    sku: (formData.get("sku") as string) || undefined,
    categoryId: formData.get("categoryId") as string,
    unit: formData.get("unit") as string,
    quantityOnHand: formData.get("quantityOnHand") as string,
    reorderLevel: formData.get("reorderLevel") as string,
    description: (formData.get("description") as string) || undefined,
  };

  const parsed = stockItemSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const category = await prisma.stockCategory.findFirst({
    where: { id: parsed.data.categoryId, salonId: session.user.salonId },
  });
  if (!category) return { error: "Category not found" };

  const reorderLevel = parseReorderLevel(formData.get("reorderLevel"));

  const item = await prisma.stockItem.create({
    data: {
      salonId: session.user.salonId,
      name: parsed.data.name,
      sku: parsed.data.sku || null,
      categoryId: parsed.data.categoryId,
      unit: parsed.data.unit,
      quantityOnHand: parsed.data.quantityOnHand,
      reorderLevel,
      description: parsed.data.description || null,
    },
  });

  revalidateStock();
  return { success: true, id: item.id };
}

export async function updateStockItem(id: string, formData: FormData) {
  const session = await requireSession();

  const item = await prisma.stockItem.findFirst({
    where: { id, salonId: session.user.salonId },
  });
  if (!item) return { error: "Stock item not found" };

  const raw = {
    name: formData.get("name") as string,
    sku: (formData.get("sku") as string) || undefined,
    categoryId: formData.get("categoryId") as string,
    unit: formData.get("unit") as string,
    quantityOnHand: formData.get("quantityOnHand") as string,
    reorderLevel: formData.get("reorderLevel") as string,
    description: (formData.get("description") as string) || undefined,
  };

  const parsed = stockItemSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const category = await prisma.stockCategory.findFirst({
    where: { id: parsed.data.categoryId, salonId: session.user.salonId },
  });
  if (!category) return { error: "Category not found" };

  const reorderLevel = parseReorderLevel(formData.get("reorderLevel"));

  await prisma.stockItem.update({
    where: { id },
    data: {
      name: parsed.data.name,
      sku: parsed.data.sku || null,
      categoryId: parsed.data.categoryId,
      unit: parsed.data.unit,
      quantityOnHand: parsed.data.quantityOnHand,
      reorderLevel,
      description: parsed.data.description || null,
    },
  });

  revalidateStock(id);
  return { success: true };
}

export async function deleteStockItem(id: string) {
  const session = await requireSession();
  const item = await prisma.stockItem.findFirst({
    where: { id, salonId: session.user.salonId },
  });
  if (!item) return { error: "Stock item not found" };

  await prisma.stockItem.delete({ where: { id } });
  revalidateStock();
  return { success: true };
}

export async function recordPurchase(formData: FormData) {
  const session = await requireSession();
  const salonId = session.user.salonId;

  const raw = {
    stockItemId: formData.get("stockItemId") as string,
    quantityPurchased: formData.get("quantityPurchased") as string,
    amount: formData.get("amount") as string,
    supplierName: (formData.get("supplierName") as string) || undefined,
    purchaseDate: formData.get("purchaseDate") as string,
    notes: (formData.get("notes") as string) || undefined,
  };

  const parsed = stockPurchaseSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const item = await prisma.stockItem.findFirst({
    where: { id: parsed.data.stockItemId, salonId },
  });
  if (!item) return { error: "Stock item not found" };

  const billFile = formData.get("billAttachment") as File | null;
  let billAttachmentPath: string | null = null;

  if (billFile && billFile.size > 0) {
    const upload = await saveBillAttachment(billFile, salonId);
    if (upload.error) return { error: upload.error };
    billAttachmentPath = upload.path ?? null;
  }

  const unitCost =
    parsed.data.quantityPurchased > 0
      ? parsed.data.amount / parsed.data.quantityPurchased
      : null;

  const purchaseDate = new Date(parsed.data.purchaseDate);

  await prisma.$transaction(async (tx) => {
    const purchase = await tx.stockPurchase.create({
      data: {
        salonId,
        stockItemId: parsed.data.stockItemId,
        quantityPurchased: parsed.data.quantityPurchased,
        amount: parsed.data.amount,
        unitCost,
        supplierName: parsed.data.supplierName || null,
        purchaseDate,
        billAttachmentPath,
        notes: parsed.data.notes || null,
      },
    });

    const { recordStockMovement } = await import("@/lib/inventory/ledger");
    await recordStockMovement(tx, {
      salonId,
      stockItemId: parsed.data.stockItemId,
      movementType: "purchase",
      quantity: parsed.data.quantityPurchased,
      unitCost: unitCost ?? undefined,
      referenceType: "purchase",
      referenceId: purchase.id,
      notes: parsed.data.notes,
      createdById: session.user.id,
      updateAvgCost: true,
    });
  });

  revalidateStock(parsed.data.stockItemId);
  revalidatePath(`${STOCK_PATH}/purchases/new`);
  revalidatePath("/stock/purchases/new");
  return { success: true };
}
