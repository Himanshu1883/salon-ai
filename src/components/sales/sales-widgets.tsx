"use client";

import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Crown, Sparkles, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { MemberAvatar } from "@/components/team/member-avatar";
import type { SalesStats } from "./types";

const CHART_COLORS = ["#6C3CF0", "#22C55E", "#3B82F6", "#F59E0B", "#EF4444"];

type SalesWidgetsProps = {
  stats: SalesStats;
};

export function SalesWidgets({ stats }: SalesWidgetsProps) {
  const pieData = stats.paymentBreakdown.map((p) => ({
    name: p.label,
    value: p.total,
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="rounded-2xl border border-[#ECECEC] bg-white p-5 shadow-[0_4px_24px_rgba(28,16,61,0.05)] transition-shadow duration-150 hover:shadow-[0_8px_32px_rgba(28,16,61,0.08)]"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#1C103D]">
              Revenue Trend
            </h3>
            <p className="text-xs text-[#9CA3AF]">Last 7 days</p>
          </div>
          <TrendingUp className="h-4 w-4 text-[#6C3CF0]" />
        </div>
        <div className="mt-4 h-[120px] w-full">
          {stats.revenueByDay.every((d) => d.revenue === 0) ? (
            <div className="flex h-full items-center justify-center text-xs text-[#9CA3AF]">
              No revenue data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.revenueByDay}>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #ECECEC",
                    fontSize: 12,
                  }}
                  formatter={(value) => [
                    formatCurrency(Number(value ?? 0)),
                    "Revenue",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6C3CF0"
                  strokeWidth={2.5}
                  dot={{ fill: "#6C3CF0", r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className="rounded-2xl border border-[#ECECEC] bg-white p-5 shadow-[0_4px_24px_rgba(28,16,61,0.05)] transition-shadow duration-150 hover:shadow-[0_8px_32px_rgba(28,16,61,0.08)]"
      >
        <h3 className="text-sm font-semibold text-[#1C103D]">
          Payment Methods
        </h3>
        <p className="text-xs text-[#9CA3AF]">Distribution by volume</p>
        <div className="mt-2 flex items-center gap-4">
          <div className="h-[120px] w-[120px] shrink-0">
            {pieData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-[#9CA3AF]">
                No data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex-1 space-y-1.5">
            {stats.paymentBreakdown.slice(0, 4).map((p, i) => (
              <div
                key={p.method}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor:
                        CHART_COLORS[i % CHART_COLORS.length],
                    }}
                  />
                  <span className="text-[#6B7280]">{p.label}</span>
                </div>
                <span className="font-medium text-[#1C103D]">
                  {formatCurrency(p.total)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="rounded-2xl border border-[#ECECEC] bg-white p-5 shadow-[0_4px_24px_rgba(28,16,61,0.05)] transition-shadow duration-150 hover:shadow-[0_8px_32px_rgba(28,16,61,0.08)]"
        >
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-[#1C103D]">
              Top Stylist
            </h3>
          </div>
          {stats.topStylist ? (
            <div className="mt-3 flex items-center gap-3">
              <MemberAvatar
                name={stats.topStylist.name}
                className="h-10 w-10"
              />
              <div>
                <p className="font-semibold text-[#1C103D]">
                  {stats.topStylist.name}
                </p>
                <p className="text-xs text-[#6B7280]">
                  {formatCurrency(stats.topStylist.revenue)} ·{" "}
                  {stats.topStylist.count} sale
                  {stats.topStylist.count !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-xs text-[#9CA3AF]">No stylist data yet</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.35 }}
          className="rounded-2xl border border-[#ECECEC] bg-white p-5 shadow-[0_4px_24px_rgba(28,16,61,0.05)] transition-shadow duration-150 hover:shadow-[0_8px_32px_rgba(28,16,61,0.08)]"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#6C3CF0]" />
            <h3 className="text-sm font-semibold text-[#1C103D]">
              Top Service
            </h3>
          </div>
          {stats.topService ? (
            <div className="mt-3">
              <p className="font-semibold text-[#1C103D]">
                {stats.topService.name}
              </p>
              <p className="text-xs text-[#6B7280]">
                {stats.topService.count} booking
                {stats.topService.count !== 1 ? "s" : ""}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-xs text-[#9CA3AF]">No service data yet</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
