"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getBillingSubscriptionTabData } from "@/actions/subscription";
import { BillingInvoiceDialog } from "@/components/billing/billing-invoice-dialog";
import { BillingHeader } from "@/components/billing/billing-header";
import { BillingKpiCards } from "@/components/billing/billing-kpi-cards";
import { BillingFilterBar } from "@/components/billing/billing-filter-bar";
import {
  PlatformSubscriptionInvoices,
  type PlatformSubscriptionInvoice,
} from "@/components/subscription/platform-subscription-invoices";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  BillingEmployee,
  BillingFilters,
  BillingInvoice,
  BillingStats,
} from "@/components/billing/types";
import { BillingStatsProvider } from "./billing-stats-context";

export function BillingClient({
  stats: initialStats,
  employees,
  filters,
  prefilledCustomer,
  autoOpenCreate = false,
  isBasicPlan = false,
  salonName = "Salon",
  gstEnabled = true,
  initialTab = "customers",
  invoicesContent,
}: {
  stats: BillingStats;
  employees: BillingEmployee[];
  filters: BillingFilters;
  prefilledCustomer?: { name: string; phone: string };
  autoOpenCreate?: boolean;
  isBasicPlan?: boolean;
  salonName?: string;
  gstEnabled?: boolean;
  initialTab?: "customers" | "subscription";
  invoicesContent: React.ReactNode;
}) {
  const router = useRouter();
  const listPrependRef = useRef<((invoice: BillingInvoice) => void) | null>(null);
  const recordedInvoiceIdsRef = useRef(new Set<string>());
  const [stats, setStats] = useState(initialStats);
  const [open, setOpen] = useState(autoOpenCreate);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [platformInvoices, setPlatformInvoices] = useState<
    PlatformSubscriptionInvoice[]
  >([]);
  const [subscriptionPlanNameState, setSubscriptionPlanNameState] =
    useState("Enterprise");
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const subscriptionLoadedRef = useRef(false);
  const [status, setStatus] = useState(filters.status);
  const [dateFrom, setDateFrom] = useState(filters.dateFrom);
  const [dateTo, setDateTo] = useState(filters.dateTo);
  const [employeeId, setEmployeeId] = useState(filters.employeeId);

  useEffect(() => {
    setStats(initialStats);
  }, [initialStats]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    setStatus(filters.status);
    setDateFrom(filters.dateFrom);
    setDateTo(filters.dateTo);
    setEmployeeId(filters.employeeId);
  }, [filters]);

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

  function handleInvoiceCreated(
    invoice: BillingInvoice,
    options?: { close?: boolean }
  ) {
    const alreadyRecorded = recordedInvoiceIdsRef.current.has(invoice.id);
    if (!alreadyRecorded) {
      recordedInvoiceIdsRef.current.add(invoice.id);
      if (invoice.status === "paid") {
        setStats((stats) => ({
          ...stats,
          revenueToday: stats.revenueToday + invoice.total,
          revenueMonth: stats.revenueMonth + invoice.total,
        }));
      } else if (invoice.status === "partial") {
        setStats((stats) => ({
          ...stats,
          revenueToday: stats.revenueToday + (invoice.amountPaid ?? 0),
          revenueMonth: stats.revenueMonth + (invoice.amountPaid ?? 0),
          unpaidCount: stats.unpaidCount + 1,
        }));
      } else if (invoice.status !== "paid") {
        setStats((stats) => ({ ...stats, unpaidCount: stats.unpaidCount + 1 }));
      }
      listPrependRef.current?.(invoice);
      router.refresh();
    }

    if (options?.close !== false) {
      setOpen(false);
    }
  }

  function applyFilters() {
    const params = new URLSearchParams();
    if (status && status !== "all") params.set("status", status);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    if (employeeId && employeeId !== "all") params.set("employeeId", employeeId);
    if (activeTab === "subscription") params.set("tab", "subscription");
    params.delete("page");
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

  return (
    <BillingStatsProvider
      listPrependRef={listPrependRef}
      updateStats={(updater) => setStats((current) => updater(current))}
      openNewInvoice={() => setOpen(true)}
    >
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
              <div className="flex flex-col gap-3 border-b border-[#ECECEC] px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5 sm:py-4">
                <div>
                  <h2 className="text-base font-semibold text-[#1C103D] sm:text-lg">
                    Customer Invoices
                  </h2>
                  <p className="text-xs text-[#9CA3AF] sm:text-sm">
                    Bills you create for salon customers
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

              <div className="sm:p-1">{invoicesContent}</div>
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
          prefilledCustomer={prefilledCustomer}
          isBasicPlan={isBasicPlan}
          salonName={salonName}
          gstEnabled={gstEnabled}
          onSuccess={handleInvoiceCreated}
        />
      </div>
    </BillingStatsProvider>
  );
}
