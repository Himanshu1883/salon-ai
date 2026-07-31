"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
} from "recharts";
import {
  Calendar,
  IndianRupee,
  Package,
  Users,
  ListOrdered,
  Repeat,
  BarChart3,
  CreditCard,
  UserPlus,
  Crown,
  Gift,
  ShoppingBag,
  Percent,
  XCircle,
  UserX,
  Warehouse,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import type { ReportsDashboardMetrics } from "@/components/reports/reports-bi-dashboard";

type KpiItem = {
  label: string;
  value: string;
  sublabel?: string;
  trend?: number;
  href?: string;
  icon: React.ReactNode;
  gradient: string;
  sparkColor: string;
  sparkline?: { v: number }[];
};

function RechartsSparkline({
  data,
  color,
}: {
  data: { v: number }[];
  color: string;
}) {
  return (
    <div className="h-10 w-20 shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#spark-${color})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function TrendBadge({ trend }: { trend?: number }) {
  if (trend === undefined) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium",
        trend > 0
          ? "text-emerald-600"
          : trend < 0
            ? "text-rose-600"
            : "text-[#9CA3AF]"
      )}
    >
      {trend > 0 ? (
        <TrendingUp className="h-3 w-3" />
      ) : trend < 0 ? (
        <TrendingDown className="h-3 w-3" />
      ) : (
        <Minus className="h-3 w-3" />
      )}
      {trend > 0 ? "+" : ""}
      {trend}%
    </span>
  );
}

function KpiCard({ item, index }: { item: KpiItem; index: number }) {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.03 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="group flex h-full flex-col rounded-2xl border border-[#E8ECF4] bg-white p-4 shadow-[0_2px_12px_rgba(28,16,61,0.04)] transition-shadow hover:shadow-[0_8px_24px_rgba(108,59,255,0.08)]"
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm",
            item.gradient
          )}
        >
          {item.icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-[#6B7280]">{item.label}</p>
          <p className="mt-0.5 text-xl font-bold tracking-tight text-[#1C103D]">
            {item.value}
          </p>
        </div>
        {item.sparkline && item.sparkline.length > 0 && (
          <RechartsSparkline data={item.sparkline} color={item.sparkColor} />
        )}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        {item.sublabel && (
          <p className="truncate text-xs text-[#9CA3AF]">{item.sublabel}</p>
        )}
        <TrendBadge trend={item.trend} />
      </div>
    </motion.div>
  );

  if (item.href) {
    return (
      <Link href={item.href} className="block h-full">
        {content}
      </Link>
    );
  }
  return content;
}

export function ReportsKpiGrid({ metrics }: { metrics: ReportsDashboardMetrics }) {
  const sparkline = metrics.revenueByDay.map((d) => ({ v: d.revenue }));

  const kpis: KpiItem[] = [
    {
      label: "Today's Revenue",
      value: formatCurrency(metrics.revenueToday),
      sublabel: `${formatCurrency(metrics.revenueMonth)} this month`,
      trend: metrics.revenueTrend,
      href: "/sales/daily",
      icon: <IndianRupee className="h-5 w-5 text-white" />,
      gradient: "from-[#6C3BFF] to-[#8B5CF6]",
      sparkColor: "#6C3BFF",
      sparkline,
    },
    {
      label: "Month Revenue",
      value: formatCurrency(metrics.revenueMonth),
      sublabel: "Month to date",
      href: "/reports/finance/revenue-summary",
      icon: <BarChart3 className="h-5 w-5 text-white" />,
      gradient: "from-violet-600 to-purple-700",
      sparkColor: "#7C3AED",
      sparkline,
    },
    {
      label: "Appointments",
      value: String(metrics.todayAppointments),
      sublabel: "Scheduled today",
      href: "/sales/appointments",
      icon: <Calendar className="h-5 w-5 text-white" />,
      gradient: "from-rose-500 to-pink-500",
      sparkColor: "#F43F5E",
    },
    {
      label: "Walk-ins",
      value: String(metrics.activeQueue),
      sublabel: `${metrics.waitingCount} waiting`,
      href: "/queue",
      icon: <ListOrdered className="h-5 w-5 text-white" />,
      gradient: "from-orange-500 to-amber-500",
      sparkColor: "#F97316",
    },
    {
      label: "Retail Sales",
      value: formatCurrency(metrics.retailSales),
      sublabel: "Products this month",
      href: "/reports/sales/summary",
      icon: <ShoppingBag className="h-5 w-5 text-white" />,
      gradient: "from-sky-500 to-cyan-500",
      sparkColor: "#0EA5E9",
    },
    {
      label: "Avg Bill",
      value: metrics.avgBill > 0 ? formatCurrency(metrics.avgBill) : "—",
      sublabel: `${metrics.invoiceCountMonth} invoices`,
      href: "/reports/finance/revenue-summary",
      icon: <CreditCard className="h-5 w-5 text-white" />,
      gradient: "from-fuchsia-500 to-purple-600",
      sparkColor: "#D946EF",
    },
    {
      label: "Active Customers",
      value: String(metrics.totalCustomers),
      sublabel: "Total in CRM",
      href: "/clients",
      icon: <Users className="h-5 w-5 text-white" />,
      gradient: "from-indigo-500 to-violet-500",
      sparkColor: "#6366F1",
    },
    {
      label: "New Customers",
      value: String(metrics.newCustomersMonth),
      sublabel: "Added this month",
      href: "/reports/clients/new-clients",
      icon: <UserPlus className="h-5 w-5 text-white" />,
      gradient: "from-teal-500 to-emerald-500",
      sparkColor: "#14B8A6",
    },
    {
      label: "Membership Sales",
      value: formatCurrency(metrics.membershipSales),
      sublabel: "This month",
      href: "/reports/sales/memberships",
      icon: <Crown className="h-5 w-5 text-white" />,
      gradient: "from-amber-500 to-yellow-500",
      sparkColor: "#F59E0B",
    },
    {
      label: "Package Sales",
      value: formatCurrency(metrics.packageSales),
      sublabel: "This month",
      href: "/reports/sales/packages-summary",
      icon: <Gift className="h-5 w-5 text-white" />,
      gradient: "from-pink-500 to-rose-400",
      sparkColor: "#EC4899",
    },
    {
      label: "Product Sales",
      value: formatCurrency(metrics.productSales),
      sublabel: "This month",
      href: "/reports/sales/summary",
      icon: <Package className="h-5 w-5 text-white" />,
      gradient: "from-blue-500 to-indigo-500",
      sparkColor: "#3B82F6",
    },
    {
      label: "Staff Utilization",
      value: `${metrics.staffUtilization}%`,
      sublabel: `${metrics.employeesOnDuty} on duty`,
      href: "/reports/team/shift-hours",
      icon: <Repeat className="h-5 w-5 text-white" />,
      gradient: "from-violet-500 to-indigo-600",
      sparkColor: "#8B5CF6",
    },
    {
      label: "Cancellation Rate",
      value: `${metrics.cancellationRate}%`,
      sublabel: "This month",
      href: "/reports/appointments/by-period",
      icon: <XCircle className="h-5 w-5 text-white" />,
      gradient: "from-red-500 to-rose-500",
      sparkColor: "#EF4444",
    },
    {
      label: "No Shows",
      value: String(metrics.noShowCount),
      sublabel: `${metrics.completionRate}% completion`,
      href: "/reports/appointments/no-shows",
      icon: <UserX className="h-5 w-5 text-white" />,
      gradient: "from-stone-500 to-stone-600",
      sparkColor: "#78716C",
    },
    {
      label: "Inventory Value",
      value: formatCurrency(metrics.inventoryValue),
      sublabel: `${metrics.lowStockCount} low stock`,
      href: "/reports/inventory/stock-levels",
      icon: <Warehouse className="h-5 w-5 text-white" />,
      gradient: "from-emerald-500 to-teal-500",
      sparkColor: "#10B981",
    },
    {
      label: "Favourites",
      value: String(metrics.favoriteCount),
      sublabel: "Saved reports",
      href: "/reports/favourites",
      icon: <Percent className="h-5 w-5 text-white" />,
      gradient: "from-[#6C3BFF] to-[#FF2D6F]",
      sparkColor: "#6C3BFF",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4">
      {kpis.map((kpi, i) => (
        <KpiCard key={kpi.label} item={kpi} index={i} />
      ))}
    </div>
  );
}
