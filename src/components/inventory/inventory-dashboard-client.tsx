"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { format } from "date-fns";
import Link from "next/link";
import {
  InventoryPageHeader,
  InventoryStatCard,
} from "@/components/inventory/inventory-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MOVEMENT_LABELS } from "@/lib/inventory/constants";
import type { MovementType } from "@/lib/inventory/constants";
import { motion } from "framer-motion";

type DashboardProps = {
  stats: Awaited<ReturnType<typeof import("@/actions/inventory/dashboard").getInventoryDashboardStats>>;
};

export function InventoryDashboardClient({ stats }: DashboardProps) {
  return (
    <div className="space-y-6">
      <InventoryPageHeader
        title="Inventory Dashboard"
        description="Track stock levels, consumption, purchases, and salon product movement."
      >
        <div className="flex gap-2">
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/inventory/purchase-orders">New PO</Link>
          </Button>
          <Button asChild className="rounded-xl bg-[#6C3BFF] hover:bg-[#5A2FE0]">
            <Link href="/inventory/products">Add Product</Link>
          </Button>
        </div>
      </InventoryPageHeader>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <InventoryStatCard
          label="Total Products"
          value={stats.totalProducts}
          sub="Active SKUs"
        />
        <InventoryStatCard
          label="Inventory Value"
          value={`₹${stats.inventoryValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
          sub="At avg cost"
          accent="emerald"
        />
        <InventoryStatCard
          label="Low Stock"
          value={stats.lowStockCount}
          sub="Needs reorder"
          accent="amber"
        />
        <InventoryStatCard
          label="Open POs"
          value={stats.openPurchaseOrders}
          sub={`${stats.expiringSoon} expiring soon`}
          accent="rose"
        />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-violet-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Purchase Activity (30 days)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.purchaseTrend}>
                <defs>
                  <linearGradient id="purchaseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6C3BFF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6C3BFF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EAF0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="qty"
                  stroke="#6C3BFF"
                  fill="url(#purchaseGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-violet-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Movement Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.movementChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EAF0" />
                <XAxis
                  dataKey="type"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) =>
                    MOVEMENT_LABELS[v as MovementType]?.slice(0, 8) ?? v
                  }
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  labelFormatter={(v) =>
                    MOVEMENT_LABELS[v as MovementType] ?? v
                  }
                />
                <Bar dataKey="count" fill="#6C3BFF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <InventoryStatCard
          label="Consumed This Month"
          value={stats.consumptionThisMonth}
          sub="Units from services"
        />
        <InventoryStatCard
          label="Retail Sold"
          value={stats.salesThisMonth}
          sub="Units this month"
          accent="emerald"
        />
        <InventoryStatCard
          label="Expiring Soon"
          value={stats.expiringSoon}
          sub="Within 30 days"
          accent="amber"
        />
      </div>

      <Card className="rounded-2xl border-violet-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Stock Movements</CardTitle>
          <Button asChild variant="ghost" size="sm" className="rounded-xl">
            <Link href="/inventory/ledger">View ledger</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.recentMovements.length === 0 ? (
              <p className="text-sm text-stone-500">No recent movements.</p>
            ) : (
              stats.recentMovements.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-xl bg-[#F7F8FC] px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-stone-900">{m.product}</p>
                    <p className="text-xs text-stone-500">
                      {format(new Date(m.createdAt), "MMM d, h:mm a")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="rounded-lg capitalize">
                      {MOVEMENT_LABELS[m.type as MovementType] ?? m.type}
                    </Badge>
                    <span
                      className={
                        m.quantity >= 0
                          ? "text-sm font-semibold text-emerald-600"
                          : "text-sm font-semibold text-rose-600"
                      }
                    >
                      {m.quantity >= 0 ? "+" : ""}
                      {m.quantity}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
