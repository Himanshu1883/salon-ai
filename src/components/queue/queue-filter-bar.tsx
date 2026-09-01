"use client";

import {
  Clock,
  RotateCcw,
  Search,
  Star,
  User,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Employee, ServiceOption } from "./types";
import type { QueueFilters } from "./queue-utils";
import { DEFAULT_FILTERS } from "./queue-utils";

type QueueFilterBarProps = {
  filters: QueueFilters;
  employees: Employee[];
  services: ServiceOption[];
  onChange: (filters: QueueFilters) => void;
};

function StubSelect({ label }: { label: string }) {
  return (
    <Select disabled>
      <SelectTrigger
        title="Coming soon"
        className="h-9 w-full min-w-0 overflow-hidden rounded-xl border-[#E8ECF4] bg-[#F7F8FC] text-xs text-[#9CA3AF] sm:w-[130px] sm:shrink-0"
      >
        <SelectValue placeholder={label} />
      </SelectTrigger>
    </Select>
  );
}

export function QueueFilterBar({
  filters,
  employees,
  services,
  onChange,
}: QueueFilterBarProps) {
  const set = (patch: Partial<QueueFilters>) =>
    onChange({ ...filters, ...patch });

  return (
    <div className="min-w-0 rounded-xl border border-[#E8ECF4] bg-white p-2.5 shadow-[0_2px_12px_rgba(28,16,61,0.04)] sm:rounded-2xl sm:p-4">
      <div className="flex min-w-0 flex-col gap-2.5 xl:flex-row xl:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          <Input
            value={filters.search}
            onChange={(e) => set({ search: e.target.value })}
            placeholder="Search customers, services..."
            className="h-9 min-w-0 rounded-xl border-[#E8ECF4] bg-[#F7F8FC] pl-9 text-sm sm:h-10"
          />
        </div>

        <div className="grid min-w-0 grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
          <Select
            value={filters.status}
            onValueChange={(v) => set({ status: v })}
          >
            <SelectTrigger className="h-9 w-full min-w-0 overflow-hidden rounded-xl border-[#E8ECF4] bg-[#F7F8FC] text-xs sm:w-[130px] sm:shrink-0">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="waiting">Waiting</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.stylist}
            onValueChange={(v) => set({ stylist: v })}
          >
            <SelectTrigger className="h-9 w-full min-w-0 overflow-hidden rounded-xl border-[#E8ECF4] bg-[#F7F8FC] text-xs sm:w-[130px] sm:shrink-0">
              <User className="mr-1 hidden h-3.5 w-3.5 shrink-0 text-[#9CA3AF] sm:block" />
              <SelectValue placeholder="Stylist" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stylists</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {employees.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.service}
            onValueChange={(v) => set({ service: v })}
          >
            <SelectTrigger className="h-9 w-full min-w-0 overflow-hidden rounded-xl border-[#E8ECF4] bg-[#F7F8FC] text-xs sm:w-[130px] sm:shrink-0">
              <SelectValue placeholder="Service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All services</SelectItem>
              {services.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <StubSelect label="Branch" />

          <Select
            value={filters.priority}
            onValueChange={(v) => set({ priority: v })}
          >
            <SelectTrigger className="h-9 w-full min-w-0 overflow-hidden rounded-xl border-[#E8ECF4] bg-[#F7F8FC] text-xs sm:w-[130px] sm:shrink-0">
              <Star className="mr-1 hidden h-3.5 w-3.5 shrink-0 text-[#9CA3AF] sm:block" />
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priority</SelectItem>
              <SelectItem value="vip">VIP first</SelectItem>
              <SelectItem value="long-wait">Long wait</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.arrivalTime}
            onValueChange={(v) => set({ arrivalTime: v })}
          >
            <SelectTrigger className="h-9 w-full min-w-0 overflow-hidden rounded-xl border-[#E8ECF4] bg-[#F7F8FC] text-xs sm:w-[130px] sm:shrink-0">
              <Clock className="mr-1 hidden h-3.5 w-3.5 shrink-0 text-[#9CA3AF] sm:block" />
              <SelectValue placeholder="Arrival" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any time</SelectItem>
              <SelectItem value="morning">Morning</SelectItem>
              <SelectItem value="afternoon">Afternoon</SelectItem>
              <SelectItem value="evening">Evening</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.waitingTime}
            onValueChange={(v) => set({ waitingTime: v })}
          >
            <SelectTrigger className="h-9 w-full min-w-0 overflow-hidden rounded-xl border-[#E8ECF4] bg-[#F7F8FC] text-xs sm:w-[130px] sm:shrink-0">
              <SelectValue placeholder="Wait time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any wait</SelectItem>
              <SelectItem value="under15">Under 15 min</SelectItem>
              <SelectItem value="15-30">15–30 min</SelectItem>
              <SelectItem value="over30">Over 30 min</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onChange(DEFAULT_FILTERS)}
            className="h-9 w-full min-w-0 rounded-xl border-[#E8ECF4] bg-white text-xs text-[#6B7280] sm:w-auto sm:shrink-0"
          >
            <RotateCcw className="mr-1 h-3.5 w-3.5" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
