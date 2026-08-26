"use client";

import { motion } from "framer-motion";
import { CalendarDays, Mail, Plus, UserCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  CustomerSearch,
  PhoneSearch,
  type InvoiceCustomer,
} from "../customer-search";
import type { BillingEmployee } from "../../types";
import { v3 } from "./tokens";

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "paid", label: "Paid" },
  { value: "cancelled", label: "Cancelled" },
] as const;

type CustomerSectionProps = {
  customer: InvoiceCustomer;
  onChange: (customer: InvoiceCustomer) => void;
  error?: string;
  autoFocus?: boolean;
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

function CompactField({
  label,
  required,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <span className={v3.label}>
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
    </div>
  );
}

export function CustomerSection({
  customer,
  onChange,
  error,
  autoFocus,
  dueDate,
  onDueDateChange,
  status,
  onStatusChange,
  employeeId,
  onEmployeeChange,
  employees,
  requiresEmployee,
  employeeError,
}: CustomerSectionProps) {
  function startNewCustomer() {
    onChange({
      id: undefined,
      name: "",
      phone: "",
      email: "",
      loyaltyPoints: 0,
      lastVisit: null,
    });
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      aria-labelledby="v3-customer-section"
      className={v3.section}
    >
      <h3 id="v3-customer-section" className={v3.sectionTitle}>
        👤 Customer
      </h3>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
        <div className="md:col-span-5 [&_label]:hidden [&_input]:h-12 [&_input]:rounded-[14px] [&_input]:text-base sm:[&_input]:h-10 sm:[&_input]:text-[13px]">
          <CompactField label="Customer" required>
            <CustomerSearch
              value={customer}
              onChange={onChange}
              error={error}
              autoFocus={autoFocus}
            />
          </CompactField>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end md:col-span-7">
          <div className="min-w-0 flex-1 [&_label]:hidden [&_input]:h-12 [&_input]:rounded-[14px] [&_input]:text-base sm:[&_input]:h-10 sm:[&_input]:text-[13px]">
            <CompactField label="Phone" required>
              <PhoneSearch value={customer} onChange={onChange} />
            </CompactField>
          </div>

          <button
            type="button"
            onClick={startNewCustomer}
            className={cn(
              v3.outlineButton,
              "h-12 shrink-0 whitespace-nowrap px-3 text-[11px] text-[#7C3AED] sm:h-10 md:h-9"
            )}
            title="New customer"
          >
            <Plus className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
            <span className="hidden lg:inline">New</span>
          </button>

          {requiresEmployee ? (
            <div className="min-w-0 flex-1">
              <CompactField label="Staff" required>
                <Select value={employeeId} onValueChange={onEmployeeChange}>
                  <SelectTrigger
                    className={cn(v3.selectTrigger, employeeError && v3.inputError)}
                  >
                    <SelectValue placeholder="Staff" />
                  </SelectTrigger>
                  <SelectContent className="rounded-[12px]">
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        <span className="inline-flex items-center gap-1.5 text-[13px]">
                          <UserCircle className="h-3.5 w-3.5 text-[#6B7280]" />
                          {emp.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CompactField>
              {employeeError && (
                <p className="mt-0.5 text-[11px] text-red-500">{employeeError}</p>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {error && (
        <p className="mt-1 text-[11px] text-red-500 md:hidden">{error}</p>
      )}

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <CompactField label="Email">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6B7280]" />
            <Input
              type="email"
              value={customer.email}
              onChange={(e) => onChange({ ...customer, email: e.target.value })}
              placeholder="Email"
              className={cn(v3.input, "pl-8")}
            />
          </div>
        </CompactField>

        <CompactField label="Invoice Status">
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger className={v3.selectTrigger}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-[12px]">
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CompactField>

        <CompactField label="Due Date">
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6B7280]" />
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => onDueDateChange(e.target.value)}
              className={cn(v3.input, "pl-8")}
            />
          </div>
        </CompactField>
      </div>

      <div className={cn(v3.sectionDivider, "mt-4")} />
    </motion.section>
  );
}
