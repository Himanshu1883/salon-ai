import {
  addDays,
  addMonths,
  addYears,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";

export type AnalyticsPeriod =
  | "today"
  | "yesterday"
  | "this_week"
  | "last_week"
  | "this_month"
  | "last_month"
  | "last_3_months"
  | "last_6_months"
  | "this_year"
  | "custom";

export type AnalyticsDateRange = {
  period: AnalyticsPeriod;
  from: Date;
  to: Date;
  prevFrom: Date;
  prevTo: Date;
  label: string;
};

export const ANALYTICS_PERIOD_OPTIONS: {
  value: AnalyticsPeriod;
  label: string;
}[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "this_week", label: "This Week" },
  { value: "last_week", label: "Last Week" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "last_3_months", label: "Last 3 Months" },
  { value: "last_6_months", label: "Last 6 Months" },
  { value: "this_year", label: "This Year" },
  { value: "custom", label: "Custom Range" },
];

function previousRange(from: Date, to: Date) {
  const durationMs = to.getTime() - from.getTime();
  const prevTo = new Date(from.getTime() - 1);
  const prevFrom = new Date(prevTo.getTime() - durationMs);
  return { prevFrom: startOfDay(prevFrom), prevTo: endOfDay(prevTo) };
}

export function resolveAnalyticsDateRange(
  period: AnalyticsPeriod,
  customFrom?: string,
  customTo?: string,
  now = new Date()
): AnalyticsDateRange {
  let from: Date;
  let to: Date;
  let label: string;

  switch (period) {
    case "today":
      from = startOfDay(now);
      to = endOfDay(now);
      label = format(now, "MMM d, yyyy");
      break;
    case "yesterday": {
      const day = subDays(now, 1);
      from = startOfDay(day);
      to = endOfDay(day);
      label = `Yesterday · ${format(day, "MMM d, yyyy")}`;
      break;
    }
    case "this_week":
      from = startOfWeek(now, { weekStartsOn: 1 });
      to = endOfWeek(now, { weekStartsOn: 1 });
      label = `This week · ${format(from, "MMM d")} – ${format(to, "MMM d")}`;
      break;
    case "last_week": {
      const lastWeek = subWeeks(now, 1);
      from = startOfWeek(lastWeek, { weekStartsOn: 1 });
      to = endOfWeek(lastWeek, { weekStartsOn: 1 });
      label = `Last week · ${format(from, "MMM d")} – ${format(to, "MMM d")}`;
      break;
    }
    case "this_month":
      from = startOfMonth(now);
      to = endOfMonth(now);
      label = format(now, "MMMM yyyy");
      break;
    case "last_month": {
      const lastMonth = subMonths(now, 1);
      from = startOfMonth(lastMonth);
      to = endOfMonth(lastMonth);
      label = format(lastMonth, "MMMM yyyy");
      break;
    }
    case "last_3_months":
      from = startOfMonth(subMonths(now, 2));
      to = endOfMonth(now);
      label = "Last 3 months";
      break;
    case "last_6_months":
      from = startOfMonth(subMonths(now, 5));
      to = endOfMonth(now);
      label = "Last 6 months";
      break;
    case "this_year":
      from = startOfYear(now);
      to = endOfYear(now);
      label = format(now, "yyyy");
      break;
    case "custom":
    default: {
      const parsedFrom = customFrom ? startOfDay(new Date(customFrom)) : startOfMonth(now);
      const parsedTo = customTo ? endOfDay(new Date(customTo)) : endOfMonth(now);
      from = parsedFrom;
      to = parsedTo > parsedFrom ? parsedTo : endOfDay(parsedFrom);
      label = `${format(from, "MMM d, yyyy")} – ${format(to, "MMM d, yyyy")}`;
      break;
    }
  }

  const { prevFrom, prevTo } = previousRange(from, to);
  return { period, from, to, prevFrom, prevTo, label };
}

export function growthPercent(current: number, previous: number): number | null {
  if (previous <= 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}
