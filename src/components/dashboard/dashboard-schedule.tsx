import Link from "next/link";
import { addMinutes, format, isPast, isFuture } from "date-fns";
import { Calendar, Clock, UserCheck, CheckCircle2, UserPlus, Receipt, UserRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DashboardActivity } from "@/actions/dashboard";

type Appointment = {
  id: string;
  scheduledAt: Date;
  status: string;
  customer: { name: string };
  service: { name: string; duration: number };
  employee: { name: string } | null;
};

type DashboardScheduleProps = {
  appointments: Appointment[];
  recentActivity: DashboardActivity[];
};

const activityIcons = {
  check_in: UserCheck,
  completed: CheckCircle2,
  new_customer: UserPlus,
  sale: Receipt,
};

const activityColors = {
  check_in: "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
  new_customer: "bg-violet-100 text-violet-700",
  sale: "bg-rose-100 text-rose-700",
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

export function DashboardSchedule({
  appointments,
  recentActivity,
}: DashboardScheduleProps) {
  return (
    <div className="space-y-6">
      <Card className="rounded-xl border-zinc-100 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold text-zinc-900">
            Today&apos;s Schedule
          </CardTitle>
          <Link
            href="/sales/appointments"
            className="text-sm font-medium text-violet-600 hover:text-violet-700"
          >
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-10 text-center">
              <Calendar className="mb-3 h-8 w-8 text-zinc-300" />
              <p className="text-sm font-medium text-zinc-700">
                No appointments today
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Book your first appointment to fill the schedule
              </p>
              <Button
                asChild
                className="mt-4 rounded-xl bg-violet-600 hover:bg-violet-700"
                size="sm"
              >
                <Link href="/sales/appointments">New Appointment</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.map((apt) => {
                const start = new Date(apt.scheduledAt);
                const end = addMinutes(start, apt.service.duration);
                const time = format(start, "hh:mm a");
                const timeRange = `${format(start, "h:mm a")} – ${format(end, "h:mm a")}`;
                const statusInfo = getAppointmentStatus(start, apt.status);

                return (
                  <div
                    key={apt.id}
                    className="flex items-center gap-4 rounded-xl border border-zinc-100 p-4"
                  >
                    <div className="w-16 shrink-0 text-center">
                      <p className="text-sm font-semibold text-violet-600">
                        {time}
                      </p>
                    </div>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 text-sm font-bold text-white">
                      {apt.customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-zinc-900">
                        {apt.customer.name}
                      </p>
                      <p className="mt-0.5 text-sm text-zinc-500">
                        {apt.service.name}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500">
                        <UserRound className="h-3.5 w-3.5 shrink-0" />
                        {apt.employee?.name ?? "Unassigned stylist"}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-500">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        {timeRange} · {apt.service.duration} min
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <Badge variant={statusInfo.variant}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-xl border-zinc-100 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold text-zinc-900">
            Recent Activity
          </CardTitle>
          <Link
            href="/queue"
            className="text-sm font-medium text-violet-600 hover:text-violet-700"
          >
            View queue
          </Link>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-10 text-center">
              <p className="text-sm font-medium text-zinc-700">
                No activity yet today
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Check in a customer to get started
              </p>
              <Button
                asChild
                className="mt-4 rounded-xl"
                size="sm"
                variant="outline"
              >
                <Link href="/check-in">Check-in customer</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
              {recentActivity.map((item) => {
                const Icon = activityIcons[item.type];
                const colorClass = activityColors[item.type];
                const inner = (
                  <div className="flex items-start gap-3 py-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${colorClass}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-900">
                        {item.title}
                      </p>
                      {item.subtitle && (
                        <p className="mt-0.5 text-xs text-zinc-500">
                          {item.subtitle}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-zinc-400">
                        {format(new Date(item.timestamp), "h:mm a · MMM d")}
                      </p>
                    </div>
                  </div>
                );

                if (item.href) {
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="block rounded-xl transition-colors hover:bg-zinc-50/80"
                    >
                      {inner}
                    </Link>
                  );
                }

                return <div key={item.id}>{inner}</div>;
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
