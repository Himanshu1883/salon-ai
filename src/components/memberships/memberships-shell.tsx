"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MEMBERSHIP_NAV, MEMBERSHIP_PRIMARY } from "@/lib/memberships/constants";
import { Crown } from "lucide-react";

export function MembershipsSubNav() {
  const pathname = usePathname();

  return (
    <div className="rounded-2xl border border-emerald-100/80 bg-white/80 p-2 shadow-sm backdrop-blur-md dark:border-emerald-900/30 dark:bg-stone-900/80">
      <div className="mb-2 flex items-center gap-2 px-3 py-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${MEMBERSHIP_PRIMARY}18` }}
        >
          <Crown className="h-4 w-4" style={{ color: MEMBERSHIP_PRIMARY }} />
        </div>
        <div>
          <p className="text-sm font-semibold text-stone-900 dark:text-white">
            Memberships
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Glow Desk Loyalty & Rewards
          </p>
        </div>
      </div>
      <nav className="flex flex-wrap gap-1">
        {MEMBERSHIP_NAV.map((item) => {
          const active =
            "exact" in item && item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-xl px-3 py-1.5 text-xs font-medium transition-all",
                active
                  ? "text-white shadow-sm"
                  : "text-stone-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-stone-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300"
              )}
              style={
                active
                  ? { backgroundColor: MEMBERSHIP_PRIMARY }
                  : undefined
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function MembershipPageHeader({
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
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400 sm:text-base">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

export function MembershipStatCard({
  label,
  value,
  sub,
  accent = "green",
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "green" | "gold" | "emerald" | "slate";
}) {
  const accents = {
    green: "from-emerald-500/10 to-green-500/5 border-emerald-100 dark:border-emerald-900/40",
    gold: "from-amber-500/10 to-yellow-500/5 border-amber-100 dark:border-amber-900/40",
    emerald: "from-teal-500/10 to-emerald-500/5 border-teal-100 dark:border-teal-900/40",
    slate: "from-stone-500/10 to-slate-500/5 border-stone-100 dark:border-stone-800",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border bg-gradient-to-br p-5 shadow-sm backdrop-blur-sm transition-transform hover:-translate-y-0.5",
        accents[accent]
      )}
    >
      <p className="text-sm font-medium text-stone-500 dark:text-stone-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-stone-900 dark:text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{sub}</p>}
    </div>
  );
}

export function MembershipComingSoon({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-dashed border-emerald-200/80 bg-gradient-to-br from-emerald-50/50 to-white p-12 text-center dark:border-emerald-900/40 dark:from-emerald-950/20 dark:to-stone-900">
      <div
        className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{ backgroundColor: `${MEMBERSHIP_PRIMARY}15` }}
      >
        <Crown className="h-8 w-8" style={{ color: MEMBERSHIP_PRIMARY }} />
      </div>
      <h2 className="text-xl font-bold text-stone-900 dark:text-white">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-stone-500 dark:text-stone-400">
        {description ??
          "This section is coming soon. We're building premium membership tools for Glow Desk."}
      </p>
      <span
        className="mt-6 inline-flex rounded-full px-4 py-1.5 text-xs font-semibold text-white"
        style={{ backgroundColor: MEMBERSHIP_PRIMARY }}
      >
        Coming Soon
      </span>
    </div>
  );
}
