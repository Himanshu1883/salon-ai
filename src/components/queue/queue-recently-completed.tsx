"use client";

import Link from "next/link";
import { format } from "date-fns";
import { CheckCircle2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import type { CompletedEntry, QueueInvoiceEntry } from "./types";
import { getServiceNames, getServiceTotal } from "./queue-utils";

type QueueRecentlyCompletedProps = {
  entries: CompletedEntry[];
  loading: boolean;
  onCreateInvoice: (entry: QueueInvoiceEntry) => void;
};

export function QueueRecentlyCompleted({
  entries,
  loading,
  onCreateInvoice,
}: QueueRecentlyCompletedProps) {
  if (entries.length === 0) return null;

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-[#E8ECF4] bg-white shadow-[0_2px_12px_rgba(28,16,61,0.04)]">
      <div className="flex items-center justify-between gap-2 border-b border-[#E8ECF4] px-3 py-2.5 sm:px-5 sm:py-4">
        <h2 className="min-w-0 text-sm font-semibold leading-tight text-[#1C103D] sm:text-base">
          Recently completed
        </h2>
        <Link
          href="/billing"
          className="shrink-0 text-xs font-medium text-[#6C3BFF] hover:underline"
        >
          View all
        </Link>
      </div>

      <div className="divide-y divide-[#E8ECF4]">
        {entries.map((entry) => {
          const total = entry.serviceTotal ?? getServiceTotal(entry);
          const hasInvoice = entry.invoices.length > 0;
          const invoice = entry.invoices[0];
          const isPaid = invoice?.status === "paid";

          return (
            <div
              key={entry.id}
              className="flex items-start justify-between gap-2 px-3 py-2.5 sm:items-center sm:gap-3 sm:px-5 sm:py-4"
            >
              <div className="flex min-w-0 flex-1 items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#1C103D]">
                    {entry.customer.name}
                  </p>
                  <p className="mt-0.5 break-words text-[11px] leading-snug text-[#6B7280] sm:text-sm">
                    {entry.serviceNames ?? getServiceNames(entry)}
                    {entry.completedAt &&
                      ` · ${format(new Date(entry.completedAt), "MMM d, h:mm a")}`}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className="text-sm font-semibold text-[#1C103D]">
                      {formatCurrency(invoice?.total ?? total)}
                    </span>
                    {hasInvoice && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          isPaid
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {isPaid ? "Paid" : "Pending"}
                      </span>
                    )}
                    {invoice?.paymentMethod && (
                      <span className="rounded-full bg-[#F7F8FC] px-2 py-0.5 text-[10px] font-medium text-[#6B7280] capitalize">
                        {invoice.paymentMethod}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {hasInvoice ? (
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                  className="h-8 w-fit shrink-0 rounded-lg border-[#E8ECF4] px-2.5 text-xs"
                >
                  <Link href={`/billing/${entry.invoices[0].id}`}>
                    View
                  </Link>
                </Button>
              ) : (
                <Button
                  size="sm"
                  disabled={loading}
                  onClick={() => onCreateInvoice(entry)}
                  className="h-8 w-fit shrink-0 rounded-lg border border-[#6C3BFF] bg-white px-2.5 text-xs text-[#6C3BFF] hover:bg-[#EDE9FE]"
                  variant="outline"
                >
                  <FileText className="h-3.5 w-3.5 sm:mr-1" />
                  <span className="hidden sm:inline">Create invoice</span>
                  <span className="sm:hidden">Invoice</span>
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
