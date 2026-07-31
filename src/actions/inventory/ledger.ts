"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getInventoryAccess, requireInventoryWrite } from "@/lib/inventory/permissions";
import { recordStockMovement } from "@/lib/inventory/ledger";
import { MOVEMENT_LABELS } from "@/lib/inventory/constants";
import type { MovementType } from "@/lib/inventory/constants";

const PATH = "/inventory/ledger";

export async function getLedgerEntries(filters?: {
  stockItemId?: string;
  movementType?: string;
  limit?: number;
}) {
  const { session } = await getInventoryAccess();
  return prisma.stockLedgerEntry.findMany({
    where: {
      salonId: session.user.salonId,
      ...(filters?.stockItemId ? { stockItemId: filters.stockItemId } : {}),
      ...(filters?.movementType ? { movementType: filters.movementType } : {}),
    },
    include: {
      stockItem: { select: { id: true, name: true, sku: true, unit: true } },
      appointment: { select: { id: true, service: { select: { name: true } } } },
      customer: { select: { name: true } },
      employee: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: filters?.limit ?? 100,
  });
}

export async function getRetailSales(limit = 50) {
  const { session } = await getInventoryAccess();
  return prisma.stockLedgerEntry.findMany({
    where: {
      salonId: session.user.salonId,
      movementType: "sale",
    },
    include: {
      stockItem: { select: { name: true, unit: true, retailPrice: true } },
      customer: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getMovementTypeOptions() {
  return Object.entries(MOVEMENT_LABELS).map(([value, label]) => ({
    value: value as MovementType,
    label,
  }));
}

export async function getLowStockProducts() {
  const { session } = await getInventoryAccess();
  const { getStockItems } = await import("@/actions/stock");
  return getStockItems({ lowStockOnly: true });
}

export async function getExpiringProducts(withinDays = 30) {
  const { session } = await getInventoryAccess();
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + withinDays);

  return prisma.stockItem.findMany({
    where: {
      salonId: session.user.salonId,
      status: "active",
      expiryDate: { lte: deadline, gte: new Date() },
    },
    include: {
      category: { select: { name: true } },
      brand: { select: { name: true } },
    },
    orderBy: { expiryDate: "asc" },
  });
}

export async function getInventoryReports() {
  const { session } = await getInventoryAccess();
  const salonId = session.user.salonId;

  const [byCategory, topConsumed, recentPurchases] = await Promise.all([
    prisma.stockItem.groupBy({
      by: ["categoryId"],
      where: { salonId, status: "active" },
      _sum: { quantityOnHand: true },
      _count: { id: true },
    }),
    prisma.stockLedgerEntry.groupBy({
      by: ["stockItemId"],
      where: { salonId, movementType: "consumption" },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "asc" } },
      take: 10,
    }),
    prisma.stockLedgerEntry.findMany({
      where: { salonId, movementType: { in: ["purchase", "grn"] } },
      include: { stockItem: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const categories = await prisma.stockCategory.findMany({
    where: { salonId },
    select: { id: true, name: true },
  });
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  const stockItems = await prisma.stockItem.findMany({
    where: { salonId },
    select: { id: true, name: true },
  });
  const itemMap = Object.fromEntries(stockItems.map((i) => [i.id, i.name]));

  return {
    stockByCategory: byCategory.map((c) => ({
      category: catMap[c.categoryId] ?? "Unknown",
      count: c._count.id,
      quantity: c._sum.quantityOnHand ?? 0,
    })),
    topConsumed: topConsumed.map((t) => ({
      product: itemMap[t.stockItemId] ?? "Unknown",
      quantity: Math.abs(t._sum.quantity ?? 0),
    })),
    recentPurchases,
  };
}
