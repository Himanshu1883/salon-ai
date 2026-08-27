import type { AttendanceStatus } from "./types";
import { getZonedMinutes } from "./business-day";

export function computeWorkedMinutes(
  checkInAt: Date,
  checkOutAt: Date | null,
  now: Date = new Date()
): number {
  const end = checkOutAt ?? now;
  return Math.max(0, Math.floor((end.getTime() - checkInAt.getTime()) / 60000));
}

export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

export function computeLateMinutes(
  checkInAt: Date,
  scheduledStartTime: string | null | undefined,
  graceMinutes = 5
): number {
  if (!scheduledStartTime) return 0;
  const scheduled = parseTimeToMinutes(scheduledStartTime);
  const actual = getZonedMinutes(checkInAt);
  const diff = actual - scheduled - graceMinutes;
  return diff > 0 ? diff : 0;
}

export function computeEarlyCheckoutMinutes(
  checkOutAt: Date,
  scheduledEndTime: string | null | undefined
): number {
  if (!scheduledEndTime) return 0;
  const scheduled = parseTimeToMinutes(scheduledEndTime);
  const actual = getZonedMinutes(checkOutAt);
  const diff = scheduled - actual;
  return diff > 0 ? diff : 0;
}

export function deriveRecordStatus(input: {
  checkOutAt: Date | null;
  lateMinutes: number;
  correctedAt: Date | null;
  isPastBusinessDay: boolean;
}): AttendanceStatus {
  if (input.correctedAt) return "CORRECTED";
  if (!input.checkOutAt) {
    if (input.isPastBusinessDay) return "MISSED_CHECKOUT";
    return "WORKING";
  }
  if (input.lateMinutes > 0) return "LATE";
  return "COMPLETED";
}

export function formatDuration(minutes: number): string {
  if (minutes <= 0) return "0m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatHoursDecimal(minutes: number): number {
  return Math.round((minutes / 60) * 100) / 100;
}
