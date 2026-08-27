import { getAdminStatsForPage } from "@/actions/platform-admin";
import Link from "next/link";
import { PlatformPlansOverview } from "@/components/admin/platform-plans-overview";
import { AdminCard, AdminCardContent, AdminCardHeader } from "@/components/admin/admin-card";
import {
  Building2,
  CalendarPlus,
  CreditCard,
  AlertTriangle,
  Users,
  ArrowRight,
  LayoutDashboard,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const STAT_CARDS: {
  title: string;
  key:
    | "totalSalons"
    | "onTrial"
    | "activeMonthly"
    | "pastDueOrSuspended"
    | "signedUpThisMonth";
  icon: LucideIcon;
  description: string;
  accent: string;
  iconBg: string;
  href?: string;
}[] = [
  {
    title: "Total Salons",
    key: "totalSalons",
    icon: Building2,
    description: "Signed up on platform",
    accent: "text-violet-600",
    iconBg: "bg-violet-100",
    href: "/admin/salons",
  },
  {
    title: "On Trial",
    key: "onTrial",
    icon: Users,
    description: "14-day trial period",
    accent: "text-blue-600",
    iconBg: "bg-blue-100",
    href: "/admin/salons?status=trial",
  },
  {
    title: "Active Monthly",
    key: "activeMonthly",
    icon: CreditCard,
    description: "Paying subscribers",
    accent: "text-emerald-600",
    iconBg: "bg-emerald-100",
    href: "/admin/salons?status=active",
  },
  {
    title: "Past Due / Suspended",
    key: "pastDueOrSuspended",
    icon: AlertTriangle,
    description: "Needs attention",
    accent: "text-amber-600",
    iconBg: "bg-amber-100",
    href: "/admin/salons?status=past_due",
  },
  {
    title: "Signed Up This Month",
    key: "signedUpThisMonth",
    icon: CalendarPlus,
    description: "New salons",
    accent: "text-rose-600",
    iconBg: "bg-rose-100",
  },
];

export async function AdminDashboardStats() {
  const stats = await getAdminStatsForPage();

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {STAT_CARDS.map(({ title, key, icon: Icon, description, accent, iconBg, href }) => {
          const value = stats[key];
          const content = (
            <AdminCard
              className={cn(
                "transition-all",
                href && "group cursor-pointer hover:border-dashboard-primary/30 hover:shadow-lg"
              )}
            >
              <AdminCardContent className="py-5">
                <div className="flex items-start justify-between">
                  <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", iconBg)}>
                    <Icon className={cn("h-5 w-5", accent)} />
                  </div>
                  {href && (
                    <ArrowRight className="h-4 w-4 text-dashboard-muted opacity-0 transition group-hover:opacity-100 group-hover:translate-x-0.5" />
                  )}
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-dashboard-muted">
                  {title}
                </p>
                <p className={cn("mt-1 text-3xl font-bold tabular-nums", accent)}>{value}</p>
                <p className="mt-1 text-xs text-dashboard-muted">{description}</p>
              </AdminCardContent>
            </AdminCard>
          );

          return href ? (
            <Link key={title} href={href} className="block">
              {content}
            </Link>
          ) : (
            <div key={title}>{content}</div>
          );
        })}
      </div>

      <PlatformPlansOverview />
    </>
  );
}
