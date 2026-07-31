"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { usePlan } from "@/components/plans/plan-provider";

type QueueAlertWidgetProps = {
  waitingCount: number;
  estimatedWait?: number;
  delay?: number;
};

export function QueueAlertWidget({
  waitingCount,
  estimatedWait,
  delay = 0,
}: QueueAlertWidgetProps) {
  const { isEnterprise } = usePlan();

  if (!isEnterprise || waitingCount <= 0) return null;

  return (
    <DashboardCard delay={delay} hover={false} className="border-orange-200 bg-orange-50/80">
      <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
            <Clock className="h-5 w-5" />
          </div>
          <p className="text-sm text-orange-950">
            <span className="font-semibold">{waitingCount} waiting</span>
            {estimatedWait !== undefined && (
              <>
                {" · "}
                Est. wait for walk-ins:{" "}
                <span className="font-semibold">{estimatedWait} min</span>
              </>
            )}
          </p>
        </div>
        <Button
          asChild
          size="sm"
          className="shrink-0 rounded-2xl bg-orange-500 text-white hover:bg-orange-600"
        >
          <Link href="/queue">View Queue</Link>
        </Button>
      </div>
    </DashboardCard>
  );
}
