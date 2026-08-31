"use client";

import Link from "next/link";
import { format } from "date-fns";
import { UserCheck, CheckCircle2, UserPlus, Receipt } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Button } from "@/components/ui/button";
import type { DashboardActivity } from "@/actions/dashboard";
import { usePlan } from "@/components/plans/plan-provider";

const activityIcons = {
  check_in: UserCheck,
  completed: CheckCircle2,
  new_customer: UserPlus,
  sale: Receipt,
};

const activityColors = {
  check_in: "from-amber-400 to-orange-500",
  completed: "from-emerald-400 to-green-500",
  new_customer: "from-violet-400 to-purple-500",
  sale: "from-rose-400 to-pink-500",
};

type ActivityWidgetProps = {
  recentActivity: DashboardActivity[];
  delay?: number;
};

export function ActivityWidget({ recentActivity, delay = 0 }: ActivityWidgetProps) {
  const { isEnterprise } = usePlan();

  return (
    <DashboardCard delay={delay} className="flex h-full flex-col">
      <div className="flex min-w-0 flex-row items-center justify-between gap-2 px-3 pt-3 pb-1.5">
        <h3 className="min-w-0 truncate text-sm font-semibold text-dashboard-text">
          Recent Activity
        </h3>
        {isEnterprise && (
          <Link
            href="/queue"
            className="shrink-0 text-xs font-medium text-dashboard-primary hover:text-dashboard-primary-hover"
          >
            View queue
          </Link>
        )}
      </div>

      <div className="h-[15.5rem] overflow-y-auto overscroll-contain px-3 pb-3">
        {recentActivity.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-dashboard-border text-center">
            <p className="text-xs font-medium text-dashboard-text">
              No activity yet today
            </p>
            <p className="mt-1 text-[11px] text-dashboard-muted">
              {isEnterprise
                ? "Check in a customer to get started"
                : "Book an appointment to get started"}
            </p>
            {isEnterprise ? (
              <Button asChild className="mt-2 h-7 rounded-lg px-2.5 text-[11px]" size="sm" variant="outline">
                <Link href="/check-in">Check-in customer</Link>
              </Button>
            ) : (
              <Button asChild className="mt-2 h-7 rounded-lg px-2.5 text-[11px]" size="sm" variant="outline">
                <Link href="/sales/appointments">New appointment</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-0.5 pr-1">
            {recentActivity.map((item) => {
              const Icon = activityIcons[item.type];
              const gradient = activityColors[item.type];
              const inner = (
                <div className="flex min-w-0 items-start gap-2 rounded-xl px-1.5 py-1.5 transition-colors hover:bg-dashboard-bg/80">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} text-white shadow-sm`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-dashboard-text">
                      {item.title}
                    </p>
                    {item.subtitle && (
                      <p className="truncate text-[11px] text-dashboard-muted">
                        {item.subtitle}
                      </p>
                    )}
                    <p className="mt-0.5 text-[10px] text-dashboard-muted/80">
                      {format(new Date(item.timestamp), "h:mm a · MMM d")}
                    </p>
                  </div>
                </div>
              );

              if (item.href) {
                return (
                  <Link key={item.id} href={item.href} className="block">
                    {inner}
                  </Link>
                );
              }

              return <div key={item.id}>{inner}</div>;
            })}
          </div>
        )}
      </div>
    </DashboardCard>
  );
}
