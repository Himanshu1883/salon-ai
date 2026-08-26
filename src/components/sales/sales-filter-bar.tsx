"use client";

import { Search, Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PAYMENT_LABELS } from "./types";

type SalesFilterBarProps = {
  search: string;
  dateFrom: string;
  dateTo: string;
  paymentMethod: string;
  stylist: string;
  stylists: string[];
  onSearchChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onPaymentMethodChange: (value: string) => void;
  onStylistChange: (value: string) => void;
  onApply: () => void;
  onReset: () => void;
};

export function SalesFilterBar({
  search,
  dateFrom,
  dateTo,
  paymentMethod,
  stylist,
  stylists,
  onSearchChange,
  onDateFromChange,
  onDateToChange,
  onPaymentMethodChange,
  onStylistChange,
  onApply,
  onReset,
}: SalesFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-[#ECECEC] px-5 py-4 lg:flex-row lg:flex-wrap lg:items-end">
      <div className="relative min-w-[200px] flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
        <Input
          placeholder="Search customer name or phone..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onApply()}
          className="h-10 rounded-xl border-[#ECECEC] bg-[#F8F9FC] pl-9 transition-colors duration-150 focus:bg-white"
        />
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <div className="space-y-1">
          <label className="text-[10px] font-medium uppercase tracking-wide text-[#9CA3AF]">
            From
          </label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="h-10 w-auto rounded-xl border-[#ECECEC]"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-medium uppercase tracking-wide text-[#9CA3AF]">
            To
          </label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="h-10 w-auto rounded-xl border-[#ECECEC]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-medium uppercase tracking-wide text-[#9CA3AF]">
            Payment
          </label>
          <Select value={paymentMethod} onValueChange={onPaymentMethodChange}>
            <SelectTrigger className="h-10 w-[160px] rounded-xl border-[#ECECEC]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All methods</SelectItem>
              <SelectItem value="partial">Partial payment</SelectItem>
              {Object.entries(PAYMENT_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-medium uppercase tracking-wide text-[#9CA3AF]">
            Stylist
          </label>
          <Select value={stylist} onValueChange={onStylistChange}>
            <SelectTrigger className="h-10 w-[140px] rounded-xl border-[#ECECEC]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All stylists</SelectItem>
              {stylists.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={onApply}
          className="h-10 rounded-xl bg-[#6C3CF0] px-4 text-white shadow-[0_4px_16px_rgba(108,60,240,0.3)] transition-all duration-150 hover:bg-[#5B2FD9]"
        >
          <Filter className="h-4 w-4" />
          Apply Filter
        </Button>
        <Button
          variant="outline"
          onClick={onReset}
          className="h-10 rounded-xl border-[#ECECEC] transition-all duration-150 hover:bg-[#F8F9FC]"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>
    </div>
  );
}
