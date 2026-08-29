"use client";

import Link from "next/link";
import { addMinutes, isPast, isFuture } from "date-fns";
import { formatAppointmentDateTime } from "@/lib/appointments/datetime";
import { Calendar } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Appointment = {
  id: string;
  scheduledAt: Date;
  status: string;
  customer: { name: string };
  service: { name: string; duration: number };
  employee: { name: string } | null;
};

type ScheduleWidgetProps = {
  appointments: Appointment[];
  delay?: number;
};

function getAppointmentStatus(scheduledAt: Date, status: string) {
  if (status === "completed")
    return { label: "Completed", variant: "success" as const };
  if (status === "no_show")
    return { label: "No show", variant: "destructive" as const };
  if (isPast(scheduledAt))
    return { label: "In Progress", variant: "warning" as const };
  if (isFuture(scheduledAt))
    return { label: "Upcoming", variant: "secondary" as const };
  return { label: "Now", variant: "default" as const };
}

export function ScheduleWidget({ appointments, delay = 0 }: ScheduleWidgetProps) {
  return (
    <DashboardCard delay={delay} className="h-full">
      <div className="flex flex-row items-center justify-between p-4 pb-3 xl:p-6 xl:pb-4">
        <h3 className="text-base font-semibold text-dashboard-text xl:text-lg">
          Today&apos;s Schedule
        </h3>
        <Link
          href="/sales/appointments"
          className="text-sm font-medium text-dashboard-primary hover:text-dashboard-primary-hover"
        >
          View all
        </Link>
      </div>

      <div className="px-4 pb-4 xl:px-6 xl:pb-6">
        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-dashboard-border py-10 text-center">
            <Calendar className="mb-3 h-8 w-8 text-dashboard-border" />
            <p className="text-sm font-medium text-dashboard-text">
              No appointments today
            </p>
            <p className="mt-1 text-xs text-dashboard-muted">
              Book your first appointment to fill the schedule
            </p>
            <Button
              asChild
              className="mt-4 rounded-2xl bg-dashboard-primary hover:bg-dashboard-primary-hover"
              size="sm"
            >
              <Link href="/sales/appointments">New Appointment</Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-dashboard-border/60">
            {appointments.map((apt) => {
              const start = new Date(apt.scheduledAt);
              const end = addMinutes(start, apt.service.duration);
              const time = formatAppointmentDateTime(start, "hh:mm a");
              const timeRange = `${formatAppointmentDateTime(start, "h:mm a")} – ${formatAppointmentDateTime(end, "h:mm a")}`;
              const statusInfo = getAppointmentStatus(start, apt.status);

              return (
                <div
                  key={apt.id}
                  className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0 xl:gap-4"
                >
                  <div className="w-[72px] shrink-0">
                    <p className="text-xs font-semibold text-dashboard-primary xl:text-sm">
                      {time}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white">
                    {apt.customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-dashboard-text">
                      {apt.customer.name}
                      <span className="font-normal text-dashboard-muted">
                        {" "}
                        — {apt.service.name}
                      </span>
                    </p>
                    <p className="mt-0.5 truncate text-xs text-dashboard-muted">
                      {apt.employee?.name ?? "Unassigned stylist"} · {timeRange}
                    </p>
                  </div>
                  <Badge variant={statusInfo.variant} className="shrink-0">
                    {statusInfo.label}
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
