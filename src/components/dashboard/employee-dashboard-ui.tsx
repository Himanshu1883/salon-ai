"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/currency";
import type { getEmployeeDashboard } from "@/actions/employee-dashboard";

type DashboardData = Awaited<ReturnType<typeof getEmployeeDashboard>>;

const PERIODS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "this_week", label: "This Week" },
  { value: "last_week", label: "Last Week" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "custom", label: "Custom" },
] as const;

function Empty({ message }: { message: string }) {
  return (
    <p className="rounded-xl border border-dashed border-[#E8ECF4] px-4 py-8 text-center text-sm text-[#9CA3AF]">
      {message}
    </p>
  );
}

export function EmployeeDashboardUi({
  data,
}: {
  data: DashboardData;
}) {
  const router = useRouter();
  const hour = new Date().getHours();
  const hello =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  function setPeriod(period: string) {
    const params = new URLSearchParams();
    if (period !== "today") params.set("period", period);
    router.push(params.size ? `/dashboard?${params}` : "/dashboard");
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-[#6B7280]">{hello},</p>
          <h1 className="text-2xl font-bold text-[#1C103D] sm:text-3xl">
            {data.employeeName}
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Your performance · {data.rangeLabel}
          </p>
        </div>
        <div
          className="flex gap-1 overflow-x-auto pb-1"
          role="tablist"
          aria-label="Date range"
        >
          {PERIODS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={data.period === option.value}
              onClick={() => setPeriod(option.value)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
                data.period === option.value
                  ? "bg-[#6C3BFF] text-white"
                  : "bg-white text-[#6B7280] ring-1 ring-[#E8ECF4]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

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

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-[20px] border border-[#E8ECF4] bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-semibold text-[#1C103D]">
            Next appointment
          </h2>
          {data.nextAppointment ? (
            <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <p className="text-2xl font-bold text-[#1C103D]">
                  {data.nextAppointment.time}
                </p>
                <p className="text-sm text-[#6B7280]">
                  {data.nextAppointment.customer} · {data.nextAppointment.service}
                </p>
              </div>
              <p className="text-lg font-semibold text-[#6C3BFF]">
                {formatCurrency(data.nextAppointment.price)}
              </p>
            </div>
          ) : (
            <Empty message="No appointments yet" />
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
              <dd className="font-medium capitalize">{data.today.status}</dd>
            </div>
          </dl>
          {!data.today.checkIn && (
            <p className="mt-3 text-xs text-[#9CA3AF]">
              No attendance records yet
            </p>
          )}
        </section>
      </div>

      <section className="rounded-[20px] border border-[#E8ECF4] bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-[#1C103D]">Today&apos;s schedule</h2>
        {data.schedule.length === 0 ? (
          <div className="mt-3">
            <Empty message="No appointments yet" />
          </div>
        ) : (
          <ol className="mt-4 space-y-3">
            {data.schedule.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F3F4F6] pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-semibold text-[#1C103D]">
                    {item.time} — {item.service}
                  </p>
                  <p className="text-xs text-[#6B7280]">
                    {item.customer} · {item.status.replace("_", " ")}
                  </p>
                </div>
                <p className="text-sm font-medium">
                  {formatCurrency(item.price)}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-[20px] border border-[#E8ECF4] bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-[#1C103D]">Revenue trend</h2>
          {data.charts.revenueTrend.length === 0 ||
          data.charts.revenueTrend.every((row) => row.revenue === 0) ? (
            <div className="mt-3">
              <Empty message="No sales recorded yet" />
            </div>
          ) : (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
              {data.charts.revenueTrend.map((row) => (
                <div key={row.label} className="min-w-[4.5rem] text-center">
                  <p className="text-xs text-[#6B7280]">{row.label}</p>
                  <p className="mt-1 text-sm font-semibold">
                    {formatCurrency(row.revenue)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[20px] border border-[#E8ECF4] bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-[#1C103D]">
            Appointment status
          </h2>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-[#6B7280]">Completed</dt>
              <dd className="text-lg font-semibold">
                {data.overview.appointments.completed}
              </dd>
            </div>
            <div>
              <dt className="text-[#6B7280]">Upcoming</dt>
              <dd className="text-lg font-semibold">
                {data.overview.appointments.upcoming}
              </dd>
            </div>
            <div>
              <dt className="text-[#6B7280]">Cancelled</dt>
              <dd className="text-lg font-semibold">
                {data.overview.appointments.cancelled}
              </dd>
            </div>
            <div>
              <dt className="text-[#6B7280]">No-show</dt>
              <dd className="text-lg font-semibold">
                {data.overview.appointments.noShow}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-[20px] border border-[#E8ECF4] bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-[#1C103D]">Utilization</h2>
          {data.overview.utilization.hasScheduleData ? (
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-[#6B7280]">Booked</dt>
                <dd>
                  {Math.round(data.overview.utilization.bookedMinutes / 60)}h
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#6B7280]">Available</dt>
                <dd>
                  {Math.round(data.overview.utilization.availableMinutes / 60)}h
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#6B7280]">Utilization</dt>
                <dd className="font-semibold">
                  {data.overview.utilization.utilizationPercent}%
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#6B7280]">Busiest day</dt>
                <dd>{data.charts.peakDay}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-3 text-sm text-[#9CA3AF]">
              {data.overview.overview.utilizationLabel}
            </p>
          )}
        </section>

        <section className="rounded-[20px] border border-[#E8ECF4] bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-[#1C103D]">Top services</h2>
          {data.charts.services.length === 0 ? (
            <div className="mt-3">
              <Empty message="No appointments yet" />
            </div>
          ) : (
            <ul className="mt-3 space-y-2">
              {data.charts.services.slice(0, 6).map((service) => (
                <li
                  key={service.serviceId ?? service.serviceName}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{service.serviceName}</span>
                  <span className="font-medium">
                    {service.appointments} · {formatCurrency(service.revenue)}
                    {service.appointments > 0
                      ? ` · avg ${formatCurrency(service.revenue / service.appointments)}`
                      : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <p className="text-center text-sm">
        <Link
          href="/team/analytics"
          className="font-medium text-[#6C3BFF] hover:underline"
        >
          Open My Performance
        </Link>
      </p>
    </div>
  );
}
