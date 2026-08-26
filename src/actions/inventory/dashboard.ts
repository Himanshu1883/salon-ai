"use server";

import { prisma } from "@/lib/prisma";
import { cachedBySalon } from "@/lib/salon-cache";
import { getInventoryAccess } from "@/lib/inventory/permissions";
import { getLowStockCountForSalon } from "@/actions/stock";
import { getStockStatus } from "@/lib/stock";
import { startOfMonth, subDays, format } from "date-fns";

async function fetchInventoryDashboardStats(salonId: string) {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const thirtyDaysAgo = subDays(now, 30);

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
    purchaseTrendRows,
  ] = await Promise.all([
    prisma.stockItem.count({ where: { salonId, status: "active" } }),
    getLowStockCountForSalon(salonId),
    prisma.stockItem.count({
      where: {
        salonId,
        status: "active",
        expiryDate: { lte: subDays(now, -30), gte: now },
      },
    }),
    prisma.$queryRaw<{ total: number }[]>`
      SELECT COALESCE(SUM("quantityOnHand" * "avgCost"), 0)::float AS total
      FROM "StockItem"
      WHERE "salonId" = ${salonId} AND status = 'active'
    `,
    prisma.stockLedgerEntry.findMany({
      where: { salonId, createdAt: { gte: thirtyDaysAgo } },
      select: {
        id: true,
        movementType: true,
        quantity: true,
        createdAt: true,
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
    prisma.$queryRaw<{ day: Date; qty: number }[]>`
      SELECT DATE("createdAt") AS day, COALESCE(SUM(ABS(quantity)), 0)::float AS qty
      FROM "StockLedgerEntry"
      WHERE "salonId" = ${salonId}
        AND "movementType" IN ('purchase', 'grn')
        AND "createdAt" >= ${thirtyDaysAgo}
      GROUP BY DATE("createdAt")
      ORDER BY day ASC
    `,
  ]);

  const inventoryValue = inventoryValueRow[0]?.total ?? 0;

  const chartData = movementByDay.map((m) => ({
    type: m.movementType,
    count: m._count.id,
  }));

  const purchaseTrend: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = format(subDays(now, i), "MMM d");
    purchaseTrend[d] = 0;
  }
  for (const row of purchaseTrendRows) {
    const key = format(row.day, "MMM d");
    if (key in purchaseTrend) purchaseTrend[key] = row.qty;
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
