"use client";

import Link from "next/link";
import { format } from "date-fns";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import { PayInvoiceButton } from "@/components/subscription/pay-invoice-dialog";
import { AlertTriangle, LogOut, Mail } from "lucide-react";

type Subscription = {
  planName: string;
  status: string;
} | null;

type OverdueInvoice = {
  id: string;
  invoiceNumber: string;
  total: number;
  dueDate: Date;
  periodStart: Date;
  periodEnd: Date;
} | null;

export function InvoiceDueClient({
  overdueInvoice,
  subscription,
  signOutUrl = "/",
}: {
  overdueInvoice: OverdueInvoice;
  subscription: Subscription;
  signOutUrl?: string;
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center">
      <Card className="w-full border-red-200 shadow-lg">
        <CardContent className="space-y-6 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-7 w-7 text-red-600" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-stone-900">
              Subscription Invoice Due
            </h1>
            <p className="mt-2 text-stone-600">
              Your Salon AI subscription payment is overdue. Pay now to restore
              access to your salon dashboard.
            </p>
          </div>

          {overdueInvoice ? (
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-left">
              <p className="text-sm text-stone-500">Amount due</p>
              <p className="text-3xl font-bold text-stone-900">
                {formatCurrency(overdueInvoice.total)}
              </p>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-stone-500">Invoice</dt>
                  <dd className="font-medium">{overdueInvoice.invoiceNumber}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-stone-500">Due date</dt>
                  <dd className="font-medium text-red-600">
                    {format(new Date(overdueInvoice.dueDate), "MMM d, yyyy")}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-stone-500">Billing period</dt>
                  <dd className="font-medium">
                    {format(new Date(overdueInvoice.periodStart), "MMM d")} –{" "}
                    {format(new Date(overdueInvoice.periodEnd), "MMM d, yyyy")}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-stone-500">Plan</dt>
                  <dd className="font-medium">
                    {subscription?.planName ?? "Salon AI Pro"}
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <p className="text-sm text-stone-600">
              Your account access is restricted. Contact support for assistance.
            </p>
          )}

          <div className="flex flex-col gap-3">
            {overdueInvoice && <PayInvoiceButton invoice={overdueInvoice} />}
            <Button variant="outline" asChild>
              <Link href="/settings/billing">View billing settings</Link>
            </Button>
          </div>

          <div className="border-t border-stone-200 pt-4 text-sm text-stone-500">
            <p className="flex items-center justify-center gap-2">
              <Mail className="h-4 w-4" />
              Need help? Email support@salon.ai
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 gap-2 text-stone-600"
              onClick={() => signOut({ callbackUrl: signOutUrl })}
            >
              <LogOut className="h-4 w-4" />
              Log out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
