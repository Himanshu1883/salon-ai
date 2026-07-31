"use client";

import { format } from "date-fns";
import Link from "next/link";
import { motion } from "framer-motion";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Sparkles } from "lucide-react";
import type {
  CompletedEntry,
  Employee,
  QueueDashboardStats,
  QueueEntry,
} from "./types";
import { formatCurrency } from "@/lib/currency";
import {
  getInitials,
  getServiceNames,
  getServiceTotal,
} from "./queue-utils";

type QueueSidebarProps = {
  entries: QueueEntry[];
  completedEntries: CompletedEntry[];
  employees: Employee[];
  stats: QueueDashboardStats;
};

const CHART_COLORS = ["#6C3BFF", "#3B82F6", "#10B981", "#EF4444"];

export function QueueSidebar({
  entries,
  completedEntries,
  employees,
  stats,
}: QueueSidebarProps) {
  const chartData = [
    { name: "Waiting", value: stats.waiting, color: CHART_COLORS[0] },
    { name: "In Progress", value: stats.inProgress + stats.assigned, color: CHART_COLORS[1] },
    { name: "Completed", value: stats.completedToday, color: CHART_COLORS[2] },
    { name: "Cancelled", value: stats.cancelledToday, color: CHART_COLORS[3] },
  ].filter((d) => d.value > 0);

  const totalToday =
    stats.waiting +
    stats.inService +
    stats.completedToday +
    stats.cancelledToday;

  const upcoming = entries
    .filter((e) => e.status === "waiting")
    .slice(0, 3);

  const recentDone = completedEntries.slice(0, 3);

  const busyIds = new Set(
    entries
      .filter((e) => e.status === "assigned" || e.status === "in_progress")
      .map((e) => e.employee?.id)
      .filter(Boolean)
  );

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#E8ECF4] bg-white p-5 shadow-[0_2px_12px_rgba(28,16,61,0.04)]">
        <h3 className="text-sm font-semibold text-[#1C103D]">Queue Overview</h3>
        <div className="relative mx-auto mt-2 h-44 w-full">
          {chartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-[#1C103D]">
                  {totalToday}
                </span>
                <span className="text-xs text-[#9CA3AF]">Total today</span>
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[#9CA3AF]">
              No queue data yet
            </div>
          )}
        </div>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          {chartData.map((d) => (
            <div key={d.name} className="flex items-center gap-1.5 text-xs text-[#6B7280]">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              {d.name}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-[#E8ECF4] bg-white p-5 shadow-[0_2px_12px_rgba(28,16,61,0.04)]">
        <h3 className="text-sm font-semibold text-[#1C103D]">Upcoming in queue</h3>
        {upcoming.length === 0 ? (
          <p className="mt-3 text-sm text-[#9CA3AF]">No one waiting</p>
        ) : (
          <div className="mt-3 space-y-2.5">
            {upcoming.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 rounded-xl bg-[#F7F8FC] p-2.5"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EDE9FE] text-xs font-bold text-[#6C3BFF]">
                  {getInitials(entry.customer.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#1C103D]">
                    {entry.customer.name}
                  </p>
                  <p className="truncate text-xs text-[#9CA3AF]">
                    {getServiceNames(entry)}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-[#6B7280]">
                  {format(new Date(entry.checkedInAt), "h:mm a")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[#E8ECF4] bg-white p-5 shadow-[0_2px_12px_rgba(28,16,61,0.04)]">
        <h3 className="text-sm font-semibold text-[#1C103D]">Recently completed</h3>
        {recentDone.length === 0 ? (
          <p className="mt-3 text-sm text-[#9CA3AF]">No completions yet</p>
        ) : (
          <div className="mt-3 space-y-2.5">
            {recentDone.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between gap-2 rounded-xl bg-[#F7F8FC] p-2.5"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-700">
                    {getInitials(entry.customer.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#1C103D]">
                      {entry.customer.name}
                    </p>
                    <p className="truncate text-[10px] text-[#9CA3AF]">
                      {entry.completedAt
                        ? format(new Date(entry.completedAt), "h:mm a")
                        : "—"}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-xs font-semibold text-[#1C103D]">
                  {formatCurrency(getServiceTotal(entry))}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[#E8ECF4] bg-white p-5 shadow-[0_2px_12px_rgba(28,16,61,0.04)]">
        <h3 className="text-sm font-semibold text-[#1C103D]">Staff availability</h3>
        <div className="mt-3 space-y-2">
          {employees.slice(0, 6).map((emp) => {
            const busy = busyIds.has(emp.id);
            return (
              <div
                key={emp.id}
                className="flex items-center justify-between rounded-xl bg-[#F7F8FC] px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[10px] font-bold text-[#6C3BFF] shadow-sm">
                    {getInitials(emp.name)}
                  </div>
                  <span className="text-sm text-[#1C103D]">{emp.name}</span>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    busy
                      ? "bg-blue-50 text-blue-700"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {busy ? "Busy" : "Available"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-[#DBEAFE] bg-gradient-to-br from-[#EFF6FF] to-[#F7F8FC] p-4"
      >
        <div className="flex items-start gap-2">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#2563EB]" />
          <div>
            <p className="text-sm font-semibold text-[#1C103D]">AI Suggestion</p>
            <p className="mt-1 text-xs leading-relaxed text-[#6B7280]">
              {stats.waiting >= 3 && stats.staffAvailable <= 1
                ? "It's a busy period! Consider assigning another stylist to reduce wait times."
                : stats.avgWaitMinutes > 20
                  ? "Average wait is high. Prioritize long-waiting customers or add walk-in capacity."
                  : "Queue is flowing smoothly. Keep monitoring peak-hour staffing."}
            </p>
            <Link
              href="/team/members"
              className="mt-2 inline-block text-xs font-medium text-[#6C3BFF] hover:underline"
            >
              Manage staff →
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
