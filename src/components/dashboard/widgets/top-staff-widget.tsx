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
    <DashboardCard delay={delay} className="h-full">
      <div className="flex min-w-0 flex-row items-center justify-between gap-2 p-4 pb-3 xl:p-6 xl:pb-4">
        <h3 className="min-w-0 truncate text-base font-semibold text-dashboard-text xl:text-lg">Top Staff</h3>
        <Link
          href="/reports/team/earnings"
          className="shrink-0 text-sm font-medium text-dashboard-primary hover:text-dashboard-primary-hover"
        >
          Full report
        </Link>
      </div>

      <div className="px-4 pb-4 xl:px-6 xl:pb-6">
        {topEarners.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-dashboard-border py-8 text-center">
            <p className="text-sm font-medium text-dashboard-text">No earnings data yet</p>
            <p className="mt-1 text-xs text-dashboard-muted">
              Record sales to see top performers
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {topEarners.map((earner, i) => (
              <div
                key={earner.id}
                className="flex min-w-0 items-center justify-between gap-2 rounded-2xl border border-dashboard-border bg-dashboard-bg/40 px-3 py-3 sm:px-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-dashboard-text">{earner.name}</p>
                    <p className="truncate text-xs capitalize text-dashboard-muted">{earner.role}</p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-dashboard-text">
                    {formatCurrency(earner.monthEarnings)}
                  </p>
                  <p className="text-xs text-dashboard-muted">
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
