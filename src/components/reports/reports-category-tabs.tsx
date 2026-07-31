"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ReportCategory } from "@/lib/reports-catalog";

export type BiCategoryTab =
  | ReportCategory
  | "all"
  | "memberships"
  | "packages"
  | "marketing"
  | "branches"
  | "custom";

export const BI_CATEGORY_TABS: { id: BiCategoryTab; label: string; href?: string }[] = [
  { id: "all", label: "Dashboard" },
  { id: "sales", label: "Sales" },
  { id: "finance", label: "Finance" },
  { id: "appointments", label: "Appointments" },
  { id: "clients", label: "Customers" },
  { id: "memberships", label: "Memberships" },
  { id: "packages", label: "Packages" },
  { id: "inventory", label: "Inventory" },
  { id: "team", label: "Staff" },
  { id: "marketing", label: "Marketing" },
  { id: "branches", label: "Branches" },
  { id: "custom", label: "Custom Reports", href: "/reports/custom" },
];

type Props = {
  activeTab: BiCategoryTab;
  onTabChange: (tab: BiCategoryTab) => void;
};

export function ReportsCategoryTabs({ activeTab, onTabChange }: Props) {
  return (
    <div className="flex flex-wrap gap-1 rounded-2xl border border-[#E8ECF4] bg-[#F7F8FC] p-1">
      {BI_CATEGORY_TABS.map((tab) => {
        if (tab.href) {
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                "rounded-xl px-3 py-2 text-sm font-medium transition-all",
                "text-[#6B7280] hover:bg-white hover:text-[#6C3BFF]"
              )}
            >
              {tab.label}
            </Link>
          );
        }

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "rounded-xl px-3 py-2 text-sm font-medium transition-all",
              activeTab === tab.id
                ? "bg-white text-[#6C3BFF] shadow-sm"
                : "text-[#6B7280] hover:bg-white/60 hover:text-[#374151]"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export function filterReportsByTab<T extends { slug: string; category: ReportCategory }>(
  reports: T[],
  tab: BiCategoryTab
): T[] {
  switch (tab) {
    case "all":
      return reports;
    case "memberships":
      return reports.filter((r) => r.slug.includes("membership"));
    case "packages":
      return reports.filter((r) => r.slug.includes("package"));
    case "marketing":
    case "branches":
      return [];
    case "custom":
      return [];
    default:
      return reports.filter((r) => r.category === tab);
  }
}

export function mapTabToUrlCategory(tab: BiCategoryTab): ReportCategory | "all" {
  if (
    tab === "memberships" ||
    tab === "packages" ||
    tab === "marketing" ||
    tab === "branches" ||
    tab === "custom"
  ) {
    return "all";
  }
  return tab;
}
