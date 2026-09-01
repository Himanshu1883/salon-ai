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
  compact = false,
}: {
  sort: CustomerSort;
  onSortChange: (value: CustomerSort) => void;
  onFiltersOpen: () => void;
  onReset: () => void;
  compact?: boolean;
}) {
  const triggerClass = compact
    ? "h-8 w-full min-w-0 overflow-hidden rounded-xl border-[#E8ECF4] text-xs"
    : "w-[130px] shrink-0 rounded-xl border-[#E8ECF4] opacity-60";

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={onFiltersOpen}
        className={
          compact
            ? "h-8 w-full min-w-0 rounded-xl border-[#E8ECF4] px-2 text-xs"
            : "shrink-0 rounded-xl border-[#E8ECF4]"
        }
      >
        <SlidersHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        {compact ? "Filters" : "Advanced filters"}
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
        <SelectTrigger
          className={
            compact
              ? "h-8 w-full min-w-0 overflow-hidden rounded-xl border-[#E8ECF4] text-xs opacity-60"
              : "w-[150px] shrink-0 rounded-xl border-[#E8ECF4] opacity-60"
          }
        >
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
        <SelectTrigger
          className={
            compact
              ? "h-8 w-full min-w-0 overflow-hidden rounded-xl border-[#E8ECF4] text-xs"
              : "w-[220px] shrink-0 rounded-xl border-[#E8ECF4]"
          }
        >
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
        size="sm"
        onClick={onReset}
        className={
          compact
            ? "h-8 w-full min-w-0 rounded-xl border-[#E8ECF4] px-2 text-xs"
            : "shrink-0 rounded-xl border-[#E8ECF4]"
        }
      >
        <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        Reset
      </Button>

      <Button
        variant="outline"
        size="sm"
        disabled
        className={
          compact
            ? "h-8 w-full min-w-0 rounded-xl border-[#E8ECF4] px-2 text-xs opacity-60"
            : "shrink-0 rounded-xl border-[#E8ECF4] opacity-60"
        }
      >
        <Bookmark className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        {compact ? "Saved" : "Saved Filters"}
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
    <div className="min-w-0 space-y-2 sm:space-y-3">
      <div className="relative w-full min-w-0">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
        <Input
          placeholder="Search name, email or phone…"
          className="h-9 min-w-0 rounded-xl border-[#E8ECF4] bg-white pl-9 text-sm shadow-sm sm:h-11"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="hidden flex-wrap gap-2 lg:flex">
        <SecondaryFilters
          sort={sort}
          onSortChange={onSortChange}
          onFiltersOpen={onFiltersOpen}
          onReset={onReset}
        />
      </div>

      <div className="grid min-w-0 grid-cols-2 gap-2 lg:hidden">
        <SecondaryFilters
          sort={sort}
          onSortChange={onSortChange}
          onFiltersOpen={onFiltersOpen}
          onReset={onReset}
          compact
        />
      </div>
    </div>
  );
}
