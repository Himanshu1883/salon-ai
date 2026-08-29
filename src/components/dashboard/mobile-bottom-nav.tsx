"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  LayoutDashboard,
  LineChart,
  Menu,
  Clock,
  Receipt,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isEmployeeNavUser } from "@/lib/plans";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard, match: (p: string) => p === "/dashboard" },
  {
    href: "/sales/appointments",
    label: "Bookings",
    icon: CalendarDays,
    match: (p: string) =>
      p.startsWith("/sales/appointments") || p.startsWith("/appointments"),
  },
  {
    href: "/clients",
    label: "Clients",
    icon: Users,
    match: (p: string) => p === "/clients" || /^\/clients\/(?!segments|loyalty)/.test(p),
  },
  {
    href: "/billing",
    label: "Billing",
    icon: Receipt,
    match: (p: string) => p.startsWith("/billing"),
  },
] as const;

const EMPLOYEE_NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard, match: (p: string) => p === "/dashboard" || p.startsWith("/employee/dashboard") },
  {
    href: "/sales/appointments",
    label: "Bookings",
    icon: CalendarDays,
    match: (p: string) =>
      p.startsWith("/sales/appointments") || p.startsWith("/appointments"),
  },
  {
    href: "/attendance",
    label: "Attendance",
    icon: Clock,
    match: (p: string) => p === "/attendance" || p.startsWith("/attendance/"),
  },
  {
    href: "/team/analytics",
    label: "Performance",
    icon: LineChart,
    match: (p: string) =>
      p.startsWith("/team/analytics") || p.startsWith("/employee/analytics"),
  },
] as const;

type MobileBottomNavProps = {
  onOpenMenu: () => void;
  accessBlocked?: boolean;
  userRole?: string;
  isOwner?: boolean;
  roleKey?: string | null;
};

export function MobileBottomNav({
  onOpenMenu,
  accessBlocked = false,
  userRole = "owner",
  isOwner = false,
  roleKey = null,
}: MobileBottomNavProps) {
  const pathname = usePathname();
  const employeeNav = isEmployeeNavUser(userRole, isOwner, roleKey);
  const items = employeeNav ? EMPLOYEE_NAV_ITEMS : NAV_ITEMS;

  if (accessBlocked) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-dashboard-border bg-white/95 backdrop-blur-xl pb-safe lg:hidden"
      aria-label="Primary navigation"
    >
      <div className="mx-auto flex h-16 min-h-[var(--touch-target)] max-w-lg items-stretch justify-around px-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.match(pathname);

          return (
            <Link
              key={item.label}
              href={item.href}
              prefetch={false}
              className={cn(
                "flex min-h-[var(--touch-target)] min-w-[4.5rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 transition-colors",
                active
                  ? "text-dashboard-primary"
                  : "text-dashboard-muted hover:text-dashboard-text"
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={onOpenMenu}
          className="flex min-h-[var(--touch-target)] min-w-[4.5rem] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-dashboard-muted transition-colors hover:text-dashboard-text"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
          <span className="text-[10px] font-medium leading-none">Menu</span>
        </button>
      </div>
    </nav>
  );
}
