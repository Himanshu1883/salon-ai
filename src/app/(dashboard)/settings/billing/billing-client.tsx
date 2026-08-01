"use client";

import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/currency";
import { getPlanMonthlyAmount } from "@/lib/plans";
import { PayInvoiceButton } from "@/components/subscription/pay-invoice-dialog";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";

type Subscription = {
  status: string;
  planName: string;
  monthlyAmount: number;
  currentPeriodEnd: Date;
  trialEndsAt: Date | null;
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
  paymentMethod: string | null;
};

const statusVariant: Record<
  string,
  "default" | "success" | "warning" | "destructive" | "secondary"
> = {
  active: "success",
  trial: "default",
  past_due: "destructive",
  suspended: "destructive",
  draft: "secondary",
  sent: "warning",
  paid: "success",
  overdue: "destructive",
  cancelled: "secondary",
};

function SubscriptionStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={statusVariant[status] ?? "secondary"}>
      {status.replace("_", " ")}
    </Badge>
  );
}

export function BillingClient({
  subscription,
  invoices,
  overdueInvoice,
  blocked,
  planMonthlyFallback = getPlanMonthlyAmount("ENTERPRISE"),
}: {
  subscription: Subscription | null;
  invoices: PlatformInvoice[];
  overdueInvoice: PlatformInvoice | null;
  blocked: boolean;
  planMonthlyFallback?: number;
}) {
  const nextDue =
    overdueInvoice?.dueDate ??
    invoices.find((inv) => inv.status === "sent" && !inv.paidAt)?.dueDate ??
    subscription?.currentPeriodEnd;

  return (
    <div className="space-y-6">
      {blocked && overdueInvoice && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div className="flex-1">
            <p className="font-medium text-red-900">Subscription invoice overdue</p>
            <p className="mt-1 text-sm text-red-700">
              Pay {formatCurrency(overdueInvoice.total)} for invoice{" "}
              {overdueInvoice.invoiceNumber} to restore full access to Glow Desk.
            </p>
            <div className="mt-3">
              <PayInvoiceButton invoice={overdueInvoice} size="sm" />
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-stone-600">Plan</span>
              <span className="font-medium">
                {subscription?.planName ?? "Enterprise"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-600">Monthly amount</span>
              <span className="font-medium">
                {formatCurrency(subscription?.monthlyAmount ?? planMonthlyFallback)}/month
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-stone-600">Status</span>
              <SubscriptionStatusBadge status={subscription?.status ?? "trial"} />
            </div>
            {subscription?.status === "trial" && subscription.trialEndsAt && (
              <div className="flex items-center justify-between">
                <span className="text-stone-600">Trial ends</span>
                <span className="font-medium">
                  {format(new Date(subscription.trialEndsAt), "MMM d, yyyy")}
                </span>
              </div>
            )}
            {nextDue && (
              <div className="flex items-center justify-between">
                <span className="text-stone-600">Next due date</span>
                <span className="font-medium">
                  {format(new Date(nextDue), "MMM d, yyyy")}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Billing summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-stone-600">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              {invoices.filter((i) => i.status === "paid").length} invoices paid
            </div>
            <div className="flex items-center gap-2 text-sm text-stone-600">
              <Clock className="h-4 w-4 text-amber-600" />
              {invoices.filter((i) => ["sent", "overdue"].includes(i.status)).length}{" "}
              pending
            </div>
            <p className="text-sm text-stone-500">
              Glow Desk platform invoices are separate from your customer billing
              in the Billing section.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Invoice history</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="py-6 text-center text-sm text-stone-500">
              No platform invoices yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell className="text-stone-600">
                      {format(new Date(invoice.periodStart), "MMM d")} –{" "}
                      {format(new Date(invoice.periodEnd), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {format(new Date(invoice.dueDate), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>{formatCurrency(invoice.total)}</TableCell>
                    <TableCell>
                      <SubscriptionStatusBadge status={invoice.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {["sent", "overdue"].includes(invoice.status) &&
                        !invoice.paidAt && (
                          <PayInvoiceButton invoice={invoice} size="sm" />
                        )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
