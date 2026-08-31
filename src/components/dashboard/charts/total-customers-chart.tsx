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
import type { CustomerDay } from "@/actions/dashboard";

type TotalCustomersChartProps = {
  data: CustomerDay[];
  totalCustomers: number;
  delay?: number;
};

export function TotalCustomersChart({
  data = [],
  totalCustomers = 0,
  delay = 0,
}: TotalCustomersChartProps) {
  const weekNew = data.reduce((sum, day) => sum + day.newCount, 0);

  return (
    <DashboardCard delay={delay} className="h-full">
      <div className="flex min-w-0 flex-row items-start justify-between gap-2 px-3 pt-3 pb-1.5">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-dashboard-text">
            Total Customers
          </h3>
          <p className="text-[11px] text-dashboard-muted">Last 7 days</p>
        </div>
        <Link
          href="/clients"
          className="shrink-0 text-xs font-medium text-dashboard-primary hover:text-dashboard-primary-hover"
        >
          Report
        </Link>
      </div>

      <div className="min-w-0 px-3 pb-3">
        <div className="mb-2 min-w-0">
          <p className="truncate text-lg font-bold tracking-tight text-dashboard-text sm:text-xl">
            {totalCustomers.toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-dashboard-muted">All clients</p>
        </div>

        {totalCustomers === 0 ? (
          <div className="flex h-[128px] flex-col items-center justify-center rounded-xl border border-dashed border-dashboard-border text-center">
            <p className="text-xs font-medium text-dashboard-text">
              No customers yet
            </p>
            <Link
              href="/clients"
              className="mt-1 text-xs font-medium text-dashboard-primary hover:text-dashboard-primary-hover"
            >
              Add customer →
            </Link>
          </div>
        ) : (
          <div className="h-[128px] w-full min-w-0 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="customersGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#6366F1" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E5E7EB"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 10 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 10 }}
                  tickFormatter={(value) =>
                    value >= 1000
                      ? `${Math.round(Number(value) / 1000)}k`
                      : String(value)
                  }
                  width={32}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid #E5E7EB",
                    boxShadow: "0 10px 40px rgba(15,23,42,0.08)",
                    fontSize: 12,
                  }}
                  formatter={(value, name) => {
                    if (name === "total") {
                      return [Number(value ?? 0).toLocaleString("en-IN"), "Total"];
                    }
                    return [Number(value ?? 0).toLocaleString("en-IN"), "New"];
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#4F46E5"
                  strokeWidth={2}
                  fill="url(#customersGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        <p className="mt-2 border-t border-dashboard-border pt-2 text-[11px] text-dashboard-muted">
          {weekNew === 1 ? "1 new this week" : `${weekNew} new this week`}
        </p>
      </div>
    </DashboardCard>
  );
}
