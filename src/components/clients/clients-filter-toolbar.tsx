"use client";

import {
  Bookmark,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
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
import type { CustomerSort } from "@/actions/customers";
import { SORT_OPTIONS } from "./types";

type ClientsFilterToolbarProps = {
  search: string;
  sort: CustomerSort;
  onSearchChange: (value: string) => void;
  onSortChange: (value: CustomerSort) => void;
  onFiltersOpen: () => void;
  onReset: () => void;
};

function SecondaryFilters({
  sort,
  onSortChange,
  onFiltersOpen,
  onReset,
  stacked = false,
}: {
  sort: CustomerSort;
  onSortChange: (value: CustomerSort) => void;
  onFiltersOpen: () => void;
  onReset: () => void;
  stacked?: boolean;
}) {
  const triggerClass = stacked
    ? "h-11 w-full rounded-xl border-[#E8ECF4]"
    : "w-[130px] shrink-0 rounded-xl border-[#E8ECF4] opacity-60";

  return (
    <>
      <Button
        variant="outline"
        size={stacked ? "default" : "sm"}
        onClick={onFiltersOpen}
        className={
          stacked
            ? "h-11 min-h-[48px] w-full rounded-xl border-[#E8ECF4]"
            : "shrink-0 rounded-xl border-[#E8ECF4]"
        }
      >
        <SlidersHorizontal className="h-4 w-4" />
        Advanced filters
      </Button>

      <Select disabled>
        <SelectTrigger className={triggerClass}>
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
        </SelectContent>
      </Select>

      <Select disabled>
        <SelectTrigger className={stacked ? "h-11 w-full rounded-xl border-[#E8ECF4] opacity-60" : "w-[150px] shrink-0 rounded-xl border-[#E8ECF4] opacity-60"}>
          <SelectValue placeholder="Membership" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={sort}
        onValueChange={(value) => onSortChange(value as CustomerSort)}
      >
        <SelectTrigger className={stacked ? "h-11 w-full rounded-xl border-[#E8ECF4]" : "w-[220px] shrink-0 rounded-xl border-[#E8ECF4]"}>
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size={stacked ? "default" : "sm"}
        onClick={onReset}
        className={
          stacked
            ? "h-11 min-h-[48px] w-full rounded-xl border-[#E8ECF4]"
            : "shrink-0 rounded-xl border-[#E8ECF4]"
        }
      >
        <RotateCcw className="h-4 w-4" />
        Reset
      </Button>

      <Button
        variant="outline"
        size={stacked ? "default" : "sm"}
        disabled
        className={
          stacked
            ? "h-11 w-full rounded-xl border-[#E8ECF4] opacity-60"
            : "shrink-0 rounded-xl border-[#E8ECF4] opacity-60"
        }
      >
        <Bookmark className="h-4 w-4" />
        Saved Filters
      </Button>
    </>
  );
}

export function ClientsFilterToolbar({
  search,
  sort,
  onSearchChange,
  onSortChange,
  onFiltersOpen,
  onReset,
}: ClientsFilterToolbarProps) {
  return (
    <div className="space-y-3">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
        <Input
          placeholder="Search by name, email or phone…"
          className="h-11 rounded-xl border-[#E8ECF4] bg-white pl-9 shadow-sm"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="hidden flex-wrap gap-2 lg:flex">
        <Button
          variant="outline"
          size="sm"
          onClick={onFiltersOpen}
          className="shrink-0 rounded-xl border-[#E8ECF4]"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
        <SecondaryFilters
          sort={sort}
          onSortChange={onSortChange}
          onFiltersOpen={onFiltersOpen}
          onReset={onReset}
        />
      </div>

      <div className="lg:hidden">
        <FilterDrawer
          triggerLabel="Filter clients"
          onApply={() => {}}
          onReset={onReset}
        >
          <SecondaryFilters
            sort={sort}
            onSortChange={onSortChange}
            onFiltersOpen={onFiltersOpen}
            onReset={onReset}
            stacked
          />
        </FilterDrawer>
      </div>
    </div>
  );
}
