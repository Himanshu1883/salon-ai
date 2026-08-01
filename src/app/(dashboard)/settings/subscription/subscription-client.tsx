"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  Check,
  CheckCircle2,
  Clock,
  Crown,
  FileText,
  Receipt,
  Sparkles,
  Zap,
} from "lucide-react";
import { updateSalonPlan } from "@/actions/plans";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PayInvoiceButton } from "@/components/subscription/pay-invoice-dialog";
import { PlatformInvoiceDialog } from "@/components/subscription/platform-invoice-dialog";
import type { PlatformInvoiceDetailData } from "@/components/subscription/platform-invoice-detail";
import { formatCurrency } from "@/lib/currency";
import {
  PLAN_FEATURES,
  PLAN_LABELS,
  PLAN_PRICING,
  type SalonPlan,
} from "@/lib/plans";

type Subscription = {
  status: string;
  planName: string;
  monthlyAmount: number;
  currentPeriodEnd: Date;
  trialEndsAt: Date | null;
  createdAt: Date;
};

type PlatformInvoice = {
  id: string;
  invoiceNumber: string;
  amount: number;
  tax: number;
  total: number;
  periodStart: Date;
  periodEnd: Date;
  dueDate: Date;
  paidAt: Date | null;
  status: string;
};

const statusStyles: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700",
  trial: "bg-[#6C3BFF]/10 text-[#6C3BFF]",
  past_due: "bg-red-100 text-red-700",
  suspended: "bg-red-100 text-red-700",
  draft: "bg-stone-100 text-stone-600",
  sent: "bg-amber-100 text-amber-700",
  paid: "bg-emerald-100 text-emerald-700",
  overdue: "bg-red-100 text-red-700",
  cancelled: "bg-stone-100 text-stone-500",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      className={`rounded-full capitalize hover:opacity-90 ${statusStyles[status] ?? "bg-stone-100 text-stone-600"}`}
    >
      {status.replace("_", " ")}
    </Badge>
  );
}

function SubscriptionTimeline({
  subscription,
  invoices,
}: {
  subscription: Subscription | null;
  invoices: PlatformInvoice[];
}) {
  const events = useMemo(() => {
    const items: { date: Date; title: string; detail: string; tone: "violet" | "green" | "amber" }[] =
      [];

    if (subscription) {
      items.push({
        date: new Date(subscription.createdAt),
        title: "Trial started",
        detail: subscription.trialEndsAt
          ? `14-day free trial until ${format(new Date(subscription.trialEndsAt), "MMM d, yyyy")}`
          : "Free trial period began",
        tone: "violet",
      });
    }

    const sortedInvoices = [...invoices].sort(
      (a, b) => new Date(a.periodStart).getTime() - new Date(b.periodStart).getTime()
    );

    const trialInvoices = sortedInvoices.filter((invoice) => invoice.amount === 0);
    const monthlyInvoices = sortedInvoices.filter((invoice) => invoice.amount > 0);

    for (const invoice of trialInvoices) {
      items.push({
        date: new Date(invoice.dueDate),
        title: "Trial invoice issued",
        detail: `${invoice.invoiceNumber} — ₹0 (free trial)`,
        tone: "violet",
      });
    }

    if (subscription?.status === "active") {
      const activationDate =
        monthlyInvoices.find((inv) => inv.paidAt)?.paidAt ??
        monthlyInvoices[0]?.dueDate ??
        subscription.currentPeriodEnd;
      items.push({
        date: new Date(activationDate),
        title: "Subscription activated",
        detail: `${subscription.planName} plan — ${formatCurrency(subscription.monthlyAmount)}/mo + 18% GST`,
        tone: "green",
      });
    }

    for (const invoice of monthlyInvoices) {
      items.push({
        date: new Date(invoice.dueDate),
        title: "Monthly GST invoice",
        detail: `${invoice.invoiceNumber} — ${formatCurrency(invoice.total)} incl. GST`,
        tone: invoice.status === "paid" ? "green" : "amber",
      });
    }

    return items.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [subscription, invoices]);

  if (events.length === 0) return null;

  const toneColors = {
    violet: "border-[#6C3BFF] bg-[#6C3BFF]",
    green: "border-emerald-500 bg-emerald-500",
    amber: "border-amber-500 bg-amber-500",
  };

  return (
    <div className="rounded-2xl border border-[#EDE9FE] bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <Clock className="h-5 w-5 text-[#6C3BFF]" />
        <h2 className="text-lg font-bold text-[#1C103D]">Billing timeline</h2>
      </div>
      <ol className="relative space-y-0 border-l-2 border-[#EDE9FE] pl-6">
        {events.map((event, index) => (
          <li key={`${event.title}-${index}`} className="relative pb-6 last:pb-0">
            <span
              className={`absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 ${toneColors[event.tone]}`}
            />
            <p className="text-sm font-semibold text-[#1C103D]">{event.title}</p>
            <p className="mt-0.5 text-xs text-[#6B7280]">
              {format(event.date, "MMM d, yyyy")} · {event.detail}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function SubscriptionClient({
  plan,
  planLabel,
  subscription,
  invoices,
}: {
  plan: SalonPlan;
  planLabel: string;
  subscription: Subscription | null;
  invoices: PlatformInvoice[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedInvoice, setSelectedInvoice] = useState<PlatformInvoiceDetailData | null>(null);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);

  const planName = subscription?.planName ?? planLabel;
  const sortedInvoices = useMemo(
    () =>
      [...invoices].sort(
        (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
      ),
    [invoices]
  );

  function switchPlan(nextPlan: SalonPlan) {
    if (nextPlan === plan) return;
    startTransition(async () => {
      await updateSalonPlan(nextPlan);
      router.refresh();
    });
  }

  function openInvoiceDialog(invoice: PlatformInvoice) {
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
    });
    setInvoiceDialogOpen(true);
  }

  const plans: SalonPlan[] = ["BASIC", "ENTERPRISE"];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1C103D]">Plan & subscription</h1>
        <p className="mt-1 text-[#6B7280]">
          Manage your Glow Desk plan and view platform invoices from VSACHI TECH.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-[#EDE9FE] bg-gradient-to-br from-[#6C3BFF]/5 via-white to-[#FF2D6F]/5 p-6 shadow-[0_12px_40px_rgba(108,59,255,0.08)]"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6C3BFF] text-white shadow-lg shadow-[#6C3BFF]/30">
              <Crown className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#6B7280]">Current plan</p>
              <p className="text-2xl font-bold text-[#1C103D]">{planLabel}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={subscription?.status ?? "trial"} />
            <Badge className="rounded-full bg-[#6C3BFF]/10 px-4 py-1.5 text-[#6C3BFF] hover:bg-[#6C3BFF]/10">
              {plan === "ENTERPRISE" ? "Full ERP access" : "Essentials only"}
            </Badge>
          </div>
        </div>
        {subscription?.status === "trial" && subscription.trialEndsAt && (
          <p className="mt-4 flex items-center gap-2 text-sm text-[#6B7280]">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Trial ends {format(new Date(subscription.trialEndsAt), "MMM d, yyyy")}
          </p>
        )}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {plans.map((tier, index) => {
          const isCurrent = tier === plan;
          const pricing = PLAN_PRICING[tier];
          const features = PLAN_FEATURES[tier];
          const isEnterprise = tier === "ENTERPRISE";
          const gstTotal = Math.round(pricing.monthly * 1.18 * 100) / 100;

          return (
            <motion.div
              key={tier}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className={`relative flex flex-col rounded-2xl border p-6 shadow-sm ${
                isEnterprise
                  ? "border-[#6C3BFF]/30 bg-white shadow-[0_16px_48px_rgba(108,59,255,0.12)]"
                  : "border-[#E8ECF4] bg-white"
              }`}
            >
              {isEnterprise && (
                <div className="absolute -top-3 left-6 rounded-full bg-[#6C3BFF] px-3 py-1 text-xs font-semibold text-white">
                  Most popular
                </div>
              )}

              <div className="mb-4 flex items-center gap-2">
                {isEnterprise ? (
                  <Sparkles className="h-5 w-5 text-[#6C3BFF]" />
                ) : (
                  <Zap className="h-5 w-5 text-[#6B7280]" />
                )}
                <h2 className="text-xl font-bold text-[#1C103D]">{PLAN_LABELS[tier]}</h2>
              </div>

              <p className="text-sm text-[#6B7280]">{pricing.tagline}</p>

              <p className="mt-4">
                <span className="text-4xl font-bold text-[#1C103D]">₹{pricing.monthly}</span>
                <span className="text-[#6B7280]">/month</span>
              </p>
              <p className="mt-1 text-sm text-[#6B7280]">
                {formatCurrency(gstTotal)}/mo incl. 18% GST when active
              </p>

              <ul className="mt-6 flex-1 space-y-3">
                {features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-[#374151]">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#6C3BFF]" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                disabled={isCurrent || isPending}
                onClick={() => switchPlan(tier)}
                className={`mt-6 h-11 rounded-2xl ${
                  isEnterprise
                    ? "bg-[#6C3BFF] hover:bg-[#5B2FE0]"
                    : "bg-[#1C103D] hover:bg-[#2D1B4E]"
                }`}
                variant={isCurrent ? "outline" : "default"}
              >
                {isCurrent
                  ? "Current plan"
                  : tier === "ENTERPRISE"
                    ? "Upgrade to Enterprise"
                    : "Switch to Basic"}
              </Button>
            </motion.div>
          );
        })}
      </div>

      <SubscriptionTimeline subscription={subscription} invoices={invoices} />

      <div className="rounded-2xl border border-[#EDE9FE] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EDE9FE] px-6 py-4">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-[#6C3BFF]" />
            <h2 className="text-lg font-bold text-[#1C103D]">Platform invoices</h2>
          </div>
          <div className="flex items-center gap-4 text-sm text-[#6B7280]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              {invoices.filter((i) => i.status === "paid").length} paid
            </span>
            <span className="flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-amber-600" />
              {invoices.filter((i) => ["sent", "overdue"].includes(i.status)).length} pending
            </span>
          </div>
        </div>

        {sortedInvoices.length === 0 ? (
          <p className="py-10 text-center text-sm text-[#9CA3AF]">
            No platform invoices yet. A ₹0 trial invoice is created when your salon signs up.
          </p>
        ) : (
          <div className="overflow-x-auto px-2 pb-2">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-[#6B7280]">Invoice</TableHead>
                  <TableHead className="text-[#6B7280]">Date</TableHead>
                  <TableHead className="text-[#6B7280]">Period</TableHead>
                  <TableHead className="text-[#6B7280]">Plan</TableHead>
                  <TableHead className="text-[#6B7280]">Base</TableHead>
                  <TableHead className="text-[#6B7280]">GST</TableHead>
                  <TableHead className="text-[#6B7280]">Total</TableHead>
                  <TableHead className="text-[#6B7280]">Status</TableHead>
                  <TableHead className="text-right text-[#6B7280]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedInvoices.map((invoice) => (
                  <TableRow key={invoice.id} className="hover:bg-[#6C3BFF]/[0.03]">
                    <TableCell className="font-medium text-[#1C103D]">
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell className="text-[#6B7280]">
                      {format(new Date(invoice.dueDate), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-[#6B7280]">
                      {format(new Date(invoice.periodStart), "MMM d")} –{" "}
                      {format(new Date(invoice.periodEnd), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-[#374151]">{planName}</TableCell>
                    <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                    <TableCell>{formatCurrency(invoice.tax)}</TableCell>
                    <TableCell className="font-medium text-[#1C103D]">
                      {formatCurrency(invoice.total)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={invoice.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-[#6C3BFF] hover:bg-[#6C3BFF]/10 hover:text-[#5B2FE0]"
                          onClick={() => openInvoiceDialog(invoice)}
                        >
                          View
                        </Button>
                        {["sent", "overdue"].includes(invoice.status) && !invoice.paidAt && (
                          <PayInvoiceButton invoice={invoice} size="sm" />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <PlatformInvoiceDialog
        invoice={selectedInvoice}
        open={invoiceDialogOpen}
        onOpenChange={setInvoiceDialogOpen}
      />
    </div>
  );
}
