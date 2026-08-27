"use client";

import { Plus, Scissors, Trash2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Employee, Service } from "./types";

export type AppointmentServiceLine = {
  id: string;
  serviceId: string;
  employeeId: string;
};

type AppointmentServiceLinesProps = {
  services: Service[];
  employees: Employee[];
  lines: AppointmentServiceLine[];
  onChange: (lines: AppointmentServiceLine[]) => void;
  busyEmployeeIdsByLine?: Record<string, Set<string>>;
};

function createLine(): AppointmentServiceLine {
  return {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`,
    serviceId: "",
    employeeId: "",
  };
}

function employeesForService(employees: Employee[], serviceId: string) {
  if (!serviceId) return employees;
  return employees.filter((employee) => {
    if (!employee.serviceIds?.length) return true;
    return employee.serviceIds.includes(serviceId);
  });
}

export function createInitialServiceLine(): AppointmentServiceLine {
  return createLine();
}

export function AppointmentServiceLines({
  services,
  employees,
  lines,
  onChange,
  busyEmployeeIdsByLine = {},
}: AppointmentServiceLinesProps) {
  function updateLine(id: string, patch: Partial<AppointmentServiceLine>) {
    onChange(
      lines.map((line) => (line.id === id ? { ...line, ...patch } : line))
    );
  }

  function addLine() {
    onChange([...lines, createLine()]);
  }

  function removeLine(id: string) {
    if (lines.length === 1) return;
    onChange(lines.filter((line) => line.id !== id));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md shadow-violet-500/25">
            <Scissors className="h-4 w-4" />
          </div>
          <div>
            <Label className="text-sm font-semibold text-[#1C103D]">
              Services & staff
            </Label>
            <p className="text-xs text-[#6B7280]">
              {lines.length} service{lines.length !== 1 ? "s" : ""} added
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addLine}
          className="h-9 shrink-0 rounded-xl border-violet-200 bg-violet-50/50 text-violet-700 hover:border-violet-300 hover:bg-violet-100/80"
        >
          <Plus className="h-4 w-4" />
          Add service
        </Button>
      </div>

      <div
        className={cn(
          "space-y-2.5",
          lines.length > 2 &&
            "max-h-[min(280px,36vh)] overflow-y-auto overscroll-contain pr-0.5",
          "[scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-violet-200"
        )}
      >
        {lines.map((line, index) => {
          const eligibleEmployees = employeesForService(
            employees,
            line.serviceId
          );
          const busyIds = busyEmployeeIdsByLine[line.id] ?? new Set<string>();
          const selectedService = services.find(
            (service) => service.id === line.serviceId
          );

          return (
            <div
              key={line.id}
              className="group relative overflow-hidden rounded-2xl border border-violet-100/80 bg-white p-3 shadow-sm shadow-violet-500/5 transition-shadow hover:shadow-md hover:shadow-violet-500/10"
            >
              <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-violet-500 to-purple-500" />

              <div className="grid gap-3 pl-2 sm:grid-cols-[auto_1fr_1fr_auto] sm:items-end">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
                  {index + 1}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] font-medium uppercase tracking-wide text-[#9CA3AF]">
                    Service
                  </Label>
                  <Select
                    value={line.serviceId}
                    onValueChange={(serviceId) =>
                      updateLine(line.id, { serviceId, employeeId: "" })
                    }
                  >
                    <SelectTrigger className="h-10 rounded-xl border-stone-200 bg-stone-50/50 focus:border-violet-300 focus:ring-violet-100">
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} · {service.duration} min
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-[#9CA3AF]">
                    <UserRound className="h-3 w-3" />
                    Staff
                  </Label>
                  <Select
                    value={line.employeeId}
                    onValueChange={(employeeId) =>
                      updateLine(line.id, { employeeId })
                    }
                  >
                    <SelectTrigger className="h-10 rounded-xl border-stone-200 bg-stone-50/50 focus:border-violet-300 focus:ring-violet-100">
                      <SelectValue placeholder="Any available" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any available</SelectItem>
                      {eligibleEmployees.map((employee) => {
                        const busy = busyIds.has(employee.id);
                        return (
                          <SelectItem
                            key={employee.id}
                            value={employee.id}
                            disabled={busy}
                          >
                            {busy
                              ? `${employee.name} · Unavailable`
                              : employee.name}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {lines.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 shrink-0 rounded-xl text-stone-400 opacity-70 transition-all hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                    onClick={() => removeLine(line.id)}
                    aria-label="Remove service"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {selectedService && (
                <p className="mt-2 pl-9 text-[11px] text-violet-600/80">
                  {selectedService.duration} min slot
                  {index > 0 ? " · runs after previous service" : ""}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {lines.length > 2 && (
        <p className="text-center text-[11px] text-[#9CA3AF]">
          Scroll to view all services
        </p>
      )}
    </div>
  );
}
