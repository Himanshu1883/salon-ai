"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { MONTHLY_AMOUNT_INR } from "@/lib/subscription";
import { SalonPlanBadge } from "@/components/admin/salon-plan-badge";
import { SalonLoginUrl } from "@/components/admin/salon-login-url";
import { PLAN_LABELS, type SalonPlan } from "@/lib/plans";

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

export function SalonDetailClient({ salon }: { salon: SalonDetail }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{salon.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Signed up {format(new Date(salon.createdAt), "MMMM d, yyyy")}
          </p>
        </div>
        {subscription && <SubscriptionStatusBadge status={subscription.status} />}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Business</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex gap-2">
              <span className="w-28 shrink-0 text-slate-500">Login URL</span>
              <SalonLoginUrl slug={salon.slug} variant="full" />
            </div>
            <DetailRow label="Type" value={salon.businessType?.replace(/_/g, " ") ?? "—"} />
            <DetailRow label="GSTIN" value={salon.gstin ?? "—"} />
            <DetailRow label="Address" value={salon.address ?? salon.addressLine1 ?? "—"} />
            <DetailRow
              label="Location"
              value={[salon.city, salon.state, salon.pincode].filter(Boolean).join(", ") || "—"}
            />
            <DetailRow label="Phone" value={salon.phone ?? "—"} />
            <DetailRow label="Email" value={salon.email ?? "—"} />
            <DetailRow label="Opening hours" value={formatOpeningHours(salon.openingHours)} />
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Owner</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <DetailRow label="Name" value={salon.owner?.name ?? "—"} />
            <DetailRow label="Email" value={salon.owner?.email ?? "—"} />
            <DetailRow label="Phone" value={salon.owner?.phone ?? "—"} />
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">ERP Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Tier</span>
              <SalonPlanBadge plan={salon.plan} />
            </div>
            <DetailRow label="Plan name" value={PLAN_LABELS[salon.plan as SalonPlan] ?? salon.plan} />
            <div className="flex flex-wrap gap-2 pt-2">
              {salon.plan !== "ENTERPRISE" && (
                <Button
                  size="sm"
                  disabled={isPending}
                  onClick={() => runPlanChange("ENTERPRISE")}
                >
                  Upgrade to Enterprise
                </Button>
              )}
              {salon.plan !== "BASIC" && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => runPlanChange("BASIC")}
                >
                  Downgrade to Basic
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <DetailRow label="Plan" value={subscription?.planName ?? "—"} />
            <DetailRow
              label="Monthly amount"
              value={subscription ? `₹${subscription.monthlyAmount ?? MONTHLY_AMOUNT_INR}` : "—"}
            />
            <DetailRow label="Status" value={subscription?.status ?? "—"} />
            <DetailRow
              label="Trial ends"
              value={
                subscription?.trialEndsAt
                  ? format(new Date(subscription.trialEndsAt), "MMM d, yyyy")
                  : "—"
              }
            />
            <DetailRow
              label="Current period"
              value={
                subscription
                  ? `${format(new Date(subscription.currentPeriodStart), "MMM d")} – ${format(new Date(subscription.currentPeriodEnd), "MMM d, yyyy")}`
                  : "—"
              }
            />
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Usage</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <Stat label="Employees" value={salon.counts.employees} />
            <Stat label="Customers" value={salon.counts.customers} />
            <Stat label="Services" value={salon.counts.services} />
            <Stat label="Seats" value={salon.counts.seats} />
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Admin Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => runAction("extend_trial")}
          >
            Extend trial (+14 days)
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => runAction("activate")}
          >
            Mark active
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => runAction("suspend")}
          >
            Suspend
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => runAction("generate_invoice")}
          >
            Generate invoice
          </Button>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Platform Invoices</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salon.platformInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-slate-500">
                    No platform invoices
                  </TableCell>
                </TableRow>
              ) : (
                salon.platformInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {format(new Date(invoice.periodStart), "MMM d")} –{" "}
                      {format(new Date(invoice.periodEnd), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>₹{invoice.total.toLocaleString("en-IN")}</TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {format(new Date(invoice.dueDate), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <PlatformInvoiceStatusBadge status={invoice.status} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="w-28 shrink-0 text-slate-500">{label}</span>
      <span className="capitalize text-slate-900">{value}</span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
