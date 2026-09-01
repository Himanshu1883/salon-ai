"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  addDays,
  format,
  isSameDay,
  isToday,
  setHours,
  setMinutes,
  startOfDay,
} from "date-fns";
import { AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRoleLabel } from "@/lib/team";
import type { OpeningHours } from "@/lib/onboarding";
import {
  clipAppointmentToDayHours,
  clipIntervalToDayHours,
  getCalendarBounds,
  isSlotWithinSalonHours,
} from "@/lib/appointments/salon-hours";
import {
  appointmentClockMinutes,
  appointmentDateKey,
  formatAppointmentDateTime,
} from "@/lib/appointments/datetime";
import { groupAppointmentsByVisit } from "@/lib/appointments/service-items";
import type { Appointment, Employee } from "./types";
import {
  SLOT_HEIGHT_PX,
  SLOT_MINUTES,
} from "./types";
import {
  formatAppointmentTime,
  getInitials,
  expandAppointmentsForCalendar,
} from "./appointments-utils";

const STAFF_PALETTES = [
  {
    bar: "bg-[#6C3BFF]",
    accent: "#6C3BFF",
    card: "bg-[#F5F3FF] border-[#DDD6FE]",
    text: "text-[#4C1D95]",
    avatar: "bg-[#6C3BFF] text-white",
  },
  {
    bar: "bg-[#EC4899]",
    accent: "#EC4899",
    card: "bg-[#FDF2F8] border-[#FBCFE8]",
    text: "text-[#831843]",
    avatar: "bg-[#EC4899] text-white",
  },
  {
    bar: "bg-[#14B8A6]",
    accent: "#14B8A6",
    card: "bg-[#F0FDFA] border-[#99F6E4]",
    text: "text-[#134E4A]",
    avatar: "bg-[#14B8A6] text-white",
  },
  {
    bar: "bg-[#F59E0B]",
    accent: "#F59E0B",
    card: "bg-[#FFFBEB] border-[#FDE68A]",
    text: "text-[#92400E]",
    avatar: "bg-[#F59E0B] text-white",
  },
  {
    bar: "bg-[#3B82F6]",
    accent: "#3B82F6",
    card: "bg-[#EFF6FF] border-[#BFDBFE]",
    text: "text-[#1E3A8A]",
    avatar: "bg-[#3B82F6] text-white",
  },
  {
    bar: "bg-[#8B5CF6]",
    accent: "#8B5CF6",
    card: "bg-[#F5F3FF] border-[#DDD6FE]",
    text: "text-[#5B21B6]",
    avatar: "bg-[#8B5CF6] text-white",
  },
];

function getStaffPalette(index: number) {
  return STAFF_PALETTES[index % STAFF_PALETTES.length];
}

function getStaffRoleLabel(employee: Employee) {
  if (employee.specialties?.trim()) return employee.specialties;
  if (employee.role) return getRoleLabel(employee.role);
  return "Staff";
}

type LayoutBlock = {
  appointment: Appointment;
  column: number;
  totalColumns: number;
};

function layoutOverlaps(appointments: Appointment[]): LayoutBlock[] {
  if (appointments.length === 0) return [];

  type Timed = {
    appointment: Appointment;
    start: number;
    end: number;
    column: number;
  };

  const timed: Timed[] = [...appointments]
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
    )
    .map((appointment) => ({
      appointment,
      start: new Date(appointment.scheduledAt).getTime(),
      end:
        new Date(appointment.scheduledAt).getTime() +
        appointment.service.duration * 60_000,
      column: 0,
    }));

  const columns: { end: number }[] = [];
  const layout: LayoutBlock[] = [];

  for (const item of timed) {
    let column = columns.findIndex((col) => col.end <= item.start);
    if (column === -1) {
      column = columns.length;
      columns.push({ end: item.end });
    } else {
      columns[column].end = Math.max(columns[column].end, item.end);
    }
    layout.push({
      appointment: item.appointment,
      column,
      totalColumns: 0,
    });
  }

  const totalColumns = Math.max(columns.length, 1);
  return layout.map((item) => ({ ...item, totalColumns }));
}

function topPxFor(scheduledAt: Date, startHour: number) {
  const minutes = appointmentClockMinutes(scheduledAt) - startHour * 60;
  return (minutes / SLOT_MINUTES) * SLOT_HEIGHT_PX;
}

function heightPx(durationMinutes: number) {
  return (durationMinutes / SLOT_MINUTES) * SLOT_HEIGHT_PX;
}

type CalendarGrid = {
  startHour: number;
  endHour: number;
  timeSlots: number[];
  gridHeight: number;
};

function buildCalendarGrid(startHour: number, endHour: number): CalendarGrid {
  const timeSlots = Array.from(
    {
      length: ((endHour - startHour) * 60) / SLOT_MINUTES + 1,
    },
    (_, i) => startHour * 60 + i * SLOT_MINUTES
  );

  return {
    startHour,
    endHour,
    timeSlots,
    gridHeight:
      ((endHour - startHour) * 60 / SLOT_MINUTES) * SLOT_HEIGHT_PX,
  };
}

const MIN_DAY_APPOINTMENT_HEIGHT_PX = 46;

function dayAppointmentHeight(durationMinutes: number) {
  const calculated = heightPx(durationMinutes);
  if (durationMinutes <= 15) return Math.max(calculated, 34);
  if (durationMinutes <= 30) return Math.max(calculated, MIN_DAY_APPOINTMENT_HEIGHT_PX);
  if (durationMinutes <= 45) return Math.max(calculated, 56);
  return calculated;
}

type DayCardDensity = "xs" | "sm" | "md" | "lg";

function getDayCardDensity(
  durationMinutes: number,
  cardHeight: number
): DayCardDensity {
  if (cardHeight < 38 || durationMinutes <= 15) return "xs";
  if (cardHeight < 50 || durationMinutes <= 30) return "sm";
  if (cardHeight < 64 || durationMinutes <= 45) return "md";
  return "lg";
}

function formatHourLabel(hour: number) {
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
}

const MIN_BUSY_CHIP_HEIGHT_PX = 92;
const HOVER_CLOSE_DELAY_MS = 120;

function getBusyChipHeight(slotHeightPx: number) {
  return Math.max(slotHeightPx, MIN_BUSY_CHIP_HEIGHT_PX);
}

type BusyCluster = {
  start: number;
  end: number;
  appointments: Appointment[];
  staffIds: string[];
};

function dedupeAppointments(appointments: Appointment[]) {
  const seen = new Set<string>();
  return appointments.filter((appointment) => {
    if (seen.has(appointment.id)) return false;
    seen.add(appointment.id);
    return true;
  });
}

function normalizeCluster(cluster: BusyCluster): BusyCluster {
  const appointments = dedupeAppointments(cluster.appointments);
  const staffIds = [
    ...new Set(
      appointments
        .map((appointment) => appointment.employee?.id)
        .filter((id): id is string => Boolean(id))
    ),
  ];

  return {
    start: cluster.start,
    end: cluster.end,
    appointments,
    staffIds,
  };
}

function consolidateClusters(clusters: BusyCluster[]): BusyCluster[] {
  let result = clusters.map(normalizeCluster);
  let changed = true;

  while (changed) {
    changed = false;
    const next: BusyCluster[] = [];

    for (const cluster of result) {
      const matchIndex = next.findIndex(
        (existing) =>
          cluster.start < existing.end && cluster.end > existing.start
      );

      if (matchIndex === -1) {
        next.push(cluster);
        continue;
      }

      const existing = next[matchIndex];
      next[matchIndex] = normalizeCluster({
        start: Math.min(cluster.start, existing.start),
        end: Math.max(cluster.end, existing.end),
        appointments: [...existing.appointments, ...cluster.appointments],
        staffIds: [...existing.staffIds, ...cluster.staffIds],
      });
      changed = true;
    }

    result = next;
  }

  return result.sort((a, b) => a.start - b.start);
}

function findBusyClusters(appointments: Appointment[]): BusyCluster[] {
  const active = appointments.filter((apt) => apt.status !== "cancelled");
  if (active.length === 0) return [];

  type Interval = {
    start: number;
    end: number;
    appointment: Appointment;
  };

  const intervals: Interval[] = active
    .map((appointment) => ({
      start: new Date(appointment.scheduledAt).getTime(),
      end:
        new Date(appointment.scheduledAt).getTime() +
        appointment.service.duration * 60_000,
      appointment,
    }))
    .sort((a, b) => a.start - b.start);

  const clusters: BusyCluster[] = [];

  for (const interval of intervals) {
    const overlapping = clusters.filter(
      (cluster) => interval.start < cluster.end && interval.end > cluster.start
    );

    if (overlapping.length === 0) {
      clusters.push({
        start: interval.start,
        end: interval.end,
        appointments: [interval.appointment],
        staffIds: interval.appointment.employee
          ? [interval.appointment.employee.id]
          : [],
      });
      continue;
    }

    const merged: BusyCluster = {
      start: interval.start,
      end: interval.end,
      appointments: [interval.appointment],
      staffIds: interval.appointment.employee
        ? [interval.appointment.employee.id]
        : [],
    };

    for (const cluster of overlapping) {
      merged.start = Math.min(merged.start, cluster.start);
      merged.end = Math.max(merged.end, cluster.end);
      merged.appointments.push(...cluster.appointments);
      merged.staffIds.push(...cluster.staffIds);
      const idx = clusters.indexOf(cluster);
      if (idx >= 0) clusters.splice(idx, 1);
    }

    merged.staffIds = [...new Set(merged.staffIds)];
    clusters.push(normalizeCluster(merged));
  }

  return consolidateClusters(clusters);
}

function StaffDayCard({
  appointment,
  palette,
  style,
  totalColumns,
  onClick,
}: {
  appointment: Appointment;
  palette: (typeof STAFF_PALETTES)[number];
  style: React.CSSProperties;
  totalColumns: number;
  onClick: () => void;
}) {
  const hasOverlap = totalColumns > 1;
  const duration = appointment.service.duration;
  const cardHeight =
    typeof style.height === "number"
      ? style.height
      : Number.parseFloat(String(style.height)) || MIN_DAY_APPOINTMENT_HEIGHT_PX;
  const density = getDayCardDensity(duration, cardHeight);
  const shortName = appointment.customer.name
    .split(" ")
    .map((part, i) => (i === 0 ? part : `${part.charAt(0)}.`))
    .join(" ");

  const tooltip = `${appointment.customer.name} · ${appointment.service.name} · ${formatAppointmentTime(appointment)}`;

  return (
    <button
      type="button"
      onClick={onClick}
      style={style}
      title={tooltip}
      className={cn(
        "absolute z-10 flex flex-col overflow-hidden border-l-[4px] border text-left shadow-sm transition-shadow hover:z-20 hover:shadow-md",
        density === "xs" ? "justify-center rounded-lg px-2 py-1" : "rounded-xl",
        density === "sm" && "justify-center px-2 py-1.5",
        (density === "md" || density === "lg") && "px-2.5 py-2",
        palette.card,
        palette.text,
        hasOverlap && "ring-1 ring-amber-200"
      )}
    >
      {hasOverlap && density !== "xs" && (
        <div className="flex shrink-0 items-center gap-1 bg-amber-50 px-2 py-0.5 text-[9px] font-semibold text-amber-700">
          <AlertTriangle className="h-2.5 w-2.5 shrink-0" />
          overlap
        </div>
      )}

      {density === "xs" && (
        <p className="truncate text-[11px] font-semibold leading-none">
          {shortName}
        </p>
      )}

      {density === "sm" && (
        <div className="min-h-0 space-y-0.5">
          <p className="truncate text-[12px] font-semibold leading-tight">
            {shortName}
          </p>
          <p className="truncate text-[10px] leading-tight opacity-80">
            {appointment.service.name}
          </p>
        </div>
      )}

      {density === "md" && (
        <div className="min-h-0 space-y-0.5">
          <p className="truncate text-[12px] font-semibold leading-tight">
            {shortName}
          </p>
          <p className="truncate text-[10px] leading-tight opacity-80">
            {appointment.service.name}
          </p>
          <p className="truncate text-[10px] font-medium leading-tight opacity-70">
            {formatAppointmentTime(appointment)}
          </p>
        </div>
      )}

      {density === "lg" && (
        <div className="min-h-0 space-y-0.5">
          <p className="truncate text-[13px] font-semibold leading-tight">
            {shortName}
          </p>
          <p className="truncate text-[11px] leading-tight opacity-80">
            {appointment.service.name}
          </p>
          <p className="truncate text-[10px] font-medium leading-tight opacity-70">
            {formatAppointmentTime(appointment)}
          </p>
        </div>
      )}
    </button>
  );
}

function BusyChip({
  cluster,
  employees,
  style,
}: {
  cluster: BusyCluster;
  employees: Employee[];
  style: React.CSSProperties;
}) {
  const chipRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const [open, setOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const appointments = useMemo(
    () => dedupeAppointments(cluster.appointments),
    [cluster.appointments]
  );

  const staffCount = cluster.staffIds.length || 1;
  const staffMembers = cluster.staffIds
    .map((id) => employees.find((employee) => employee.id === id))
    .filter(Boolean) as Employee[];
  const singleAppointment =
    appointments.length === 1 ? appointments[0] : null;

  const timeLabel = `${formatAppointmentDateTime(new Date(cluster.start), "h:mm a")} – ${formatAppointmentDateTime(new Date(cluster.end), "h:mm a")}`;

  function clearCloseTimer() {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function handleOpen() {
    clearCloseTimer();
    setOpen(true);
  }

  function handleClose() {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
      setPopoverPos(null);
    }, HOVER_CLOSE_DELAY_MS);
  }

  useLayoutEffect(() => {
    if (!open || !chipRef.current) {
      setPopoverPos(null);
      return;
    }

    function updatePosition() {
      const anchor = chipRef.current;
      if (!anchor) return;

      const rect = anchor.getBoundingClientRect();
      const popoverWidth = 256;
      const popoverMaxHeight = 280;
      const gap = 10;

      let left = rect.right + gap;
      if (left + popoverWidth > window.innerWidth - 12) {
        left = Math.max(12, rect.left - popoverWidth - gap);
      }

      let top = rect.top;
      if (top + popoverMaxHeight > window.innerHeight - 12) {
        top = Math.max(12, window.innerHeight - popoverMaxHeight - 12);
      }

      setPopoverPos({ top, left });
    }

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  useEffect(() => () => clearCloseTimer(), []);

  const popover =
    open &&
    popoverPos &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        style={{
          position: "fixed",
          top: popoverPos.top,
          left: popoverPos.left,
          zIndex: 9999,
        }}
        className="w-64 overflow-hidden rounded-xl border border-[#E8ECF4] bg-white shadow-2xl"
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
      >
        <div className="border-b border-[#EEF1F6] px-3 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
            Appointments
          </p>
          <p className="mt-0.5 text-xs font-medium text-[#6B7280]">{timeLabel}</p>
        </div>
        <div className="max-h-56 space-y-2 overflow-y-auto p-3">
          {appointments.map((appointment) => (
            <div
              key={appointment.calendarKey ?? appointment.id}
              className="rounded-lg bg-[#FAFAFF] px-2.5 py-2"
            >
              <p className="truncate text-sm font-medium text-[#1C103D]">
                {appointment.customer.name}
              </p>
              <p className="truncate text-xs text-[#6B7280]">
                {appointment.service.name} · {formatAppointmentTime(appointment)}
              </p>
              {appointment.employee && (
                <p className="truncate text-xs text-[#6B7280]">
                  {appointment.employee.name}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>,
      document.body
    );

  return (
    <>
      <div
        ref={chipRef}
        className={cn("absolute px-1", open ? "z-[60]" : "z-10")}
        style={style}
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
      >
        <div className="flex h-full flex-col overflow-hidden rounded-xl border border-[#E8ECF4] bg-white p-2.5 shadow-sm">
          <div className="flex shrink-0 -space-x-2">
            {(staffMembers.length > 0 ? staffMembers : employees.slice(0, 3)).map(
              (employee, index) => {
                const palette = getStaffPalette(
                  employees.findIndex((item) => item.id === employee.id) >= 0
                    ? employees.findIndex((item) => item.id === employee.id)
                    : index
                );
                return (
                  <div
                    key={employee.id}
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold",
                      palette.avatar
                    )}
                  >
                    {getInitials(employee.name)}
                  </div>
                );
              }
            )}
          </div>
          <div className="mt-2 min-h-0 flex-1">
            {singleAppointment ? (
              <>
                <p className="truncate text-xs font-semibold leading-tight text-[#1C103D]">
                  {singleAppointment.customer.name}
                </p>
                <p className="mt-0.5 truncate text-[10px] leading-tight text-[#6B7280]">
                  {singleAppointment.service.name} · {timeLabel}
                </p>
              </>
            ) : (
              <>
                <p className="truncate text-xs font-semibold leading-tight text-[#1C103D]">
                  {staffCount} staff busy
                </p>
                <p className="mt-0.5 truncate text-[10px] leading-tight text-[#6B7280]">
                  {timeLabel}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      {popover}
    </>
  );
}

function TimeColumn({ calendar }: { calendar: CalendarGrid }) {
  return (
    <div className="sticky left-0 z-10 border-r border-[#EEF1F6] bg-white">
      {calendar.timeSlots.map((slotMinutes, i) => {
        const hour = Math.floor(slotMinutes / 60);
        const minute = slotMinutes % 60;
        const isLast = i === calendar.timeSlots.length - 1;
        return (
          <div
            key={slotMinutes}
            className="relative border-b border-[#F3F4F8]"
            style={{ height: SLOT_HEIGHT_PX }}
          >
            {minute === 0 && !isLast && (
              <span className="absolute -top-2.5 right-3 text-[11px] font-medium text-[#9CA3AF]">
                {formatHourLabel(hour)}
              </span>
            )}
            {isLast && (
              <span className="absolute bottom-0 right-3 text-[11px] font-medium text-[#9CA3AF]">
                {formatHourLabel(calendar.endHour)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function NowLine({
  gridHeight,
  startHour,
}: {
  gridHeight: number;
  startHour: number;
}) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  if (now.getHours() < startHour) return null;

  const top = topPxFor(now, startHour);
  if (top < 0 || top > gridHeight) return null;

  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-20 flex items-center"
      style={{ top }}
    >
      <div className="ml-[-4px] flex h-5 items-center gap-2">
        <div className="h-2.5 w-2.5 rounded-full bg-[#D97706] shadow-[0_0_0_3px_rgba(217,119,6,0.15)]" />
        <span className="rounded-full bg-[#FFFBEB] px-2 py-0.5 text-[10px] font-semibold text-[#B45309] shadow-sm">
          Now · {format(now, "h:mm")}
        </span>
      </div>
      <div className="h-px flex-1 bg-[#D97706]/50" />
    </div>
  );
}

function DayStaffCalendar({
  selectedDay,
  appointments,
  employees,
  openingHours,
  calendar,
  onSlotClick,
  onAppointmentClick,
  onPrevDay,
  onNextDay,
}: {
  selectedDay: Date;
  appointments: Appointment[];
  employees: Employee[];
  openingHours: OpeningHours;
  calendar: CalendarGrid;
  onSlotClick: (day: Date, hour: number, minute: number) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  onPrevDay?: () => void;
  onNextDay?: () => void;
}) {
  const dayKey = format(selectedDay, "yyyy-MM-dd");
  const dayAppointments = expandAppointmentsForCalendar(appointments).filter(
    (apt) =>
      appointmentDateKey(apt.scheduledAt) === dayKey &&
      apt.status !== "cancelled"
  );

  const unassigned = dayAppointments.filter((apt) => !apt.employee);
  const staffColumns = employees.map((employee, index) => ({
    employee,
    palette: getStaffPalette(index),
    appointments: dayAppointments.filter(
      (apt) => apt.employee?.id === employee.id
    ),
  }));

  const columns = [
    ...staffColumns,
    ...(unassigned.length > 0
      ? [
          {
            employee: {
              id: "unassigned",
              name: "Unassigned",
              role: "Needs staff",
            } as Employee,
            palette: {
              bar: "bg-[#9CA3AF]",
              accent: "#9CA3AF",
              card: "bg-[#F9FAFB] border-[#E5E7EB]",
              text: "text-[#374151]",
              avatar: "bg-[#9CA3AF] text-white",
            },
            appointments: unassigned,
          },
        ]
      : []),
  ];

  const colCount = Math.max(columns.length, 1);

  return (
    <div className="overflow-hidden rounded-[20px] border border-[#E8ECF4] bg-white shadow-[0_8px_40px_rgba(28,16,61,0.06)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EEF1F6] px-3 py-2.5 sm:gap-3 sm:px-5 sm:py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-sm font-semibold text-[#1C103D]">Day view</span>
          <span className="hidden rounded-full bg-[#EDE9FE] px-2.5 py-0.5 text-[10px] font-semibold text-[#6C3BFF] sm:inline">
            staff columns — recommended
          </span>
        </div>
        <div className="flex min-w-0 items-center gap-2">
          {onPrevDay && (
            <button
              type="button"
              onClick={onPrevDay}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E8ECF4] text-[#6B7280] hover:bg-[#FAFAFF]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          <span className="min-w-0 text-center text-xs font-semibold text-[#1C103D] sm:min-w-[180px] sm:text-sm">
            <span className="sm:hidden">{format(selectedDay, "EEE, d MMM")}</span>
            <span className="hidden sm:inline">
              {format(selectedDay, "EEEE, d MMMM yyyy")}
            </span>
          </span>
          {onNextDay && (
            <button
              type="button"
              onClick={onNextDay}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E8ECF4] text-[#6B7280] hover:bg-[#FAFAFF]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="max-h-[min(62vh,560px)] overflow-auto overscroll-x-contain md:max-h-none md:overflow-x-auto">
        <div
          className="min-w-[520px] md:min-w-[720px]"
          style={{
            display: "grid",
            gridTemplateColumns: `72px repeat(${colCount}, minmax(160px, 1fr))`,
          }}
        >
          <div className="sticky left-0 z-20 border-b border-[#EEF1F6] bg-[#FAFBFD]" />
          {columns.map(({ employee, palette }) => (
            <div
              key={employee.id}
              className="border-b border-[#EEF1F6] bg-[#FAFBFD] px-2 py-2 text-center sm:px-3 sm:py-3"
            >
              <div
                className={cn(
                  "mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold sm:h-10 sm:w-10 sm:text-sm",
                  palette.avatar
                )}
              >
                {getInitials(employee.name)}
              </div>
              <p className="mt-1 truncate text-xs font-semibold text-[#1C103D] sm:mt-2 sm:text-sm">
                {employee.name.split(" ")[0]}
              </p>
              <p className="hidden truncate text-[11px] text-[#6B7280] sm:block">
                {getStaffRoleLabel(employee)}
              </p>
              <div className={cn("mx-auto mt-1.5 h-1 w-8 rounded-full sm:mt-2 sm:w-10", palette.bar)} />
            </div>
          ))}

          <TimeColumn calendar={calendar} />

          {columns.map(({ employee, palette, appointments: staffAppointments }) => {
            const layout = layoutOverlaps(staffAppointments);

            return (
              <div
                key={employee.id}
                className="relative overflow-hidden border-r border-[#EEF1F6] last:border-r-0"
                style={{ height: calendar.gridHeight }}
              >
                {calendar.timeSlots.map((slotMinutes) => {
                  const hour = Math.floor(slotMinutes / 60);
                  const minute = slotMinutes % 60;
                  const inHours = isSlotWithinSalonHours(
                    openingHours,
                    selectedDay,
                    hour,
                    minute
                  );
                  return (
                    <button
                      key={slotMinutes}
                      type="button"
                      disabled={!inHours}
                      className={cn(
                        "absolute inset-x-0 border-b border-[#F3F4F8] transition-colors",
                        inHours
                          ? "hover:bg-[#FAFAFF]"
                          : "cursor-not-allowed bg-[#FAFBFD]/80 opacity-40"
                      )}
                      style={{
                        top:
                          ((slotMinutes - calendar.startHour * 60) /
                            SLOT_MINUTES) *
                          SLOT_HEIGHT_PX,
                        height: SLOT_HEIGHT_PX,
                      }}
                      onClick={() => {
                        if (inHours) onSlotClick(selectedDay, hour, minute);
                      }}
                    />
                  );
                })}

                {isToday(selectedDay) && (
                  <NowLine
                    gridHeight={calendar.gridHeight}
                    startHour={calendar.startHour}
                  />
                )}

                {layout.map(({ appointment, column, totalColumns }) => {
                  const start = new Date(appointment.scheduledAt);
                  const widthPct = 100 / totalColumns;
                  const clipped = clipAppointmentToDayHours(
                    openingHours,
                    start,
                    appointment.service.duration,
                    calendar.startHour,
                    calendar.endHour
                  );
                  if (!clipped || clipped.hidden) return null;

                  const cardHeight = Math.min(
                    dayAppointmentHeight(appointment.service.duration),
                    clipped.height
                  );

                  return (
                    <StaffDayCard
                      key={appointment.calendarKey ?? appointment.id}
                      appointment={appointment}
                      palette={palette}
                      totalColumns={totalColumns}
                      onClick={() => onAppointmentClick(appointment)}
                      style={{
                        top: clipped.top + 2,
                        height: Math.max(cardHeight - 4, 0),
                        maxHeight: clipped.height - 4,
                        left: `calc(${column * widthPct}% + 4px)`,
                        width: `calc(${widthPct}% - 8px)`,
                        borderLeftColor: palette.accent,
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

function WeekBusyCalendar({
  weekStart,
  appointments,
  employees,
  selectedDay,
  openingHours,
  calendar,
  onSelectDay,
  onSlotClick,
}: {
  weekStart: Date;
  appointments: Appointment[];
  employees: Employee[];
  selectedDay: Date;
  openingHours: OpeningHours;
  calendar: CalendarGrid;
  onSelectDay: (day: Date) => void;
  onSlotClick: (day: Date, hour: number, minute: number) => void;
}) {
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const appointmentsByDay = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const day of weekDays) {
      map.set(format(day, "yyyy-MM-dd"), []);
    }
    for (const apt of expandAppointmentsForCalendar(appointments)) {
      const key = appointmentDateKey(apt.scheduledAt);
      if (map.has(key)) map.get(key)!.push(apt);
    }
    return map;
  }, [appointments, weekDays]);

  return (
    <div className="overflow-hidden rounded-[20px] border border-[#E8ECF4] bg-white shadow-[0_8px_40px_rgba(28,16,61,0.06)]">
      <div className="flex flex-wrap items-center gap-2 border-b border-[#EEF1F6] px-3 py-2.5 sm:px-5 sm:py-3">
        <span className="text-sm font-semibold text-[#1C103D]">Week view</span>
        <span className="hidden rounded-full bg-[#FEF3C7] px-2.5 py-0.5 text-[10px] font-semibold text-[#B45309] sm:inline">
          busy chip — hover to expand
        </span>
      </div>

      <div className="max-h-[min(62vh,560px)] overflow-auto overscroll-x-contain md:max-h-none md:overflow-x-auto">
        <div
          className="min-w-[560px] md:min-w-[720px]"
          style={{
            display: "grid",
            gridTemplateColumns: `72px repeat(7, minmax(100px, 1fr))`,
          }}
        >
          <div className="sticky left-0 z-20 border-b border-[#EEF1F6] bg-[#FAFBFD]" />
          {weekDays.map((day) => (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelectDay(day)}
              className={cn(
                "border-b border-[#EEF1F6] px-1 py-2.5 text-center transition-colors hover:bg-[#FAFAFF] sm:px-2 sm:py-4",
                isSameDay(day, selectedDay) && "bg-[#FAFAFF]"
              )}
            >
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                {format(day, "EEE")}
              </div>
              <div
                className={cn(
                  "mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold",
                  isToday(day)
                    ? "bg-[#6C3BFF] text-white shadow-md"
                    : "text-[#1C103D]"
                )}
              >
                {format(day, "d")}
              </div>
            </button>
          ))}

          <TimeColumn calendar={calendar} />

          {weekDays.map((day) => {
            const dayKey = format(day, "yyyy-MM-dd");
            const clusters = findBusyClusters(
              appointmentsByDay.get(dayKey) ?? []
            );

            return (
              <div
                key={dayKey}
                className={cn(
                  "relative overflow-visible border-r border-[#EEF1F6] last:border-r-0",
                  isToday(day) && "bg-[#FAFAFF]/40"
                )}
                style={{ height: calendar.gridHeight }}
              >
                {calendar.timeSlots.map((slotMinutes) => {
                  const hour = Math.floor(slotMinutes / 60);
                  const minute = slotMinutes % 60;
                  const inHours = isSlotWithinSalonHours(
                    openingHours,
                    day,
                    hour,
                    minute
                  );
                  return (
                    <button
                      key={slotMinutes}
                      type="button"
                      disabled={!inHours}
                      className={cn(
                        "absolute inset-x-0 border-b border-[#F3F4F8] transition-colors",
                        inHours
                          ? "hover:bg-[#FAFAFF]"
                          : "cursor-not-allowed bg-[#FAFBFD]/80 opacity-40"
                      )}
                      style={{
                        top:
                          ((slotMinutes - calendar.startHour * 60) /
                            SLOT_MINUTES) *
                          SLOT_HEIGHT_PX,
                        height: SLOT_HEIGHT_PX,
                      }}
                      onClick={() => {
                        if (inHours) onSlotClick(day, hour, minute);
                      }}
                    />
                  );
                })}

                {isToday(day) && (
                  <NowLine
                    gridHeight={calendar.gridHeight}
                    startHour={calendar.startHour}
                  />
                )}

                {clusters.map((cluster, index) => {
                  const clipped = clipIntervalToDayHours(
                    openingHours,
                    day,
                    cluster.start,
                    cluster.end,
                    calendar.startHour,
                    calendar.endHour
                  );
                  if (!clipped || clipped.hidden) return null;

                  const chipHeight = getBusyChipHeight(
                    Math.max(clipped.height - 8, 0)
                  );

                  return (
                    <BusyChip
                      key={`${dayKey}-${index}`}
                      cluster={cluster}
                      employees={employees}
                      style={{
                        top: clipped.top + 4,
                        height: chipHeight,
                        left: 4,
                        right: 4,
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

function MobileAgendaList({
  appointments,
  employees,
  selectedDay,
  onAppointmentClick,
}: {
  appointments: Appointment[];
  employees: Employee[];
  selectedDay: Date;
  onAppointmentClick: (appointment: Appointment) => void;
}) {
  const dayKey = format(selectedDay, "yyyy-MM-dd");
  const dayAppointments = groupAppointmentsByVisit(
    appointments.filter((apt) => appointmentDateKey(apt.scheduledAt) === dayKey)
  ).sort(
    (a, b) =>
      new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  );

  if (dayAppointments.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-[#E8ECF4] py-6 text-center text-sm text-[#9CA3AF] sm:py-8">
        No appointments for {format(selectedDay, "EEEE, MMM d")}
      </p>
    );
  }

  return (
    <div className="space-y-1.5 sm:space-y-2">
      {dayAppointments.map((appointment) => {
        const staffIndex = appointment.employee
          ? employees.findIndex((e) => e.id === appointment.employee!.id)
          : 0;
        const palette = getStaffPalette(Math.max(staffIndex, 0));
        return (
          <button
            key={appointment.id}
            type="button"
            onClick={() => onAppointmentClick(appointment)}
            className={cn(
              "flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left shadow-sm sm:p-3.5",
              palette.card,
              palette.text
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                palette.avatar
              )}
            >
              {getInitials(appointment.customer.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{appointment.customer.name}</p>
              <p className="truncate text-sm opacity-85">
                {appointment.service.name}
              </p>
              <p className="text-xs opacity-75">
                {formatAppointmentTime(appointment)}
                {appointment.employee ? ` · ${appointment.employee.name}` : ""}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function AppointmentsWeekCalendar({
  weekStart,
  appointments,
  employees,
  openingHours,
  viewMode,
  selectedDay,
  onSelectDay,
  onSlotClick,
  onAppointmentClick,
}: {
  weekStart: Date;
  appointments: Appointment[];
  employees: Employee[];
  openingHours: OpeningHours;
  viewMode: "week" | "day";
  selectedDay: Date;
  onSelectDay: (day: Date) => void;
  onSlotClick: (day: Date, hour: number, minute: number) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  onRefresh?: () => void;
}) {
  const calendar = useMemo(() => {
    const bounds = getCalendarBounds(openingHours);
    return buildCalendarGrid(bounds.startHour, bounds.endHour);
  }, [openingHours]);

  const selectedDayKey = format(selectedDay, "yyyy-MM-dd");
  const selectedDayHasAppointments = appointments.some(
    (apt) => appointmentDateKey(apt.scheduledAt) === selectedDayKey
  );

  return (
    <div className="space-y-3 sm:space-y-4">
      {viewMode === "day" ? (
        <DayStaffCalendar
          selectedDay={selectedDay}
          appointments={appointments}
          employees={employees}
          openingHours={openingHours}
          calendar={calendar}
          onSlotClick={onSlotClick}
          onAppointmentClick={onAppointmentClick}
          onPrevDay={() => onSelectDay(addDays(selectedDay, -1))}
          onNextDay={() => onSelectDay(addDays(selectedDay, 1))}
        />
      ) : (
        <WeekBusyCalendar
          weekStart={weekStart}
          appointments={appointments}
          employees={employees}
          selectedDay={selectedDay}
          openingHours={openingHours}
          calendar={calendar}
          onSelectDay={onSelectDay}
          onSlotClick={onSlotClick}
        />
      )}

      {selectedDayHasAppointments ? (
        <div className="md:hidden">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
            {format(selectedDay, "EEE, MMM d")} bookings
          </p>
          <MobileAgendaList
            appointments={appointments}
            employees={employees}
            selectedDay={selectedDay}
            onAppointmentClick={onAppointmentClick}
          />
        </div>
      ) : null}
    </div>
  );
}

export function slotToDatetimeLocal(day: Date, hour: number, minute: number) {
  return format(
    setMinutes(setHours(startOfDay(day), hour), minute),
    "yyyy-MM-dd'T'HH:mm"
  );
}
