"use client";

import Link from "next/link";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { formatCurrency } from "@/lib/currency";

type TopEarner = {
  id: string;
  name: string;
  role: string;
  monthEarnings: number;
  monthInvoiceCount: number;
};

type TopStaffWidgetProps = {
  topEarners: TopEarner[];
  delay?: number;
};

export function TopStaffWidget({ topEarners, delay = 0 }: TopStaffWidgetProps) {
  return (
    <DashboardCard delay={delay} className="flex h-full flex-col">
      <div className="flex min-w-0 flex-row items-center justify-between gap-2 px-3 pt-3 pb-1.5">
        <h3 className="min-w-0 truncate text-sm font-semibold text-dashboard-text">Top Staff</h3>
        <Link
          href="/reports/team/earnings"
          className="shrink-0 text-xs font-medium text-dashboard-primary hover:text-dashboard-primary-hover"
        >
          Full report
        </Link>
      </div>

      <div className="h-[15.5rem] overflow-y-auto overscroll-contain px-3 pb-3">
        {topEarners.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-dashboard-border text-center">
            <p className="text-xs font-medium text-dashboard-text">No earnings data yet</p>
            <p className="mt-1 text-[11px] text-dashboard-muted">
              Record sales to see top performers
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {topEarners.map((earner, i) => (
              <div
                key={earner.id}
                className="flex min-w-0 items-center justify-between gap-2 rounded-xl border border-dashboard-border bg-dashboard-bg/40 px-2 py-1.5"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-[11px] font-bold text-white">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-dashboard-text">{earner.name}</p>
                    <p className="truncate text-[11px] capitalize text-dashboard-muted">{earner.role}</p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-bold tabular-nums text-dashboard-text">
                    {formatCurrency(earner.monthEarnings)}
                  </p>
                  <p className="text-[10px] text-dashboard-muted">
                    {earner.monthInvoiceCount} invoice
                    {earner.monthInvoiceCount !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardCard>
  );
}
