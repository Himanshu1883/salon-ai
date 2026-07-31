"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { INVENTORY_NAV } from "@/lib/inventory/constants";
import { Package } from "lucide-react";

export function InventorySubNav() {
  const pathname = usePathname();

  return (
    <div className="rounded-2xl border border-violet-100 bg-white p-2 shadow-sm">
      <div className="mb-2 flex items-center gap-2 px-3 py-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#6C3BFF]/10">
          <Package className="h-4 w-4 text-[#6C3BFF]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-stone-900">Inventory</p>
          <p className="text-xs text-stone-500">Salon stock management</p>
        </div>
      </div>
      <nav className="flex flex-wrap gap-1">
        {INVENTORY_NAV.map((item) => {
          const active =
            "exact" in item && item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-xl px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "bg-[#6C3BFF] text-white shadow-sm"
                  : "text-stone-600 hover:bg-violet-50 hover:text-[#6C3BFF]"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function InventoryPageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-stone-500 sm:text-base">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

export function InventoryStatCard({
  label,
  value,
  sub,
  accent = "violet",
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "violet" | "amber" | "emerald" | "rose";
}) {
  const accents = {
    violet: "from-violet-500/10 to-fuchsia-500/5 border-violet-100",
    amber: "from-amber-500/10 to-orange-500/5 border-amber-100",
    emerald: "from-emerald-500/10 to-teal-500/5 border-emerald-100",
    rose: "from-rose-500/10 to-pink-500/5 border-rose-100",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border bg-gradient-to-br p-5 shadow-sm",
        accents[accent]
      )}
    >
      <p className="text-sm font-medium text-stone-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-stone-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-stone-500">{sub}</p>}
    </div>
  );
}
