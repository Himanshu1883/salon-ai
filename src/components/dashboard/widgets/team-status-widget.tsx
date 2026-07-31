"use client";

import Link from "next/link";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Badge } from "@/components/ui/badge";
import type { TeamMemberStatus } from "@/actions/dashboard";

const statusConfig = {
  on_shift: { label: "On Shift", variant: "success" as const },
  busy: { label: "With client", variant: "warning" as const },
  available: { label: "Available", variant: "secondary" as const },
};

type TeamStatusWidgetProps = {
  team: TeamMemberStatus[];
  delay?: number;
};

export function TeamStatusWidget({ team, delay = 0 }: TeamStatusWidgetProps) {
  return (
    <DashboardCard delay={delay} className="h-full">
      <div className="flex flex-row items-center justify-between p-6 pb-4">
        <h3 className="text-lg font-semibold text-dashboard-text">Team Status</h3>
        <Link
          href="/team/shifts"
          className="text-sm font-medium text-dashboard-primary hover:text-dashboard-primary-hover"
        >
          Shifts
        </Link>
      </div>

      <div className="px-6 pb-6">
        {team.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-dashboard-border py-8 text-center">
            <p className="text-sm font-medium text-dashboard-text">No team scheduled</p>
            <p className="mt-1 text-xs text-dashboard-muted">
              Add team members and set shifts
            </p>
            <Link
              href="/team/members"
              className="mt-3 inline-block text-sm font-medium text-dashboard-primary hover:text-dashboard-primary-hover"
            >
              Manage team →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {team.map((member) => {
              const config = statusConfig[member.status];
              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-dashboard-border bg-dashboard-bg/40 px-3 py-2.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-semibold text-white">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-dashboard-text">
                        {member.name}
                      </p>
                      <p className="truncate text-xs capitalize text-dashboard-muted">
                        {member.role}
                        {member.startTime && member.endTime
                          ? ` · ${member.startTime}–${member.endTime}`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <Badge variant={config.variant}>{config.label}</Badge>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardCard>
  );
}
