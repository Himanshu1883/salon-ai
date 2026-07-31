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
import type { BillingEmployee, BillingFilters } from "./types";

type BillingFilterBarProps = {
  filters: BillingFilters;
  employees: BillingEmployee[];
  isBasicPlan?: boolean;
  onApply: (e: React.FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
};

export function BillingFilterBar({
  filters,
  employees,
  isBasicPlan,
  onApply,
  onReset,
}: BillingFilterBarProps) {
  return (
    <form
      onSubmit={onApply}
      className="flex w-full flex-wrap items-center justify-end gap-2 sm:gap-3"
    >
      <Select name="status" defaultValue={filters.status}>
        <SelectTrigger className="h-9 w-[130px] rounded-xl border-[#ECECEC] bg-white text-sm">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="sent">Sent</SelectItem>
          <SelectItem value="paid">Paid</SelectItem>
          <SelectItem value="overdue">Overdue</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      <Input
        name="dateFrom"
        type="date"
        defaultValue={filters.dateFrom}
        className="h-9 w-[140px] rounded-xl border-[#ECECEC] text-sm"
      />
      <Input
        name="dateTo"
        type="date"
        defaultValue={filters.dateTo}
        className="h-9 w-[140px] rounded-xl border-[#ECECEC] text-sm"
      />

      {!isBasicPlan && (
        <Select name="employeeId" defaultValue={filters.employeeId}>
          <SelectTrigger className="h-9 w-[150px] rounded-xl border-[#ECECEC] bg-white text-sm">
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

      <Button
        type="submit"
        size="sm"
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
    </form>
  );
}
