"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  AlertTriangle,
  Package,
  FileText,
  CreditCard,
  Clock,
} from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

type AlertsWidgetProps = {
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
  delay?: number;
};

type AlertItem = {
  id: string;
  severity: "critical" | "warning" | "info";
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  action: string;
};

export function AlertsWidget({
  lowStockCount,
  unpaidInvoices,
  pendingSms,
  trialEndingSoon,
  trialEndsAt,
  overduePlatformInvoice,
  delay = 0,
}: AlertsWidgetProps) {
  const alerts: AlertItem[] = [];

  if (overduePlatformInvoice) {
    alerts.push({
      id: "subscription",
      severity: "critical",
      icon: <CreditCard className="h-4 w-4" />,
      title: "Subscription payment overdue",
      description: `${formatCurrency(overduePlatformInvoice.total)} due ${format(new Date(overduePlatformInvoice.dueDate), "MMM d")}`,
      href: "/invoice-due",
      action: "Pay now",
    });
  }

  if (trialEndingSoon && trialEndsAt) {
    alerts.push({
      id: "trial",
      severity: "warning",
      icon: <Clock className="h-4 w-4" />,
      title: "Trial ending soon",
      description: `Your trial ends ${format(new Date(trialEndsAt), "MMM d, yyyy")}`,
      href: "/settings/billing",
      action: "View plan",
    });
  }

  if (lowStockCount > 0) {
    alerts.push({
      id: "stock",
      severity: "warning",
      icon: <Package className="h-4 w-4" />,
      title: `${lowStockCount} low stock item${lowStockCount !== 1 ? "s" : ""}`,
      description: "Inventory below minimum threshold",
      href: "/inventory/stock",
      action: "View",
    });
  }

  if (unpaidInvoices > 0) {
    alerts.push({
      id: "invoices",
      severity: "info",
      icon: <FileText className="h-4 w-4" />,
      title: `${unpaidInvoices} pending invoice${unpaidInvoices !== 1 ? "s" : ""}`,
      description: "Awaiting payment",
      href: "/billing",
      action: "View",
    });
  }

  if (pendingSms > 0) {
    alerts.push({
      id: "sms",
      severity: "info",
      icon: <AlertTriangle className="h-4 w-4" />,
      title: `${pendingSms} SMS reminder${pendingSms !== 1 ? "s" : ""} pending`,
      description: "Appointment reminders to be sent",
      href: "/settings/notifications",
      action: "Manage",
    });
  }

  return (
    <DashboardCard delay={delay} className="flex h-full flex-col">
      <div className="px-3 pt-3 pb-1.5">
        <h3 className="text-sm font-semibold text-dashboard-text">Alerts</h3>
      </div>

      <div className="h-[15.5rem] overflow-y-auto overscroll-contain px-3 pb-3">
        {alerts.length === 0 ? (
          <div className="flex h-full items-center gap-2 rounded-xl bg-emerald-50 px-2.5 py-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-600">
              ✓
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-900">All clear</p>
              <p className="text-[11px] text-emerald-700">No urgent items right now</p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {alerts.map((alert) => (
              <Link
                key={alert.id}
                href={alert.href}
                className={cn(
                  "flex items-start gap-2 rounded-xl border p-2 transition-colors hover:bg-dashboard-bg/60",
                  alert.severity === "critical"
                    ? "border-red-200 bg-red-50/50"
                    : alert.severity === "warning"
                      ? "border-amber-200 bg-amber-50/50"
                      : "border-dashboard-border bg-dashboard-bg/40"
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                    alert.severity === "critical"
                      ? "bg-red-100 text-red-600"
                      : alert.severity === "warning"
                        ? "bg-amber-100 text-amber-600"
                        : "bg-dashboard-border text-dashboard-muted"
                  )}
                >
                  {alert.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-dashboard-text">{alert.title}</p>
                  <p className="mt-0.5 text-[11px] text-dashboard-muted">{alert.description}</p>
                  <span className="mt-1 inline-block text-[11px] font-medium text-dashboard-primary">
                    {alert.action} →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardCard>
  );
}
