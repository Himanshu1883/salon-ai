"use client";

import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { formatCurrency } from "@/lib/currency";
import type { RevenueDay } from "@/actions/dashboard";

type AverageSaleChartProps = {
  data: RevenueDay[];
  delay?: number;
};

function averageTicket(days: RevenueDay[]) {
  const sales = days.reduce((sum, day) => sum + (day.salesCount ?? 0), 0);
  const revenue = days.reduce((sum, day) => sum + day.revenue, 0);
  return sales > 0 ? revenue / sales : 0;
}

export function AverageSaleChart({ data, delay = 0 }: AverageSaleChartProps) {
  const chartData = data.map((day) => ({
    ...day,
    averageSale:
      (day.salesCount ?? 0) > 0 ? day.revenue / day.salesCount : 0,
  }));
  const weekAverage = averageTicket(data);
  const weekSales = data.reduce((sum, day) => sum + (day.salesCount ?? 0), 0);

  return (
    <DashboardCard delay={delay} className="h-full">
      <div className="flex min-w-0 flex-row items-start justify-between gap-2 px-3 pt-3 pb-1.5">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-dashboard-text">
            Average Sale
          </h3>
          <p className="text-[11px] text-dashboard-muted">Last 7 days</p>
        </div>
        <Link
          href="/reports/finance/revenue-summary"
          className="shrink-0 text-xs font-medium text-dashboard-primary hover:text-dashboard-primary-hover"
        >
          Report
        </Link>
      </div>

      <div className="min-w-0 px-3 pb-3">
        <div className="mb-2 min-w-0">
          <p className="truncate text-lg font-bold tracking-tight text-dashboard-text sm:text-xl">
            {weekAverage > 0 ? formatCurrency(Math.round(weekAverage)) : "—"}
          </p>
          <p className="text-[11px] text-dashboard-muted">Avg ticket</p>
        </div>

        {weekAverage === 0 ? (
          <div className="flex h-[128px] flex-col items-center justify-center rounded-xl border border-dashed border-dashboard-border text-center">
            <p className="text-xs font-medium text-dashboard-text">
              No sales yet
            </p>
            <Link
              href="/billing"
              className="mt-1 text-xs font-medium text-dashboard-primary hover:text-dashboard-primary-hover"
            >
              Record a sale →
            </Link>
          </div>
        ) : (
          <div className="h-[128px] w-full min-w-0 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
              >
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
                  formatter={(value) => [
                    formatCurrency(Number(value ?? 0)),
                    "Avg sale",
                  ]}
                />
                <Bar
                  dataKey="averageSale"
                  fill="#0D9488"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <p className="mt-2 border-t border-dashboard-border pt-2 text-[11px] text-dashboard-muted">
          {weekSales === 1 ? "1 sale this week" : `${weekSales} sales this week`}
        </p>
      </div>
    </DashboardCard>
  );
}
