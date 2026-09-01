import { addDays, endOfDay } from "date-fns";
import { getBusinessDateKey } from "@/lib/attendance/business-day";

function utcDayStart(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1, 0, 0, 0, 0));
}

function utcDayEnd(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1, 23, 59, 59, 999));
}

/** Calendar date at local midnight so the grid is not shifted by UTC parsing. */
export function dateFromKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function addDaysToKey(dateKey: string, days: number) {
  const date = utcDayStart(dateKey);
  date.setUTCDate(date.getUTCDate() + days);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Default and past URLs snap to today so last week is not shown. */
export function resolveAppointmentsRangeStart(
  weekStartParam: string | undefined,
  now = new Date()
) {
  const todayKey = getBusinessDateKey(now);
  if (!weekStartParam || weekStartParam < todayKey) return todayKey;
  return weekStartParam;
}

export function getAppointmentsPageWindows(
  weekStartIso: string,
  now = new Date()
) {
  const rangeStartKey = resolveAppointmentsRangeStart(weekStartIso, now);
  const rangeEndKey = addDaysToKey(rangeStartKey, 6);
  const weekStart = utcDayStart(rangeStartKey);
  const weekEnd = utcDayEnd(rangeEndKey);
  const todayKey = getBusinessDateKey(now);
  const todayStart = utcDayStart(todayKey);
  const todayEnd = utcDayEnd(todayKey);
  const tomorrowStart = addDays(todayStart, 1);
  const upcomingEnd = endOfDay(addDays(now, 30));
  const upcomingStart =
    weekStart.getTime() > tomorrowStart.getTime() ? weekStart : tomorrowStart;

  return {
    weekStart,
    weekEnd,
    todayKey,
    todayStart,
    todayEnd,
    upcomingStart,
    upcomingEnd,
    includeToday: rangeStartKey <= todayKey && todayKey <= rangeEndKey,
  };
}
