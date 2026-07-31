import {
  format,
  isSameMonth,
  isToday,
  startOfDay,
  subDays,
} from "date-fns";
import type { CustomerListItem } from "@/actions/customers";
import type { ClientSummaryStats } from "./types";

const ACTIVE_DAYS = 90;
const VIP_LOYALTY_THRESHOLD = 500;
const VIP_SPEND_THRESHOLD = 10000;

export function computeClientStats(
  customers: CustomerListItem[],
  totalCount: number
): ClientSummaryStats {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const activeClients = customers.filter((c) => {
    if (!c.lastVisit) return false;
    const daysSince =
      (now.getTime() - new Date(c.lastVisit).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= ACTIVE_DAYS;
  }).length;

  const vipMembers = customers.filter(
    (c) =>
      c.loyaltyPoints >= VIP_LOYALTY_THRESHOLD ||
      c.totalSales >= VIP_SPEND_THRESHOLD
  ).length;

  const newThisMonth = customers.filter((c) =>
    isSameMonth(new Date(c.createdAt), now)
  ).length;

  const returningClients = customers.filter((c) => c.visitCount > 1).length;

  const lifetimeRevenue = customers.reduce((sum, c) => sum + c.totalSales, 0);

  const growthData = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(now, 6 - i);
    const dayStart = startOfDay(day);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);
    const count = customers.filter((c) => {
      const created = new Date(c.createdAt);
      return created >= dayStart && created <= dayEnd;
    }).length;
    return { date: format(day, "d MMM"), count };
  });

  return {
    totalClients: totalCount,
    activeClients,
    vipMembers,
    newThisMonth,
    returningClients,
    birthdayToday: 0,
    outstandingBalance: null,
    lifetimeRevenue,
    growthData,
  };
}

export function getClientStatus(customer: CustomerListItem): {
  label: string;
  variant: "new" | "active" | "inactive" | "vip";
} {
  if (customer.visitCount === 0) {
    return { label: "New", variant: "new" };
  }
  if (
    customer.loyaltyPoints >= VIP_LOYALTY_THRESHOLD ||
    customer.totalSales >= VIP_SPEND_THRESHOLD
  ) {
    return { label: "VIP", variant: "vip" };
  }
  if (customer.lastVisit) {
    const daysSince =
      (Date.now() - new Date(customer.lastVisit).getTime()) /
      (1000 * 60 * 60 * 24);
    if (daysSince <= ACTIVE_DAYS) {
      return { label: "Active", variant: "active" };
    }
  }
  return { label: "Inactive", variant: "inactive" };
}

export function formatLastVisit(lastVisit: Date | null): string {
  if (!lastVisit) return "—";
  const date = new Date(lastVisit);
  if (isToday(date)) return "Today";
  const days = Math.floor(
    (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "1 week ago";
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return format(date, "d MMM yyyy");
}

export function computeAvgTicket(customer: CustomerListItem): number | null {
  if (customer.visitCount === 0 || customer.totalSales === 0) return null;
  return Math.round(customer.totalSales / customer.visitCount);
}

export function getTopSpenders(
  customers: CustomerListItem[],
  limit = 5
): CustomerListItem[] {
  return [...customers]
    .sort((a, b) => b.totalSales - a.totalSales)
    .slice(0, limit);
}

export function getRecentlyAdded(
  customers: CustomerListItem[],
  limit = 5
): CustomerListItem[] {
  return [...customers]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, limit);
}

export function getInactiveClients(
  customers: CustomerListItem[],
  limit = 5
): CustomerListItem[] {
  return customers
    .filter((c) => getClientStatus(c).variant === "inactive")
    .slice(0, limit);
}
