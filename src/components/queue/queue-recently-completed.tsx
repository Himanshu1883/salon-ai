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
    <div className="rounded-2xl border border-[#E8ECF4] bg-white shadow-[0_2px_12px_rgba(28,16,61,0.04)]">
      <div className="flex items-center justify-between border-b border-[#E8ECF4] px-5 py-4">
        <h2 className="font-semibold text-[#1C103D]">
          Recently completed — Create invoice
        </h2>
        <Link
          href="/billing"
          className="text-xs font-medium text-[#6C3BFF] hover:underline"
        >
          View all
        </Link>
      </div>

      <div className="divide-y divide-[#E8ECF4]">
        {entries.map((entry) => {
          const total = getServiceTotal(entry);
          const hasInvoice = entry.invoices.length > 0;
          const invoice = entry.invoices[0];
          const isPaid = invoice?.status === "paid";

          return (
            <div
              key={entry.id}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                <div>
                  <p className="font-medium text-[#1C103D]">
                    {entry.customer.name}
                  </p>
                  <p className="text-sm text-[#6B7280]">
                    {getServiceNames(entry)}
                    {entry.completedAt &&
                      ` · ${format(new Date(entry.completedAt), "MMM d, h:mm a")}`}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
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
                  className="shrink-0 rounded-xl border-[#E8ECF4]"
                >
                  <Link href={`/billing/${entry.invoices[0].id}`}>
                    View invoice
                  </Link>
                </Button>
              ) : (
                <Button
                  size="sm"
                  disabled={loading}
                  onClick={() => onCreateInvoice(entry)}
                  className="shrink-0 rounded-xl border border-[#6C3BFF] bg-white text-[#6C3BFF] hover:bg-[#EDE9FE]"
                  variant="outline"
                >
                  <FileText className="mr-1.5 h-3.5 w-3.5" />
                  Create invoice
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
