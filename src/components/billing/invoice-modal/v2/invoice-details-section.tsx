"use client";

import { motion } from "framer-motion";
import { CalendarDays, FileText, UserCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { BillingEmployee } from "../../types";
import { v2 } from "./tokens";

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "paid", label: "Paid" },
  { value: "cancelled", label: "Cancelled" },
] as const;

type InvoiceDetailsSectionProps = {
  dueDate: string;
  onDueDateChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  employeeId: string;
  onEmployeeChange: (value: string) => void;
  employees: BillingEmployee[];
  requiresEmployee: boolean;
  employeeError?: string;
};

export function InvoiceDetailsSection({
  dueDate,
  onDueDateChange,
  status,
  onStatusChange,
  employeeId,
  onEmployeeChange,
  employees,
  requiresEmployee,
  employeeError,
}: InvoiceDetailsSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.05 }}
      aria-labelledby="v2-details-section"
      className={v2.card}
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#7C3AED]/10">
          <FileText className="h-4.5 w-4.5 text-[#7C3AED]" />
        </div>
        <h3 id="v2-details-section" className={v2.sectionTitle}>
          Invoice Details
        </h3>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="v2-due-date" className={v2.label}>
            Due Date
          </Label>
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
            <Input
              id="v2-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => onDueDateChange(e.target.value)}
              className={cn(v2.input, "pl-11")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className={v2.label}>Invoice Status</Label>
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger className={v2.selectTrigger}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-[14px]">
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {requiresEmployee ? (
          <div className="space-y-2">
            <Label className={v2.label}>
              Assigned Staff <span className="text-red-500">*</span>
            </Label>
            <Select value={employeeId} onValueChange={onEmployeeChange}>
              <SelectTrigger
                className={cn(
                  v2.selectTrigger,
                  employeeError && v2.inputError
                )}
              >
                <SelectValue placeholder="Select staff" />
              </SelectTrigger>
              <SelectContent className="rounded-[14px]">
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    <span className="inline-flex items-center gap-2">
                      <UserCircle className="h-4 w-4 text-[#6B7280]" />
                      {emp.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {employeeError && (
              <p className="text-xs text-red-500">{employeeError}</p>
            )}
          </div>
        ) : (
          <div aria-hidden />
        )}
      </div>
    </motion.section>
  );
}
