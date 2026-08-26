"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { cachedBySalon } from "@/lib/salon-cache";
import { getInventoryAccess } from "@/lib/inventory/permissions";
import { getStockStatus } from "@/lib/stock";
import { startOfMonth, subDays, format } from "date-fns";

async function fetchInventoryDashboardStats(salonId: string) {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const thirtyDaysAgo = subDays(now, 30);
  const expiringCutoff = subDays(now, -30);

  const [
    stockKpis,
    recentMovements,
    purchaseOrders,
    ledgerStats,
    purchaseTrendRows,
  ] = await Promise.all([
    prisma.$queryRaw<
      {
        totalProducts: number;
        lowStockCount: number;
        expiringSoon: number;
        inventoryValue: number;
      }[]
    >`
      SELECT
        COUNT(*) FILTER (WHERE status = 'active')::int AS "totalProducts",
        COUNT(*) FILTER (
          WHERE status = 'active'
            AND (
              "quantityOnHand" <= 0
              OR (
                "reorderLevel" IS NOT NULL
                AND "quantityOnHand" <= "reorderLevel"
              )
            )
        )::int AS "lowStockCount",
        COUNT(*) FILTER (
          WHERE status = 'active'
            AND "expiryDate" IS NOT NULL
            AND "expiryDate" <= ${expiringCutoff}
            AND "expiryDate" >= ${now}
        )::int AS "expiringSoon",
        COALESCE(
          SUM("quantityOnHand" * "avgCost") FILTER (WHERE status = 'active'),
          0
        )::float AS "inventoryValue"
      FROM "StockItem"
      WHERE "salonId" = ${salonId}
    `,
    prisma.stockLedgerEntry.findMany({
      where: { salonId },
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
    prisma.$queryRaw<
      {
        movementType: string;
        count30d: number;
        monthQty: number;
      }[]
    >`
      SELECT
        "movementType",
        COUNT(*) FILTER (WHERE "createdAt" >= ${thirtyDaysAgo})::int AS "count30d",
        COALESCE(
          SUM(ABS(quantity)) FILTER (WHERE "createdAt" >= ${monthStart}),
          0
        )::float AS "monthQty"
      FROM "StockLedgerEntry"
      WHERE "salonId" = ${salonId}
        AND "createdAt" >= ${thirtyDaysAgo}
      GROUP BY "movementType"
    `,
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

  const kpis = stockKpis[0] ?? {
    totalProducts: 0,
    lowStockCount: 0,
    expiringSoon: 0,
    inventoryValue: 0,
  };

  let consumptionThisMonth = 0;
  let salesThisMonth = 0;
  const chartData = ledgerStats.map((row) => {
    if (row.movementType === "consumption") {
      consumptionThisMonth = Math.abs(row.monthQty);
    } else if (row.movementType === "sale") {
      salesThisMonth = Math.abs(row.monthQty);
    }
    return { type: row.movementType, count: row.count30d };
  });

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
    totalProducts: kpis.totalProducts,
    lowStockCount: kpis.lowStockCount,
    expiringSoon: kpis.expiringSoon,
    inventoryValue: kpis.inventoryValue,
    openPurchaseOrders: purchaseOrders,
    consumptionThisMonth,
    salesThisMonth,
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
  { revalidate: 120, key: "inventory-dashboard" }
);

export async function getInventoryDashboardStats() {
  const session = await requireSession();
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
