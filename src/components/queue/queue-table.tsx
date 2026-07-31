"use client";

import { format } from "date-fns";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

type QueueTableProps = {
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

export function QueueTable({
  items,
  now,
  loading,
  onAssign,
  onStart,
  onComplete,
  onCancel,
  onRowClick,
  onViewDetails,
}: QueueTableProps) {
  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-[#6B7280]">No entries in this tab.</p>
        <p className="mt-1 text-xs text-[#9CA3AF]">
          Try another tab or add a walk-in customer.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-[#E8ECF4] hover:bg-transparent">
          <TableHead className="w-10 text-xs font-semibold text-[#6B7280]">#</TableHead>
          <TableHead className="text-xs font-semibold text-[#6B7280]">Customer</TableHead>
          <TableHead className="text-xs font-semibold text-[#6B7280]">Service</TableHead>
          <TableHead className="text-xs font-semibold text-[#6B7280]">Stylist</TableHead>
          <TableHead className="text-xs font-semibold text-[#6B7280]">Wait Time</TableHead>
          <TableHead className="text-xs font-semibold text-[#6B7280]">Status</TableHead>
          <TableHead className="text-right text-xs font-semibold text-[#6B7280]">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item, index) => {
          if (isAppointmentSnapshot(item)) {
            return (
              <TableRow key={item.id} className="border-[#E8ECF4]">
                <TableCell className="text-sm font-medium text-[#9CA3AF]">
                  {index + 1}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-xs font-bold text-stone-600">
                      {getInitials(item.customer.name)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1C103D]">
                        {item.customer.name}
                      </p>
                      <p className="text-xs text-[#9CA3AF]">Appointment</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-[#1C103D]">
                  {item.service.name}
                </TableCell>
                <TableCell className="text-sm text-[#6B7280]">
                  {item.employee?.name ?? "—"}
                </TableCell>
                <TableCell className="text-sm text-[#6B7280]">
                  {format(new Date(item.scheduledAt), "h:mm a")}
                </TableCell>
                <TableCell>
                  <QueueStatusBadge status={item.status} />
                </TableCell>
                <TableCell />
              </TableRow>
            );
          }

          if (isCompletedEntry(item)) {
            return (
              <TableRow key={item.id} className="border-[#E8ECF4]">
                <TableCell className="text-sm font-medium text-[#9CA3AF]">
                  {index + 1}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700">
                      {getInitials(item.customer.name)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1C103D]">
                        {item.customer.name}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-[#1C103D]">
                  {getServiceNames(item)}
                </TableCell>
                <TableCell className="text-sm text-[#6B7280]">—</TableCell>
                <TableCell className="text-sm text-[#6B7280]">
                  {item.completedAt
                    ? format(new Date(item.completedAt), "h:mm a")
                    : "—"}
                </TableCell>
                <TableCell>
                  <QueueStatusBadge status="completed" />
                </TableCell>
                <TableCell />
              </TableRow>
            );
          }

          const entry = item as QueueEntry;
          const waitMinutes = getWaitMinutes(entry, now);
          const isLongWait = waitMinutes >= 20;

          return (
            <TableRow
              key={entry.id}
              className="cursor-pointer border-[#E8ECF4] transition-colors hover:bg-[#F7F8FC]/80"
              onClick={() => onRowClick(entry)}
            >
              <TableCell className="text-sm font-semibold text-[#6C3BFF]">
                {entry.position}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#6C3BFF] to-[#FF2D6F] text-xs font-bold text-white">
                    {getInitials(entry.customer.name)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1C103D]">
                      {entry.customer.name}
                    </p>
                    <p className="text-xs text-[#9CA3AF]">
                      {formatPhone(entry.customer.phone)}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <p className="text-sm font-medium text-[#1C103D]">
                  {getServiceNames(entry)}
                </p>
                <p className="text-xs text-[#9CA3AF]">
                  {getServiceDuration(entry)} min
                </p>
              </TableCell>
              <TableCell>
                {entry.employee ? (
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EDE9FE] text-[10px] font-bold text-[#6C3BFF]">
                      {getInitials(entry.employee.name)}
                    </div>
                    <span className="text-sm text-[#1C103D]">
                      {entry.employee.name}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-[#9CA3AF]">Unassigned</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <Clock
                    className={cn(
                      "h-3.5 w-3.5",
                      isLongWait ? "text-rose-500" : "text-amber-500"
                    )}
                  />
                  <div>
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        isLongWait ? "text-rose-600" : "text-[#1C103D]"
                      )}
                    >
                      {formatWaitTime(waitMinutes)}
                    </p>
                    <p className="text-[10px] text-[#9CA3AF]">
                      Arrived {format(new Date(entry.checkedInAt), "h:mm a")}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <QueueStatusBadge status={entry.status} />
              </TableCell>
              <TableCell className="text-right">
                <QueueRowActions
                  entry={entry}
                  loading={loading}
                  onAssign={onAssign}
                  onStart={onStart}
                  onComplete={onComplete}
                  onCancel={onCancel}
                  onViewDetails={onViewDetails}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
