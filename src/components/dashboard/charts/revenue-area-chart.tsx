"use client";

import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { formatCurrency } from "@/lib/currency";
import type { RevenueDay } from "@/actions/dashboard";

type RevenueAreaChartProps = {
  data: RevenueDay[];
  revenueMonth: number;
  delay?: number;
};

export function RevenueAreaChart({
  data,
  revenueMonth,
  delay = 0,
}: RevenueAreaChartProps) {
  const weekTotal = data.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <DashboardCard delay={delay} className="h-full">
      <div className="flex flex-row items-start justify-between p-4 pb-2 xl:p-6">
        <div>
          <h3 className="text-base font-semibold text-dashboard-text xl:text-lg">
            Revenue Analytics
          </h3>
          <p className="mt-0.5 text-xs text-dashboard-muted xl:mt-1 xl:text-sm">Last 7 days</p>
        </div>
        <Link
          href="/reports/finance/revenue-summary"
          className="text-sm font-medium text-dashboard-primary hover:text-dashboard-primary-hover"
        >
          Full report
        </Link>
      </div>

      <div className="px-4 pb-4 xl:px-6 xl:pb-6">
        <div className="mb-3 xl:mb-4">
          <p className="text-2xl font-bold tracking-tight text-dashboard-text xl:text-3xl">
            {formatCurrency(weekTotal)}
          </p>
          <p className="text-xs text-dashboard-muted">7-day total</p>
        </div>

        {weekTotal === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-dashboard-border py-10 text-center">
            <p className="text-sm font-medium text-dashboard-text">
              No revenue yet
            </p>
            <p className="mt-1 text-xs text-dashboard-muted">
              Record your first sale to see trends here
            </p>
            <Link
              href="/billing"
              className="mt-4 text-sm font-medium text-dashboard-primary hover:text-dashboard-primary-hover"
            >
              Create invoice →
            </Link>
          </div>
        ) : (
          <div className="h-[180px] w-full xl:h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#6D28D9" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 11 }}
                  tickFormatter={(v) =>
                    v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)
                  }
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #E5E7EB",
                    boxShadow: "0 10px 40px rgba(15,23,42,0.08)",
                  }}
                  formatter={(value) => [formatCurrency(Number(value ?? 0)), "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6D28D9"
                  strokeWidth={2.5}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="mt-4 border-t border-dashboard-border pt-4">
          <p className="text-sm text-dashboard-muted">
            Month to date{" "}
            <span className="font-semibold text-dashboard-text">
              {formatCurrency(revenueMonth)}
            </span>
          </p>
        </div>
      </div>
    </DashboardCard>
  );
}
