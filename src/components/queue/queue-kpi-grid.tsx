"use client";

import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
} from "recharts";
import {
  Calendar,
  Clock,
  IndianRupee,
  ListOrdered,
  Scissors,
  TrendingUp,
  UserCheck,
  Users,
  UserX,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import type { QueueDashboardStats } from "./types";
import {
  computeTrend,
  formatWaitTime,
  generateSparkline,
} from "./queue-utils";

type KpiItem = {
  label: string;
  value: string;
  sublabel?: string;
  trend?: number;
  icon: React.ReactNode;
  gradient: string;
  sparkColor: string;
  sparkline?: { v: number }[];
  stub?: boolean;
};

function Sparkline({ data, color }: { data: { v: number }[]; color: string }) {
  const id = color.replace("#", "");
  return (
    <div className="h-10 w-16 shrink-0 opacity-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`q-spark-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#q-spark-${id})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function TrendPill({ trend }: { trend?: number }) {
  if (trend === undefined) return null;
  return (
    <span
      className={cn(
        "text-xs font-medium",
        trend > 0 ? "text-emerald-600" : trend < 0 ? "text-rose-600" : "text-[#9CA3AF]"
      )}
    >
      {trend > 0 ? "+" : ""}
      {trend}% vs yesterday
    </span>
  );
}

function KpiCard({ item, index }: { item: KpiItem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ y: -2, scale: 1.01 }}
      className="group flex flex-col rounded-2xl border border-[#E8ECF4] bg-white p-3.5 shadow-[0_2px_12px_rgba(28,16,61,0.04)] transition-shadow hover:shadow-[0_8px_24px_rgba(108,59,255,0.08)] sm:p-4"
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
          <p className="text-[11px] font-medium text-[#6B7280] sm:text-xs">
            {item.label}
            {item.stub && " *"}
          </p>
          <p className="mt-0.5 text-lg font-bold tracking-tight text-[#1C103D] sm:text-xl">
            {item.value}
          </p>
        </div>
        {item.sparkline && <Sparkline data={item.sparkline} color={item.sparkColor} />}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        {item.sublabel && (
          <p className="truncate text-[11px] text-[#9CA3AF]">{item.sublabel}</p>
        )}
        <TrendPill trend={item.trend} />
      </div>
    </motion.div>
  );
}

export function QueueKpiGrid({ stats }: { stats: QueueDashboardStats }) {
  const completedTrend = computeTrend(
    stats.completedToday,
    stats.completedYesterday
  );

  const kpis: KpiItem[] = [
    {
      label: "Waiting",
      value: String(stats.waiting),
      sublabel: `Est. ${stats.estimatedWait} min wait`,
      icon: <Users className="h-5 w-5 text-white" />,
      gradient: "from-amber-400 to-orange-500",
      sparkColor: "#F97316",
      sparkline: generateSparkline(stats.waiting),
    },
    {
      label: "In Service",
      value: String(stats.inService),
      sublabel: `${stats.inProgress} in progress`,
      icon: <Scissors className="h-5 w-5 text-white" />,
      gradient: "from-[#6C3BFF] to-[#8B5CF6]",
      sparkColor: "#6C3BFF",
      sparkline: generateSparkline(stats.inService),
    },
    {
      label: "Completed Today",
      value: String(stats.completedToday),
      trend: completedTrend,
      icon: <TrendingUp className="h-5 w-5 text-white" />,
      gradient: "from-emerald-500 to-teal-500",
      sparkColor: "#10B981",
      sparkline: generateSparkline(stats.completedToday),
    },
    {
      label: "Avg Wait",
      value: formatWaitTime(stats.avgWaitMinutes),
      sublabel: "Across active queue",
      icon: <Clock className="h-5 w-5 text-white" />,
      gradient: "from-blue-500 to-indigo-500",
      sparkColor: "#3B82F6",
      sparkline: generateSparkline(stats.avgWaitMinutes),
    },
    {
      label: "Avg Service Time",
      value: stats.avgServiceMinutes > 0 ? formatWaitTime(stats.avgServiceMinutes) : "—",
      sublabel: "Completed today",
      icon: <Clock className="h-5 w-5 text-white" />,
      gradient: "from-violet-500 to-purple-600",
      sparkColor: "#8B5CF6",
      sparkline: generateSparkline(stats.avgServiceMinutes || 30),
    },
    {
      label: "Walk-ins Today",
      value: String(stats.walkInsToday),
      sublabel: `${stats.activeTotal} currently active`,
      icon: <ListOrdered className="h-5 w-5 text-white" />,
      gradient: "from-rose-500 to-pink-500",
      sparkColor: "#F43F5E",
      sparkline: generateSparkline(stats.walkInsToday),
    },
    {
      label: "Appointments Today",
      value: String(stats.appointmentsToday),
      sublabel: "Scheduled",
      icon: <Calendar className="h-5 w-5 text-white" />,
      gradient: "from-cyan-500 to-sky-500",
      sparkColor: "#0EA5E9",
      sparkline: generateSparkline(stats.appointmentsToday),
    },
    {
      label: "Cancelled",
      value: String(stats.cancelledToday),
      sublabel: "Appointments today",
      icon: <XCircle className="h-5 w-5 text-white" />,
      gradient: "from-red-500 to-rose-500",
      sparkColor: "#EF4444",
      sparkline: generateSparkline(stats.cancelledToday),
    },
    {
      label: "Revenue Today",
      value: formatCurrency(stats.revenueToday),
      sublabel: "Paid invoices",
      icon: <IndianRupee className="h-5 w-5 text-white" />,
      gradient: "from-[#6C3BFF] to-[#FF2D6F]",
      sparkColor: "#6C3BFF",
      sparkline: generateSparkline(Math.max(stats.revenueToday / 1000, 1)),
    },
    {
      label: "Staff Available",
      value: String(stats.staffAvailable),
      sublabel: "Ready to serve",
      icon: <UserCheck className="h-5 w-5 text-white" />,
      gradient: "from-teal-500 to-emerald-500",
      sparkColor: "#14B8A6",
      sparkline: generateSparkline(stats.staffAvailable),
    },
    {
      label: "Staff Busy",
      value: String(stats.staffBusy),
      sublabel: "Currently serving",
      icon: <Users className="h-5 w-5 text-white" />,
      gradient: "from-fuchsia-500 to-purple-600",
      sparkColor: "#D946EF",
      sparkline: generateSparkline(stats.staffBusy),
    },
    {
      label: "Active in Queue",
      value: String(stats.activeTotal),
      sublabel: `${stats.assigned} assigned`,
      icon: <ListOrdered className="h-5 w-5 text-white" />,
      gradient: "from-indigo-500 to-violet-600",
      sparkColor: "#6366F1",
      sparkline: generateSparkline(stats.activeTotal),
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
      {kpis.map((kpi, i) => (
        <KpiCard key={kpi.label} item={kpi} index={i} />
      ))}
    </div>
  );
}
