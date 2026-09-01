"use client";

import { format } from "date-fns";
import Link from "next/link";
import { motion } from "framer-motion";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import {
  EMPTY_QUEUE_OVERVIEW,
  type QueueSidebarPayload,
} from "@/lib/queue/overview-types";

type QueueSidebarProps = {
  sidebar?: QueueSidebarPayload;
};

export function QueueSidebar({ sidebar }: QueueSidebarProps) {
  const {
    chartData,
    totalToday,
    upcomingWaiting,
    recentDone,
    staff,
    aiSuggestion,
  } = sidebar ?? EMPTY_QUEUE_OVERVIEW.sidebar;

  return (
    <div className="min-w-0 space-y-3 sm:space-y-4">
      <div className="overflow-hidden rounded-xl border border-[#E8ECF4] bg-white p-3 shadow-[0_2px_12px_rgba(28,16,61,0.04)] sm:rounded-2xl sm:p-5">
        <h3 className="text-sm font-semibold text-[#1C103D]">Queue Overview</h3>
        <div className="relative mx-auto mt-2 h-32 w-full max-w-[220px] sm:h-44 sm:max-w-none">
          {chartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius="58%"
                    outerRadius="82%"
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

      <div className="rounded-xl border border-[#E8ECF4] bg-white p-3 shadow-[0_2px_12px_rgba(28,16,61,0.04)] sm:rounded-2xl sm:p-5">
        <h3 className="text-sm font-semibold text-[#1C103D]">Upcoming in queue</h3>
        {upcomingWaiting.length === 0 ? (
          <p className="mt-3 text-sm text-[#9CA3AF]">No one waiting</p>
        ) : (
          <div className="mt-3 space-y-2.5">
            {upcomingWaiting.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 rounded-xl bg-[#F7F8FC] p-2.5"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EDE9FE] text-xs font-bold text-[#6C3BFF]">
                  {entry.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#1C103D]">
                    {entry.customerName}
                  </p>
                  <p className="truncate text-xs text-[#9CA3AF]">
                    {entry.serviceNames}
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

      <div className="rounded-xl border border-[#E8ECF4] bg-white p-3 shadow-[0_2px_12px_rgba(28,16,61,0.04)] sm:rounded-2xl sm:p-5">
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
                    {entry.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#1C103D]">
                      {entry.customerName}
                    </p>
                    <p className="truncate text-[10px] text-[#9CA3AF]">
                      {entry.completedAt
                        ? format(new Date(entry.completedAt), "h:mm a")
                        : "—"}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-xs font-semibold text-[#1C103D]">
                  {formatCurrency(entry.total)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-[#E8ECF4] bg-white p-3 shadow-[0_2px_12px_rgba(28,16,61,0.04)] sm:rounded-2xl sm:p-5">
        <h3 className="text-sm font-semibold text-[#1C103D]">Staff availability</h3>
        <div className="mt-3 space-y-2">
          {staff.map((emp) => (
            <div
              key={emp.id}
              className="flex items-center justify-between rounded-xl bg-[#F7F8FC] px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[10px] font-bold text-[#6C3BFF] shadow-sm">
                  {emp.initials}
                </div>
                <span className="max-w-[60%] truncate text-sm text-[#1C103D]">{emp.name}</span>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  emp.busy
                    ? "bg-blue-50 text-blue-700"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {emp.busy ? "Busy" : "Available"}
              </span>
            </div>
          ))}
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
              {aiSuggestion}
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
