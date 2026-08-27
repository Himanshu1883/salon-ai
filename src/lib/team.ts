import {
  addDays,
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  isSameDay,
} from "date-fns";

export const PRESET_EMPLOYEE_ROLES = [
  "owner",
  "manager",
  "stylist",
  "receptionist",
] as const;

export type PresetEmployeeRole = (typeof PRESET_EMPLOYEE_ROLES)[number];

export const CUSTOM_EMPLOYEE_ROLE_SELECT_VALUE = "__custom__";

export const EMPLOYEE_ROLE_LABELS: Record<PresetEmployeeRole, string> = {
  owner: "Workspace owner",
  manager: "Manager",
  stylist: "Stylist",
  receptionist: "Receptionist",
};

export function isPresetEmployeeRole(role: string): role is PresetEmployeeRole {
  return (PRESET_EMPLOYEE_ROLES as readonly string[]).includes(role);
}

export function getRoleLabel(role: string): string {
  if (isPresetEmployeeRole(role)) {
    return EMPLOYEE_ROLE_LABELS[role];
  }
  if (/^[a-z][a-z0-9_-]*$/.test(role)) {
    return role
      .split(/[_-]+/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }
  return role;
}

export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + (minutes ?? 0);
}

export type Time12Hour = {
  hour: number;
  minute: number;
  period: "AM" | "PM";
};

export function time24To12(time24: string): Time12Hour {
  const [hourStr, minuteStr] = time24.split(":");
  const hour24 = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr ?? "0", 10);
  const period: "AM" | "PM" = hour24 >= 12 ? "PM" : "AM";
  let hour = hour24 % 12;
  if (hour === 0) hour = 12;
  return { hour, minute, period };
}

export function time12To24(hour12: number, minute: number, period: "AM" | "PM"): string {
  let hour24: number;
  if (period === "AM") {
    hour24 = hour12 === 12 ? 0 : hour12;
  } else {
    hour24 = hour12 === 12 ? 12 : hour12 + 12;
  }
  return `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function formatIndianTimeDisplay(time24: string): string {
  const { hour, minute, period } = time24To12(time24);
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`;
}

export function formatShiftTime(time: string): string {
  const [hourStr, minuteStr] = time.split(":");
  let hour = parseInt(hourStr, 10);
  const minutes = parseInt(minuteStr ?? "0", 10);
  const period = hour >= 12 ? "PM" : "AM";
  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;
  if (minutes === 0) return `${hour} ${period}`;
  return `${hour}:${minuteStr} ${period}`;
}

export function formatShiftRange(startTime: string, endTime: string): string {
  return `${formatShiftTime(startTime)} – ${formatShiftTime(endTime)}`;
}

export function calculateShiftHours(
  startTime: string,
  endTime: string
): number {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  return Math.max(0, (end - start) / 60);
}

export function getWeekStart(date: Date | string): Date {
  const d = typeof date === "string" ? parseISO(date) : date;
  return startOfWeek(d, { weekStartsOn: 1 });
}

export function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

export function formatWeekRange(weekStart: Date): string {
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  return `${format(weekStart, "MMM d")} – ${format(weekEnd, "MMM d, yyyy")}`;
}

export function formatDayHeader(date: Date): { day: string; hours: number } {
  return {
    day: format(date, "EEE"),
    hours: 0,
  };
}

export function toDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function parseDateKey(key: string): Date {
  return parseISO(key);
}

export function isTodayInWeek(weekStart: Date): boolean {
  const today = new Date();
  const weekEnd = addDays(weekStart, 6);
  return today >= weekStart && today <= weekEnd;
}

export { isSameDay, format, addDays };
