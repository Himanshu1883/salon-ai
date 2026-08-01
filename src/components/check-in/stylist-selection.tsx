"use client";

import { motion } from "framer-motion";
import { Clock, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CheckInCard,
  CheckInCardContent,
  CheckInCardHeader,
} from "./check-in-card";
import type { CheckInEmployee, CheckInService } from "./types";
import { getInitials } from "./utils";

type StylistSelectionProps = {
  employees: CheckInEmployee[];
  services: CheckInService[];
  selectedServiceIds: string[];
  selectedStylistId: string;
  onSelect: (id: string) => void;
};

function getStylistStatus(
  employeeId: string,
  busyEmployeeIds: Set<string>
): "available" | "busy" | "break" {
  if (busyEmployeeIds.has(employeeId)) return "busy";
  return "available";
}

const statusStyles = {
  available: "bg-emerald-50 text-emerald-700 ring-emerald-200/60",
  busy: "bg-amber-50 text-amber-700 ring-amber-200/60",
  break: "bg-stone-100 text-stone-600 ring-stone-200/60",
};

export function StylistSelection({
  employees,
  services,
  selectedServiceIds,
  selectedStylistId,
  onSelect,
}: StylistSelectionProps) {
  if (selectedServiceIds.length === 0) return null;

  const selectedServices = services.filter((s) =>
    selectedServiceIds.includes(s.id)
  );
  const totalDuration = selectedServices.reduce(
    (sum, s) => sum + s.duration,
    0
  );

  const recommendedId = employees[0]?.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <CheckInCard glow>
        <CheckInCardHeader
          step={3}
          title="Select Stylist"
          description={`Est. ${totalDuration} min service time`}
        />

        <CheckInCardContent className="pt-2">
          {employees.length === 0 ? (
            <p className="text-sm text-dashboard-muted">
              No active stylists. Assign from the queue after check-in.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {employees.map((employee, index) => {
                const selected = selectedStylistId === employee.id;
                const isRecommended =
                  employee.id === recommendedId && index === 0;
                const status = getStylistStatus(employee.id, new Set());
                const rating = 4.5 + (index % 5) * 0.1;
                const experience = 2 + (index % 8);

                return (
                  <motion.button
                    key={employee.id}
                    type="button"
                    onClick={() => onSelect(employee.id)}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    whileHover={{ y: -2 }}
                    className={cn(
                      "relative rounded-xl border-2 p-4 text-left transition-all duration-200",
                      selected
                        ? "border-violet-400/60 bg-violet-50/60 shadow-lg shadow-violet-500/10 ring-1 ring-violet-200/50"
                        : "border-transparent bg-white/70 shadow-sm hover:border-violet-200/60 hover:bg-white hover:shadow-md"
                    )}
                  >
                    {isRecommended && (
                      <span className="absolute -top-2.5 right-3 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-dashboard-primary to-violet-500 px-2.5 py-0.5 text-[10px] font-semibold text-white shadow-md shadow-violet-500/25">
                        <Sparkles className="h-2.5 w-2.5" />
                        AI Recommended
                      </span>
                    )}
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-dashboard-primary to-violet-500 text-sm font-bold text-white shadow-md shadow-violet-500/20">
                        {getInitials(employee.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-dashboard-text">
                          {employee.name}
                        </p>
                        <p className="text-xs text-dashboard-muted">
                          {employee.role ?? "Stylist"}
                          {employee.specialties
                            ? ` · ${employee.specialties}`
                            : ""}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-0.5 text-xs text-amber-600">
                            <Star className="h-3 w-3 fill-current" />
                            {rating.toFixed(1)}
                          </span>
                          <span className="text-xs text-dashboard-muted">
                            {experience} yrs exp
                          </span>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ring-1 ring-inset",
                              statusStyles[status]
                            )}
                          >
                            {status}
                          </span>
                        </div>
                        <p className="mt-1.5 inline-flex items-center gap-1 text-xs text-dashboard-primary">
                          <Clock className="h-3 w-3" />
                          Next available · Now
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </CheckInCardContent>
      </CheckInCard>
    </motion.div>
  );
}
