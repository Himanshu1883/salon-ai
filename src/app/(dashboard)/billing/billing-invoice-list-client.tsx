"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { deleteInvoice, updateInvoiceStatus } from "@/actions/billing";
import { BillingInvoiceTable } from "@/components/billing/billing-invoice-table";
import { BillingEmptyState } from "@/components/billing/billing-empty-state";
import { ClientsPagination } from "@/components/clients/clients-pagination";
import type { BillingInvoice } from "@/components/billing/types";
import { useBillingStatsContext } from "./billing-stats-context";
import { markDashboardStale } from "@/lib/dashboard/stale-refresh";

type BillingInvoiceListClientProps = {
  invoices: BillingInvoice[];
  totalCount: number;
  page: number;
  pageSize: number;
  isBasicPlan?: boolean;
};

export function BillingInvoiceListClient({
  invoices: initialInvoices,
  totalCount,
  page,
  pageSize,
  isBasicPlan = false,
}: BillingInvoiceListClientProps) {
  const router = useRouter();
  const { updateStats, openNewInvoice, registerPrependInvoice } =
    useBillingStatsContext();
  const [isPending, startTransition] = useTransition();
  const [invoices, setInvoices] = useState(initialInvoices);
  const [loading, setLoading] = useState(false);

  const prependInvoice = useCallback((invoice: BillingInvoice) => {
    setInvoices((prev) => [
      invoice,
      ...prev.filter((item) => item.id !== invoice.id),
    ]);
  }, []);

  useEffect(() => {
    registerPrependInvoice(prependInvoice);
    return () => registerPrependInvoice(null);
  }, [prependInvoice, registerPrependInvoice]);

  useEffect(() => {
    setInvoices(initialInvoices);
  }, [initialInvoices]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const start = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalCount);

  function handlePageChange(nextPage: number) {
    const params = new URLSearchParams(window.location.search);
    if (nextPage > 1) {
      params.set("page", String(nextPage));
    } else {
      params.delete("page");
    }
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `/billing?${query}` : "/billing");
    });
  }

  function handleInvoicePaid(
    invoiceId: string,
    method: string,
    amountPaid: number,
    status: string
  ) {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              status,
              paidAt: status === "paid" ? new Date() : inv.paidAt,
              paymentMethod: method,
              amountPaid,
            }
          : inv
      )
    );

    const inv = invoices.find((item) => item.id === invoiceId);
    if (!inv) return;

    const previousPaid = inv.amountPaid ?? 0;
    const receivedNow = Math.max(0, amountPaid - previousPaid);
    updateStats((stats) => ({
      ...stats,
      revenueToday: stats.revenueToday + receivedNow,
      revenueMonth: stats.revenueMonth + receivedNow,
      unpaidCount:
        status === "paid"
          ? Math.max(0, stats.unpaidCount - 1)
          : stats.unpaidCount,
    }));
    markDashboardStale();
    router.refresh();
  }

  function handleStatusChange(id: string, status: string) {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status } : inv))
    );
  }

  function handleInvoiceDeleted(id: string) {
    const inv = invoices.find((item) => item.id === id);
    setInvoices((prev) => prev.filter((item) => item.id !== id));
    if (inv && inv.status !== "paid" && inv.status !== "cancelled") {
      updateStats((stats) => ({
        ...stats,
        unpaidCount: Math.max(0, stats.unpaidCount - 1),
      }));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this invoice?")) return;
    setLoading(true);
    await deleteInvoice(id);
    setLoading(false);
    handleInvoiceDeleted(id);
  }

  async function handleStatus(id: string, status: string) {
    setLoading(true);
    await updateInvoiceStatus(id, status);
    setLoading(false);
    handleStatusChange(id, status);
  }

  if (invoices.length === 0) {
    return (
      <div className="p-6">
        <BillingEmptyState onNewInvoice={openNewInvoice} />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-1 pb-5">
      <BillingInvoiceTable
        invoices={invoices}
        loading={loading || isPending}
        isBasicPlan={isBasicPlan}
        onMarkPaid={handleInvoicePaid}
        onMarkSent={(id) => handleStatus(id, "sent")}
        onDelete={handleDelete}
      />
      {totalCount > pageSize && (
        <div className="px-4">
          <ClientsPagination
            start={start}
            end={end}
            totalCount={totalCount}
            page={page}
            totalPages={totalPages}
            isPending={isPending}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
