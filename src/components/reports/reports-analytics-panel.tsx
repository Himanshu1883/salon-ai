"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
} from "recharts";
import {
  Activity,
  Target,
  AlertTriangle,
  TrendingUp,
  Scissors,
  Users,
  ShoppingBag,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import type { ReportsDashboardMetrics } from "@/components/reports/reports-bi-dashboard";

const PIE_COLORS = ["#6C3BFF", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B"];

type Props = {
  metrics: ReportsDashboardMetrics;
};

export function ReportsAnalyticsPanel({ metrics }: Props) {
  const healthScore = Math.min(
    100,
    Math.round(
      (metrics.completionRate * 0.3 +
        Math.min(metrics.revenueTrend + 50, 100) * 0.25 +
        (100 - metrics.cancellationRate) * 0.2 +
        metrics.staffUtilization * 0.15 +
        (metrics.lowStockCount === 0 ? 100 : Math.max(0, 100 - metrics.lowStockCount * 10)) *
          0.1)
    )
  );

  const revenueBreakdown = [
    { name: "Services", value: metrics.serviceSales || 1 },
    { name: "Products", value: metrics.productSales || 0 },
    { name: "Packages", value: metrics.packageSales || 0 },
    { name: "Memberships", value: metrics.membershipSales || 0 },
  ].filter((d) => d.value > 0);

  const alerts = [
    metrics.lowStockCount > 0 && {
      text: `${metrics.lowStockCount} items low on stock`,
      href: "/reports/inventory/low-stock",
      severity: "warning" as const,
    },
    metrics.unpaidInvoices > 0 && {
      text: `${metrics.unpaidInvoices} unpaid invoices`,
      href: "/reports/finance/unpaid-invoices",
      severity: "warning" as const,
    },
    metrics.noShowCount > 0 && {
      text: `${metrics.noShowCount} no-shows this month`,
      href: "/reports/appointments/no-shows",
      severity: "info" as const,
    },
  ].filter(Boolean) as { text: string; href: string; severity: "warning" | "info" }[];

  const goalProgress = Math.min(
    100,
    metrics.revenueMonth > 0
      ? Math.round((metrics.revenueMonth / Math.max(metrics.revenueMonth * 1.2, 1)) * 100)
      : 0
  );

  return (
    <motion.aside
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="space-y-4"
    >
      {/* Business Health Score */}
      <div className="rounded-2xl border border-[#E8ECF4] bg-white p-4 shadow-[0_2px_12px_rgba(28,16,61,0.04)]">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#6C3BFF]" />
          <h3 className="text-sm font-semibold text-[#1C103D]">Business Health Score</h3>
        </div>
        <div className="mt-3 flex items-center gap-4">
          <div className="relative flex h-20 w-20 items-center justify-center">
            <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="#EDE9FE" strokeWidth="3" />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="#6C3BFF"
                strokeWidth="3"
                strokeDasharray={`${healthScore} 100`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-lg font-bold text-[#6C3BFF]">{healthScore}</span>
          </div>
          <p className="text-xs text-[#6B7280]">
            Based on completion rate, revenue trend, cancellations, staff utilization, and inventory.
          </p>
        </div>
      </div>

      {/* Today's Performance */}
      <div className="rounded-2xl border border-[#E8ECF4] bg-white p-4 shadow-[0_2px_12px_rgba(28,16,61,0.04)]">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-500" />
          <h3 className="text-sm font-semibold text-[#1C103D]">Today&apos;s Performance</h3>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-[#F7F8FC] p-2.5">
            <p className="text-[10px] text-[#9CA3AF]">Revenue</p>
            <p className="text-sm font-bold text-[#1C103D]">
              {formatCurrency(metrics.revenueToday)}
            </p>
          </div>
          <div className="rounded-xl bg-[#F7F8FC] p-2.5">
            <p className="text-[10px] text-[#9CA3AF]">Appointments</p>
            <p className="text-sm font-bold text-[#1C103D]">{metrics.todayAppointments}</p>
          </div>
          <div className="rounded-xl bg-[#F7F8FC] p-2.5">
            <p className="text-[10px] text-[#9CA3AF]">Walk-ins</p>
            <p className="text-sm font-bold text-[#1C103D]">{metrics.activeQueue}</p>
          </div>
          <div className="rounded-xl bg-[#F7F8FC] p-2.5">
            <p className="text-[10px] text-[#9CA3AF]">Trend</p>
            <p className="text-sm font-bold text-emerald-600">
              {metrics.revenueTrend > 0 ? "+" : ""}
              {metrics.revenueTrend}%
            </p>
          </div>
        </div>
      </div>

      {/* Revenue Goal */}
      <div className="rounded-2xl border border-[#E8ECF4] bg-white p-4 shadow-[0_2px_12px_rgba(28,16,61,0.04)]">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-[#6C3BFF]" />
          <h3 className="text-sm font-semibold text-[#1C103D]">Revenue Goal</h3>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-xs">
            <span className="text-[#6B7280]">{formatCurrency(metrics.revenueMonth)} MTD</span>
            <span className="font-medium text-[#6C3BFF]">{goalProgress}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#EDE9FE]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#6C3BFF] to-[#8B5CF6]"
              style={{ width: `${goalProgress}%` }}
            />
          </div>
          <Link
            href="/reports/finance/revenue-summary"
            className="mt-2 inline-block text-xs text-[#6C3BFF] hover:underline"
          >
            View revenue summary →
          </Link>
        </div>
      </div>

      {/* Top Services */}
      {metrics.topServices.length > 0 && (
        <div className="rounded-2xl border border-[#E8ECF4] bg-white p-4 shadow-[0_2px_12px_rgba(28,16,61,0.04)]">
          <div className="flex items-center gap-2">
            <Scissors className="h-4 w-4 text-rose-500" />
            <h3 className="text-sm font-semibold text-[#1C103D]">Top Services</h3>
          </div>
          <div className="mt-2 h-24">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.topServices.slice(0, 4)} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <Bar dataKey="value" fill="#6C3BFF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Top Staff */}
      {metrics.topEarners.length > 0 && (
        <div className="rounded-2xl border border-[#E8ECF4] bg-white p-4 shadow-[0_2px_12px_rgba(28,16,61,0.04)]">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-500" />
            <h3 className="text-sm font-semibold text-[#1C103D]">Top Staff</h3>
          </div>
          <ul className="mt-2 space-y-2">
            {metrics.topEarners.slice(0, 3).map((e, i) => (
              <li key={e.id} className="flex items-center justify-between text-sm">
                <span className="text-[#374151]">
                  {i + 1}. {e.name}
                </span>
                <span className="font-medium text-[#6C3BFF]">
                  {formatCurrency(e.monthEarnings)}
                </span>
              </li>
            ))}
          </ul>
          <Link
            href="/reports/team/earnings"
            className="mt-2 inline-block text-xs text-[#6C3BFF] hover:underline"
          >
            View all earnings →
          </Link>
        </div>
      )}

      {/* Top Customers */}
      {metrics.topCustomers.length > 0 && (
        <div className="rounded-2xl border border-[#E8ECF4] bg-white p-4 shadow-[0_2px_12px_rgba(28,16,61,0.04)]">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-sky-500" />
            <h3 className="text-sm font-semibold text-[#1C103D]">Top Customers</h3>
          </div>
          <ul className="mt-2 space-y-2">
            {metrics.topCustomers.slice(0, 3).map((c, i) => (
              <li key={c.name} className="flex items-center justify-between text-sm">
                <span className="truncate text-[#374151]">
                  {i + 1}. {c.name}
                </span>
                <span className="font-medium text-[#6C3BFF]">
                  {formatCurrency(c.total)}
                </span>
              </li>
            ))}
          </ul>
          <Link
            href="/reports/clients/top-spenders"
            className="mt-2 inline-block text-xs text-[#6C3BFF] hover:underline"
          >
            View top spenders →
          </Link>
        </div>
      )}

      {/* Revenue Breakdown */}
      {revenueBreakdown.length > 0 && (
        <div className="rounded-2xl border border-[#E8ECF4] bg-white p-4 shadow-[0_2px_12px_rgba(28,16,61,0.04)]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-[#6C3BFF]" />
            <h3 className="text-sm font-semibold text-[#1C103D]">Revenue Breakdown</h3>
          </div>
          <div className="mt-2 h-28">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={28}
                  outerRadius={44}
                  paddingAngle={2}
                >
                  {revenueBreakdown.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-1 flex flex-wrap gap-2">
            {revenueBreakdown.map((d, i) => (
              <span key={d.name} className="flex items-center gap-1 text-[10px] text-[#6B7280]">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                />
                {d.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Alerts */}
      <div className="rounded-2xl border border-[#E8ECF4] bg-white p-4 shadow-[0_2px_12px_rgba(28,16,61,0.04)]">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-semibold text-[#1C103D]">Alerts</h3>
        </div>
        {alerts.length === 0 ? (
          <p className="mt-2 text-xs text-[#9CA3AF]">No alerts at this time.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {alerts.map((alert) => (
              <li key={alert.text}>
                <Link
                  href={alert.href}
                  className="flex items-center gap-2 rounded-lg bg-[#F7F8FC] px-3 py-2 text-xs text-[#374151] hover:bg-[#EDE9FE]"
                >
                  <AlertTriangle
                    className={cn(
                      "h-3.5 w-3.5 shrink-0",
                      alert.severity === "warning" ? "text-amber-500" : "text-[#6C3BFF]"
                    )}
                  />
                  {alert.text}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.aside>
  );
}
