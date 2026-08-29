import { parseISO, startOfDay } from "date-fns";

/** Default business timezone for Indian salons; override via SALON_TIMEZONE env. */
export const DEFAULT_SALON_TIMEZONE =
  process.env.SALON_TIMEZONE?.trim() || "Asia/Kolkata";

/** yyyy-MM-dd in salon business timezone. */
export function getBusinessDateKey(
  now: Date = new Date(),
  timeZone: string = DEFAULT_SALON_TIMEZONE
): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Stored attendance `date` column — start of calendar day (consistent with existing records). */
export function businessDateFromKey(dateKey: string): Date {
  return startOfDay(parseISO(dateKey));
}

export function parseBusinessDateKey(dateStr: string): Date {
  return businessDateFromKey(dateStr);
}

/** Minutes since midnight in business timezone. */
export function getZonedMinutes(
  date: Date,
  timeZone: string = DEFAULT_SALON_TIMEZONE
): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}

export function formatZonedTime(
  date: Date,
  timeZone: string = DEFAULT_SALON_TIMEZONE
): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function timezoneOffsetMinutes(date: Date, timeZone: string): number {
  const label =
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "longOffset",
    })
      .formatToParts(date)
      .find((part) => part.type === "timeZoneName")?.value ?? "GMT+00:00";
  const match = label.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/i);
  if (!match) return 0;
  const sign = match[1] === "-" ? -1 : 1;
  const hours = Number(match[2] ?? 0);
  const minutes = Number(match[3] ?? 0);
  return sign * (hours * 60 + minutes);
}

/** Inclusive start / exclusive-aware end of a salon calendar day as UTC instants. */
export function salonDayBounds(
  dateKey: string,
  timeZone: string = DEFAULT_SALON_TIMEZONE
): { start: Date; end: Date } {
  const [year, month, day] = dateKey.split("-").map(Number);
  const utcMidnight = Date.UTC(year, (month ?? 1) - 1, day ?? 1, 0, 0, 0, 0);
  const guess = new Date(utcMidnight);
  const start = new Date(
    utcMidnight - timezoneOffsetMinutes(guess, timeZone) * 60_000
  );
  const adjusted = new Date(
    utcMidnight - timezoneOffsetMinutes(start, timeZone) * 60_000
  );
  return {
    start: adjusted,
    end: new Date(adjusted.getTime() + 24 * 60 * 60 * 1000 - 1),
  };
}

export function currentSalonDayBounds(
  now: Date = new Date(),
  timeZone: string = DEFAULT_SALON_TIMEZONE
) {
  return salonDayBounds(getBusinessDateKey(now, timeZone), timeZone);
}
