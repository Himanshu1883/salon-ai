"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getInventoryAccess, requireInventoryWrite } from "@/lib/inventory/permissions";
import { getStockStatus } from "@/lib/stock";
import { startOfMonth, subDays, format } from "date-fns";

const PATHS = ["/inventory", "/inventory/products", "/dashboard"];

function revalidate() {
  for (const p of PATHS) revalidatePath(p);
}

export async function getInventoryDashboardStats() {
  const { session } = await getInventoryAccess();
  const salonId = session.user.salonId;
  const monthStart = startOfMonth(new Date());
  const thirtyDaysAgo = subDays(new Date(), 30);

  const [
    items,
    lowStockItems,
    expiringSoon,
    totalValue,
    recentMovements,
    purchaseOrders,
    consumptionThisMonth,
    salesThisMonth,
  ] = await Promise.all([
    prisma.stockItem.count({ where: { salonId, status: "active" } }),
    prisma.stockItem.findMany({
      where: { salonId, status: "active" },
      select: { quantityOnHand: true, reorderLevel: true },
    }),
    prisma.stockItem.count({
      where: {
        salonId,
        status: "active",
        expiryDate: { lte: subDays(new Date(), -30), gte: new Date() },
      },
    }),
    prisma.stockItem.aggregate({
      where: { salonId, status: "active" },
      _sum: { quantityOnHand: true },
    }),
    prisma.stockLedgerEntry.findMany({
      where: { salonId, createdAt: { gte: thirtyDaysAgo } },
      include: {
        stockItem: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.purchaseOrder.count({
      where: { salonId, status: { in: ["draft", "ordered", "partial"] } },
    }),
    prisma.stockLedgerEntry.aggregate({
      where: {
        salonId,
        movementType: "consumption",
        createdAt: { gte: monthStart },
      },
      _sum: { quantity: true },
    }),
    prisma.stockLedgerEntry.aggregate({
      where: {
        salonId,
        movementType: "sale",
        createdAt: { gte: monthStart },
      },
      _sum: { quantity: true },
    }),
  ]);

  const lowStockCount = lowStockItems.filter((i) => {
    const s = getStockStatus(i);
    return s === "low" || s === "out";
  }).length;

  const itemsWithCost = await prisma.stockItem.findMany({
    where: { salonId, status: "active" },
    select: { quantityOnHand: true, avgCost: true },
  });
  const inventoryValue = itemsWithCost.reduce(
    (sum, i) => sum + i.quantityOnHand * i.avgCost,
    0
  );

  const movementByDay = await prisma.stockLedgerEntry.groupBy({
    by: ["movementType"],
    where: { salonId, createdAt: { gte: thirtyDaysAgo } },
    _count: { id: true },
  });

  const chartData = movementByDay.map((m) => ({
    type: m.movementType,
    count: m._count.id,
  }));

  const dailyPurchases = await prisma.stockLedgerEntry.findMany({
    where: {
      salonId,
      movementType: { in: ["purchase", "grn"] },
      createdAt: { gte: thirtyDaysAgo },
    },
    select: { createdAt: true, quantity: true },
  });

  const purchaseTrend: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = format(subDays(new Date(), i), "MMM d");
    purchaseTrend[d] = 0;
  }
  for (const p of dailyPurchases) {
    const key = format(p.createdAt, "MMM d");
    if (key in purchaseTrend) purchaseTrend[key] += Math.abs(p.quantity);
  }

  return {
    totalProducts: items,
    lowStockCount,
    expiringSoon,
    inventoryValue,
    openPurchaseOrders: purchaseOrders,
    consumptionThisMonth: Math.abs(consumptionThisMonth._sum.quantity ?? 0),
    salesThisMonth: Math.abs(salesThisMonth._sum.quantity ?? 0),
    recentMovements: recentMovements.map((m) => ({
      id: m.id,
      product: m.stockItem.name,
      type: m.movementType,
      quantity: m.quantity,
      createdAt: m.createdAt,
    })),
    movementChart: chartData,
    purchaseTrend: Object.entries(purchaseTrend).map(([date, qty]) => ({
      date,
      qty,
    })),
  };
}

export async function getInventoryAlerts() {
  const { session } = await getInventoryAccess();
  const salonId = session.user.salonId;

  const items = await prisma.stockItem.findMany({
    where: { salonId, status: "active" },
    select: {
      id: true,
      name: true,
      quantityOnHand: true,
      reorderLevel: true,
      expiryDate: true,
    },
    orderBy: { name: "asc" },
  });

  const lowStock = items.filter((i) => {
    const s = getStockStatus(i);
    return s === "low" || s === "out";
  });

  const expiring = items.filter(
    (i) =>
      i.expiryDate &&
      i.expiryDate <= subDays(new Date(), -30) &&
      i.expiryDate >= new Date()
  );

  return { lowStock, expiring };
}
