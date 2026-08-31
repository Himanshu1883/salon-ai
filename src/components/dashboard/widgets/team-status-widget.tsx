"use client";

import Link from "next/link";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Badge } from "@/components/ui/badge";
import type { TeamMemberStatus } from "@/actions/dashboard";

const statusConfig = {
  on_shift: { label: "On Shift", variant: "success" as const },
  busy: { label: "With client", variant: "warning" as const },
  available: { label: "Available", variant: "success" as const },
};

type TeamStatusWidgetProps = {
  team: TeamMemberStatus[];
  delay?: number;
};

export function TeamStatusWidget({ team, delay = 0 }: TeamStatusWidgetProps) {
  return (
    <DashboardCard delay={delay} className="flex h-full flex-col">
      <div className="flex min-w-0 flex-row items-center justify-between gap-2 px-3 pt-3 pb-1.5">
        <h3 className="min-w-0 truncate text-sm font-semibold text-dashboard-text">Team Status</h3>
        <Link
          href="/team/shifts"
          className="shrink-0 text-xs font-medium text-dashboard-primary hover:text-dashboard-primary-hover"
        >
          Shifts
        </Link>
      </div>

      <div className="h-[15.5rem] overflow-y-auto overscroll-contain px-3 pb-3">
        {team.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-dashboard-border text-center">
            <p className="text-xs font-medium text-dashboard-text">No team scheduled</p>
            <p className="mt-1 text-[11px] text-dashboard-muted">
              Add team members and set shifts
            </p>
            <Link
              href="/team/members"
              className="mt-2 inline-block text-xs font-medium text-dashboard-primary hover:text-dashboard-primary-hover"
            >
              Manage team →
            </Link>
          </div>
        ) : (
          <div className="space-y-1">
            {team.map((member) => {
              const config = statusConfig[member.status];
              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-dashboard-border bg-dashboard-bg/40 px-2 py-1.5"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[11px] font-semibold text-white">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-dashboard-text">
                        {member.name}
                      </p>
                      <p className="truncate text-[11px] capitalize text-dashboard-muted">
                        {member.role}
                        {member.startTime && member.endTime
                          ? ` · ${member.startTime}–${member.endTime}`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <Badge variant={config.variant} className="h-5 shrink-0 px-1.5 text-[10px]">
                    {config.label}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardCard>
  );
}
