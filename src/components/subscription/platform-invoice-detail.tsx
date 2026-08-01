"use client";

import { format } from "date-fns";
import { formatCurrency } from "@/lib/currency";
import {
  PLATFORM_BILLING_ENTITY,
  calculatePlatformInvoiceGst,
  formatPlatformBillingAddress,
  getPlatformSubscriptionLineItem,
} from "@/lib/platform-billing";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export type PlatformInvoiceDetailData = {
  invoiceNumber: string;
  amount: number;
  tax: number;
  total: number;
  periodStart: Date;
  periodEnd: Date;
  dueDate: Date;
  paidAt?: Date | null;
  status: string;
  planName: string;
  billTo?: {
    name: string;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    gstin?: string | null;
  };
};

export function PlatformInvoiceDetail({
  invoice,
  showPrintButton = false,
  className = "",
}: {
  invoice: PlatformInvoiceDetailData;
  showPrintButton?: boolean;
  className?: string;
}) {
  const gst = calculatePlatformInvoiceGst(invoice.amount);
  const lineItem = getPlatformSubscriptionLineItem(invoice.planName, invoice.amount);

  return (
    <div className={className}>
      {showPrintButton && (
        <div className="mb-4 flex justify-end print:hidden">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print invoice
          </Button>
        </div>
      )}

      <div className="rounded-xl border border-stone-200 bg-white p-6 print:border-none print:p-0">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              From
            </p>
            <p className="mt-1 text-lg font-bold text-stone-900">
              {PLATFORM_BILLING_ENTITY.legalName}
            </p>
            <p className="mt-1 text-sm text-stone-600">{formatPlatformBillingAddress()}</p>
            <p className="mt-2 text-sm text-stone-600">
              GSTIN/UIN: {PLATFORM_BILLING_ENTITY.gstin}
            </p>
            <p className="text-sm text-stone-600">
              State: {PLATFORM_BILLING_ENTITY.stateName}, Code:{" "}
              {PLATFORM_BILLING_ENTITY.stateCode}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Tax Invoice
            </p>
            <p className="mt-1 font-mono text-sm font-semibold text-stone-900">
              {invoice.invoiceNumber}
            </p>
            <p className="mt-2 text-sm text-stone-600">
              Invoice date: {format(new Date(invoice.dueDate), "MMM d, yyyy")}
            </p>
            <p className="text-sm text-stone-600">
              Due date: {format(new Date(invoice.dueDate), "MMM d, yyyy")}
            </p>
            <p className="mt-1 text-sm capitalize text-stone-600">Status: {invoice.status}</p>
          </div>
        </div>

        {invoice.billTo && (
          <div className="mt-6 border-t border-stone-100 pt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Bill to
            </p>
            <p className="mt-1 font-medium text-stone-900">{invoice.billTo.name}</p>
            {invoice.billTo.address && (
              <p className="text-sm text-stone-600">{invoice.billTo.address}</p>
            )}
            {(invoice.billTo.city || invoice.billTo.state) && (
              <p className="text-sm text-stone-600">
                {[invoice.billTo.city, invoice.billTo.state].filter(Boolean).join(", ")}
              </p>
            )}
            {invoice.billTo.gstin && (
              <p className="text-sm text-stone-600">GSTIN: {invoice.billTo.gstin}</p>
            )}
          </div>
        )}

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left text-xs uppercase tracking-wider text-stone-500">
                <th className="pb-3 pr-4 font-semibold">Description</th>
                <th className="pb-3 pr-4 font-semibold">Period</th>
                <th className="pb-3 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-stone-100">
                <td className="py-4 pr-4 text-stone-800">{lineItem.description}</td>
                <td className="py-4 pr-4 text-stone-600">
                  {format(new Date(invoice.periodStart), "MMM d")} –{" "}
                  {format(new Date(invoice.periodEnd), "MMM d, yyyy")}
                </td>
                <td className="py-4 text-right font-medium tabular-nums text-stone-900">
                  {formatCurrency(lineItem.amount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <dl className="w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between text-stone-600">
              <dt>Taxable value</dt>
              <dd className="font-medium tabular-nums text-stone-900">
                {formatCurrency(gst.baseAmount)}
              </dd>
            </div>
            <div className="flex justify-between text-stone-600">
              <dt>CGST @ {gst.cgstRatePercent}%</dt>
              <dd className="font-medium tabular-nums text-stone-900">
                {formatCurrency(gst.cgst)}
              </dd>
            </div>
            <div className="flex justify-between text-stone-600">
              <dt>SGST @ {gst.sgstRatePercent}%</dt>
              <dd className="font-medium tabular-nums text-stone-900">
                {formatCurrency(gst.sgst)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-stone-200 pt-2 text-stone-600">
              <dt>Total GST @ {gst.gstRatePercent}%</dt>
              <dd className="font-medium tabular-nums text-stone-900">
                {formatCurrency(gst.tax)}
              </dd>
            </div>
            <div className="flex justify-between border-t border-stone-200 pt-3 text-base font-semibold text-stone-900">
              <dt>Invoice total</dt>
              <dd className="tabular-nums">{formatCurrency(invoice.total)}</dd>
            </div>
          </dl>
        </div>

        {invoice.paidAt && (
          <p className="mt-4 text-sm text-emerald-700">
            Paid on {format(new Date(invoice.paidAt), "MMM d, yyyy")}
          </p>
        )}
      </div>
    </div>
  );
}
