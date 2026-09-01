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
    <div className="space-y-2 p-2 sm:space-y-3 sm:p-3">
      {items.map((item) => {
        if (isAppointmentSnapshot(item) || isCompletedEntry(item)) {
          const name = item.customer.name;
          const status = isCompletedEntry(item) ? "completed" : item.status;
          return (
            <div
              key={item.id}
              className="rounded-xl border border-[#E8ECF4] bg-[#F7F8FC] p-3 sm:rounded-2xl sm:p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium text-[#1C103D]">{name}</p>
                <QueueStatusBadge status={status} />
              </div>
              <p className="mt-1 break-words text-xs text-[#6B7280] sm:text-sm">
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
            className="w-full rounded-xl border border-[#E8ECF4] bg-white p-3 text-left shadow-sm transition-shadow hover:shadow-md sm:rounded-2xl sm:p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6C3BFF] to-[#FF2D6F] text-[10px] font-bold text-white">
                  {getInitials(entry.customer.name)}
                  <span className="absolute -left-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded bg-[#EDE9FE] px-0.5 text-[9px] font-bold text-[#6C3BFF]">
                    {entry.position}
                  </span>
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#1C103D]">
                    {entry.customer.name}
                  </p>
                  <p className="text-xs text-[#9CA3AF]">
                    {formatPhone(entry.customer.phone)}
                  </p>
                </div>
              </div>
              <QueueStatusBadge status={entry.status} />
            </div>

            <div className="mt-2 space-y-1 text-sm sm:mt-3 sm:space-y-1.5">
              <p className="break-words text-sm text-[#1C103D]">{getServiceNames(entry)}</p>
              <p className="text-xs text-[#6B7280]">
                {entry.employee?.name ?? "Unassigned"} ·{" "}
                {getServiceDuration(entry)} min
              </p>
              <div className="flex min-w-0 flex-wrap items-center gap-1.5 text-xs text-[#6B7280]">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                {formatWaitTime(waitMinutes)} · Arrived{" "}
                {format(new Date(entry.checkedInAt), "h:mm a")}
              </div>
            </div>

            <div
              className="mt-2 border-t border-[#E8ECF4] pt-2 sm:mt-3 sm:pt-3"
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
