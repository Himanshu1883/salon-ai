import {
  addDays,
  format,
  getDay,
  setHours,
  setMinutes,
  startOfDay,
} from "date-fns";
import {
  DEFAULT_OPENING_HOURS,
  DAYS_OF_WEEK,
  type DayHours,
  type DayKey,
  type OpeningHours,
} from "@/lib/onboarding";
import { SLOT_HEIGHT_PX, SLOT_MINUTES } from "@/components/appointments/types";

const DAY_KEYS: DayKey[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export function parseOpeningHours(raw: string | null | undefined): OpeningHours {
  if (!raw) return DEFAULT_OPENING_HOURS;

  try {
    const parsed = JSON.parse(raw) as Partial<OpeningHours>;
    return {
      ...DEFAULT_OPENING_HOURS,
      ...parsed,
    };
  } catch {
    return DEFAULT_OPENING_HOURS;
  }
}

export function dayKeyFromDate(date: Date): DayKey {
  return DAY_KEYS[getDay(date)];
}

export function parseTimeToMinutes(time: string): number {
  const [hours, minutes = "0"] = time.split(":");
  return Number(hours) * 60 + Number(minutes);
}

export function formatSalonTime(time: string): string {
  const [hours, minutes = "0"] = time.split(":");
  const sample = setMinutes(
    setHours(new Date(), Number(hours)),
    Number(minutes)
  );
  return format(sample, "h:mm a");
}

export function getDayHours(openingHours: OpeningHours, date: Date): DayHours {
  return openingHours[dayKeyFromDate(date)];
}

export type DayHoursRange = {
  closed: boolean;
  openMinutes: number;
  closeMinutes: number;
};

export function getDayHoursRange(
  openingHours: OpeningHours,
  date: Date
): DayHoursRange {
  const dayHours = getDayHours(openingHours, date);
  if (dayHours.closed) {
    return { closed: true, openMinutes: 0, closeMinutes: 0 };
  }

  return {
    closed: false,
    openMinutes: parseTimeToMinutes(dayHours.open),
    closeMinutes: parseTimeToMinutes(dayHours.close),
  };
}

export function getCalendarBounds(openingHours: OpeningHours): {
  startHour: number;
  endHour: number;
} {
  let minOpen = Number.POSITIVE_INFINITY;
  let maxClose = 0;
  let hasOpenDay = false;

  for (const day of DAYS_OF_WEEK) {
    const hours = openingHours[day.key];
    if (hours.closed) continue;
    hasOpenDay = true;
    minOpen = Math.min(minOpen, parseTimeToMinutes(hours.open));
    maxClose = Math.max(maxClose, parseTimeToMinutes(hours.close));
  }

  if (!hasOpenDay || minOpen >= maxClose) {
    return { startHour: 8, endHour: 21 };
  }

  return {
    startHour: Math.floor(minOpen / 60),
    endHour: Math.ceil(maxClose / 60),
  };
}

export function findNextOpenDate(
  openingHours: OpeningHours,
  from: Date
): Date {
  let day = startOfDay(from);

  for (let i = 0; i < 14; i++) {
    const hours = getDayHours(openingHours, day);
    if (!hours.closed) return day;
    day = addDays(day, 1);
  }

  return addDays(startOfDay(from), 1);
}

export function getNextOpenDateTime(
  openingHours: OpeningHours,
  from: Date
): Date {
  const day = findNextOpenDate(openingHours, from);
  const hours = getDayHours(openingHours, day);
  const [openHour, openMinute = 0] = hours.open.split(":").map(Number);
  return setMinutes(setHours(day, openHour), openMinute);
}

export type SalonHoursValidation =
  | { ok: true }
  | { ok: false; error: string; suggestNextDate?: Date };

export function validateAppointmentAgainstSalonHours(
  openingHours: OpeningHours,
  scheduledAt: Date,
  durationMinutes: number
): SalonHoursValidation {
  if (Number.isNaN(scheduledAt.getTime())) {
    return { ok: false, error: "Choose a valid date and time." };
  }

  const dayHours = getDayHours(openingHours, scheduledAt);

  if (dayHours.closed) {
    const nextDate = findNextOpenDate(
      openingHours,
      addDays(startOfDay(scheduledAt), 1)
    );
    return {
      ok: false,
      error: `Salon is closed on ${format(scheduledAt, "EEEE")}. Please choose the next available date (${format(nextDate, "EEEE, MMM d")}).`,
      suggestNextDate: nextDate,
    };
  }

  const openMinutes = parseTimeToMinutes(dayHours.open);
  const closeMinutes = parseTimeToMinutes(dayHours.close);
  const startMinutes =
    scheduledAt.getHours() * 60 + scheduledAt.getMinutes();
  const endMinutes = startMinutes + durationMinutes;
  const closeLabel = formatSalonTime(dayHours.close);

  if (startMinutes < openMinutes) {
    return {
      ok: false,
      error: `Salon opens at ${formatSalonTime(dayHours.open)}. Please choose a later time.`,
    };
  }

  if (startMinutes >= closeMinutes) {
    const nextDate = findNextOpenDate(
      openingHours,
      addDays(startOfDay(scheduledAt), 1)
    );
    return {
      ok: false,
      error: `Salon closes at ${closeLabel}. Appointments cannot start at or after closing. Please choose the next available date (${format(nextDate, "EEEE, MMM d")}).`,
      suggestNextDate: nextDate,
    };
  }

  if (endMinutes > closeMinutes) {
    const latestStartMinutes = closeMinutes - durationMinutes;
    const nextDate = findNextOpenDate(
      openingHours,
      addDays(startOfDay(scheduledAt), 1)
    );

    if (latestStartMinutes < openMinutes) {
      return {
        ok: false,
        error: `This service cannot finish before closing at ${closeLabel} on ${format(scheduledAt, "EEEE")}. Please choose the next available date (${format(nextDate, "EEEE, MMM d")}).`,
        suggestNextDate: nextDate,
      };
    }

    const latestStart = setMinutes(
      setHours(startOfDay(scheduledAt), Math.floor(latestStartMinutes / 60)),
      latestStartMinutes % 60
    );

    return {
      ok: false,
      error: `Appointment would end after closing (${closeLabel}). Latest start today is ${format(latestStart, "h:mm a")}, or choose the next available date (${format(nextDate, "EEEE, MMM d")}).`,
      suggestNextDate: nextDate,
    };
  }

  return { ok: true };
}

export function isSlotWithinSalonHours(
  openingHours: OpeningHours,
  day: Date,
  hour: number,
  minute: number
): boolean {
  const range = getDayHoursRange(openingHours, day);
  if (range.closed) return false;

  const slotMinutes = hour * 60 + minute;
  return (
    slotMinutes >= range.openMinutes && slotMinutes < range.closeMinutes
  );
}

export function clipAppointmentToDayHours(
  openingHours: OpeningHours,
  scheduledAt: Date,
  durationMinutes: number,
  calendarStartHour: number,
  calendarEndHour: number
): { top: number; height: number; hidden: boolean } | null {
  const range = getDayHoursRange(openingHours, scheduledAt);
  if (range.closed) return null;

  const startMinutes =
    scheduledAt.getHours() * 60 + scheduledAt.getMinutes();
  const endMinutes = startMinutes + durationMinutes;
  const gridStartMinutes = calendarStartHour * 60;
  const gridEndMinutes = calendarEndHour * 60;

  const visibleStart = Math.max(
    startMinutes,
    range.openMinutes,
    gridStartMinutes
  );
  const visibleEnd = Math.min(endMinutes, range.closeMinutes, gridEndMinutes);

  if (visibleEnd <= visibleStart) {
    return { top: 0, height: 0, hidden: true };
  }

  const top =
    ((visibleStart - gridStartMinutes) / SLOT_MINUTES) * SLOT_HEIGHT_PX;
  const height = Math.max(
    ((visibleEnd - visibleStart) / SLOT_MINUTES) * SLOT_HEIGHT_PX,
    0
  );

  return { top, height, hidden: false };
}

export function clipIntervalToDayHours(
  openingHours: OpeningHours,
  day: Date,
  startMs: number,
  endMs: number,
  calendarStartHour: number,
  calendarEndHour: number
): { top: number; height: number; hidden: boolean } | null {
  const range = getDayHoursRange(openingHours, day);
  if (range.closed) return null;

  const dayStart = startOfDay(day);
  const startDate = new Date(startMs);
  const endDate = new Date(endMs);
  const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
  const endMinutes = endDate.getHours() * 60 + endDate.getMinutes();
  const gridStartMinutes = calendarStartHour * 60;
  const gridEndMinutes = calendarEndHour * 60;

  const visibleStart = Math.max(
    startMinutes,
    range.openMinutes,
    gridStartMinutes
  );
  const visibleEnd = Math.min(endMinutes, range.closeMinutes, gridEndMinutes);

  if (visibleEnd <= visibleStart) {
    return { top: 0, height: 0, hidden: true };
  }

  const top =
    ((visibleStart - gridStartMinutes) / SLOT_MINUTES) * SLOT_HEIGHT_PX;
  const height = Math.max(
    ((visibleEnd - visibleStart) / SLOT_MINUTES) * SLOT_HEIGHT_PX,
    0
  );

  return { top, height, hidden: false };
}
