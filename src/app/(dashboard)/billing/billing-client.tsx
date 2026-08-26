"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  deleteInvoice,
  updateInvoiceStatus,
} from "@/actions/billing";
import { getBillingSubscriptionTabData } from "@/actions/subscription";
import { BillingInvoiceDialog } from "@/components/billing/billing-invoice-dialog";
import { BillingHeader } from "@/components/billing/billing-header";
import { BillingKpiCards } from "@/components/billing/billing-kpi-cards";
import { BillingFilterBar } from "@/components/billing/billing-filter-bar";
import { BillingInvoiceTable } from "@/components/billing/billing-invoice-table";
import { BillingEmptyState } from "@/components/billing/billing-empty-state";
import {
  PlatformSubscriptionInvoices,
  type PlatformSubscriptionInvoice,
} from "@/components/subscription/platform-subscription-invoices";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  gstEnabled = true,
  whatsappSettings,
  platformInvoices: platformInvoicesProp = [],
  subscriptionPlanName = "Enterprise",
  initialTab = "customers",
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
  gstEnabled?: boolean;
  whatsappSettings?: {
    billingMessageTemplate: string;
    autoOpenAfterPayment: boolean;
  };
  platformInvoices?: PlatformSubscriptionInvoice[];
  subscriptionPlanName?: string;
  initialTab?: "customers" | "subscription";
}) {
  const router = useRouter();
  const [invoices, setInvoices] = useState(initialInvoices);
  const [stats, setStats] = useState(initialStats);
  const [open, setOpen] = useState(autoOpenCreate);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [platformInvoices, setPlatformInvoices] = useState(platformInvoicesProp);
  const [subscriptionPlanNameState, setSubscriptionPlanNameState] =
    useState(subscriptionPlanName);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const subscriptionLoadedRef = useRef(platformInvoicesProp.length > 0);
  const [status, setStatus] = useState(filters.status);
  const [dateFrom, setDateFrom] = useState(filters.dateFrom);
  const [dateTo, setDateTo] = useState(filters.dateTo);
  const [employeeId, setEmployeeId] = useState(filters.employeeId);

  useEffect(() => {
    setPlatformInvoices(platformInvoicesProp);
    setSubscriptionPlanNameState(subscriptionPlanName);
    if (platformInvoicesProp.length > 0) {
      subscriptionLoadedRef.current = true;
    }
  }, [platformInvoicesProp, subscriptionPlanName]);

  useEffect(() => {
    if (activeTab !== "subscription" || subscriptionLoadedRef.current) return;

    let cancelled = false;
    setSubscriptionLoading(true);
    getBillingSubscriptionTabData()
      .then((data) => {
        if (cancelled) return;
        setPlatformInvoices(data.invoices);
        setSubscriptionPlanNameState(data.subscriptionPlanName);
        subscriptionLoadedRef.current = true;
      })
      .finally(() => {
        if (!cancelled) setSubscriptionLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  useEffect(() => {
    setInvoices(initialInvoices);
    setStats(initialStats);
  }, [initialInvoices, initialStats]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    setStatus(filters.status);
    setDateFrom(filters.dateFrom);
    setDateTo(filters.dateTo);
    setEmployeeId(filters.employeeId);
  }, [filters]);

  function handleTabChange(value: string) {
    const tab = value as "customers" | "subscription";
    setActiveTab(tab);
    const params = new URLSearchParams(window.location.search);
    if (tab === "subscription") {
      params.set("tab", "subscription");
    } else {
      params.delete("tab");
    }
    const query = params.toString();
    router.replace(query ? `/billing?${query}` : "/billing", { scroll: false });
  }

  function handleInvoiceCreated(invoice: BillingInvoice) {
    setOpen(false);
    setInvoices((prev) => [invoice, ...prev]);
    if (invoice.status === "paid") {
      setStats((s) => ({
        ...s,
        revenueToday: s.revenueToday + invoice.total,
        revenueMonth: s.revenueMonth + invoice.total,
      }));
    } else if (invoice.status === "partial") {
      setStats((s) => ({
        ...s,
        revenueToday: s.revenueToday + (invoice.amountPaid ?? 0),
        revenueMonth: s.revenueMonth + (invoice.amountPaid ?? 0),
        unpaidCount: s.unpaidCount + 1,
      }));
    } else {
      setStats((s) => ({ ...s, unpaidCount: s.unpaidCount + 1 }));
    }
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
    const inv = invoices.find((i) => i.id === invoiceId);
    if (inv) {
      const previousPaid = inv.amountPaid ?? 0;
      const receivedNow = Math.max(0, amountPaid - previousPaid);
      setStats((s) => ({
        ...s,
        revenueToday: s.revenueToday + receivedNow,
        revenueMonth: s.revenueMonth + receivedNow,
        unpaidCount:
          status === "paid"
            ? Math.max(0, s.unpaidCount - 1)
            : s.unpaidCount,
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

  function applyFilters() {
    const params = new URLSearchParams();
    if (status && status !== "all") params.set("status", status);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    if (employeeId && employeeId !== "all") params.set("employeeId", employeeId);
    if (activeTab === "subscription") params.set("tab", "subscription");
    router.push(params.size > 0 ? `/billing?${params.toString()}` : "/billing");
  }

  function resetFilters() {
    setStatus("all");
    setDateFrom("");
    setDateTo("");
    setEmployeeId("all");
    const params = activeTab === "subscription" ? "?tab=subscription" : "";
    router.push(`/billing${params}`);
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
        showNewInvoice={activeTab === "customers"}
      />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="h-auto w-full justify-start gap-1 rounded-xl border border-[#ECECEC] bg-white p-1 shadow-sm sm:w-auto">
          <TabsTrigger
            value="customers"
            className="rounded-lg px-4 py-2 data-[state=active]:bg-[#6C3CF0] data-[state=active]:text-white"
          >
            Customer Invoices
          </TabsTrigger>
          <TabsTrigger
            value="subscription"
            className="rounded-lg px-4 py-2 data-[state=active]:bg-[#6C3CF0] data-[state=active]:text-white"
          >
            Go Tix Subscription
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="mt-0 space-y-6">
          <BillingKpiCards stats={stats} />

          <div className="overflow-hidden rounded-2xl border border-[#ECECEC] bg-white shadow-[0_4px_24px_rgba(28,16,61,0.05)]">
            <div className="flex flex-col gap-4 border-b border-[#ECECEC] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#1C103D]">
                  Customer Invoices
                </h2>
                <p className="text-sm text-[#9CA3AF]">
                  Bills you create for salon customers — {invoices.length} invoice
                  {invoices.length !== 1 ? "s" : ""}
                </p>
              </div>
              <BillingFilterBar
                status={status}
                dateFrom={dateFrom}
                dateTo={dateTo}
                employeeId={employeeId}
                employees={employees}
                isBasicPlan={isBasicPlan}
                onStatusChange={setStatus}
                onDateFromChange={setDateFrom}
                onDateToChange={setDateTo}
                onEmployeeIdChange={setEmployeeId}
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
        </TabsContent>

        <TabsContent value="subscription" className="mt-0">
          <div className="overflow-hidden rounded-2xl border border-[#ECECEC] bg-white shadow-[0_4px_24px_rgba(28,16,61,0.05)]">
            {subscriptionLoading ? (
              <div className="flex min-h-[240px] items-center justify-center p-8 text-sm text-[#9CA3AF]">
                Loading subscription invoices…
              </div>
            ) : (
              <PlatformSubscriptionInvoices
                invoices={platformInvoices}
                planName={subscriptionPlanNameState}
                salonName={salonName}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>

      <BillingInvoiceDialog
        open={open}
        onOpenChange={setOpen}
        services={services}
        employees={employees}
        seats={seats}
        prefilledCustomer={prefilledCustomer}
        isBasicPlan={isBasicPlan}
        salonName={salonName}
        gstEnabled={gstEnabled}
        whatsappSettings={whatsappSettings}
        onSuccess={handleInvoiceCreated}
      />
    </div>
  );
}
