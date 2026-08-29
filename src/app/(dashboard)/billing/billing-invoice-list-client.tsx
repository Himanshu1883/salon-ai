"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteInvoice, updateInvoiceStatus } from "@/actions/billing";
import { BillingInvoiceTable } from "@/components/billing/billing-invoice-table";
import { BillingEmptyState } from "@/components/billing/billing-empty-state";
import { SalesPagination } from "@/components/sales/sales-pagination";
import type { BillingInvoice } from "@/components/billing/types";
import { useBillingStatsContext } from "./billing-stats-context";
import { markDashboardStale } from "@/lib/dashboard/stale-refresh";

type BillingInvoiceListClientProps = {
  invoices: BillingInvoice[];
  totalCount: number;
  page: number;
  pageSize: number;
  start: number;
  end: number;
  totalPages: number;
  isBasicPlan?: boolean;
};

export function BillingInvoiceListClient({
  invoices,
  totalCount,
  page,
  start,
  end,
  totalPages,
  isBasicPlan = false,
}: BillingInvoiceListClientProps) {
  const router = useRouter();
  const { openNewInvoice } = useBillingStatsContext();
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  function refresh() {
    markDashboardStale();
    startTransition(() => {
      router.refresh();
    });
  }

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

  async function handleDelete(id: string) {
    if (!confirm("Delete this invoice?")) return;
    setLoading(true);
    await deleteInvoice(id);
    setLoading(false);
    refresh();
  }

  async function handleStatus(id: string, status: string) {
    setLoading(true);
    await updateInvoiceStatus(id, status);
    setLoading(false);
    refresh();
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
        onMarkPaid={refresh}
        onMarkSent={(id) => handleStatus(id, "sent")}
        onDelete={handleDelete}
      />
      <SalesPagination
        start={start}
        end={end}
        totalCount={totalCount}
        page={page}
        totalPages={totalPages}
        itemLabel="invoice"
        onPageChange={handlePageChange}
      />
    </div>
  );
}
