import Link from "next/link";
import { format } from "date-fns";
import {
  AlertTriangle,
  Package,
  FileText,
  CreditCard,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";
import type { TeamMemberStatus } from "@/actions/dashboard";
import { cn } from "@/lib/utils";

type DashboardAlertsProps = {
  lowStockCount: number;
  unpaidInvoices: number;
  pendingSms: number;
  trialEndingSoon: boolean;
  trialEndsAt: Date | null;
  overduePlatformInvoice: {
    id: string;
    total: number;
    dueDate: Date;
  } | null;
};

type DashboardTeamStatusProps = {
  team: TeamMemberStatus[];
};

const statusConfig = {
  on_shift: { label: "On Shift", variant: "success" as const },
  busy: { label: "With client", variant: "warning" as const },
  available: { label: "Available", variant: "secondary" as const },
};

export function DashboardTeamStatus({ team }: DashboardTeamStatusProps) {
  return (
    <Card className="rounded-xl border-zinc-100 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold text-zinc-900">
          Team Status
        </CardTitle>
        <Link
          href="/team/shifts"
          className="text-sm font-medium text-violet-600 hover:text-violet-700"
        >
          Shifts
        </Link>
      </CardHeader>
      <CardContent>
        {team.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-200 py-8 text-center">
            <p className="text-sm font-medium text-zinc-700">No team scheduled</p>
            <p className="mt-1 text-xs text-zinc-500">
              Add team members and set shifts
            </p>
            <Link
              href="/team/members"
              className="mt-3 inline-block text-sm font-medium text-violet-600 hover:text-violet-700"
            >
              Manage team →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {team.map((member) => {
              const config = statusConfig[member.status];
              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-zinc-100 px-3 py-2.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 text-sm font-semibold text-white">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-900">
                        {member.name}
                      </p>
                      <p className="truncate text-xs capitalize text-zinc-500">
                        {member.role}
                        {member.startTime && member.endTime
                          ? ` · ${member.startTime} - ${member.endTime}`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <Badge variant={config.variant}>{config.label}</Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

type AlertItem = {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  href: string;
  action: string;
};

export function DashboardAlerts({
  lowStockCount,
  unpaidInvoices,
  pendingSms,
  trialEndingSoon,
  trialEndsAt,
  overduePlatformInvoice,
}: DashboardAlertsProps) {
  const alerts: AlertItem[] = [];

  if (overduePlatformInvoice) {
    alerts.push({
      id: "subscription",
      icon: <CreditCard className="h-4 w-4" />,
      iconBg: "bg-red-100 text-red-600",
      title: "Subscription payment overdue",
      description: `${formatCurrency(overduePlatformInvoice.total)} due ${format(new Date(overduePlatformInvoice.dueDate), "MMM d")}`,
      href: "/invoice-due",
      action: "Pay now",
    });
  }

  if (trialEndingSoon && trialEndsAt) {
    alerts.push({
      id: "trial",
      icon: <Clock className="h-4 w-4" />,
      iconBg: "bg-amber-100 text-amber-600",
      title: "Trial ending soon",
      description: `Your trial ends ${format(new Date(trialEndsAt), "MMM d, yyyy")}`,
      href: "/settings/billing",
      action: "View plan",
    });
  }

  if (lowStockCount > 0) {
    alerts.push({
      id: "stock",
      icon: <Package className="h-4 w-4" />,
      iconBg: "bg-amber-100 text-amber-700",
      title: `${lowStockCount} low stock item${lowStockCount !== 1 ? "s" : ""}`,
      description: "Inventory below minimum threshold",
      href: "/inventory/stock",
      action: "View stock",
    });
  }

  if (unpaidInvoices > 0) {
    alerts.push({
      id: "invoices",
      icon: <FileText className="h-4 w-4" />,
      iconBg: "bg-zinc-200 text-zinc-600",
      title: `${unpaidInvoices} pending invoice${unpaidInvoices !== 1 ? "s" : ""}`,
      description: "Customer invoices awaiting payment",
      href: "/billing",
      action: "View billing",
    });
  }

  if (pendingSms > 0) {
    alerts.push({
      id: "sms",
      icon: <AlertTriangle className="h-4 w-4" />,
      iconBg: "bg-sky-100 text-sky-600",
      title: `${pendingSms} SMS reminder${pendingSms !== 1 ? "s" : ""} pending`,
      description: "Appointment reminders to be sent",
      href: "/settings/notifications",
      action: "Manage",
    });
  }

  return (
    <Card className="rounded-xl border-zinc-100 bg-white shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-zinc-900">Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              ✓
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-900">All clear</p>
              <p className="text-xs text-emerald-700">No urgent items right now</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <Link
                key={alert.id}
                href={alert.href}
                className="flex items-start gap-3 rounded-xl border border-zinc-100 bg-white p-4 shadow-sm transition-colors hover:bg-zinc-50/80"
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    alert.iconBg
                  )}
                >
                  {alert.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-900">{alert.title}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">{alert.description}</p>
                  <span className="mt-2 inline-block text-xs font-medium text-violet-600">
                    {alert.action} →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
