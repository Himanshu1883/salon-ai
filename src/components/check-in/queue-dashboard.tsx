"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Clock,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import type {
  BillingStatsSnapshot,
  CompletedEntryItem,
  QueueEntryItem,
} from "./types";
import { getInitials } from "./utils";

type QueueDashboardProps = {
  queueEntries: QueueEntryItem[];
  completedEntries: CompletedEntryItem[];
  estimatedWait: number;
  billingStats: BillingStatsSnapshot;
  employeeCount: number;
};

const statusBadge: Record<string, string> = {
  waiting: "bg-[#EDE9FE] text-[#6C3BFF]",
  assigned: "bg-[#DBEAFE] text-[#2563EB]",
  in_progress: "bg-[#FCE7F3] text-[#DB2777]",
};

export function QueueDashboard({
  queueEntries,
  completedEntries,
  estimatedWait,
  billingStats,
  employeeCount,
}: QueueDashboardProps) {
  const router = useRouter();

  const waiting = queueEntries.filter((e) => e.status === "waiting").length;
  const beingServed = queueEntries.filter(
    (e) => e.status === "in_progress" || e.status === "assigned"
  ).length;

  const todayCompleted = completedEntries.filter((e) => {
    if (!e.completedAt) return false;
    const d = new Date(e.completedAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).length;

  const stats = [
    {
      label: "Waiting",
      value: waiting,
      bg: "bg-[#EDE9FE]",
      text: "text-[#6C3BFF]",
      icon: Users,
    },
    {
      label: "Being Served",
      value: beingServed,
      bg: "bg-[#FCE7F3]",
      text: "text-[#FF2D6F]",
      icon: Clock,
    },
    {
      label: "Completed",
      value: todayCompleted,
      bg: "bg-[#FEF3C7]",
      text: "text-[#D97706]",
      icon: TrendingUp,
    },
    {
      label: "Cancelled",
      value: 0,
      bg: "bg-[#CCFBF1]",
      text: "text-[#0D9488]",
      icon: XCircle,
      stub: true,
    },
  ];

  const nextCustomer = queueEntries.find((e) => e.status === "waiting");
  const walkInsToday = waiting + beingServed + todayCompleted;
  const avgBill =
    completedEntries.length > 0
      ? completedEntries.reduce(
          (sum, e) =>
            sum +
            e.services.reduce((s, svc) => s + (svc.service.price ?? 0), 0),
          0
        ) / completedEntries.length
      : 0;
  const staffUtilization =
    employeeCount > 0
      ? Math.min(100, Math.round((beingServed / employeeCount) * 100))
      : 0;

  return (
    <div className="space-y-4 lg:sticky lg:top-4">
      <div className="rounded-[20px] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-[#1C103D]">Today&apos;s Queue</h2>
          <Link
            href="/queue"
            className="text-xs font-medium text-[#6C3BFF] hover:underline"
          >
            Manage
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={cn(
                "flex flex-col rounded-2xl p-3",
                stat.bg
              )}
            >
              <stat.icon className={cn("mb-1 h-4 w-4", stat.text)} />
              <span className={cn("text-2xl font-bold", stat.text)}>
                {stat.value}
              </span>
              <span className="text-[10px] font-medium text-[#6B7280]">
                {stat.label}
                {stat.stub && " *"}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between rounded-xl bg-[#F7F8FC] px-3 py-2">
          <span className="text-xs text-[#6B7280]">Avg wait time</span>
          <span className="text-sm font-semibold text-[#1C103D]">
            {estimatedWait} min
          </span>
        </div>
      </div>

      {nextCustomer && (
        <div className="rounded-[20px] bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-[#1C103D]">
            Next Customer
          </h3>
          <div className="flex items-center gap-3 rounded-2xl bg-[#F7F8FC] p-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6C3BFF] to-[#FF2D6F] text-xs font-bold text-white">
              {getInitials(nextCustomer.customer.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-[#1C103D]">
                {nextCustomer.customer.name}
              </p>
              <p className="truncate text-xs text-[#6B7280]">
                {nextCustomer.services.map((s) => s.service.name).join(", ")}
              </p>
              <p className="text-xs text-[#9CA3AF]">
                {format(new Date(nextCustomer.checkedInAt), "h:mm a")}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-[#EDE9FE] px-2.5 py-1 text-[10px] font-semibold text-[#6C3BFF]">
              In queue
            </span>
          </div>
        </div>
      )}

      <div className="rounded-[20px] bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#1C103D]">Live Queue</h3>
          <span className="text-xs text-[#6B7280]">
            {queueEntries.length} active
          </span>
        </div>

        {queueEntries.length === 0 ? (
          <div className="py-8 text-center">
            <Users className="mx-auto mb-2 h-8 w-8 text-[#D1D5DB]" />
            <p className="text-sm text-[#6B7280]">Queue is empty</p>
            <p className="mt-1 text-xs text-[#9CA3AF]">
              Check in a customer to get started
            </p>
          </div>
        ) : (
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {queueEntries.map((entry, index) => (
              <motion.button
                key={entry.id}
                type="button"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => router.push("/queue")}
                className="flex w-full items-center gap-3 rounded-xl bg-[#F7F8FC] p-2.5 text-left transition-all hover:bg-[#EDE9FE] hover:shadow-sm"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-bold text-[#6C3BFF] shadow-sm">
                  {entry.position}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#1C103D]">
                    {entry.customer.name}
                  </p>
                  <p className="truncate text-[10px] text-[#6B7280]">
                    {entry.services.map((s) => s.service.name).join(", ")}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
                    statusBadge[entry.status] ?? "bg-stone-100 text-stone-600"
                  )}
                >
                  {entry.status.replace("_", " ")}
                </span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]" />
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-[20px] bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-[#6C3BFF]" />
          <h3 className="text-sm font-semibold text-[#1C103D]">
            Today&apos;s Statistics
          </h3>
        </div>
        <div className="space-y-2.5">
          {[
            { label: "Walk-ins", value: String(walkInsToday), real: true },
            {
              label: "Revenue",
              value: formatCurrency(billingStats.revenueToday),
              real: true,
            },
            {
              label: "Avg Bill",
              value: avgBill > 0 ? formatCurrency(avgBill) : "—",
              real: completedEntries.length > 0,
            },
            {
              label: "Conversion",
              value: walkInsToday > 0 ? "78%" : "—",
              real: false,
            },
            {
              label: "Staff Utilization",
              value: `${staffUtilization}%`,
              real: employeeCount > 0,
            },
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between rounded-xl bg-[#F7F8FC] px-3 py-2"
            >
              <span className="text-xs text-[#6B7280]">
                {row.label}
                {!row.real && row.value !== "—" && " *"}
              </span>
              <span className="text-sm font-semibold text-[#1C103D]">
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[20px] bg-gradient-to-br from-[#EDE9FE] to-[#F7F8FC] p-4">
        <p className="text-xs leading-relaxed text-[#6B7280]">
          <strong className="text-[#6C3BFF]">Tip:</strong> Walk-ins are added
          to the live queue instantly. Assign a stylist from the queue page when
          ready.
        </p>
      </div>
    </div>
  );
}
