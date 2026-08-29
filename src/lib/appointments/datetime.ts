import { format } from "date-fns";

/**
 * Appointment times are salon wall-clock stored as UTC.
 *
 * Booking "12:00 PM" is persisted as 12:00 UTC (not 06:30 UTC).
 * That matches existing production rows created on UTC hosts.
 * Display must read UTC hours/minutes so IST browsers do not show 5:30 PM.
 */

const WALL_CLOCK_RE =
  /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?$/;

function hasExplicitTimeZone(value: string): boolean {
  return /[zZ]|[+-]\d{2}:?\d{2}$/.test(value);
}

export function toAppointmentDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

/** Parse a datetime-local string as UTC wall-clock, independent of server TZ. */
export function parseAppointmentDateTime(value: string | Date): Date {
  if (value instanceof Date) return value;

  const trimmed = value.trim();
  if (!trimmed) return new Date(NaN);

  const wall = trimmed.match(WALL_CLOCK_RE);
  if (wall && !hasExplicitTimeZone(trimmed)) {
    return new Date(
      Date.UTC(
        Number(wall[1]),
        Number(wall[2]) - 1,
        Number(wall[3]),
        Number(wall[4]),
        Number(wall[5]),
        Number(wall[6] ?? 0)
      )
    );
  }

  return new Date(trimmed);
}

/**
 * Date-fns `format()` uses the local timezone. Shift the instant so local
 * getters match the stored UTC wall-clock on any host (UTC or IST).
 */
export function asAppointmentWallClock(value: Date | string): Date {
  const date = toAppointmentDate(value);
  return new Date(date.getTime() + date.getTimezoneOffset() * 60_000);
}

export function formatAppointmentDateTime(
  value: Date | string,
  pattern: string
): string {
  return format(asAppointmentWallClock(value), pattern);
}

export function appointmentDateKey(value: Date | string): string {
  const date = toAppointmentDate(value);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function calendarDateKey(day: Date): string {
  return format(day, "yyyy-MM-dd");
}

export function isAppointmentOnCalendarDay(
  scheduledAt: Date | string,
  day: Date
): boolean {
  return appointmentDateKey(scheduledAt) === calendarDateKey(day);
}

export function appointmentClockMinutes(value: Date | string): number {
  const date = toAppointmentDate(value);
  return date.getUTCHours() * 60 + date.getUTCMinutes();
}
