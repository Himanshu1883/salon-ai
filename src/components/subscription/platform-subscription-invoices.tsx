"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlatformInvoiceStatusBadge } from "@/components/admin/subscription-status-badge";
import { PayInvoiceButton } from "@/components/subscription/pay-invoice-dialog";
import { PlatformInvoiceDialog } from "@/components/subscription/platform-invoice-dialog";
import type { PlatformInvoiceDetailData } from "@/components/subscription/platform-invoice-detail";
import { formatCurrency } from "@/lib/currency";
import { PLATFORM_BILLING_ENTITY } from "@/lib/platform-billing";
import { Receipt } from "lucide-react";
import { ResponsiveTableWrapper } from "@/components/ui/responsive-table-wrapper";

export type PlatformSubscriptionInvoice = {
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
  paymentMethod?: string | null;
};

function getPlanLabel(amount: number, planName: string): string {
  if (amount === 0) return `${planName} — Free Trial`;
  return `${planName} — Monthly`;
}

export function PlatformSubscriptionInvoices({
  invoices,
  planName,
  salonName,
  compact = false,
}: {
  invoices: PlatformSubscriptionInvoice[];
  planName: string;
  salonName?: string;
  compact?: boolean;
}) {
  const [selectedInvoice, setSelectedInvoice] = useState<PlatformInvoiceDetailData | null>(
    null
  );
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);

  const sortedInvoices = useMemo(
    () =>
      [...invoices].sort(
        (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
      ),
    [invoices]
  );

  function openInvoiceDialog(invoice: PlatformSubscriptionInvoice) {
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
      billTo: salonName ? { name: salonName } : undefined,
    });
    setInvoiceDialogOpen(true);
  }

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6C3CF0]/10">
          <Receipt className="h-7 w-7 text-[#6C3CF0]" />
        </div>
        <h3 className="text-lg font-semibold text-[#1C103D]">
          No subscription invoices yet
        </h3>
        <p className="mt-2 max-w-md text-sm text-[#6B7280]">
          Invoices from {PLATFORM_BILLING_ENTITY.brandName} ({PLATFORM_BILLING_ENTITY.legalName})
          for your ERP subscription will appear here — including your free trial invoice at ₹0.
        </p>
      </div>
    );
  }

  return (
    <>
      {!compact && (
        <div className="border-b border-[#ECECEC] px-3 py-2.5 sm:px-5 sm:py-4">
          <h2 className="text-sm font-semibold text-[#1C103D] sm:text-lg">
            Go Tix Subscription Invoices
          </h2>
          <p className="mt-0.5 text-[11px] leading-snug text-[#6B7280] sm:mt-1 sm:text-sm">
            Platform invoices from {PLATFORM_BILLING_ENTITY.legalName} for your Go Tix ERP
            subscription — not invoices you create for salon customers.
          </p>
        </div>
      )}

      <div className="p-1">
        <ResponsiveTableWrapper
          cards={
            <div className="divide-y divide-[#ECECEC]">
              {sortedInvoices.map((invoice) => (
                <div key={invoice.id} className="space-y-1.5 p-2.5 sm:space-y-2.5 sm:p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-[#1C103D]">{invoice.invoiceNumber}</p>
                    <PlatformInvoiceStatusBadge status={invoice.status} />
                  </div>
                  <p className="text-xs text-[#6B7280] sm:text-sm">
                    {format(new Date(invoice.dueDate), "MMM d, yyyy")}
                  </p>
                  <p className="text-xs text-[#6B7280] sm:text-sm">
                    {getPlanLabel(invoice.amount, planName)}
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-xs sm:text-sm">
                    <div>
                      <p className="text-[10px] text-[#9CA3AF] sm:text-xs">Base</p>
                      <p className="font-medium tabular-nums">{formatCurrency(invoice.amount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#9CA3AF]">GST</p>
                      <p className="font-medium tabular-nums">{formatCurrency(invoice.tax)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#9CA3AF]">Total</p>
                      <p className="font-semibold tabular-nums text-[#1C103D]">{formatCurrency(invoice.total)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 flex-1 text-xs text-[#6C3CF0] hover:text-[#5B2FE0] sm:h-9"
                      onClick={() => openInvoiceDialog(invoice)}
                    >
                      View
                    </Button>
                    {["sent", "overdue"].includes(invoice.status) && !invoice.paidAt && (
                      <div className="flex-1">
                        <PayInvoiceButton invoice={invoice} size="sm" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          }
          table={
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Base</TableHead>
                    <TableHead>GST</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium text-[#1C103D]">
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell className="text-[#6B7280]">
                        {format(new Date(invoice.dueDate), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-[#6B7280]">
                        {getPlanLabel(invoice.amount, planName)}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatCurrency(invoice.amount)}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {formatCurrency(invoice.tax)}
                      </TableCell>
                      <TableCell className="font-medium tabular-nums text-[#1C103D]">
                        {formatCurrency(invoice.total)}
                      </TableCell>
                      <TableCell>
                        <PlatformInvoiceStatusBadge status={invoice.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-[#6C3CF0] hover:text-[#5B2FE0]"
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
          }
        />
      </div>

      <PlatformInvoiceDialog
        invoice={selectedInvoice}
        open={invoiceDialogOpen}
        onOpenChange={setInvoiceDialogOpen}
      />
    </>
  );
}
