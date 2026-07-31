"use client";

import Link from "next/link";
import { format, isPast, isFuture } from "date-fns";
import { Calendar } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Appointment = {
  id: string;
  scheduledAt: Date;
  status: string;
  customer: { name: string };
  service: { name: string };
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
      <div className="flex flex-row items-center justify-between p-6 pb-4">
        <h3 className="text-lg font-semibold text-dashboard-text">
          Today&apos;s Schedule
        </h3>
        <Link
          href="/sales/appointments"
          className="text-sm font-medium text-dashboard-primary hover:text-dashboard-primary-hover"
        >
          View all
        </Link>
      </div>

      <div className="px-6 pb-6">
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
          <div className="relative space-y-0">
            <div className="absolute bottom-4 left-[27px] top-4 w-px bg-gradient-to-b from-dashboard-primary/30 via-dashboard-secondary/20 to-transparent" />
            {appointments.map((apt) => {
              const time = format(new Date(apt.scheduledAt), "hh:mm a");
              const statusInfo = getAppointmentStatus(
                new Date(apt.scheduledAt),
                apt.status
              );

              return (
                <div
                  key={apt.id}
                  className="relative flex items-start gap-4 py-3 pl-0"
                >
                  <div className="relative z-10 flex w-14 shrink-0 flex-col items-center">
                    <div className="h-3 w-3 rounded-full border-2 border-white bg-dashboard-primary shadow-md shadow-violet-200" />
                    <p className="mt-2 text-center text-xs font-semibold text-dashboard-primary">
                      {time}
                    </p>
                  </div>
                  <div className="min-w-0 flex-1 rounded-2xl border border-dashboard-border bg-dashboard-bg/60 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white">
                          {apt.customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-dashboard-text">
                            {apt.customer.name}
                          </p>
                          <p className="mt-0.5 truncate text-sm text-dashboard-muted">
                            {apt.service.name}
                            {apt.employee ? ` · ${apt.employee.name}` : ""}
                          </p>
                        </div>
                      </div>
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardCard>
  );
}
