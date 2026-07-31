"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderPlus, Link2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { getReportCounts } from "@/lib/reports-catalog";
import { Button } from "@/components/ui/button";

type SidebarItem = {
  href: string;
  label: string;
  count?: number;
};

export function ReportsSidebar({ favoriteCount }: { favoriteCount: number }) {
  const pathname = usePathname();
  const counts = getReportCounts();

  const items: SidebarItem[] = [
    { href: "/reports", label: "All reports", count: counts.total },
    { href: "/reports/favourites", label: "Favourites", count: favoriteCount },
    { href: "/reports/dashboards", label: "Dashboards", count: counts.dashboards },
    { href: "/reports/standard", label: "Standard", count: counts.standard },
    { href: "/reports/premium", label: "Premium", count: counts.premium },
    { href: "/reports/custom", label: "Custom", count: counts.custom },
  ];

  function isActive(href: string) {
    if (href === "/reports") return pathname === "/reports";
    return pathname.startsWith(href);
  }

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-stone-200 bg-stone-50">
      <div className="flex-1 space-y-1 p-4">
        <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
          Reports
        </p>
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive(item.href)
                ? "bg-violet-100 text-violet-800"
                : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
            )}
          >
            <span>{item.label}</span>
            {item.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs tabular-nums",
                  isActive(item.href)
                    ? "bg-violet-200 text-violet-800"
                    : "bg-stone-200 text-stone-600"
                )}
              >
                {item.count}
              </span>
            )}
          </Link>
        ))}

        <div className="mt-6 border-t border-stone-200 pt-4">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-stone-400">
            Folders
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-stone-500"
            disabled
          >
            <FolderPlus className="h-4 w-4" />
            Add folder
          </Button>
        </div>
      </div>

      <div className="border-t border-stone-200 p-4">
        <button
          type="button"
          disabled
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-stone-400"
        >
          <Link2 className="h-4 w-4" />
          Data connector
        </button>
      </div>
    </aside>
  );
}

export function ReportsAddButton() {
  return (
    <Button variant="outline" size="sm" disabled className="gap-1">
      <Plus className="h-4 w-4" />
      Add
    </Button>
  );
}
