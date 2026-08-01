"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Building2,
  Calendar,
  Clock,
  CreditCard,
  Crown,
  FileText,
  Mail,
  MapPin,
  Phone,
  Receipt,
  Scissors,
  ShieldAlert,
  Sparkles,
  User,
  Users,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  SubscriptionStatusBadge,
  PlatformInvoiceStatusBadge,
} from "@/components/admin/subscription-status-badge";
import {
  updateSalonSubscription,
  type SalonSubscriptionAction,
} from "@/actions/platform-admin";
import { updateSalonPlanAsAdmin } from "@/actions/plans";
import { SalonPlanBadge } from "@/components/admin/salon-plan-badge";
import { SalonLoginUrl } from "@/components/admin/salon-login-url";
import { AdminCard, AdminCardContent, AdminCardHeader } from "@/components/admin/admin-card";
import { SalonAccessActions } from "@/components/admin/salon-access-actions";
import { PlatformInvoiceDialog } from "@/components/subscription/platform-invoice-dialog";
import type { PlatformInvoiceDetailData } from "@/components/subscription/platform-invoice-detail";
import { PLAN_LABELS, getPlanMonthlyAmount, type SalonPlan } from "@/lib/plans";
import { cn } from "@/lib/utils";

type SalonDetail = NonNullable<Awaited<ReturnType<typeof import("@/actions/platform-admin").getSalonDetail>>>;

const DAY_LABELS: Record<string, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

function formatOpeningHours(hours: Record<string, unknown> | null) {
  if (!hours) return "Not set";
  return Object.entries(hours)
    .map(([day, value]) => {
      const slot = value as { open?: string; close?: string; closed?: boolean };
      const label = DAY_LABELS[day] ?? day;
      if (slot?.closed) return `${label}: Closed`;
      if (slot?.open && slot?.close) return `${label}: ${slot.open}–${slot.close}`;
      return null;
    })
    .filter(Boolean)
    .join(" · ");
}

const USAGE_STATS: {
  key: keyof SalonDetail["counts"];
  label: string;
  icon: LucideIcon;
  accent: string;
  iconBg: string;
}[] = [
  {
    key: "employees",
    label: "Employees",
    icon: Users,
    accent: "text-violet-600",
    iconBg: "bg-violet-100",
  },
  {
    key: "customers",
    label: "Customers",
    icon: User,
    accent: "text-blue-600",
    iconBg: "bg-blue-100",
  },
  {
    key: "services",
    label: "Services",
    icon: Scissors,
    accent: "text-emerald-600",
    iconBg: "bg-emerald-100",
  },
  {
    key: "seats",
    label: "Seats",
    icon: Building2,
    accent: "text-amber-600",
    iconBg: "bg-amber-100",
  },
];

export function SalonDetailClient({
  salon,
  readOnly = false,
}: {
  salon: SalonDetail;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedInvoice, setSelectedInvoice] = useState<PlatformInvoiceDetailData | null>(
    null
  );
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);

  function runAction(action: SalonSubscriptionAction) {
    startTransition(async () => {
      await updateSalonSubscription(salon.id, action);
      router.refresh();
    });
  }

  function runPlanChange(nextPlan: SalonPlan) {
    startTransition(async () => {
      await updateSalonPlanAsAdmin(salon.id, nextPlan);
      router.refresh();
    });
  }

  const subscription = salon.subscription;
  const planMonthlyAmount = getPlanMonthlyAmount(salon.plan as SalonPlan);
  const planName = subscription?.planName ?? PLAN_LABELS[salon.plan as SalonPlan] ?? salon.plan;

  function openInvoiceDialog(invoice: SalonDetail["platformInvoices"][number]) {
    setSelectedInvoice({
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.amount,
      tax: invoice.tax,
      total: invoice.total,
      periodStart: invoice.periodStart,
      periodEnd: invoice.periodEnd,
      dueDate: invoice.dueDate,
      paidAt: invoice.paidAt,
      status: invoice.status,
      planName,
      billTo: {
        name: salon.name,
        address: salon.address ?? salon.addressLine1,
        city: salon.city,
        state: salon.state,
        gstin: salon.gstin,
      },
    });
    setInvoiceDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-dashboard-text sm:text-3xl">
              {salon.name}
            </h1>
            <SalonPlanBadge plan={salon.plan} />
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-dashboard-muted">
            <Calendar className="h-4 w-4" />
            Signed up {format(new Date(salon.createdAt), "MMMM d, yyyy")}
          </p>
        </div>
        {subscription && (
          <SubscriptionStatusBadge status={subscription.status} />
        )}
      </div>

      {/* Prominent login URL */}
      <AdminCard className="overflow-hidden border-dashboard-primary/20 bg-gradient-to-br from-violet-50/80 via-white to-white">
        <AdminCardContent className="py-5">
          <SalonLoginUrl slug={salon.slug} variant="full" />
        </AdminCardContent>
      </AdminCard>

      {/* Info cards grid */}
      <div className="grid gap-5 lg:grid-cols-2">
        <AdminCard>
          <AdminCardHeader title="Business" icon={Building2} />
          <AdminCardContent className="space-y-4">
            <DetailField
              icon={Sparkles}
              label="Type"
              value={salon.businessType?.replace(/_/g, " ") ?? "—"}
            />
            <DetailField icon={Receipt} label="GSTIN" value={salon.gstin ?? "—"} />
            <DetailField
              icon={MapPin}
              label="Address"
              value={salon.address ?? salon.addressLine1 ?? "—"}
            />
            <DetailField
              icon={MapPin}
              label="Location"
              value={[salon.city, salon.state, salon.pincode].filter(Boolean).join(", ") || "—"}
            />
            <DetailField icon={Phone} label="Phone" value={salon.phone ?? "—"} />
            <DetailField icon={Mail} label="Email" value={salon.email ?? "—"} />
            <DetailField
              icon={Clock}
              label="Opening hours"
              value={formatOpeningHours(salon.openingHours)}
            />
          </AdminCardContent>
        </AdminCard>

        <AdminCard>
          <AdminCardHeader title="Owner" icon={User} />
          <AdminCardContent className="space-y-4">
            <DetailField icon={User} label="Name" value={salon.owner?.name ?? "—"} />
            <DetailField icon={Mail} label="Email" value={salon.owner?.email ?? "—"} />
            <DetailField icon={Phone} label="Phone" value={salon.owner?.phone ?? "—"} />
          </AdminCardContent>
        </AdminCard>

        <AdminCard>
          <AdminCardHeader title="ERP Plan" icon={Crown} />
          <AdminCardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-dashboard-border/60 bg-slate-50/50 px-4 py-3">
              <span className="text-sm font-medium text-dashboard-muted">Current tier</span>
              <SalonPlanBadge plan={salon.plan} />
            </div>
            <DetailField
              icon={Sparkles}
              label="Plan name"
              value={PLAN_LABELS[salon.plan as SalonPlan] ?? salon.plan}
            />
            <div className="flex flex-wrap gap-2 border-t border-dashboard-border/60 pt-4">
              {!readOnly && salon.plan !== "ENTERPRISE" && (
                <Button
                  size="sm"
                  disabled={isPending}
                  className="rounded-xl bg-dashboard-primary hover:bg-dashboard-primary-hover"
                  onClick={() => runPlanChange("ENTERPRISE")}
                >
                  <Crown className="mr-1.5 h-4 w-4" />
                  Upgrade to Enterprise
                </Button>
              )}
              {!readOnly && salon.plan !== "BASIC" && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  className="rounded-xl border-dashboard-border"
                  onClick={() => runPlanChange("BASIC")}
                >
                  Downgrade to Basic
                </Button>
              )}
            </div>
          </AdminCardContent>
        </AdminCard>

        <AdminCard>
          <AdminCardHeader title="Subscription" icon={CreditCard} />
          <AdminCardContent className="space-y-4">
            <DetailField icon={Sparkles} label="Plan" value={subscription?.planName ?? "—"} />
            <DetailField
              icon={CreditCard}
              label="Monthly amount"
              value={
                subscription
                  ? `₹${(subscription.monthlyAmount ?? planMonthlyAmount).toLocaleString("en-IN")}`
                  : `₹${planMonthlyAmount.toLocaleString("en-IN")}`
              }
            />
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-dashboard-primary/10 text-dashboard-primary">
                <Zap className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wider text-dashboard-muted">
                  Status
                </p>
                <div className="mt-1">
                  {subscription ? (
                    <SubscriptionStatusBadge status={subscription.status} />
                  ) : (
                    <span className="text-sm text-dashboard-text">—</span>
                  )}
                </div>
              </div>
            </div>
            <DetailField
              icon={Calendar}
              label="Trial ends"
              value={
                subscription?.trialEndsAt
                  ? format(new Date(subscription.trialEndsAt), "MMM d, yyyy")
                  : "—"
              }
            />
            <DetailField
              icon={Calendar}
              label="Current period"
              value={
                subscription
                  ? `${format(new Date(subscription.currentPeriodStart), "MMM d")} – ${format(new Date(subscription.currentPeriodEnd), "MMM d, yyyy")}`
                  : "—"
              }
            />
          </AdminCardContent>
        </AdminCard>
      </div>

      {/* Usage metrics */}
      <AdminCard>
        <AdminCardHeader
          title="Usage"
          description="Current resource counts for this salon"
          icon={Users}
        />
        <AdminCardContent>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {USAGE_STATS.map(({ key, label, icon: Icon, accent, iconBg }) => (
              <div
                key={key}
                className="rounded-2xl border border-dashboard-border/60 bg-gradient-to-br from-white to-slate-50/80 p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", iconBg)}>
                    <Icon className={cn("h-5 w-5", accent)} />
                  </div>
                </div>
                <p className="mt-3 text-xs font-medium uppercase tracking-wider text-dashboard-muted">
                  {label}
                </p>
                <p className={cn("mt-1 text-3xl font-bold tabular-nums", accent)}>
                  {salon.counts[key]}
                </p>
              </div>
            ))}
          </div>
        </AdminCardContent>
      </AdminCard>

      {/* Admin actions */}
      {!readOnly && (
        <>
          <AdminCard>
            <AdminCardHeader
              title="Salon Access"
              description="Reset owner credentials or open the salon dashboard as the owner"
              icon={ShieldAlert}
            />
            <AdminCardContent>
              <SalonAccessActions
                salonId={salon.id}
                salonSlug={salon.slug}
                subscriptionStatus={subscription?.status ?? "trial"}
                ownerEmail={salon.owner?.email ?? ""}
                ownerName={salon.owner?.name}
              />
            </AdminCardContent>
          </AdminCard>

          <AdminCard>
            <AdminCardHeader
              title="Admin Actions"
              description="Manage subscription and billing for this salon"
              icon={ShieldAlert}
            />
            <AdminCardContent className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-dashboard-muted">
              Subscription
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                disabled={isPending}
                className="rounded-xl bg-dashboard-primary hover:bg-dashboard-primary-hover"
                onClick={() => runAction("extend_trial")}
              >
                Extend trial (+14 days)
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={isPending}
                className="rounded-xl border-dashboard-border"
                onClick={() => runAction("activate")}
              >
                Mark active
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={isPending}
                className="rounded-xl border-dashboard-border"
                onClick={() => runAction("generate_invoice")}
              >
                <FileText className="mr-1.5 h-4 w-4" />
                Generate invoice
              </Button>
            </div>
          </div>
          <div className="border-t border-dashboard-border/60 pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-dashboard-muted">
              Danger zone
            </p>
            <Button
              size="sm"
              variant="destructive"
              disabled={isPending}
              className="rounded-xl"
              onClick={() => runAction("suspend")}
            >
              Suspend salon
            </Button>
          </div>
        </AdminCardContent>
      </AdminCard>
        </>
      )}

      {/* Platform invoices */}
      <AdminCard>
        <AdminCardHeader
          title="Platform Invoices"
          description={`${salon.platformInvoices.length} invoice${salon.platformInvoices.length !== 1 ? "s" : ""}`}
          icon={FileText}
        />
        <AdminCardContent className="p-0 pb-0">
          {salon.platformInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <Receipt className="h-7 w-7 text-slate-400" />
              </div>
              <p className="mt-4 text-sm font-semibold text-dashboard-text">No platform invoices</p>
              <p className="mt-1 max-w-sm text-sm text-dashboard-muted">
                Invoices will appear here once generated for this salon&apos;s subscription.
              </p>
              {!readOnly && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  className="mt-5 rounded-xl border-dashboard-border"
                  onClick={() => runAction("generate_invoice")}
                >
                  Generate first invoice
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-dashboard-border/60 hover:bg-transparent">
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-dashboard-muted">
                      Invoice #
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-dashboard-muted">
                      Period
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-dashboard-muted">
                      Base
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-dashboard-muted">
                      GST (18%)
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-dashboard-muted">
                      Total
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-dashboard-muted">
                      Due
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-dashboard-muted">
                      Status
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-dashboard-muted">
                      View
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salon.platformInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className="border-dashboard-border/40">
                      <TableCell className="font-semibold text-dashboard-text">
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell className="text-sm text-dashboard-muted">
                        {format(new Date(invoice.periodStart), "MMM d")} –{" "}
                        {format(new Date(invoice.periodEnd), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="font-medium text-dashboard-text">
                        ₹{invoice.amount.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="font-medium text-dashboard-text">
                        ₹{invoice.tax.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="font-medium text-dashboard-text">
                        ₹{invoice.total.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-sm text-dashboard-muted">
                        {format(new Date(invoice.dueDate), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <PlatformInvoiceStatusBadge status={invoice.status} />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="rounded-lg"
                          onClick={() => openInvoiceDialog(invoice)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </AdminCardContent>
      </AdminCard>

      <PlatformInvoiceDialog
        invoice={selectedInvoice}
        open={invoiceDialogOpen}
        onOpenChange={setInvoiceDialogOpen}
      />
    </div>
  );
}

function DetailField({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-dashboard-muted">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wider text-dashboard-muted">{label}</p>
        <p className="mt-0.5 text-sm font-medium capitalize text-dashboard-text">{value}</p>
      </div>
    </div>
  );
}
