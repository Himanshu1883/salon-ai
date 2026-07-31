"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  deleteInvoice,
  updateInvoiceStatus,
} from "@/actions/billing";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { BillingHeader } from "@/components/billing/billing-header";
import { BillingKpiCards } from "@/components/billing/billing-kpi-cards";
import { BillingFilterBar } from "@/components/billing/billing-filter-bar";
import { BillingInvoiceTable } from "@/components/billing/billing-invoice-table";
import { BillingInvoiceForm } from "@/components/billing/billing-invoice-form";
import { BillingEmptyState } from "@/components/billing/billing-empty-state";
import type {
  BillingEmployee,
  BillingFilters,
  BillingInvoice,
  BillingSeat,
  BillingService,
  BillingStats,
} from "@/components/billing/types";

export function BillingClient({
  invoices: initialInvoices,
  stats: initialStats,
  services,
  employees,
  seats,
  filters,
  prefilledCustomer,
  autoOpenCreate = false,
  isBasicPlan = false,
  salonName = "Salon",
}: {
  invoices: BillingInvoice[];
  stats: BillingStats;
  services: BillingService[];
  employees: BillingEmployee[];
  seats: BillingSeat[];
  filters: BillingFilters;
  prefilledCustomer?: { name: string; phone: string };
  autoOpenCreate?: boolean;
  isBasicPlan?: boolean;
  salonName?: string;
}) {
  const router = useRouter();
  const [invoices, setInvoices] = useState(initialInvoices);
  const [stats, setStats] = useState(initialStats);
  const [open, setOpen] = useState(autoOpenCreate);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setInvoices(initialInvoices);
    setStats(initialStats);
  }, [initialInvoices, initialStats]);

  function handleInvoiceCreated(invoice: BillingInvoice) {
    setOpen(false);
    setInvoices((prev) => [invoice, ...prev]);
    if (invoice.status === "paid") {
      setStats((s) => ({
        ...s,
        revenueToday: s.revenueToday + invoice.total,
        revenueMonth: s.revenueMonth + invoice.total,
      }));
    } else {
      setStats((s) => ({ ...s, unpaidCount: s.unpaidCount + 1 }));
    }
  }

  function handleInvoicePaid(invoiceId: string, method: string) {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? { ...inv, status: "paid", paidAt: new Date(), paymentMethod: method }
          : inv
      )
    );
    const inv = invoices.find((i) => i.id === invoiceId);
    if (inv) {
      setStats((s) => ({
        ...s,
        revenueToday: s.revenueToday + inv.total,
        revenueMonth: s.revenueMonth + inv.total,
        unpaidCount: Math.max(0, s.unpaidCount - 1),
      }));
    }
  }

  function handleStatusChange(id: string, status: string) {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status } : inv))
    );
  }

  function handleInvoiceDeleted(id: string) {
    const inv = invoices.find((i) => i.id === id);
    setInvoices((prev) => prev.filter((i) => i.id !== id));
    if (inv && inv.status !== "paid" && inv.status !== "cancelled") {
      setStats((s) => ({ ...s, unpaidCount: Math.max(0, s.unpaidCount - 1) }));
    }
  }

  function applyFilters(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    const status = fd.get("status") as string;
    const dateFrom = fd.get("dateFrom") as string;
    const dateTo = fd.get("dateTo") as string;
    const employeeId = fd.get("employeeId") as string;
    if (status && status !== "all") params.set("status", status);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    if (employeeId && employeeId !== "all") params.set("employeeId", employeeId);
    router.push(`/billing?${params.toString()}`);
  }

  function resetFilters() {
    router.push("/billing");
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

  return (
    <div className="space-y-6">
      <BillingHeader
        onNewInvoice={() => setOpen(true)}
        isBasicPlan={isBasicPlan}
      />

      <BillingKpiCards stats={stats} />

      <div className="overflow-hidden rounded-2xl border border-[#ECECEC] bg-white shadow-[0_4px_24px_rgba(28,16,61,0.05)]">
        <div className="flex flex-col gap-4 border-b border-[#ECECEC] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#1C103D]">
              Invoices
            </h2>
            <p className="text-sm text-[#9CA3AF]">
              {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
            </p>
          </div>
          <BillingFilterBar
            filters={filters}
            employees={employees}
            isBasicPlan={isBasicPlan}
            onApply={applyFilters}
            onReset={resetFilters}
          />
        </div>

        <div className="p-1">
          {invoices.length === 0 ? (
            <div className="p-6">
              <BillingEmptyState onNewInvoice={() => setOpen(true)} />
            </div>
          ) : (
            <BillingInvoiceTable
              invoices={invoices}
              loading={loading}
              isBasicPlan={isBasicPlan}
              onMarkPaid={handleInvoicePaid}
              onMarkSent={(id) => handleStatus(id, "sent")}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex h-[780px] max-h-[calc(100vh-2rem)] w-[1180px] max-w-[calc(100vw-1.5rem)] flex-col gap-0 overflow-hidden rounded-[20px] border-0 bg-white p-0 shadow-[0_30px_80px_rgba(0,0,0,0.15)] [&>button]:hidden">
          <BillingInvoiceForm
            services={services}
            employees={employees}
            seats={seats}
            prefilledCustomer={prefilledCustomer}
            isBasicPlan={isBasicPlan}
            salonName={salonName}
            onSuccess={handleInvoiceCreated}
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
