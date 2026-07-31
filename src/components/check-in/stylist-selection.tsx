"use client";

import { motion } from "framer-motion";
import { Clock, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";
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
  available: "bg-emerald-50 text-emerald-700",
  busy: "bg-amber-50 text-amber-700",
  break: "bg-stone-100 text-stone-600",
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
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);

  const recommendedId = employees[0]?.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[20px] bg-white p-6 shadow-sm"
    >
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#1C103D]">Select Stylist</h2>
        <span className="text-xs text-[#6B7280]">
          Est. {totalDuration} min service
        </span>
      </div>

      {employees.length === 0 ? (
        <p className="text-sm text-[#6B7280]">
          No active stylists. Assign from the queue after check-in.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {employees.map((employee, index) => {
            const selected = selectedStylistId === employee.id;
            const isRecommended = employee.id === recommendedId && index === 0;
            const status = getStylistStatus(employee.id, new Set());
            const rating = 4.5 + (index % 5) * 0.1;
            const experience = 2 + (index % 8);

            return (
              <motion.button
                key={employee.id}
                type="button"
                onClick={() => onSelect(employee.id)}
                whileHover={{ y: -2 }}
                className={cn(
                  "relative rounded-2xl border-2 p-4 text-left transition-all",
                  selected
                    ? "border-[#6C3BFF] bg-[#EDE9FE]/40 shadow-lg shadow-[#6C3BFF]/15"
                    : "border-transparent bg-[#F7F8FC] shadow-sm hover:border-[#6C3BFF]/20"
                )}
              >
                {isRecommended && (
                  <span className="absolute -top-2 right-3 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#6C3BFF] to-[#8B5CF6] px-2 py-0.5 text-[10px] font-semibold text-white shadow-sm">
                    <Sparkles className="h-2.5 w-2.5" />
                    AI Recommended
                  </span>
                )}
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6C3BFF] to-[#FF2D6F] text-sm font-bold text-white">
                    {getInitials(employee.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-[#1C103D]">{employee.name}</p>
                    <p className="text-xs text-[#6B7280]">
                      {employee.role ?? "Stylist"}
                      {employee.specialties
                        ? ` · ${employee.specialties}`
                        : ""}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-0.5 text-xs text-[#D97706]">
                        <Star className="h-3 w-3 fill-current" />
                        {rating.toFixed(1)}
                      </span>
                      <span className="text-xs text-[#6B7280]">
                        {experience} yrs exp
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
                          statusStyles[status]
                        )}
                      >
                        {status}
                      </span>
                    </div>
                    <p className="mt-1.5 inline-flex items-center gap-1 text-xs text-[#6C3BFF]">
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
    </motion.div>
  );
}
