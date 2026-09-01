"use client";

import { motion } from "framer-motion";
import { UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CheckInCard,
  CheckInCardContent,
  CheckInCardHeader,
} from "./check-in-card";
import type { CheckInEmployee, CheckInService } from "./types";
import { getInitials } from "./utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

const UNASSIGNED = "__unassigned__";

type StylistSelectionProps = {
  employees: CheckInEmployee[];
  services: CheckInService[];
  selectedServiceIds: string[];
  staffByService: Record<string, string>;
  onAssign: (serviceId: string, employeeId: string) => void;
};

function StaffAvatar({
  name,
  size = "md",
}: {
  name?: string;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-dashboard-primary to-violet-500 font-semibold text-white shadow-sm shadow-violet-500/20",
        size === "sm" ? "h-8 w-8 text-[10px]" : "h-10 w-10 text-xs"
      )}
    >
      {name ? getInitials(name) : <UserRound className="h-4 w-4" />}
    </span>
  );
}

function StaffSelect({
  employees,
  value,
  onChange,
}: {
  employees: CheckInEmployee[];
  value: string;
  onChange: (employeeId: string) => void;
}) {
  const selected = employees.find((employee) => employee.id === value);

  return (
    <Select
      value={value || UNASSIGNED}
      onValueChange={(next) => onChange(next === UNASSIGNED ? "" : next)}
    >
      <SelectTrigger
        className={cn(
          "h-auto min-h-14 w-full rounded-2xl border bg-white/90 px-3 py-2.5 text-left shadow-sm backdrop-blur-sm transition-all focus:ring-violet-400",
          selected
            ? "border-violet-300/80 ring-1 ring-violet-200/70"
            : "border-dashboard-border hover:border-violet-200/80"
        )}
      >
        <span className="flex min-w-0 flex-1 items-center gap-3">
          <StaffAvatar name={selected?.name} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-dashboard-text">
              {selected?.name ?? "Any available stylist"}
            </span>
            <span className="block truncate text-xs text-dashboard-muted">
              {selected
                ? [selected.role, selected.specialties]
                    .filter(Boolean)
                    .join(" · ") || "Assigned to this service"
                : "Assign later from the queue"}
            </span>
          </span>
        </span>
      </SelectTrigger>
      <SelectContent
        position="popper"
        sideOffset={6}
        className="z-[80] max-h-72 overflow-y-auto rounded-2xl border-violet-100/90 p-1.5 shadow-xl shadow-violet-500/10"
      >
        <SelectItem
          value={UNASSIGNED}
          className="rounded-xl py-2.5 pl-9 focus:bg-violet-50 focus:text-dashboard-text"
        >
          Any available stylist
        </SelectItem>
        {employees.map((employee) => (
          <SelectItem
            key={employee.id}
            value={employee.id}
            className="rounded-xl py-2 pl-9 focus:bg-violet-50 focus:text-dashboard-text"
          >
            {employee.name}
            {employee.role ? ` · ${employee.role}` : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function StylistSelection({
  employees,
  services,
  selectedServiceIds,
  staffByService,
  onAssign,
}: StylistSelectionProps) {
  if (selectedServiceIds.length === 0) return null;

  const selectedServices = services.filter((s) =>
    selectedServiceIds.includes(s.id)
  );
  const totalDuration = selectedServices.reduce(
    (sum, s) => sum + s.duration,
    0
  );
  const perService = selectedServiceIds.length > 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <CheckInCard glow>
        <CheckInCardHeader
          step={3}
          title={perService ? "Select Stylists" : "Select Stylist"}
          description={
            perService
              ? `One staff member per service · Est. ${totalDuration} min`
              : `Est. ${totalDuration} min service time`
          }
        />

        <CheckInCardContent className="pt-2">
          {employees.length === 0 ? (
            <p className="text-sm text-dashboard-muted">
              No active stylists. Assign from the queue after check-in.
            </p>
          ) : (
            <div className="space-y-3">
              {selectedServices.map((service) => {
                const assignedId = staffByService[service.id] ?? "";
                const assigned = employees.find((e) => e.id === assignedId);
                return (
                  <div
                    key={service.id}
                    className="rounded-2xl border border-dashboard-border/60 bg-white/55 p-3 shadow-sm sm:p-4"
                  >
                    <div className="mb-2.5 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-dashboard-text">
                          {service.name}
                        </p>
                        <p className="text-xs text-dashboard-muted">
                          {service.duration} min
                        </p>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset",
                          assigned
                            ? "bg-violet-50 text-violet-700 ring-violet-200/70"
                            : "bg-stone-50 text-dashboard-muted ring-stone-200/80"
                        )}
                      >
                        {assigned ? assigned.name : "Unassigned"}
                      </span>
                    </div>
                    <StaffSelect
                      employees={employees}
                      value={assignedId}
                      onChange={(employeeId) =>
                        onAssign(service.id, employeeId)
                      }
                    />
                  </div>
                );
              })}
            </div>
          )}
        </CheckInCardContent>
      </CheckInCard>
    </motion.div>
  );
}
