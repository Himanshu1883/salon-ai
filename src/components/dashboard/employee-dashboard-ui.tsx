"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  IndianRupee,
  LayoutList,
  LineChart,
  LogIn,
  LogOut,
  Receipt,
  Sparkles,
  UserCheck,
} from "lucide-react";
import { checkInSelf, checkOutSelf } from "@/actions/attendance";
import {
  isCheckInBusinessFailure,
  requestAppointmentCheckIn,
} from "@/lib/appointments/check-in-from-schedule";
import { formatCurrency } from "@/lib/currency";
import { markDashboardStale } from "@/lib/dashboard/stale-refresh";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CompactKpiCard } from "@/components/dashboard/cards/compact-kpi-card";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { cn } from "@/lib/utils";
import type { EmployeeDashboardPayload } from "@/lib/dashboard/employee-page-data";

function Empty({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-dashboard-border px-4 py-8 text-center">
      <p className="text-sm text-dashboard-muted">{message}</p>
    </div>
  );
}

function statusLabel(status: string) {
  if (status === "checked_in") return "In queue";
  if (status === "in_progress") return "In service";
  if (status === "no_show") return "No-show";
  return status.replace(/_/g, " ");
}

function statusBadgeVariant(status: string) {
  if (status === "completed" || status === "in_progress") return "success" as const;
  if (status === "checked_in") return "warning" as const;
  if (status === "cancelled" || status === "no_show") return "destructive" as const;
  if (status === "scheduled") return "secondary" as const;
  return "outline" as const;
}

const shortcuts = [
  {
    href: "/sales/appointments",
    label: "Bookings",
    description: "Today's calendar",
    icon: CalendarDays,
    className:
      "bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-md shadow-violet-200/50 hover:from-violet-700 hover:to-purple-800",
    descriptionClassName: "text-white/80",
  },
  {
    href: "/queue",
    label: "Queue",
    description: "Live walk-ins",
    icon: LayoutList,
    className:
      "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-200/50 hover:from-indigo-600 hover:to-violet-700",
    descriptionClassName: "text-white/80",
  },
  {
    href: "/team/analytics",
    label: "My Performance",
    description: "Earnings & charts",
    icon: LineChart,
    className:
      "bg-white text-dashboard-text shadow-[0_4px_18px_rgba(15,23,42,0.05)] hover:bg-violet-50/80",
    descriptionClassName: "text-dashboard-muted",
  },
] as const;

export function EmployeeDashboardUnlinked({
  employeeName,
}: {
  employeeName: string;
}) {
  return (
    <DashboardCard hover={false} className="px-6 py-10 text-center sm:px-10">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-500 text-white shadow-md">
        <Sparkles className="h-5 w-5" />
      </div>
      <h1 className="mt-4 text-2xl font-bold text-dashboard-text">
        Hi {employeeName}
      </h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-dashboard-muted">
        This login is not linked to a staff profile yet, so your schedule and
        earnings cannot load. Ask the salon owner to connect your account in Team
        Access.
      </p>
    </DashboardCard>
  );
}

export function EmployeeDashboardUi({
  data,
}: {
  data: EmployeeDashboardPayload;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  function refreshBoard() {
    markDashboardStale();
    router.refresh();
  }

  function runAttendance(kind: "in" | "out") {
    setMessage("");
    startTransition(async () => {
      const result = kind === "in" ? await checkInSelf() : await checkOutSelf();
      if ("error" in result && result.error) {
        setMessage(result.error);
        return;
      }
      refreshBoard();
    });
  }

  function runCheckIn(appointmentId: string, startNow: boolean) {
    setMessage("");
    setBusyId(appointmentId);
    startTransition(async () => {
      const result = await requestAppointmentCheckIn(appointmentId, {
        startNow,
      });
      setBusyId(null);
      if (isCheckInBusinessFailure(result.error)) {
        setMessage(result.error ?? "Could not check in");
        return;
      }
      refreshBoard();
    });
  }

  const attendanceStatus =
    data.today.status === "none"
      ? "Not checked in"
      : data.today.status.replace(/_/g, " ");
  const onShift = data.today.status !== "none" && !data.today.canCheckIn;

  return (
    <div className="space-y-4 xl:space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-dashboard-muted">
            {data.greeting}
          </p>
          <h1 className="mt-0.5 truncate text-2xl font-bold tracking-tight text-dashboard-text sm:text-3xl">
            {data.employeeName}
          </h1>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-dashboard-muted">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
            Today · {data.rangeLabel}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 lg:w-[min(100%,32rem)]">
          {shortcuts.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-2xl px-2 py-2.5 text-center transition-all hover:scale-[1.01] hover:shadow-md sm:flex-row sm:items-center sm:gap-3 sm:px-3.5 sm:py-3 sm:text-left",
                action.className
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl sm:h-9 sm:w-9",
                  action.href === "/team/analytics"
                    ? "bg-violet-100 text-dashboard-primary"
                    : "bg-white/15 text-white"
                )}
              >
                <action.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold leading-tight sm:text-sm">
                  {action.label}
                </p>
                <p
                  className={cn(
                    "hidden text-[11px] sm:block",
                    action.descriptionClassName
                  )}
                >
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {message ? (
        <p className="rounded-2xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
          {message}
        </p>
      ) : null}

      <section aria-label="Today's summary" className="space-y-2 md:space-y-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-5 md:gap-3">
          <Link href="/team/analytics" className="col-span-2 block min-w-0">
            <DashboardCard className="h-full overflow-hidden border-0 bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-md shadow-violet-200/60">
              <div className="relative flex items-center gap-3 px-4 py-3.5 xl:px-5 xl:py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <IndianRupee className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-white/80">
                    Today&apos;s Earnings
                  </p>
                  <p className="mt-0.5 truncate text-2xl font-bold tracking-tight">
                    {formatCurrency(data.today.earnings)}
                  </p>
                </div>
              </div>
            </DashboardCard>
          </Link>
          <CompactKpiCard
            delay={0.03}
            label="Appointments"
            value={String(data.today.appointments)}
            href="/sales/appointments"
            icon={<CalendarDays className="h-4 w-4 text-white" />}
            iconGradient="from-rose-500 to-pink-500 text-white"
          />
          <CompactKpiCard
            delay={0.06}
            label="Working Hours"
            value={data.today.workedLabel}
            href="/attendance"
            icon={<Clock className="h-4 w-4 text-white" />}
            iconGradient="from-fuchsia-500 to-purple-600 text-white"
          />
          <CompactKpiCard
            delay={0.09}
            label="Completed Services"
            value={String(data.today.completedServices)}
            href="/team/analytics"
            icon={<CheckCircle2 className="h-4 w-4 text-white" />}
            iconGradient="from-emerald-500 to-teal-500 text-white"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:gap-3">
          <CompactKpiCard
            delay={0.12}
            label="This Week Earnings"
            value={formatCurrency(data.secondary.weekEarnings)}
            href="/team/analytics"
            icon={<IndianRupee className="h-4 w-4 text-white" />}
            iconGradient="from-violet-600 to-purple-500 text-white"
          />
          <CompactKpiCard
            delay={0.15}
            label="This Month Earnings"
            value={formatCurrency(data.secondary.monthEarnings)}
            href="/team/analytics"
            icon={<IndianRupee className="h-4 w-4 text-white" />}
            iconGradient="from-purple-600 to-violet-700 text-white"
          />
          <CompactKpiCard
            delay={0.18}
            label="This Week Appointments"
            value={String(data.secondary.weekAppointments)}
            href="/sales/appointments"
            icon={<CalendarDays className="h-4 w-4 text-white" />}
            iconGradient="from-indigo-500 to-violet-500 text-white"
          />
          <CompactKpiCard
            delay={0.21}
            label="This Month Appointments"
            value={String(data.secondary.monthAppointments)}
            href="/sales/appointments"
            icon={<CalendarDays className="h-4 w-4 text-white" />}
            iconGradient="from-violet-500 to-indigo-500 text-white"
          />
        </div>
      </section>

      {data.queue.length > 0 ? (
        <DashboardCard
          hover={false}
          delay={0.08}
          className="border border-violet-100 bg-violet-50/70"
        >
          <div className="flex items-center justify-between gap-2 px-4 pt-4 xl:px-6 xl:pt-5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <h2 className="text-base font-semibold text-dashboard-text">
                Now serving
              </h2>
            </div>
            <Link
              href="/queue"
              className="text-sm font-medium text-dashboard-primary hover:text-dashboard-primary-hover"
            >
              Open queue
            </Link>
          </div>
          <ul className="space-y-2 px-4 py-4 xl:px-6 xl:pb-5">
            {data.queue.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white px-3.5 py-2.5 shadow-[0_4px_18px_rgba(15,23,42,0.05)]"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-dashboard-text">
                    {entry.service}
                  </p>
                  <Badge
                    variant={statusBadgeVariant(entry.status)}
                    className="mt-1 capitalize"
                  >
                    {statusLabel(entry.status)}
                  </Badge>
                </div>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="rounded-2xl"
                >
                  <Link href="/billing">
                    <Receipt className="h-4 w-4" />
                    Billing
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        </DashboardCard>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <DashboardCard hover={false} delay={0.1} className="lg:col-span-2">
          <div className="p-4 pb-3 xl:p-6 xl:pb-4">
            <h2 className="text-base font-semibold text-dashboard-text xl:text-lg">
              Next appointment
            </h2>
          </div>
          <div className="px-4 pb-4 xl:px-6 xl:pb-6">
            {data.nextAppointment ? (
              <div className="flex flex-col gap-4 rounded-2xl bg-violet-50/90 p-4 ring-1 ring-violet-200 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-purple-500 text-white shadow-sm">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-bold leading-tight text-dashboard-text sm:text-2xl">
                      {data.nextAppointment.time}
                    </p>
                    <p className="truncate text-sm text-dashboard-muted">
                      {data.nextAppointment.service}
                    </p>
                    <p className="mt-0.5 text-xs text-dashboard-muted">
                      Est. {formatCurrency(data.nextAppointment.price)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className="rounded-2xl bg-dashboard-primary text-white hover:bg-dashboard-primary-hover"
                    disabled={pending || busyId === data.nextAppointment.id}
                    onClick={() => runCheckIn(data.nextAppointment!.id, false)}
                  >
                    <UserCheck className="h-4 w-4" />
                    Reached
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-2xl"
                    disabled={pending || busyId === data.nextAppointment.id}
                    onClick={() => runCheckIn(data.nextAppointment!.id, true)}
                  >
                    Start now
                  </Button>
                </div>
              </div>
            ) : (
              <Empty message="No upcoming bookings left today" />
            )}
          </div>
        </DashboardCard>

        <DashboardCard hover={false} delay={0.12}>
          <div className="flex items-center justify-between p-4 pb-3 xl:p-6 xl:pb-4">
            <h2 className="text-base font-semibold text-dashboard-text xl:text-lg">
              Attendance
            </h2>
            <Badge variant={onShift ? "success" : "secondary"} className="capitalize">
              {attendanceStatus}
            </Badge>
          </div>
          <div className="px-4 pb-4 xl:px-6 xl:pb-6">
            <dl className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-2xl bg-dashboard-bg/60 px-2 py-2.5">
                <dt className="text-[11px] text-dashboard-muted">Check-in</dt>
                <dd className="mt-0.5 text-sm font-semibold text-dashboard-text">
                  {data.today.checkIn ?? "—"}
                </dd>
              </div>
              <div className="rounded-2xl bg-dashboard-bg/60 px-2 py-2.5">
                <dt className="text-[11px] text-dashboard-muted">Check-out</dt>
                <dd className="mt-0.5 text-sm font-semibold text-dashboard-text">
                  {data.today.checkOut ?? "—"}
                </dd>
              </div>
              <div className="rounded-2xl bg-dashboard-bg/60 px-2 py-2.5">
                <dt className="text-[11px] text-dashboard-muted">Worked</dt>
                <dd className="mt-0.5 text-sm font-semibold text-dashboard-text">
                  {data.today.workedLabel}
                </dd>
              </div>
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              {data.today.canCheckIn ? (
                <Button
                  size="sm"
                  className="rounded-2xl bg-dashboard-primary text-white hover:bg-dashboard-primary-hover"
                  disabled={pending}
                  onClick={() => runAttendance("in")}
                >
                  <LogIn className="h-4 w-4" />
                  Punch in
                </Button>
              ) : null}
              {data.today.canCheckOut ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-2xl"
                  disabled={pending}
                  onClick={() => runAttendance("out")}
                >
                  <LogOut className="h-4 w-4" />
                  Punch out
                </Button>
              ) : null}
              <Button asChild size="sm" variant="ghost" className="rounded-2xl">
                <Link href="/attendance">
                  <Clock className="h-4 w-4" />
                  Attendance
                </Link>
              </Button>
            </div>
          </div>
        </DashboardCard>
      </div>

      <DashboardCard hover={false} delay={0.14}>
        <div className="flex items-center justify-between gap-2 p-4 pb-3 xl:p-6 xl:pb-4">
          <h2 className="text-base font-semibold text-dashboard-text xl:text-lg">
            Today&apos;s schedule
          </h2>
          <Link
            href="/sales/appointments"
            className="text-sm font-medium text-dashboard-primary hover:text-dashboard-primary-hover"
          >
            Open bookings
          </Link>
        </div>
        <div className="px-4 pb-4 xl:px-6 xl:pb-6">
          {data.schedule.length === 0 ? (
            <Empty message="No appointments yet" />
          ) : (
            <ol className="divide-y divide-dashboard-border/60">
              {data.schedule.map((item) => {
                const isNext = data.nextAppointment?.id === item.id;
                return (
                  <li
                    key={item.id}
                    className={cn(
                      "flex flex-wrap items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0",
                      isNext &&
                        "rounded-2xl bg-violet-50/90 px-3 ring-1 ring-violet-200 first:pt-3.5 last:pb-3.5"
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="w-[72px] shrink-0">
                        <p className="text-xs font-semibold text-dashboard-primary xl:text-sm">
                          {item.time}
                        </p>
                      </div>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white">
                        {item.service.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-dashboard-text">
                          {item.service}
                        </p>
                        <p className="mt-0.5 text-xs text-dashboard-muted">
                          Est. {formatCurrency(item.price)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={statusBadgeVariant(item.status)}
                        className="capitalize"
                      >
                        {statusLabel(item.status)}
                      </Badge>
                      {item.status === "scheduled" ? (
                        <>
                          <Button
                            size="sm"
                            className="rounded-2xl bg-dashboard-primary text-white hover:bg-dashboard-primary-hover"
                            disabled={pending || busyId === item.appointmentId}
                            onClick={() => runCheckIn(item.appointmentId, false)}
                          >
                            Reached
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-2xl"
                            disabled={pending || busyId === item.appointmentId}
                            onClick={() => runCheckIn(item.appointmentId, true)}
                          >
                            Start now
                          </Button>
                        </>
                      ) : null}
                      {item.status === "checked_in" ||
                      item.status === "completed" ? (
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="rounded-2xl"
                        >
                          <Link href="/billing">Billing</Link>
                        </Button>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </DashboardCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardCard hover={false} delay={0.16}>
          <div className="p-4 pb-3 xl:p-6 xl:pb-4">
            <h2 className="text-base font-semibold text-dashboard-text xl:text-lg">
              Today&apos;s appointment status
            </h2>
          </div>
          <dl className="grid grid-cols-2 gap-2 px-4 pb-4 xl:px-6 xl:pb-6">
            {[
              {
                label: "Upcoming",
                value: data.appointmentStatus.upcoming,
                tone: "from-violet-500 to-indigo-500",
              },
              {
                label: "In queue",
                value: data.appointmentStatus.inQueue,
                tone: "from-amber-500 to-orange-500",
              },
              {
                label: "Completed",
                value: data.appointmentStatus.completed,
                tone: "from-emerald-500 to-teal-500",
              },
              {
                label: "Cancelled / no-show",
                value:
                  data.appointmentStatus.cancelled +
                  data.appointmentStatus.noShow,
                tone: "from-rose-500 to-pink-500",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-2xl border border-dashboard-border/60 bg-dashboard-bg/40 px-3 py-3"
              >
                <span
                  className={cn(
                    "h-8 w-1.5 shrink-0 rounded-full bg-gradient-to-b",
                    item.tone
                  )}
                />
                <div>
                  <dt className="text-xs text-dashboard-muted">{item.label}</dt>
                  <dd className="text-lg font-semibold text-dashboard-text">
                    {item.value}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </DashboardCard>

        <DashboardCard hover={false} delay={0.18}>
          <div className="p-4 pb-3 xl:p-6 xl:pb-4">
            <h2 className="text-base font-semibold text-dashboard-text xl:text-lg">
              Today&apos;s services
            </h2>
          </div>
          <div className="px-4 pb-4 xl:px-6 xl:pb-6">
            {data.topServices.length === 0 ? (
              <Empty message="No appointments yet" />
            ) : (
              <ul className="space-y-2">
                {data.topServices.map((service) => (
                  <li
                    key={service.serviceName}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-dashboard-border/60 bg-dashboard-bg/40 px-3 py-2.5"
                  >
                    <span className="min-w-0 truncate text-sm font-medium text-dashboard-text">
                      {service.serviceName}
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-dashboard-primary">
                      {service.appointments} · Est.{" "}
                      {formatCurrency(service.estimated)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DashboardCard>
      </div>

      <p className="text-center text-sm text-dashboard-muted">
        Charts, utilization, and history live in{" "}
        <Link
          href="/team/analytics"
          className="font-medium text-dashboard-primary hover:text-dashboard-primary-hover"
        >
          My Performance
        </Link>
        .
      </p>
    </div>
  );
}
