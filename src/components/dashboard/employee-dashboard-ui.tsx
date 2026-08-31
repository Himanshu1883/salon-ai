"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Clock,
  LayoutList,
  LineChart,
  LogIn,
  LogOut,
  Receipt,
  UserCheck,
} from "lucide-react";
import { checkInSelf, checkOutSelf } from "@/actions/attendance";
import {
  isCheckInBusinessFailure,
  requestAppointmentCheckIn,
} from "@/lib/appointments/check-in-from-schedule";
import { formatCurrency } from "@/lib/currency";
import { markDashboardStale } from "@/lib/dashboard/stale-refresh";
import { Button } from "@/components/ui/button";
import type { EmployeeDashboardPayload } from "@/lib/dashboard/employee-page-data";

function Empty({ message }: { message: string }) {
  return (
    <p className="rounded-xl border border-dashed border-[#E8ECF4] px-4 py-8 text-center text-sm text-[#9CA3AF]">
      {message}
    </p>
  );
}

function statusLabel(status: string) {
  if (status === "checked_in") return "In queue";
  if (status === "in_progress") return "In service";
  if (status === "no_show") return "No-show";
  return status.replace(/_/g, " ");
}

export function EmployeeDashboardUnlinked({
  employeeName,
}: {
  employeeName: string;
}) {
  return (
    <div className="rounded-[20px] border border-[#E8ECF4] bg-white p-8 text-center shadow-sm">
      <h1 className="text-2xl font-bold text-[#1C103D]">Hi {employeeName}</h1>
      <p className="mt-2 text-sm text-[#6B7280]">
        This login is not linked to a staff profile yet, so your schedule and
        earnings cannot load. Ask the salon owner to connect your account in Team
        Access.
      </p>
    </div>
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

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-[#6B7280]">{data.greeting},</p>
          <h1 className="text-2xl font-bold text-[#1C103D] sm:text-3xl">
            {data.employeeName}
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Today · {data.rangeLabel}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href="/sales/appointments">
              <CalendarDays className="h-4 w-4" />
              Bookings
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href="/queue">
              <LayoutList className="h-4 w-4" />
              Queue
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href="/team/analytics">
              <LineChart className="h-4 w-4" />
              My Performance
            </Link>
          </Button>
        </div>
      </div>

      {message ? (
        <p className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
          {message}
        </p>
      ) : null}

      <section
        aria-label="Today's summary"
        className="grid grid-cols-2 gap-3 md:grid-cols-4"
      >
        {[
          { label: "Today's Earnings", value: formatCurrency(data.today.earnings) },
          { label: "Appointments", value: String(data.today.appointments) },
          { label: "Working Hours", value: data.today.workedLabel },
          {
            label: "Completed Services",
            value: String(data.today.completedServices),
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-[20px] border border-[#E8ECF4] bg-white p-4 shadow-sm"
          >
            <p className="text-xs text-[#6B7280]">{card.label}</p>
            <p className="mt-1 text-xl font-semibold text-[#1C103D]">
              {card.value}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "This Week Earnings",
            value: formatCurrency(data.secondary.weekEarnings),
          },
          {
            label: "This Month Earnings",
            value: formatCurrency(data.secondary.monthEarnings),
          },
          {
            label: "This Week Appointments",
            value: String(data.secondary.weekAppointments),
          },
          {
            label: "This Month Appointments",
            value: String(data.secondary.monthAppointments),
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-[#E8ECF4] bg-white px-4 py-3"
          >
            <p className="text-xs text-[#6B7280]">{card.label}</p>
            <p className="mt-1 text-lg font-semibold text-[#1C103D]">
              {card.value}
            </p>
          </div>
        ))}
      </section>

      {data.queue.length > 0 ? (
        <section className="rounded-[20px] border border-violet-100 bg-violet-50/60 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-[#1C103D]">Now serving</h2>
            <Link
              href="/queue"
              className="text-xs font-medium text-[#6C3BFF] hover:underline"
            >
              Open queue
            </Link>
          </div>
          <ul className="mt-3 space-y-2">
            {data.queue.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-semibold text-[#1C103D]">{entry.service}</p>
                  <p className="text-xs text-[#6B7280]">
                    {statusLabel(entry.status)}
                  </p>
                </div>
                <Button asChild size="sm" variant="outline" className="rounded-full">
                  <Link href="/billing">
                    <Receipt className="h-4 w-4" />
                    Billing
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-[20px] border border-[#E8ECF4] bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-semibold text-[#1C103D]">
            Next appointment
          </h2>
          {data.nextAppointment ? (
            <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-2xl font-bold text-[#1C103D]">
                  {data.nextAppointment.time}
                </p>
                <p className="text-sm text-[#6B7280]">
                  {data.nextAppointment.service}
                </p>
                <p className="mt-1 text-xs text-[#9CA3AF]">
                  Est. {formatCurrency(data.nextAppointment.price)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  className="rounded-full bg-[#6C3BFF] hover:bg-[#5B2FE0]"
                  disabled={pending || busyId === data.nextAppointment.id}
                  onClick={() => runCheckIn(data.nextAppointment!.id, false)}
                >
                  <UserCheck className="h-4 w-4" />
                  Reached
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full"
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
        </section>

        <section className="rounded-[20px] border border-[#E8ECF4] bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-[#1C103D]">Attendance</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-[#6B7280]">Check-in</dt>
              <dd className="font-medium">{data.today.checkIn ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#6B7280]">Check-out</dt>
              <dd className="font-medium">{data.today.checkOut ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#6B7280]">Worked</dt>
              <dd className="font-medium">{data.today.workedLabel}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#6B7280]">Status</dt>
              <dd className="font-medium capitalize">
                {data.today.status === "none"
                  ? "Not checked in"
                  : data.today.status.replace(/_/g, " ")}
              </dd>
            </div>
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            {data.today.canCheckIn ? (
              <Button
                size="sm"
                className="rounded-full bg-[#6C3BFF] hover:bg-[#5B2FE0]"
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
                className="rounded-full"
                disabled={pending}
                onClick={() => runAttendance("out")}
              >
                <LogOut className="h-4 w-4" />
                Punch out
              </Button>
            ) : null}
            <Button asChild size="sm" variant="ghost" className="rounded-full">
              <Link href="/attendance">
                <Clock className="h-4 w-4" />
                Attendance
              </Link>
            </Button>
          </div>
        </section>
      </div>

      <section className="rounded-[20px] border border-[#E8ECF4] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-[#1C103D]">
            Today&apos;s schedule
          </h2>
          <Link
            href="/sales/appointments"
            className="text-xs font-medium text-[#6C3BFF] hover:underline"
          >
            Open bookings
          </Link>
        </div>
        {data.schedule.length === 0 ? (
          <div className="mt-3">
            <Empty message="No appointments yet" />
          </div>
        ) : (
          <ol className="mt-4 space-y-3">
            {data.schedule.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F3F4F6] pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-semibold text-[#1C103D]">
                    {item.time} — {item.service}
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    {statusLabel(item.status)} · Est. {formatCurrency(item.price)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.status === "scheduled" ? (
                    <>
                      <Button
                        size="sm"
                        className="rounded-full bg-[#6C3BFF] hover:bg-[#5B2FE0]"
                        disabled={pending || busyId === item.appointmentId}
                        onClick={() => runCheckIn(item.appointmentId, false)}
                      >
                        Reached
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        disabled={pending || busyId === item.appointmentId}
                        onClick={() => runCheckIn(item.appointmentId, true)}
                      >
                        Start now
                      </Button>
                    </>
                  ) : null}
                  {item.status === "checked_in" || item.status === "completed" ? (
                    <Button asChild size="sm" variant="outline" className="rounded-full">
                      <Link href="/billing">Billing</Link>
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-[20px] border border-[#E8ECF4] bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-[#1C103D]">
            Today&apos;s appointment status
          </h2>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-[#6B7280]">Upcoming</dt>
              <dd className="text-lg font-semibold">
                {data.appointmentStatus.upcoming}
              </dd>
            </div>
            <div>
              <dt className="text-[#6B7280]">In queue</dt>
              <dd className="text-lg font-semibold">
                {data.appointmentStatus.inQueue}
              </dd>
            </div>
            <div>
              <dt className="text-[#6B7280]">Completed</dt>
              <dd className="text-lg font-semibold">
                {data.appointmentStatus.completed}
              </dd>
            </div>
            <div>
              <dt className="text-[#6B7280]">Cancelled / no-show</dt>
              <dd className="text-lg font-semibold">
                {data.appointmentStatus.cancelled + data.appointmentStatus.noShow}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-[20px] border border-[#E8ECF4] bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-[#1C103D]">
            Today&apos;s services
          </h2>
          {data.topServices.length === 0 ? (
            <div className="mt-3">
              <Empty message="No appointments yet" />
            </div>
          ) : (
            <ul className="mt-3 space-y-2">
              {data.topServices.map((service) => (
                <li
                  key={service.serviceName}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{service.serviceName}</span>
                  <span className="font-medium">
                    {service.appointments} · Est. {formatCurrency(service.estimated)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <p className="text-center text-sm text-[#6B7280]">
        Charts, utilization, and history live in{" "}
        <Link
          href="/team/analytics"
          className="font-medium text-[#6C3BFF] hover:underline"
        >
          My Performance
        </Link>
        .
      </p>
    </div>
  );
}
