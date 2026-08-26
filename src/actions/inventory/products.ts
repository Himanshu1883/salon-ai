"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getInventoryAccess, requireInventoryWrite } from "@/lib/inventory/permissions";
import { scheduleSalonCacheRevalidation } from "@/lib/salon-cache";
import { getStockStatus } from "@/lib/stock";
import { STOCK_UNITS } from "@/lib/validations";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(2),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  categoryId: z.string().min(1),
  brandId: z.string().optional(),
  supplierId: z.string().optional(),
  unit: z.enum(STOCK_UNITS),
  quantityOnHand: z.coerce.number().min(0),
  reorderLevel: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.coerce.number().min(0).optional()
  ),
  maxLevel: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.coerce.number().min(0).optional()
  ),
  costPrice: z.coerce.number().min(0).default(0),
  retailPrice: z.coerce.number().min(0).default(0),
  gstRate: z.coerce.number().min(0).max(100).default(18),
  shelfLocation: z.string().optional(),
  batchNumber: z.string().optional(),
  status: z.enum(["active", "discontinued"]).default("active"),
  isRetail: z.preprocess((v) => v === "true" || v === true, z.boolean()),
  description: z.string().optional(),
});

const PATHS = ["/inventory/products", "/inventory/stock", "/catalog/products"];

function revalidate(salonId: string) {
  scheduleSalonCacheRevalidation(salonId, "dashboard-stats");
  revalidatePath("/inventory");
  for (const p of PATHS) revalidatePath(p);
}

export async function getProducts(filters?: {
  query?: string;
  category?: string;
  brand?: string;
  status?: string;
  lowStockOnly?: boolean;
}) {
  const { session } = await getInventoryAccess();
  const salonId = session.user.salonId;

  const where: Record<string, unknown> = { salonId };
  if (filters?.category && filters.category !== "all") {
    where.categoryId = filters.category;
  }
  if (filters?.brand && filters.brand !== "all") {
    where.brandId = filters.brand;
  }
  if (filters?.status && filters.status !== "all") {
    where.status = filters.status;
  }
  if (filters?.query?.trim()) {
    const q = filters.query.trim();
    where.OR = [
      { name: { contains: q } },
      { sku: { contains: q } },
      { barcode: { contains: q } },
    ];
  }

  const items = await prisma.stockItem.findMany({
    where,
    include: {
      category: { select: { id: true, name: true } },
      brand: { select: { id: true, name: true } },
      supplier: { select: { id: true, name: true } },
      purchases: { orderBy: { purchaseDate: "desc" }, take: 1 },
    },
    orderBy: { name: "asc" },
  });

  const mapped = items.map((item) => ({
    id: item.id,
    name: item.name,
    sku: item.sku,
    barcode: item.barcode,
    categoryId: item.categoryId,
    category: item.category.name,
    brandId: item.brandId,
    brand: item.brand?.name ?? null,
    supplierId: item.supplierId,
    supplier: item.supplier?.name ?? null,
    unit: item.unit,
    quantityOnHand: item.quantityOnHand,
    reorderLevel: item.reorderLevel,
    maxLevel: item.maxLevel,
    costPrice: item.costPrice,
    retailPrice: item.retailPrice,
    avgCost: item.avgCost,
    gstRate: item.gstRate,
    shelfLocation: item.shelfLocation,
    expiryDate: item.expiryDate,
    batchNumber: item.batchNumber,
    imageUrl: item.imageUrl,
    status: item.status,
    isRetail: item.isRetail,
    description: item.description,
    statusStock: getStockStatus(item),
    lastPurchaseDate: item.purchases[0]?.purchaseDate ?? null,
  }));

  if (filters?.lowStockOnly) {
    return mapped.filter(
      (i) => i.statusStock === "low" || i.statusStock === "out"
    );
  }
  return mapped;
}

export async function getProduct(id: string) {
  const { session } = await getInventoryAccess();
  const item = await prisma.stockItem.findFirst({
    where: { id, salonId: session.user.salonId },
    include: {
      category: true,
      brand: true,
      supplier: true,
      purchases: { orderBy: { purchaseDate: "desc" } },
      stockLedgerEntries: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!item) return null;
  return {
    ...item,
    statusStock: getStockStatus(item),
  };
}

export async function createProduct(formData: FormData) {
  await requireInventoryWrite();
  const { session } = await getInventoryAccess();

  const expiryDateStr = formData.get("expiryDate") as string;
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    sku: formData.get("sku") || undefined,
    barcode: formData.get("barcode") || undefined,
    categoryId: formData.get("categoryId"),
    brandId: formData.get("brandId") || undefined,
    supplierId: formData.get("supplierId") || undefined,
    unit: formData.get("unit"),
    quantityOnHand: formData.get("quantityOnHand"),
    reorderLevel: formData.get("reorderLevel"),
    maxLevel: formData.get("maxLevel"),
    costPrice: formData.get("costPrice"),
    retailPrice: formData.get("retailPrice"),
    gstRate: formData.get("gstRate"),
    shelfLocation: formData.get("shelfLocation") || undefined,
    batchNumber: formData.get("batchNumber") || undefined,
    status: formData.get("status") || "active",
    isRetail: formData.get("isRetail") ?? "true",
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const item = await prisma.stockItem.create({
    data: {
      salonId: session.user.salonId,
      name: parsed.data.name,
      sku: parsed.data.sku || null,
      barcode: parsed.data.barcode || null,
      categoryId: parsed.data.categoryId,
      brandId: parsed.data.brandId || null,
      supplierId: parsed.data.supplierId || null,
      unit: parsed.data.unit,
      quantityOnHand: parsed.data.quantityOnHand,
      reorderLevel: parsed.data.reorderLevel ?? null,
      maxLevel: parsed.data.maxLevel ?? null,
      costPrice: parsed.data.costPrice,
      retailPrice: parsed.data.retailPrice,
      avgCost: parsed.data.costPrice,
      gstRate: parsed.data.gstRate,
      shelfLocation: parsed.data.shelfLocation || null,
      expiryDate: expiryDateStr ? new Date(expiryDateStr) : null,
      batchNumber: parsed.data.batchNumber || null,
      status: parsed.data.status,
      isRetail: parsed.data.isRetail,
      description: parsed.data.description || null,
    },
  });

  revalidate(session.user.salonId!);
  return { success: true, id: item.id };
}

export async function updateProduct(id: string, formData: FormData) {
  await requireInventoryWrite();
  const { session } = await getInventoryAccess();

  const item = await prisma.stockItem.findFirst({
    where: { id, salonId: session.user.salonId },
  });
  if (!item) return { error: "Product not found" };

  const expiryDateStr = formData.get("expiryDate") as string;
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    sku: formData.get("sku") || undefined,
    barcode: formData.get("barcode") || undefined,
    categoryId: formData.get("categoryId"),
    brandId: formData.get("brandId") || undefined,
    supplierId: formData.get("supplierId") || undefined,
    unit: formData.get("unit"),
    quantityOnHand: formData.get("quantityOnHand"),
    reorderLevel: formData.get("reorderLevel"),
    maxLevel: formData.get("maxLevel"),
    costPrice: formData.get("costPrice"),
    retailPrice: formData.get("retailPrice"),
    gstRate: formData.get("gstRate"),
    shelfLocation: formData.get("shelfLocation") || undefined,
    batchNumber: formData.get("batchNumber") || undefined,
    status: formData.get("status") || "active",
    isRetail: formData.get("isRetail") ?? "true",
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  await prisma.stockItem.update({
    where: { id },
    data: {
      name: parsed.data.name,
      sku: parsed.data.sku || null,
      barcode: parsed.data.barcode || null,
      categoryId: parsed.data.categoryId,
      brandId: parsed.data.brandId || null,
      supplierId: parsed.data.supplierId || null,
      unit: parsed.data.unit,
      quantityOnHand: parsed.data.quantityOnHand,
      reorderLevel: parsed.data.reorderLevel ?? null,
      maxLevel: parsed.data.maxLevel ?? null,
      costPrice: parsed.data.costPrice,
      retailPrice: parsed.data.retailPrice,
      gstRate: parsed.data.gstRate,
      shelfLocation: parsed.data.shelfLocation || null,
      expiryDate: expiryDateStr ? new Date(expiryDateStr) : null,
      batchNumber: parsed.data.batchNumber || null,
      status: parsed.data.status,
      isRetail: parsed.data.isRetail,
      description: parsed.data.description || null,
    },
  });

  revalidate(session.user.salonId!);
  revalidatePath(`/inventory/products/${id}`);
  return { success: true };
}

export async function deleteProduct(id: string) {
  await requireInventoryWrite();
  const { session } = await getInventoryAccess();
  const item = await prisma.stockItem.findFirst({
    where: { id, salonId: session.user.salonId },
  });
  if (!item) return { error: "Product not found" };

  await prisma.stockItem.delete({ where: { id } });
  revalidate(session.user.salonId!);
  return { success: true };
}

export async function getBrandsForSelect() {
  const { session } = await getInventoryAccess();
  return prisma.productBrand.findMany({
    where: { salonId: session.user.salonId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function getCategoriesForSelect() {
  const { getStockCategories } = await import("@/actions/stock-categories");
  return getStockCategories();
}

export async function getSuppliersForSelect() {
  const { session } = await getInventoryAccess();
  return prisma.supplier.findMany({
    where: { salonId: session.user.salonId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}
