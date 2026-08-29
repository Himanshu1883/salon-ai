import { endOfDay, isValid, parseISO, startOfDay } from "date-fns";

export function parseSaleDate(dateStr: string): Date {
  const parsed = parseISO(dateStr);
  if (!isValid(parsed)) {
    return startOfDay(new Date());
  }
  return parsed;
}

export function paidAtFilter(dateFrom?: string, dateTo?: string) {
  const filter: Record<string, Date> = {};
  if (dateFrom) filter.gte = startOfDay(parseSaleDate(dateFrom));
  if (dateTo) filter.lte = endOfDay(parseSaleDate(dateTo));
  return Object.keys(filter).length > 0 ? filter : undefined;
}

export function paidSalesActivityOr(dateFrom?: string, dateTo?: string) {
  const paidAt = paidAtFilter(dateFrom, dateTo);
  if (!paidAt) return undefined;
  return [
    { status: "paid" as const, paidAt },
    { status: "partial" as const, createdAt: paidAt },
  ];
}
