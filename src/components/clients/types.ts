import type { CustomerListItem, CustomerSort } from "@/actions/customers";

export type { CustomerListItem, CustomerSort };

export const SORT_OPTIONS: { value: CustomerSort; label: string }[] = [
  { value: "createdAt_desc", label: "Created at (newest first)" },
  { value: "createdAt_asc", label: "Created at (oldest first)" },
  { value: "name_asc", label: "Name (A–Z)" },
  { value: "name_desc", label: "Name (Z–A)" },
];

export type ClientSummaryStats = {
  totalClients: number;
  activeClients: number;
  vipMembers: number;
  newThisMonth: number;
  returningClients: number;
  birthdayToday: number;
  outstandingBalance: number | null;
  lifetimeRevenue: number;
  growthData: { date: string; count: number }[];
};
