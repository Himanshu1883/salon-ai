"use client";

import { format } from "date-fns";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  AppointmentSnapshot,
  CompletedEntry,
  QueueEntry,
} from "./types";
import {
  formatPhone,
  formatWaitTime,
  getInitials,
  getServiceDuration,
  getServiceNames,
  getWaitMinutes,
  isAppointmentSnapshot,
  isCompletedEntry,
} from "./queue-utils";
import { QueueStatusBadge } from "./queue-status-badge";
import { QueueRowActions } from "./queue-row-actions";

type QueueMobileCardsProps = {
  items: (QueueEntry | CompletedEntry | AppointmentSnapshot)[];
  now: Date;
  loading: boolean;
  onAssign: (entry: QueueEntry) => void;
  onStart: (id: string) => void;
  onComplete: (id: string) => void;
  onCancel: (id: string) => void;
  onRowClick: (entry: QueueEntry) => void;
  onViewDetails: (entry: QueueEntry) => void;
};

export function QueueMobileCards({
  items,
  now,
  loading,
  onAssign,
  onStart,
  onComplete,
  onCancel,
  onRowClick,
  onViewDetails,
}: QueueMobileCardsProps) {
  if (items.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-[#6B7280]">
        No entries in this tab.
      </div>
    );
  }

  return (
    <div className="space-y-3 p-3">
      {items.map((item) => {
        if (isAppointmentSnapshot(item) || isCompletedEntry(item)) {
          const name = item.customer.name;
          const status = isCompletedEntry(item) ? "completed" : item.status;
          return (
            <div
              key={item.id}
              className="rounded-2xl border border-[#E8ECF4] bg-[#F7F8FC] p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-[#1C103D]">{name}</p>
                <QueueStatusBadge status={status} />
              </div>
              <p className="mt-1 text-sm text-[#6B7280]">
                {isCompletedEntry(item)
                  ? getServiceNames(item)
                  : item.service.name}
              </p>
            </div>
          );
        }

        const entry = item;
        const waitMinutes = getWaitMinutes(entry, now);

        return (
          <button
            key={entry.id}
            type="button"
            onClick={() => onRowClick(entry)}
            className="w-full rounded-2xl border border-[#E8ECF4] bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EDE9FE] text-sm font-bold text-[#6C3BFF]">
                  {entry.position}
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#6C3BFF] to-[#FF2D6F] text-xs font-bold text-white">
                  {getInitials(entry.customer.name)}
                </div>
                <div>
                  <p className="font-medium text-[#1C103D]">
                    {entry.customer.name}
                  </p>
                  <p className="text-xs text-[#9CA3AF]">
                    {formatPhone(entry.customer.phone)}
                  </p>
                </div>
              </div>
              <QueueStatusBadge status={entry.status} />
            </div>

            <div className="mt-3 space-y-1.5 text-sm">
              <p className="text-[#1C103D]">{getServiceNames(entry)}</p>
              <p className="text-xs text-[#6B7280]">
                {entry.employee?.name ?? "Unassigned"} ·{" "}
                {getServiceDuration(entry)} min
              </p>
              <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                {formatWaitTime(waitMinutes)} · Arrived{" "}
                {format(new Date(entry.checkedInAt), "h:mm a")}
              </div>
            </div>

            <div
              className="mt-3 border-t border-[#E8ECF4] pt-3"
              onClick={(e) => e.stopPropagation()}
            >
              <QueueRowActions
                entry={entry}
                loading={loading}
                onAssign={onAssign}
                onStart={onStart}
                onComplete={onComplete}
                onCancel={onCancel}
                onViewDetails={onViewDetails}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}
