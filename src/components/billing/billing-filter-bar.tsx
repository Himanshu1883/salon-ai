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
  filters: BillingFilters;
  employees: BillingEmployee[];
  isBasicPlan?: boolean;
  onApply: (e: React.FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
};

function BillingFilterFields({
  filters,
  employees,
  isBasicPlan,
  stacked = false,
}: {
  filters: BillingFilters;
  employees: BillingEmployee[];
  isBasicPlan?: boolean;
  stacked?: boolean;
}) {
  const triggerClass = stacked
    ? "h-11 w-full rounded-xl border-[#ECECEC] bg-white text-sm"
    : "h-9 w-full min-w-0 rounded-xl border-[#ECECEC] bg-white text-sm sm:w-[130px]";
  const dateClass = stacked
    ? "h-11 w-full rounded-xl border-[#ECECEC] text-sm"
    : "h-9 w-full min-w-0 rounded-xl border-[#ECECEC] text-sm sm:w-[140px]";

  return (
    <>
      <Select name="status" defaultValue={filters.status}>
        <SelectTrigger className={triggerClass}>
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
        className={dateClass}
        aria-label="From date"
      />
      <Input
        name="dateTo"
        type="date"
        defaultValue={filters.dateTo}
        className={dateClass}
        aria-label="To date"
      />

      {!isBasicPlan && (
        <Select name="employeeId" defaultValue={filters.employeeId}>
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
  filters,
  employees,
  isBasicPlan,
  onApply,
  onReset,
}: BillingFilterBarProps) {
  const formId = "billing-invoice-filters";

  return (
    <div className="w-full min-w-0 lg:w-auto">
      <form
        id={formId}
        onSubmit={onApply}
        className="hidden w-full flex-wrap items-center justify-end gap-2 lg:flex lg:gap-3"
      >
        <BillingFilterFields
          filters={filters}
          employees={employees}
          isBasicPlan={isBasicPlan}
        />
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

      <form
        id={`${formId}-mobile`}
        onSubmit={onApply}
        className="lg:hidden"
      >
        <FilterDrawer
          triggerLabel="Filter invoices"
          onApply={() =>
            (
              document.getElementById(`${formId}-mobile`) as HTMLFormElement | null
            )?.requestSubmit()
          }
          onReset={onReset}
        >
          <BillingFilterFields
            filters={filters}
            employees={employees}
            isBasicPlan={isBasicPlan}
            stacked
          />
        </FilterDrawer>
      </form>
    </div>
  );
}
