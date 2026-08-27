"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import type {
  AppointmentSnapshot,
  CompletedEntry,
  Employee,
  QueueEntry,
  QueueInvoiceEntry,
  QueueTab,
  Seat,
  ServiceOption,
} from "@/components/queue/types";
import {
  computeQueueStats,
  DEFAULT_FILTERS,
  filterActiveEntries,
  getTabEntries,
  queueEntryToInvoicePrefill,
  type QueueFilters,
} from "@/components/queue/queue-utils";
import { useLiveWaitTime } from "@/components/queue/use-live-wait-time";

export type QueueClientProps = {
  entries: QueueEntry[];
  employees: Employee[];
  seats: Seat[];
  estimatedWait: number;
  completedEntries: CompletedEntry[];
  services: ServiceOption[];
  appointmentsToday: AppointmentSnapshot[];
  revenueToday: number;
};

export function QueueClient({
  entries: initialEntries,
  employees,
  seats,
  estimatedWait: initialEstimatedWait,
  completedEntries: initialCompletedEntries,
  services,
  appointmentsToday,
  revenueToday,
}: QueueClientProps) {
  const now = useLiveWaitTime();
  const { openRecordSale } = useRecordSale();

  const [entries, setEntries] = useState(initialEntries);
  const [completedEntries, setCompletedEntries] = useState(initialCompletedEntries);
  const [estimatedWait, setEstimatedWait] = useState(initialEstimatedWait);

  useEffect(() => {
    setEntries(initialEntries);
    setCompletedEntries(initialCompletedEntries);
    setEstimatedWait(initialEstimatedWait);
  }, [initialEntries, initialCompletedEntries, initialEstimatedWait]);

  const [activeTab, setActiveTab] = useState<QueueTab>("waiting");
  const [filters, setFilters] = useState<QueueFilters>(DEFAULT_FILTERS);
  const [assigning, setAssigning] = useState<QueueEntry | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<QueueEntry | null>(null);
  const [employeeId, setEmployeeId] = useState("");
  const [seatId, setSeatId] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const syncFromServer = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/queue/snapshot", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as {
        entries: QueueEntry[];
        completedEntries: CompletedEntry[];
        estimatedWait: number;
      };
      setEntries(data.entries);
      setCompletedEntries(data.completedEntries);
      setEstimatedWait(data.estimatedWait);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const stats = useMemo(
    () =>
      computeQueueStats(
        entries,
        completedEntries,
        employees,
        appointmentsToday,
        revenueToday,
        estimatedWait
      ),
    [entries, completedEntries, employees, appointmentsToday, revenueToday, estimatedWait]
  );

  const filteredActiveEntries = useMemo(
    () => filterActiveEntries(entries, filters, now),
    [entries, filters, now]
  );

  const tabItems = useMemo(() => {
    const raw = getTabEntries(
      activeTab,
      entries,
      completedEntries,
      appointmentsToday
    );
    if (activeTab === "waiting" || activeTab === "assigned" || activeTab === "in_progress") {
      const filteredIds = new Set(filteredActiveEntries.map((e) => e.id));
      return raw.filter((item) => "id" in item && filteredIds.has(item.id));
    }
    return raw;
  }, [activeTab, entries, completedEntries, appointmentsToday, filteredActiveEntries]);

  async function handleAssign() {
    if (!assigning || !employeeId) return;
    setError("");

    const employee = employees.find((e) => e.id === employeeId);
    const seat = seatId ? seats.find((s) => s.id === seatId) : null;
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
    }
  }

  async function handleAction(
    action: "start" | "complete" | "cancel",
    id: string
  ) {
    const previousEntries = entries;
    const previousCompleted = completedEntries;
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
      setEntries((prev) => prev.filter((e) => e.id !== id));
      setCompletedEntries((prev) => [
        {
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
        },
        ...prev,
      ]);
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
    const result = await fn(id);
    if (result && "error" in result && result.error) {
      setEntries(previousEntries);
      setCompletedEntries(previousCompleted);
      setError(result.error);
    }
  }

  function openInvoiceDialog(entry: QueueInvoiceEntry) {
    if (entry.invoices.length > 0) return;
    openRecordSale({
      prefill: queueEntryToInvoicePrefill(entry),
      onSuccess: (invoice) => {
        setCompletedEntries((prev) =>
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
        activeCount={entries.length}
        estimatedWait={estimatedWait}
        refreshing={refreshing}
        onRefresh={() => void syncFromServer()}
      />

      <QueueKpiGrid stats={stats} />

      <QueueFilterBar
        filters={filters}
        employees={employees}
        services={services}
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
              entries={entries}
              completedEntries={completedEntries}
              appointmentsToday={appointmentsToday}
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
            entries={completedEntries}
            loading={loading}
            onCreateInvoice={openInvoiceDialog}
          />

          <QueueAiInsights stats={stats} />
        </div>

        <div className="hidden xl:block">
          <QueueSidebar
            entries={entries}
            completedEntries={completedEntries}
            employees={employees}
            stats={stats}
          />
        </div>
      </div>

      <div className="xl:hidden">
        <QueueSidebar
          entries={entries}
          completedEntries={completedEntries}
          employees={employees}
          stats={stats}
        />
      </div>

      <QueueTipBanner />

      <QueueAssignDialog
        entry={assigning}
        employees={employees}
        seats={seats}
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
