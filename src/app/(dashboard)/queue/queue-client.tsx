"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  assignQueueEntry,
  startService,
  completeService,
  cancelQueueEntry,
} from "@/actions/queue";
import { QueueHeader } from "@/components/queue/queue-header";
import { QueueKpiGrid } from "@/components/queue/queue-kpi-grid";
import { QueueFilterBar } from "@/components/queue/queue-filter-bar";
import { QueueTabs } from "@/components/queue/queue-tabs";
import { QueueTable } from "@/components/queue/queue-table";
import { QueueMobileCards } from "@/components/queue/queue-mobile-cards";
import { QueueAssignDialog } from "@/components/queue/queue-assign-dialog";
import { QueueDetailsDrawer } from "@/components/queue/queue-details-drawer";
import { QueueSidebar } from "@/components/queue/queue-sidebar";
import { QueueRecentlyCompleted } from "@/components/queue/queue-recently-completed";
import { QueueAiInsights, QueueTipBanner } from "@/components/queue/queue-ai-insights";
import { useRecordSale } from "@/components/dashboard/record-sale-provider";
import { markDashboardStale } from "@/lib/dashboard/stale-refresh";
import {
  normalizeQueueOverview,
  type QueueOverview,
} from "@/lib/queue/overview-types";
import type {
  CompletedEntry,
  QueueEntry,
  QueueInvoiceEntry,
  QueueTab,
} from "@/components/queue/types";
import {
  DEFAULT_FILTERS,
  filterActiveEntries,
  queueEntryToInvoicePrefill,
  type QueueFilters,
} from "@/components/queue/queue-utils";
import { useLiveWaitTime } from "@/components/queue/use-live-wait-time";

export type QueueClientProps = {
  overview?: QueueOverview | null;
};

export function QueueClient({ overview: overviewProp }: QueueClientProps) {
  const router = useRouter();
  const now = useLiveWaitTime();
  const { openRecordSale } = useRecordSale();

  const initialOverview = normalizeQueueOverview(overviewProp);
  const [overview, setOverview] = useState(initialOverview);
  const [entries, setEntries] = useState(initialOverview.entries);
  const [completedRecent, setCompletedRecent] = useState(
    initialOverview.completedRecent
  );
  const [completedToday, setCompletedToday] = useState(
    initialOverview.completedToday
  );

  useEffect(() => {
    applyOverview(normalizeQueueOverview(overviewProp));
  }, [overviewProp, applyOverview]);

  const [activeTab, setActiveTab] = useState<QueueTab>("waiting");
  const [filters, setFilters] = useState<QueueFilters>(DEFAULT_FILTERS);
  const [assigning, setAssigning] = useState<QueueEntry | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<QueueEntry | null>(null);
  const [employeeId, setEmployeeId] = useState("");
  const [seatId, setSeatId] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const locallyCompletedIds = useRef(new Set<string>());

  const applyOverview = useCallback((data: QueueOverview) => {
    const next = normalizeQueueOverview(data);
    const hidden = locallyCompletedIds.current;
    setOverview(next);
    setEntries(next.entries.filter((entry) => !hidden.has(entry.id)));
    setCompletedRecent(next.completedRecent);
    setCompletedToday(next.completedToday);
  }, []);

  const syncFromServer = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/queue/overview", {
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) return;
      const data = (await res.json()) as QueueOverview;
      applyOverview(data);
    } finally {
      setRefreshing(false);
    }
  }, [applyOverview]);

  const refreshQueueData = useCallback(async () => {
    markDashboardStale();
    await syncFromServer();
    router.refresh();
  }, [router, syncFromServer]);

  const filteredActiveEntries = useMemo(
    () => filterActiveEntries(entries, filters, now),
    [entries, filters, now]
  );

  const tabItems = useMemo(() => {
    if (
      activeTab === "waiting" ||
      activeTab === "assigned" ||
      activeTab === "in_progress"
    ) {
      return filteredActiveEntries.filter((e) => e.status === activeTab);
    }
    if (activeTab === "completed") return completedToday;
    if (activeTab === "cancelled") return overview.cancelledToday;
    if (activeTab === "no_show") return overview.noShowToday;
    return entries;
  }, [
    activeTab,
    filteredActiveEntries,
    completedToday,
    overview.cancelledToday,
    overview.noShowToday,
    entries,
  ]);

  async function handleAssign() {
    if (!assigning || !employeeId) return;
    setError("");

    const employee = overview.employees.find((e) => e.id === employeeId);
    const seat = seatId
      ? overview.seats.find((s) => s.id === seatId)
      : null;
    const previousEntries = entries;
    const entryId = assigning.id;

    setEntries((prev) =>
      prev.map((e) =>
        e.id === entryId
          ? {
              ...e,
              status: "assigned",
              employee: employee
                ? { id: employee.id, name: employee.name }
                : null,
              seat: seat ? { id: seat.id, number: seat.number } : null,
            }
          : e
      )
    );
    setAssigning(null);
    setSelectedEntry(null);
    setEmployeeId("");
    setSeatId("");

    const formData = new FormData();
    formData.set("queueEntryId", entryId);
    formData.set("employeeId", employeeId);
    if (seatId) formData.set("seatId", seatId);

    const result = await assignQueueEntry(formData);
    if (result.error) {
      setEntries(previousEntries);
      setError(result.error);
      setAssigning(assigning);
      return;
    }

    await refreshQueueData();
  }

  async function handleAction(
    action: "start" | "complete" | "cancel",
    id: string
  ) {
    const previousEntries = entries;
    const previousCompleted = completedRecent;
    const previousCompletedToday = completedToday;
    const entry = entries.find((e) => e.id === id);
    if (!entry) return;

    if (action === "start") {
      setEntries((prev) =>
        prev.map((e) =>
          e.id === id
            ? { ...e, status: "in_progress", startedAt: new Date() }
            : e
        )
      );
    } else if (action === "complete") {
      locallyCompletedIds.current.add(id);
      const completed: CompletedEntry = {
        id: entry.id,
        completedAt: new Date(),
        employeeId: entry.employee?.id ?? null,
        seatId: entry.seat?.id ?? null,
        customer: entry.customer,
        services: entry.services.map((qs) => ({
          service: {
            id: qs.service.id,
            name: qs.service.name,
            price: qs.service.price,
          },
        })),
        invoices: [],
        serviceNames: entry.serviceNames,
        serviceTotal: entry.serviceTotal,
      };
      setEntries((prev) => prev.filter((e) => e.id !== id));
      setCompletedRecent((prev) => [completed, ...prev]);
      setCompletedToday((prev) => [completed, ...prev]);
    } else {
      setEntries((prev) => prev.filter((e) => e.id !== id));
    }

    setSelectedEntry(null);

    const fn =
      action === "start"
        ? startService
        : action === "complete"
          ? completeService
          : cancelQueueEntry;

    try {
      const result = await fn(id);
      if (result && "error" in result && result.error) {
        if (action === "complete") locallyCompletedIds.current.delete(id);
        setEntries(previousEntries);
        setCompletedRecent(previousCompleted);
        setCompletedToday(previousCompletedToday);
        setError(result.error);
        return;
      }

      void refreshQueueData();
    } catch {
      if (action === "complete") {
        setError("Completion saved. Refresh if the row still looks active.");
        void refreshQueueData();
        return;
      }
      setEntries(previousEntries);
      setCompletedRecent(previousCompleted);
      setCompletedToday(previousCompletedToday);
      setError("Something went wrong. Please try again.");
    }
  }

  function openInvoiceDialog(entry: QueueInvoiceEntry) {
    if (entry.invoices.length > 0) return;
    openRecordSale({
      prefill: queueEntryToInvoicePrefill(entry),
      onSuccess: (invoice) => {
        setCompletedRecent((prev) =>
          prev.map((e) =>
            e.id === entry.id
              ? {
                  ...e,
                  invoices: [{ id: invoice.id, status: invoice.status }],
                }
              : e
          )
        );
      },
    });
  }

  function openAssign(entry: QueueEntry) {
    setAssigning(entry);
    setEmployeeId("");
    setSeatId("");
    setError("");
  }

  return (
    <div className="space-y-5 pb-6">
      <QueueHeader
        activeCount={overview.stats.activeTotal}
        estimatedWait={overview.stats.estimatedWait}
        refreshing={refreshing}
        onRefresh={() => void refreshQueueData()}
      />

      <QueueKpiGrid kpis={overview.kpis} />

      <QueueFilterBar
        filters={filters}
        employees={overview.employees}
        services={overview.services}
        onChange={setFilters}
      />

      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-2xl border border-[#E8ECF4] bg-white shadow-[0_2px_12px_rgba(28,16,61,0.04)]"
          >
            <QueueTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              tabCounts={overview.tabCounts}
            />

            <div className="hidden md:block">
              <QueueTable
                items={tabItems}
                now={now}
                loading={loading}
                onAssign={openAssign}
                onStart={(id) => handleAction("start", id)}
                onComplete={(id) => handleAction("complete", id)}
                onCancel={(id) => handleAction("cancel", id)}
                onRowClick={setSelectedEntry}
                onViewDetails={setSelectedEntry}
              />
            </div>

            <div className="md:hidden">
              <QueueMobileCards
                items={tabItems}
                now={now}
                loading={loading}
                onAssign={openAssign}
                onStart={(id) => handleAction("start", id)}
                onComplete={(id) => handleAction("complete", id)}
                onCancel={(id) => handleAction("cancel", id)}
                onRowClick={setSelectedEntry}
                onViewDetails={setSelectedEntry}
              />
            </div>
          </motion.div>

          <QueueRecentlyCompleted
            entries={completedRecent}
            loading={loading}
            onCreateInvoice={openInvoiceDialog}
          />

          <QueueAiInsights insights={overview.insights} />
        </div>

        <div className="hidden xl:block">
          <QueueSidebar sidebar={overview.sidebar} />
        </div>
      </div>

      <div className="xl:hidden">
        <QueueSidebar sidebar={overview.sidebar} />
      </div>

      <QueueTipBanner />

      <QueueAssignDialog
        entry={assigning}
        employees={overview.employees}
        seats={overview.seats}
        employeeId={employeeId}
        seatId={seatId}
        loading={loading}
        error={error}
        onEmployeeChange={setEmployeeId}
        onSeatChange={setSeatId}
        onClose={() => setAssigning(null)}
        onAssign={handleAssign}
      />

      <QueueDetailsDrawer
        entry={selectedEntry}
        now={now}
        loading={loading}
        onClose={() => setSelectedEntry(null)}
        onAssign={openAssign}
        onStart={(id) => handleAction("start", id)}
        onComplete={(id) => handleAction("complete", id)}
        onCancel={(id) => handleAction("cancel", id)}
        onCreateInvoice={openInvoiceDialog}
      />
    </div>
  );
}
