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
  Zap,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import {
  CheckInCard,
  CheckInCardContent,
  CheckInCardHeader,
} from "./check-in-card";
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
  waiting: "bg-violet-100 text-violet-700 ring-violet-200/60",
  assigned: "bg-blue-50 text-blue-700 ring-blue-200/60",
  in_progress: "bg-pink-50 text-pink-700 ring-pink-200/60",
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
      icon: Users,
      iconBg: "bg-violet-100",
      accent: "text-violet-700",
    },
    {
      label: "Being Served",
      value: beingServed,
      icon: Clock,
      iconBg: "bg-pink-100",
      accent: "text-pink-600",
    },
    {
      label: "Completed",
      value: todayCompleted,
      icon: TrendingUp,
      iconBg: "bg-amber-100",
      accent: "text-amber-600",
    },
    {
      label: "Cancelled",
      value: 0,
      icon: XCircle,
      iconBg: "bg-teal-100",
      accent: "text-teal-600",
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
      <CheckInCard>
        <CheckInCardHeader
          title="Today's Queue"
          description={`${queueEntries.length} active · ~${estimatedWait} min wait`}
          action={
            <Link
              href="/queue"
              className="inline-flex items-center gap-1 text-xs font-medium text-dashboard-primary transition-colors hover:text-dashboard-primary-hover"
            >
              Manage
              <ArrowRight className="h-3 w-3" />
            </Link>
          }
        />
        <CheckInCardContent className="pt-2">
          <div className="grid grid-cols-2 gap-2.5">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -1 }}
                className="flex flex-col rounded-xl border border-dashboard-border/40 bg-white/70 p-3 shadow-sm backdrop-blur-sm"
              >
                <div
                  className={cn(
                    "mb-2 flex h-8 w-8 items-center justify-center rounded-lg",
                    stat.iconBg,
                    stat.accent
                  )}
                >
                  <stat.icon className="h-4 w-4" />
                </div>
                <span className={cn("text-2xl font-bold tabular-nums", stat.accent)}>
                  {stat.value}
                </span>
                <span className="text-[10px] font-medium text-dashboard-muted">
                  {stat.label}
                  {stat.stub && " *"}
                </span>
              </motion.div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between rounded-xl bg-violet-50/60 px-3.5 py-2.5 ring-1 ring-violet-100/80">
            <span className="text-xs text-dashboard-muted">Avg wait time</span>
            <span className="text-sm font-semibold tabular-nums text-dashboard-text">
              {estimatedWait} min
            </span>
          </div>
        </CheckInCardContent>
      </CheckInCard>

      {nextCustomer && (
        <CheckInCard glow>
          <CheckInCardContent>
            <h3 className="mb-3 text-sm font-semibold text-dashboard-text">
              Next Customer
            </h3>
            <div className="flex items-center gap-3 rounded-xl border border-violet-200/40 bg-gradient-to-br from-violet-50/80 to-white/90 p-3.5 backdrop-blur-sm">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-dashboard-primary to-violet-500 text-xs font-bold text-white shadow-md shadow-violet-500/20">
                {getInitials(nextCustomer.customer.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-dashboard-text">
                  {nextCustomer.customer.name}
                </p>
                <p className="truncate text-xs text-dashboard-muted">
                  {nextCustomer.services.map((s) => s.service.name).join(", ")}
                </p>
                <p className="text-xs text-dashboard-muted/70">
                  {format(new Date(nextCustomer.checkedInAt), "h:mm a")}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-semibold text-violet-700 ring-1 ring-violet-200/60">
                In queue
              </span>
            </div>
          </CheckInCardContent>
        </CheckInCard>
      )}

      <CheckInCard>
        <CheckInCardHeader
          title="Live Queue"
          description={`${queueEntries.length} active`}
        />
        <CheckInCardContent className="pt-2">
          {queueEntries.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50">
                <Users className="h-6 w-6 text-dashboard-muted/40" />
              </div>
              <p className="text-sm font-medium text-dashboard-text">
                Queue is empty
              </p>
              <p className="mt-1 text-xs text-dashboard-muted">
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
                  transition={{ delay: index * 0.04 }}
                  onClick={() => router.push("/queue")}
                  className="group flex w-full items-center gap-3 rounded-xl border border-transparent bg-white/70 p-2.5 text-left transition-all hover:border-violet-200/60 hover:bg-violet-50/50 hover:shadow-sm"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-xs font-bold text-violet-700 transition-colors group-hover:bg-violet-200">
                    {entry.position}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-dashboard-text">
                      {entry.customer.name}
                    </p>
                    <p className="truncate text-[10px] text-dashboard-muted">
                      {entry.services.map((s) => s.service.name).join(", ")}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ring-1 ring-inset",
                      statusBadge[entry.status] ??
                        "bg-stone-100 text-stone-600 ring-stone-200/60"
                    )}
                  >
                    {entry.status.replace("_", " ")}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-dashboard-muted/50 transition-transform group-hover:translate-x-0.5 group-hover:text-dashboard-primary" />
                </motion.button>
              ))}
            </div>
          )}
        </CheckInCardContent>
      </CheckInCard>

      <CheckInCard>
        <CheckInCardHeader
          title="Today's Statistics"
          icon={BarChart3}
        />
        <CheckInCardContent className="pt-2">
          <div className="space-y-2">
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
            ].map((row, index) => (
              <motion.div
                key={row.label}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-center justify-between rounded-xl bg-white/70 px-3.5 py-2.5 ring-1 ring-dashboard-border/30 backdrop-blur-sm"
              >
                <span className="text-xs text-dashboard-muted">
                  {row.label}
                  {!row.real && row.value !== "—" && " *"}
                </span>
                <span className="text-sm font-semibold tabular-nums text-dashboard-text">
                  {row.value}
                </span>
              </motion.div>
            ))}
          </div>
        </CheckInCardContent>
      </CheckInCard>

      <div className="rounded-[20px] border border-violet-200/40 bg-gradient-to-br from-violet-100/60 to-white/80 p-4 backdrop-blur-sm">
        <p className="flex items-start gap-2 text-xs leading-relaxed text-dashboard-muted">
          <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-dashboard-primary" />
          <span>
            <strong className="text-dashboard-primary">Tip:</strong> Walk-ins are
            added to the live queue instantly. Assign a stylist from the queue
            page when ready.
          </span>
        </p>
      </div>
    </div>
  );
}
