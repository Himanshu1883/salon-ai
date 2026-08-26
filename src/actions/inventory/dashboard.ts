"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { cachedBySalon, scheduleSalonCacheRevalidation } from "@/lib/salon-cache";
import { getInventoryAccess } from "@/lib/inventory/permissions";
import { getLowStockCountForSalon } from "@/actions/stock";
import { getStockStatus } from "@/lib/stock";
import { startOfMonth, subDays, format } from "date-fns";

const PATHS = ["/inventory", "/inventory/products", "/dashboard"];

function revalidateInventoryPages(salonId: string) {
  scheduleSalonCacheRevalidation(salonId, "dashboard-stats");
  for (const p of PATHS) revalidatePath(p);
}

async function fetchInventoryDashboardStats(salonId: string) {
  const monthStart = startOfMonth(new Date());
  const thirtyDaysAgo = subDays(new Date(), 30);

  const [
    items,
    lowStockCount,
    expiringSoon,
    inventoryValueRow,
    recentMovements,
    purchaseOrders,
    consumptionThisMonth,
    salesThisMonth,
    movementByDay,
    dailyPurchases,
  ] = await Promise.all([
    prisma.stockItem.count({ where: { salonId, status: "active" } }),
    getLowStockCountForSalon(salonId),
    prisma.stockItem.count({
      where: {
        salonId,
        status: "active",
        expiryDate: { lte: subDays(new Date(), -30), gte: new Date() },
      },
    }),
    prisma.$queryRaw<{ total: number }[]>`
      SELECT COALESCE(SUM("quantityOnHand" * "avgCost"), 0)::float AS total
      FROM "StockItem"
      WHERE "salonId" = ${salonId} AND status = 'active'
    `,
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
    prisma.stockLedgerEntry.groupBy({
      by: ["movementType"],
      where: { salonId, createdAt: { gte: thirtyDaysAgo } },
      _count: { id: true },
    }),
    prisma.stockLedgerEntry.findMany({
      where: {
        salonId,
        movementType: { in: ["purchase", "grn"] },
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { createdAt: true, quantity: true },
    }),
  ]);

  const inventoryValue = inventoryValueRow[0]?.total ?? 0;

  const chartData = movementByDay.map((m) => ({
    type: m.movementType,
    count: m._count.id,
  }));

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

const getCachedInventoryDashboardStats = cachedBySalon(
  "dashboard-stats",
  fetchInventoryDashboardStats,
  { revalidate: 60, key: "inventory-dashboard" }
);

export async function getInventoryDashboardStats() {
  const { session } = await getInventoryAccess();
  return getCachedInventoryDashboardStats(session.user.salonId!);
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

export { revalidateInventoryPages };
