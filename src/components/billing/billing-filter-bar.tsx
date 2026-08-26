"use client";

import { Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterDrawer } from "@/components/ui/filter-drawer";
import type { BillingEmployee, BillingFilters } from "./types";

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
  onApply: () => void;
  onReset: () => void;
};

function BillingFilterFields({
  status,
  dateFrom,
  dateTo,
  employeeId,
  employees,
  isBasicPlan,
  stacked = false,
  onStatusChange,
  onDateFromChange,
  onDateToChange,
  onEmployeeIdChange,
}: {
  status: string;
  dateFrom: string;
  dateTo: string;
  employeeId: string;
  employees: BillingEmployee[];
  isBasicPlan?: boolean;
  stacked?: boolean;
  onStatusChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onEmployeeIdChange: (value: string) => void;
}) {
  const triggerClass = stacked
    ? "h-11 w-full rounded-xl border-[#ECECEC] bg-white text-sm"
    : "h-9 w-full min-w-0 rounded-xl border-[#ECECEC] bg-white text-sm sm:w-[130px]";
  const dateClass = stacked
    ? "h-11 w-full rounded-xl border-[#ECECEC] text-sm"
    : "h-9 w-full min-w-0 rounded-xl border-[#ECECEC] text-sm sm:w-[140px]";

  return (
    <>
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className={triggerClass}>
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="sent">Sent</SelectItem>
          <SelectItem value="partial">Partial payment</SelectItem>
          <SelectItem value="paid">Paid</SelectItem>
          <SelectItem value="overdue">Overdue</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>

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
          <SelectTrigger
            className={
              stacked
                ? "h-11 w-full rounded-xl border-[#ECECEC] bg-white text-sm"
                : "h-9 w-full min-w-0 rounded-xl border-[#ECECEC] bg-white text-sm sm:w-[150px]"
            }
          >
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
    </>
  );
}

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
  onApply,
  onReset,
}: BillingFilterBarProps) {
  const fieldProps = {
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
  };

  return (
    <div className="w-full min-w-0 lg:w-auto">
      <div className="hidden w-full flex-wrap items-center justify-end gap-2 lg:flex lg:gap-3">
        <BillingFilterFields {...fieldProps} />
        <Button
          type="button"
          size="sm"
          onClick={onApply}
          className="h-9 rounded-xl bg-[#6C3CF0] px-4 hover:bg-[#5B2FE0]"
        >
          <Filter className="h-3.5 w-3.5" />
          Apply
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onReset}
          className="h-9 rounded-xl border-[#ECECEC]"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>
      </div>

      <div className="lg:hidden">
        <FilterDrawer
          triggerLabel="Filter invoices"
          onApply={onApply}
          onReset={onReset}
        >
          <BillingFilterFields {...fieldProps} stacked />
        </FilterDrawer>
      </div>
    </div>
  );
}
