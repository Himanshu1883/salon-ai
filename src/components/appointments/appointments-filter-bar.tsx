"use client";

import { format } from "date-fns";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  List,
  Search,
  LayoutGrid,
  GanttChart,
  CalendarRange,
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
import type { Employee, Service } from "./types";
import type { ViewMode, ViewSwitcherMode } from "./appointments-utils";
import { cn } from "@/lib/utils";

type AppointmentsFilterBarProps = {
  employees: Employee[];
  services: Service[];
  employeeFilter: string;
  serviceFilter: string;
  statusFilter: string;
  searchQuery: string;
  selectedDate: string;
  onEmployeeFilterChange: (value: string) => void;
  onServiceFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onToday: () => void;
  onWeekChange: (offset: number) => void;
  weekRangeLabel: string;
};

export function AppointmentsFilterBar({
  employees,
  services,
  employeeFilter,
  serviceFilter,
  statusFilter,
  searchQuery,
  selectedDate,
  onEmployeeFilterChange,
  onServiceFilterChange,
  onStatusFilterChange,
  onSearchChange,
  onDateChange,
  onToday,
  onWeekChange,
  weekRangeLabel,
}: AppointmentsFilterBarProps) {
  return (
    <div className="rounded-[20px] border border-[#E8ECF4] bg-white p-3 shadow-[0_4px_24px_rgba(28,16,61,0.06)] sm:p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={employeeFilter} onValueChange={onEmployeeFilterChange}>
            <SelectTrigger className="h-10 w-[140px] rounded-xl border-[#E8ECF4] bg-[#F7F8FC] text-sm">
              <SelectValue placeholder="Staff" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All staff</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {employees.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={serviceFilter} onValueChange={onServiceFilterChange}>
            <SelectTrigger className="h-10 w-[140px] rounded-xl border-[#E8ECF4] bg-[#F7F8FC] text-sm">
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

          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="h-10 w-[130px] rounded-xl border-[#E8ECF4] bg-[#F7F8FC] text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="checked_in">In Queue</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value="main" disabled>
            <SelectTrigger className="h-10 w-[130px] rounded-xl border-[#E8ECF4] bg-[#F7F8FC] text-sm opacity-60">
              <GitBranch className="mr-1.5 h-3.5 w-3.5" />
              <SelectValue placeholder="Branch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="main">Main branch</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="h-10 w-[140px] rounded-xl border-[#E8ECF4] bg-[#F7F8FC] text-sm"
          />

          <Button
            variant="outline"
            size="sm"
            onClick={onToday}
            className="h-10 rounded-xl border-[#E8ECF4] bg-[#F7F8FC] px-4 hover:border-[#6C3BFF]/30 hover:bg-white"
          >
            Today
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-xl border-[#E8ECF4]"
            onClick={() => onWeekChange(-1)}
            aria-label="Previous week"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-xl border-[#E8ECF4]"
            onClick={() => onWeekChange(1)}
            aria-label="Next week"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="min-w-[160px] text-sm font-semibold text-[#1C103D]">
            {weekRangeLabel}
          </span>
          <div className="relative min-w-[200px] flex-1 xl:max-w-[280px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search appointments..."
              className="h-10 rounded-xl border-[#E8ECF4] bg-[#F7F8FC] pl-9 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

type AppointmentsViewSwitcherProps = {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
  listBadge?: number;
};

const VIEW_ITEMS: {
  id: ViewSwitcherMode;
  label: string;
  icon: React.ReactNode;
  wired: boolean;
  mapsTo?: ViewMode;
}[] = [
  { id: "week", label: "Week", icon: <CalendarDays className="h-3.5 w-3.5" />, wired: true, mapsTo: "week" },
  { id: "day", label: "Day", icon: <CalendarRange className="h-3.5 w-3.5" />, wired: true, mapsTo: "day" },
  { id: "month", label: "Month", icon: <LayoutGrid className="h-3.5 w-3.5" />, wired: false },
  { id: "timeline", label: "Timeline", icon: <GanttChart className="h-3.5 w-3.5" />, wired: false },
  { id: "list", label: "Agenda", icon: <List className="h-3.5 w-3.5" />, wired: true, mapsTo: "list" },
];

export function AppointmentsViewSwitcher({
  view,
  onChange,
  listBadge,
}: AppointmentsViewSwitcherProps) {
  return (
    <div className="inline-flex rounded-2xl border border-[#E8ECF4] bg-[#F7F8FC] p-1 shadow-sm">
      {VIEW_ITEMS.map((item) => {
        const active = item.wired && item.mapsTo === view;
        return (
          <button
            key={item.id}
            type="button"
            disabled={!item.wired}
            onClick={() => item.mapsTo && onChange(item.mapsTo)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-all",
              active
                ? "bg-white text-[#6C3BFF] shadow-sm"
                : item.wired
                  ? "text-[#6B7280] hover:text-[#1C103D]"
                  : "cursor-not-allowed text-[#C4C9D4] opacity-70"
            )}
            title={!item.wired ? "Coming soon" : undefined}
          >
            {item.icon}
            {item.label}
            {item.id === "list" && listBadge !== undefined && listBadge > 0 && (
              <span className="ml-0.5 rounded-full bg-[#FF2D6F] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {listBadge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function getWeekRangeLabel(weekStart: Date, weekEnd: Date) {
  return format(weekStart, "MMM d") === format(weekEnd, "MMM d")
    ? format(weekStart, "MMM d, yyyy")
    : `${format(weekStart, "MMM d")} – ${format(weekEnd, "MMM d, yyyy")}`;
}
