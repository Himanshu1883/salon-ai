"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BillingEmployee } from "./types";

type BillingFilterBarProps = {
  status: string;
  dateFrom: string;
  dateTo: string;
  employeeId: string;
  employees: BillingEmployee[];
  isBasicPlan?: boolean;
  onStatusChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onEmployeeIdChange: (value: string) => void;
  onReset: () => void;
};

export function BillingFilterBar({
  status,
  dateFrom,
  dateTo,
  employeeId,
  employees,
  isBasicPlan,
  onStatusChange,
  onDateFromChange,
  onDateToChange,
  onEmployeeIdChange,
  onReset,
}: BillingFilterBarProps) {
  const triggerClass =
    "h-8 w-full min-w-0 overflow-hidden rounded-xl border-[#ECECEC] bg-white text-xs lg:h-9 lg:w-[130px] lg:text-sm";
  const dateClass =
    "h-8 w-full min-w-0 rounded-xl border-[#ECECEC] text-xs lg:h-9 lg:w-[140px] lg:text-sm";

  return (
    <div className="flex w-full min-w-0 flex-col gap-1.5 lg:w-auto lg:flex-row lg:flex-wrap lg:items-center lg:justify-end lg:gap-2">
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-1.5 lg:contents">
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className={triggerClass}>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="partial">Partial payment</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onReset}
          className="h-8 w-8 shrink-0 rounded-xl border-[#ECECEC] px-0 lg:h-9 lg:w-auto lg:px-3"
          aria-label="Reset filters"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">Reset</span>
        </Button>
      </div>

      <div className="grid min-w-0 grid-cols-2 gap-1.5 lg:contents">
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          className={dateClass}
          aria-label="From date"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          className={dateClass}
          aria-label="To date"
        />
        {!isBasicPlan && (
          <Select value={employeeId} onValueChange={onEmployeeIdChange}>
            <SelectTrigger className="col-span-2 h-8 w-full min-w-0 overflow-hidden rounded-xl border-[#ECECEC] bg-white text-xs lg:col-span-1 lg:h-9 lg:w-[150px] lg:text-sm">
              <SelectValue placeholder="Stylist" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All stylists</SelectItem>
              {employees.map((emp) => (
                <SelectItem key={emp.id} value={emp.id}>
                  {emp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}
