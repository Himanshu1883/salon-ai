"use client";

import {
  Bookmark,
  Calendar,
  Filter,
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
          className="rounded-xl border-[#E8ECF4] bg-white pl-9 shadow-sm"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={onFiltersOpen}
          className="shrink-0 rounded-xl border-[#E8ECF4]"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>

        <Select disabled>
          <SelectTrigger className="w-[130px] shrink-0 rounded-xl border-[#E8ECF4] opacity-60">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
          </SelectContent>
        </Select>

        <Select disabled>
          <SelectTrigger className="w-[150px] shrink-0 rounded-xl border-[#E8ECF4] opacity-60">
            <SelectValue placeholder="Membership" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>

        <Select disabled>
          <SelectTrigger className="w-[120px] shrink-0 rounded-xl border-[#E8ECF4] opacity-60">
            <SelectValue placeholder="Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>

        <Select disabled>
          <SelectTrigger className="w-[120px] shrink-0 rounded-xl border-[#E8ECF4] opacity-60">
            <SelectValue placeholder="Branch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>

        <Select disabled>
          <SelectTrigger className="w-[160px] shrink-0 rounded-xl border-[#E8ECF4] opacity-60">
            <SelectValue placeholder="Assigned Stylist" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>

        <Select disabled>
          <SelectTrigger className="w-[130px] shrink-0 rounded-xl border-[#E8ECF4] opacity-60">
            <SelectValue placeholder="Last Visit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any time</SelectItem>
          </SelectContent>
        </Select>

        <Select disabled>
          <SelectTrigger className="w-[100px] shrink-0 rounded-xl border-[#E8ECF4] opacity-60">
            <SelectValue placeholder="Tags" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={sort}
          onValueChange={(value) => onSortChange(value as CustomerSort)}
        >
          <SelectTrigger className="w-[220px] shrink-0 rounded-xl border-[#E8ECF4]">
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
          disabled
          className="shrink-0 rounded-xl border-[#E8ECF4] opacity-60"
        >
          <Calendar className="h-4 w-4" />
          Date Range
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="shrink-0 rounded-xl border-[#E8ECF4]"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>

        <Button
          variant="outline"
          size="sm"
          disabled
          className="shrink-0 rounded-xl border-[#E8ECF4] opacity-60"
        >
          <Bookmark className="h-4 w-4" />
          Saved Filters
        </Button>
      </div>
    </div>
  );
}
