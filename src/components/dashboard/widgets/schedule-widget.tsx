"use client";

import Link from "next/link";
import { addMinutes, isPast, isFuture } from "date-fns";
import { formatAppointmentDateTime } from "@/lib/appointments/datetime";
import { groupAppointmentsByVisit } from "@/lib/appointments/service-items";
import { Calendar } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Appointment = {
  id: string;
  scheduledAt: Date;
  status: string;
  notes: string | null;
  customer: { name: string };
  service: { name: string; duration: number };
  employee: { id: string; name: string } | null;
};

type ScheduleWidgetProps = {
  appointments: Appointment[];
  delay?: number;
};

/** 6 / 8 / 10 rows visible, then scroll. */
const LIST_VIEWPORT =
  "h-[17.75rem] overflow-y-auto overscroll-contain pr-1 sm:h-[23.75rem] lg:h-[29.75rem]";

function getAppointmentStatus(
  scheduledAt: Date,
  status: string,
  isNext: boolean
) {
  if (status === "completed")
    return { label: "Completed", variant: "success" as const };
  if (status === "no_show")
    return { label: "No show", variant: "destructive" as const };
  if (status === "checked_in")
    return { label: "In Queue", variant: "warning" as const };
  if (isNext) return { label: "Next", variant: "default" as const };
  if (isPast(scheduledAt))
    return { label: "Due", variant: "warning" as const };
  if (isFuture(scheduledAt))
    return { label: "Upcoming", variant: "secondary" as const };
  return { label: "Now", variant: "default" as const };
}

export function ScheduleWidget({ appointments, delay = 0 }: ScheduleWidgetProps) {
  const visits = groupAppointmentsByVisit(appointments);
  const nextOpenIndex = visits.findIndex(
    (apt) =>
      apt.status !== "completed" &&
      apt.status !== "no_show" &&
      apt.status !== "cancelled"
  );

  return (
    <DashboardCard delay={delay} hover={false} className="flex h-full flex-col">
      <div className="flex min-w-0 flex-row items-center justify-between gap-2 px-3 pt-3 pb-1.5">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-dashboard-text">
            Today&apos;s Appointments
          </h3>
          <p className="text-[11px] text-dashboard-muted">
            {visits.length === 1 ? "1 visit today" : `${visits.length} visits today`}
          </p>
        </div>
        <Link
          href="/sales/appointments"
          className="shrink-0 text-xs font-medium text-dashboard-primary hover:text-dashboard-primary-hover"
        >
          View all
        </Link>
      </div>

      <div className="flex flex-col px-3 pb-3">
        {visits.length === 0 ? (
          <div className={`${LIST_VIEWPORT} flex flex-col items-center justify-center rounded-xl border border-dashed border-dashboard-border text-center`}>
            <Calendar className="mb-1.5 h-6 w-6 text-dashboard-border" />
            <p className="text-xs font-medium text-dashboard-text">
              No appointments today
            </p>
            <Button
              asChild
              className="mt-2 h-7 rounded-lg bg-dashboard-primary px-2.5 text-[11px] hover:bg-dashboard-primary-hover"
              size="sm"
            >
              <Link href="/sales/appointments">New Appointment</Link>
            </Button>
          </div>
        ) : (
          <div className={`${LIST_VIEWPORT} space-y-1`}>
            {visits.map((apt, index) => {
              const start = new Date(apt.scheduledAt);
              const end = addMinutes(start, apt.service.duration);
              const time = formatAppointmentDateTime(start, "hh:mm a");
              const timeRange = `${formatAppointmentDateTime(start, "h:mm a")} – ${formatAppointmentDateTime(end, "h:mm a")}`;
              const isNext = index === nextOpenIndex;
              const statusInfo = getAppointmentStatus(
                start,
                apt.status,
                isNext
              );

              return (
                <Link
                  key={apt.id}
                  href="/sales/appointments"
                  className={`grid min-w-0 shrink-0 grid-cols-[3.25rem_1.5rem_minmax(0,1fr)_auto] items-center gap-1.5 rounded-xl px-1.5 py-2 sm:grid-cols-[4.75rem_1.75rem_minmax(0,1fr)_auto] sm:gap-2 sm:px-2 ${
                    isNext
                      ? "bg-violet-50/90 ring-1 ring-violet-200"
                      : "hover:bg-dashboard-bg/60"
                  }`}
                >
                  <p className="whitespace-nowrap text-[10px] font-semibold tabular-nums text-dashboard-primary sm:text-[11px]">
                    {time}
                  </p>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[9px] font-bold text-white sm:h-7 sm:w-7 sm:text-[10px]">
                    {apt.customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-dashboard-text">
                      {apt.customer.name}
                      <span className="font-normal text-dashboard-muted">
                        {" "}
                        — {apt.service.name}
                      </span>
                    </p>
                    <p className="truncate text-[11px] text-dashboard-muted">
                      {apt.employee?.name ?? "Unassigned stylist"} · {timeRange}
                    </p>
                  </div>
                  <Badge
                    variant={statusInfo.variant}
                    className="h-5 shrink-0 justify-self-end px-1.5 text-[10px]"
                  >
                    {statusInfo.label}
                  </Badge>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </DashboardCard>
  );
}
