"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDays,
  addMinutes,
  format,
  isSameDay,
  isToday,
  setHours,
  setMinutes,
  startOfDay,
} from "date-fns";
import { cn } from "@/lib/utils";
import type { Appointment, Employee } from "./types";
import {
  CALENDAR_END_HOUR,
  CALENDAR_START_HOUR,
  SLOT_HEIGHT_PX,
  SLOT_MINUTES,
} from "./types";
import {
  formatAppointmentTime,
  getInitials,
  getPaymentLabel,
  getStatusColor,
  isAppointmentToday,
} from "./appointments-utils";
import { AppointmentReachedButton } from "./appointment-reached-button";

const BLOCK_COLORS = [
  "bg-[#EDE9FE] border-[#C4B5FD] text-[#4C1D95]",
  "bg-[#FCE7F3] border-[#F9A8D4] text-[#831843]",
  "bg-[#ECFDF5] border-[#6EE7B7] text-[#065F46]",
  "bg-[#FEF3C7] border-[#FCD34D] text-[#92400E]",
  "bg-[#EFF6FF] border-[#93C5FD] text-[#1E3A8A]",
  "bg-[#F0FDFA] border-[#5EEAD4] text-[#134E4A]",
];

function getBlockColor(appointment: Appointment, employees: Employee[]) {
  if (appointment.employee) {
    const idx = employees.findIndex((e) => e.id === appointment.employee!.id);
    return BLOCK_COLORS[idx >= 0 ? idx % BLOCK_COLORS.length : 0];
  }
  return BLOCK_COLORS[0];
}

function statusBlockStyle(status: string) {
  if (status === "completed") return "opacity-80 ring-1 ring-emerald-400/40";
  if (status === "checked_in") return "ring-2 ring-amber-400/60";
  if (status === "cancelled") return "opacity-45 line-through grayscale";
  return "";
}

type LayoutBlock = {
  appointment: Appointment;
  column: number;
  totalColumns: number;
};

function layoutDayAppointments(appointments: Appointment[]): LayoutBlock[] {
  const sorted = [...appointments].sort(
    (a, b) =>
      new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  );

  const columns: { end: number }[] = [];
  const layout: LayoutBlock[] = [];

  for (const apt of sorted) {
    const start = new Date(apt.scheduledAt).getTime();
    const end = start + apt.service.duration * 60_000;

    let column = columns.findIndex((col) => col.end <= start);
    if (column === -1) {
      column = columns.length;
      columns.push({ end });
    } else {
      columns[column].end = end;
    }

    layout.push({ appointment: apt, column, totalColumns: 0 });
  }

  const totalColumns = Math.max(columns.length, 1);
  return layout.map((item) => ({ ...item, totalColumns }));
}

function minutesFromStartOfDay(date: Date) {
  return date.getHours() * 60 + date.getMinutes();
}

function topPx(scheduledAt: Date) {
  const minutes =
    minutesFromStartOfDay(scheduledAt) - CALENDAR_START_HOUR * 60;
  return (minutes / SLOT_MINUTES) * SLOT_HEIGHT_PX;
}

function heightPx(durationMinutes: number) {
  return (durationMinutes / SLOT_MINUTES) * SLOT_HEIGHT_PX;
}

function formatHourLabel(hour: number) {
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
}

const TIME_SLOTS = Array.from(
  {
    length:
      ((CALENDAR_END_HOUR - CALENDAR_START_HOUR) * 60) / SLOT_MINUTES + 1,
  },
  (_, i) => CALENDAR_START_HOUR * 60 + i * SLOT_MINUTES
);

function AppointmentCalendarCard({
  appointment,
  employees,
  style,
  onClick,
  onRefresh,
}: {
  appointment: Appointment;
  employees: Employee[];
  style: React.CSSProperties;
  onClick: (e: React.MouseEvent) => void;
  onRefresh?: () => void;
}) {
  const start = new Date(appointment.scheduledAt);
  const isCompact = heightPx(appointment.service.duration) < SLOT_HEIGHT_PX * 2;

  return (
    <button
      type="button"
      className={cn(
        "absolute z-10 overflow-hidden rounded-xl border px-2 py-1.5 text-left shadow-[0_2px_12px_rgba(108,59,255,0.12)] transition-all hover:z-20 hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(108,59,255,0.18)]",
        getBlockColor(appointment, employees),
        statusBlockStyle(appointment.status)
      )}
      style={style}
      onClick={onClick}
    >
      <div className="flex items-start gap-1.5">
        {!isCompact && (
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/80 text-[9px] font-bold shadow-sm">
            {getInitials(appointment.customer.name)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span
              className={cn(
                "h-1.5 w-1.5 shrink-0 rounded-full",
                getStatusColor(appointment.status)
              )}
            />
            <p className="truncate text-[11px] font-semibold leading-tight">
              {appointment.customer.name}
            </p>
          </div>
          {!isCompact && (
            <>
              <p className="truncate text-[10px] opacity-85">
                {appointment.service.name}
              </p>
              {appointment.employee && (
                <p className="truncate text-[10px] opacity-75">
                  {appointment.employee.name}
                </p>
              )}
              <p className="truncate text-[10px] font-medium opacity-90">
                {formatAppointmentTime(appointment)}
              </p>
              <div className="mt-0.5 flex flex-wrap gap-1">
                <span className="rounded-md bg-white/60 px-1 py-0.5 text-[9px] font-medium">
                  {getPaymentLabel(appointment.status)}
                </span>
                {isAppointmentToday(appointment) && (
                  <AppointmentReachedButton
                    appointment={appointment}
                    onSuccess={onRefresh}
                    variant="compact"
                  />
                )}
                <span className="rounded-md bg-white/60 px-1 py-0.5 text-[9px]">
                  Manual
                </span>
                <span className="rounded-md bg-white/60 px-1 py-0.5 text-[9px]">
                  {appointment.service.duration}m
                </span>
              </div>
            </>
          )}
          {isCompact && (
            <p className="truncate text-[10px] opacity-80">
              {format(start, "h:mm a")}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

export function AppointmentsWeekCalendar({
  weekStart,
  appointments,
  employees,
  viewMode,
  selectedDay,
  onSelectDay,
  onSlotClick,
  onAppointmentClick,
  onRefresh,
}: {
  weekStart: Date;
  appointments: Appointment[];
  employees: Employee[];
  viewMode: "week" | "day";
  selectedDay: Date;
  onSelectDay: (day: Date) => void;
  onSlotClick: (day: Date, hour: number, minute: number) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  onRefresh?: () => void;
}) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const visibleDays = viewMode === "day" ? [selectedDay] : weekDays;

  const appointmentsByDay = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const day of visibleDays) {
      map.set(format(day, "yyyy-MM-dd"), []);
    }
    for (const apt of appointments) {
      const key = format(new Date(apt.scheduledAt), "yyyy-MM-dd");
      if (map.has(key)) {
        map.get(key)!.push(apt);
      }
    }
    return map;
  }, [appointments, visibleDays]);

  const gridHeight =
    ((CALENDAR_END_HOUR - CALENDAR_START_HOUR) * 60 / SLOT_MINUTES) *
    SLOT_HEIGHT_PX;

  const showNowIndicator = visibleDays.some((day) => isToday(day));
  const nowTop =
    showNowIndicator && now.getHours() >= CALENDAR_START_HOUR
      ? topPx(now)
      : null;

  return (
    <div className="space-y-4">
      {viewMode === "week" && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 md:hidden">
          {weekDays.map((day) => (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelectDay(day)}
              className={cn(
                "shrink-0 rounded-xl px-3 py-2 text-center text-xs transition-all",
                isSameDay(day, selectedDay)
                  ? "bg-[#6C3BFF] text-white shadow-md"
                  : isToday(day)
                    ? "bg-[#EDE9FE] text-[#6C3BFF]"
                    : "bg-[#F7F8FC] text-[#6B7280]"
              )}
            >
              <div className="font-medium">{format(day, "EEE")}</div>
              <div>{format(day, "d")}</div>
            </button>
          ))}
        </div>
      )}

      <div className="overflow-x-auto rounded-[20px] border border-[#E8ECF4] bg-white shadow-[0_8px_40px_rgba(28,16,61,0.06)]">
        <div
          className="min-w-[680px]"
          style={{
            display: "grid",
            gridTemplateColumns: `64px repeat(${visibleDays.length}, minmax(0, 1fr))`,
          }}
        >
          <div className="sticky left-0 z-20 border-b border-[#EEF1F6] bg-[#FAFBFD]" />
          {visibleDays.map((day) => (
            <div
              key={day.toISOString()}
              className={cn(
                "border-b border-[#EEF1F6] px-2 py-4 text-center",
                isToday(day) ? "bg-[#EDE9FE]/40" : "bg-[#FAFBFD]"
              )}
            >
              <div
                className={cn(
                  "text-xs font-semibold uppercase tracking-wider",
                  isToday(day) ? "text-[#6C3BFF]" : "text-[#9CA3AF]"
                )}
              >
                {format(day, "EEE")}
              </div>
              <div
                className={cn(
                  "mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold",
                  isToday(day)
                    ? "bg-[#FF2D6F] text-white shadow-md shadow-[#FF2D6F]/30"
                    : "text-[#1C103D]"
                )}
              >
                {format(day, "d")}
              </div>
            </div>
          ))}

          <div className="sticky left-0 z-10 border-r border-[#EEF1F6] bg-white">
            {TIME_SLOTS.map((slotMinutes, i) => {
              const hour = Math.floor(slotMinutes / 60);
              const minute = slotMinutes % 60;
              const showLabel = minute === 0;
              return (
                <div
                  key={slotMinutes}
                  className="relative border-b border-[#F3F4F8] pr-2 text-right"
                  style={{ height: SLOT_HEIGHT_PX }}
                >
                  {showLabel && (
                    <span className="absolute -top-2.5 right-2 text-[10px] font-medium text-[#9CA3AF]">
                      {formatHourLabel(hour)}
                    </span>
                  )}
                  {i === TIME_SLOTS.length - 1 && (
                    <span className="absolute bottom-0 right-2 text-[10px] font-medium text-[#9CA3AF]">
                      {formatHourLabel(CALENDAR_END_HOUR)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {visibleDays.map((day) => {
            const dayKey = format(day, "yyyy-MM-dd");
            const dayAppointments = appointmentsByDay.get(dayKey) ?? [];
            const layout = layoutDayAppointments(dayAppointments);

            return (
              <div
                key={dayKey}
                className={cn(
                  "relative border-r border-[#EEF1F6] last:border-r-0",
                  isToday(day) && "bg-[#EDE9FE]/20"
                )}
                style={{ height: gridHeight }}
              >
                {TIME_SLOTS.map((slotMinutes) => {
                  const hour = Math.floor(slotMinutes / 60);
                  const minute = slotMinutes % 60;
                  return (
                    <button
                      key={slotMinutes}
                      type="button"
                      className="absolute inset-x-0 border-b border-[#F3F4F8] transition-colors hover:bg-[#EDE9FE]/30"
                      style={{
                        top:
                          ((slotMinutes - CALENDAR_START_HOUR * 60) /
                            SLOT_MINUTES) *
                          SLOT_HEIGHT_PX,
                        height: SLOT_HEIGHT_PX,
                      }}
                      onClick={() => onSlotClick(day, hour, minute)}
                      aria-label={`Book ${format(day, "MMM d")} at ${formatHourLabel(hour)}`}
                    />
                  );
                })}

                {isToday(day) &&
                  nowTop !== null &&
                  nowTop >= 0 &&
                  nowTop <= gridHeight && (
                    <div
                      className="pointer-events-none absolute inset-x-0 z-20 flex items-center"
                      style={{ top: nowTop }}
                    >
                      <div className="relative h-3 w-3 shrink-0 rounded-full bg-[#FF2D6F] shadow-[0_0_0_4px_rgba(255,45,111,0.2)]">
                        <span className="absolute inset-0 animate-ping rounded-full bg-[#FF2D6F] opacity-60" />
                      </div>
                      <div className="h-[2px] flex-1 bg-gradient-to-r from-[#FF2D6F] to-[#FF2D6F]/20" />
                    </div>
                  )}

                {layout.map(({ appointment, column, totalColumns }) => {
                  const start = new Date(appointment.scheduledAt);
                  const top = topPx(start);
                  const height = Math.max(
                    heightPx(appointment.service.duration),
                    SLOT_HEIGHT_PX
                  );
                  const widthPct = 100 / totalColumns;
                  const leftPct = column * widthPct;

                  return (
                    <AppointmentCalendarCard
                      key={appointment.id}
                      appointment={appointment}
                      employees={employees}
                      onRefresh={onRefresh}
                      style={{
                        top,
                        height,
                        left: `calc(${leftPct}% + 3px)`,
                        width: `calc(${widthPct}% - 6px)`,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAppointmentClick(appointment);
                      }}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function slotToDatetimeLocal(day: Date, hour: number, minute: number) {
  return format(
    setMinutes(setHours(startOfDay(day), hour), minute),
    "yyyy-MM-dd'T'HH:mm"
  );
}
