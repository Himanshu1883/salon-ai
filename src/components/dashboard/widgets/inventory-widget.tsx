"use client";

import Link from "next/link";
import { Package } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getStockStatusLabel } from "@/lib/stock";
import type { DashboardLowStockItem } from "@/actions/dashboard";

type InventoryWidgetProps = {
  items?: DashboardLowStockItem[];
  lowStockCount?: number;
  totalStockItems?: number;
  delay?: number;
};

/** 6 / 8 / 10 rows visible, then scroll. */
const LIST_VIEWPORT =
  "h-[17.75rem] overflow-y-auto overscroll-contain pr-1 sm:h-[23.75rem] lg:h-[29.75rem]";

export function InventoryWidget({
  items = [],
  lowStockCount = 0,
  totalStockItems = 0,
  delay = 0,
}: InventoryWidgetProps) {
  return (
    <DashboardCard
      delay={delay}
      hover={false}
      className="flex h-full flex-col"
    >
      <div className="flex min-w-0 flex-row items-center justify-between gap-2 px-3 pt-3 pb-1.5">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-dashboard-text">
            Inventory
          </h3>
          <p className="truncate text-[11px] text-dashboard-muted">
            {totalStockItems === 1
              ? "1 item"
              : `${totalStockItems} items`}{" "}
            · {lowStockCount} low stock
          </p>
        </div>
        <Link
          href="/inventory/stock"
          className="shrink-0 text-xs font-medium text-dashboard-primary hover:text-dashboard-primary-hover"
        >
          View stock
        </Link>
      </div>

      <div className="flex flex-col px-3 pb-3">
        {totalStockItems === 0 ? (
          <div className={`${LIST_VIEWPORT} flex flex-col items-center justify-center rounded-xl border border-dashed border-dashboard-border text-center`}>
            <Package className="mb-1.5 h-6 w-6 text-dashboard-border" />
            <p className="text-xs font-medium text-dashboard-text">
              No inventory yet
            </p>
            <Button
              asChild
              className="mt-2 h-7 rounded-lg bg-dashboard-primary px-2.5 text-[11px] hover:bg-dashboard-primary-hover"
              size="sm"
            >
              <Link href="/inventory/stock">Add stock</Link>
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className={`${LIST_VIEWPORT} flex flex-col items-center justify-center rounded-xl border border-dashed border-dashboard-border text-center`}>
            <Package className="mb-1.5 h-6 w-6 text-emerald-400" />
            <p className="text-xs font-medium text-dashboard-text">
              All items adequately stocked
            </p>
            <Link
              href="/inventory/stock"
              className="mt-1 text-xs font-medium text-dashboard-primary hover:text-dashboard-primary-hover"
            >
              View inventory →
            </Link>
          </div>
        ) : (
          <div className={`${LIST_VIEWPORT} space-y-1`}>
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/inventory/stock/${item.id}`}
                  className="flex min-w-0 shrink-0 items-center gap-2 rounded-xl px-1.5 py-2 hover:bg-dashboard-bg/60 sm:px-2"
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                      item.status === "out"
                        ? "bg-red-100 text-red-600"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    <Package className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-dashboard-text">
                      {item.name}
                    </p>
                    <p className="truncate text-[11px] text-dashboard-muted">
                      {item.quantityOnHand} {item.unit}
                      {item.reorderLevel != null
                        ? ` · reorder at ${item.reorderLevel}`
                        : ""}
                    </p>
                  </div>
                  <Badge
                    variant={item.status === "out" ? "destructive" : "warning"}
                    className="h-5 shrink-0 px-1.5 text-[10px]"
                  >
                    {getStockStatusLabel(item.status)}
                  </Badge>
                </Link>
              ))}
          </div>
        )}
      </div>
    </DashboardCard>
  );
}
