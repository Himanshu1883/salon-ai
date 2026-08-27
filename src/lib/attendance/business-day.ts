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
