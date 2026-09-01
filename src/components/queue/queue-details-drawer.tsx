"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, Phone, X } from "lucide-react";
import { getCustomerStats } from "@/actions/customers";
import { Button } from "@/components/ui/button";
import type { QueueEntry, QueueInvoiceEntry } from "./types";
import {
  formatPhone,
  formatWaitTime,
  getInitials,
  getServiceDuration,
  getServiceNames,
  getServiceTotal,
  getWaitMinutes,
} from "./queue-utils";
import { QueueStatusBadge } from "./queue-status-badge";
import { formatCurrency } from "@/lib/currency";

type CustomerStatsData = Awaited<ReturnType<typeof getCustomerStats>>;

type QueueDetailsDrawerProps = {
  entry: QueueEntry | null;
  now: Date;
  loading: boolean;
  onClose: () => void;
  onAssign: (entry: QueueEntry) => void;
  onStart: (id: string) => void;
  onComplete: (id: string) => void;
  onCancel: (id: string) => void;
  onCreateInvoice?: (entry: QueueInvoiceEntry) => void;
};

export function QueueDetailsDrawer({
  entry,
  now,
  loading,
  onClose,
  onAssign,
  onStart,
  onComplete,
  onCancel,
  onCreateInvoice,
}: QueueDetailsDrawerProps) {
  const [stats, setStats] = useState<CustomerStatsData | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    if (!entry?.customerId) {
      setStats(null);
      return;
    }
    let cancelled = false;
    setStatsLoading(true);
    getCustomerStats(entry.customerId)
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .finally(() => {
        if (!cancelled) setStatsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [entry?.customerId]);

  const waitMinutes = entry ? getWaitMinutes(entry, now) : 0;

  const timeline = entry
    ? [
        {
          label: "Checked in",
          time: format(new Date(entry.checkedInAt), "h:mm a"),
          done: true,
        },
        {
          label: "Assigned",
          time: entry.employee ? entry.employee.name : "Pending",
          done: !!entry.employee,
        },
        {
          label: "Service started",
          time: entry.startedAt
            ? format(new Date(entry.startedAt), "h:mm a")
            : "Pending",
          done: !!entry.startedAt,
        },
        {
          label: "Completed",
          time: entry.completedAt
            ? format(new Date(entry.completedAt), "h:mm a")
            : "Pending",
          done: !!entry.completedAt,
        },
      ]
    : [];

  return (
    <AnimatePresence>
      {entry && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#E8ECF4] px-4 py-3 sm:px-5 sm:py-4">
              <div>
                <p className="text-xs font-medium text-[#6C3BFF]">
                  Queue #{entry.position}
                </p>
                <h2 className="text-lg font-bold text-[#1C103D]">
                  {entry.customer.name}
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-9 w-9 rounded-full p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 sm:px-5 sm:py-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6C3BFF] to-[#FF2D6F] text-lg font-bold text-white">
                  {getInitials(entry.customer.name)}
                </div>
                <div className="flex-1">
                  <QueueStatusBadge status={entry.status} />
                  <div className="mt-2 flex items-center gap-1.5 text-sm text-[#6B7280]">
                    <Phone className="h-3.5 w-3.5" />
                    {formatPhone(entry.customer.phone)}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[#F7F8FC] p-3">
                  <p className="text-xs text-[#6B7280]">Wait time</p>
                  <p className="mt-0.5 font-semibold text-[#1C103D]">
                    {formatWaitTime(waitMinutes)}
                  </p>
                </div>
                <div className="rounded-xl bg-[#F7F8FC] p-3">
                  <p className="text-xs text-[#6B7280]">Est. total</p>
                  <p className="mt-0.5 font-semibold text-[#1C103D]">
                    {formatCurrency(getServiceTotal(entry))}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <h3 className="text-sm font-semibold text-[#1C103D]">Service</h3>
                <p className="mt-1 text-sm text-[#6B7280]">
                  {getServiceNames(entry)} · {getServiceDuration(entry)} min
                </p>
                {entry.employee && (
                  <p className="mt-1 text-sm text-[#6B7280]">
                    Stylist: {entry.employee.name}
                    {entry.seat ? ` · Seat ${entry.seat.number}` : ""}
                  </p>
                )}
              </div>

              {statsLoading ? (
                <p className="mt-4 text-sm text-[#9CA3AF]">Loading customer history…</p>
              ) : stats ? (
                <div className="mt-5 rounded-xl border border-[#E8ECF4] p-3">
                  <h3 className="text-sm font-semibold text-[#1C103D]">
                    Customer profile
                  </h3>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-[#9CA3AF]">Visits</p>
                      <p className="font-medium">{stats.visitCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#9CA3AF]">Total spent</p>
                      <p className="font-medium">
                        {formatCurrency(stats.totalPaid)}
                      </p>
                    </div>
                  </div>
                  {stats.customer.notes && (
                    <p className="mt-2 text-xs text-[#6B7280]">
                      {stats.customer.notes}
                    </p>
                  )}
                </div>
              ) : null}

              <div className="mt-5">
                <h3 className="text-sm font-semibold text-[#1C103D]">Timeline</h3>
                <div className="mt-3 space-y-3">
                  {timeline.map((step) => (
                    <div key={step.label} className="flex items-start gap-3">
                      <div
                        className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                          step.done ? "bg-[#6C3BFF]" : "bg-[#E8ECF4]"
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium text-[#1C103D]">
                          {step.label}
                        </p>
                        <p className="text-xs text-[#9CA3AF]">{step.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-[#E8ECF4] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4">
              <div className="flex flex-wrap gap-2">
                {entry.status === "waiting" && (
                  <Button
                    onClick={() => onAssign(entry)}
                    disabled={loading}
                    className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                  >
                    Assign
                  </Button>
                )}
                {entry.status === "assigned" && (
                  <Button
                    onClick={() => onStart(entry.id)}
                    disabled={loading}
                    className="flex-1 rounded-xl bg-gradient-to-r from-[#FF2D6F] to-[#FF6B6B] text-white"
                  >
                    Start
                  </Button>
                )}
                {entry.status === "in_progress" && (
                  <Button
                    onClick={() => onComplete(entry.id)}
                    disabled={loading}
                    className="flex-1 rounded-xl bg-[#6C3BFF] text-white"
                  >
                    Complete
                  </Button>
                )}
                {entry.status !== "completed" && (
                  <Button
                    variant="outline"
                    onClick={() => onCancel(entry.id)}
                    disabled={loading}
                    className="rounded-xl border-red-200 text-red-600"
                  >
                    Cancel
                  </Button>
                )}
                {entry.status === "completed" && onCreateInvoice ? (
                  <Button
                    variant="outline"
                    onClick={() =>
                      onCreateInvoice({
                        id: entry.id,
                        customer: entry.customer,
                        employeeId: entry.employee?.id ?? null,
                        seatId: entry.seat?.id ?? null,
                        appointmentId: entry.appointmentId,
                        services: entry.services,
                        invoices: [],
                      })
                    }
                    disabled={loading || !entry.employee}
                    className="rounded-xl border-[#6C3BFF]/30 text-[#6C3BFF] hover:bg-[#EDE9FE]"
                  >
                    <FileText className="mr-1.5 h-4 w-4" />
                    Invoice
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    disabled
                    title="Create invoice after completing service"
                    className="rounded-xl"
                  >
                    <FileText className="mr-1.5 h-4 w-4" />
                    Invoice
                  </Button>
                )}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
