"use client";

import { Check, Receipt, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { v3 } from "./tokens";

const STEPS = [
  { num: 1 as const, label: "Invoice Details", short: "Details" },
  { num: 2 as const, label: "Payment", short: "Payment" },
];

type ModalHeaderProps = {
  step: 1 | 2;
  onClose?: () => void;
};

export function ModalHeader({ step, onClose }: ModalHeaderProps) {
  const current = STEPS.find((s) => s.num === step);

  return (
    <header className={v3.header}>
      <div className="flex w-full items-center justify-between gap-2 sm:gap-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#7C3AED] shadow-[0_2px_8px_rgba(124,58,237,0.3)] sm:h-9 sm:w-9 sm:rounded-[12px]">
            <Receipt className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-[14px] font-semibold leading-tight text-[#111827] sm:text-[15px]">
              Create Invoice
            </h2>
            <p className="truncate text-[10px] text-[#6B7280] sm:text-[11px]">
              {step === 1 ? "Add customer & items" : "Collect payment"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          {/* Mobile: compact step pill */}
          <div
            className="flex items-center gap-1.5 rounded-full border border-[#ECECF5] bg-[#FAFBFF] px-2.5 py-1 md:hidden"
            aria-label={`Step ${step} of 2: ${current?.label}`}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#7C3AED] text-[10px] font-semibold text-white">
              {step}
            </span>
            <span className="text-[10px] font-medium text-[#6B7280]">/ 2</span>
            <span className="max-w-[72px] truncate text-[10px] font-medium text-[#111827]">
              {current?.short}
            </span>
          </div>

          {/* Tablet+: full stepper */}
          <nav
            className="hidden items-center md:flex"
            aria-label={`Step ${step} of 2`}
          >
            {STEPS.map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className="flex items-center gap-1.5">
                  <div
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold transition-all duration-200",
                      step >= s.num
                        ? "bg-[#7C3AED] text-white"
                        : "border border-[#ECECF5] bg-[#FAFBFF] text-[#6B7280]"
                    )}
                    aria-current={step === s.num ? "step" : undefined}
                  >
                    {step > s.num ? (
                      <Check className="h-3 w-3" strokeWidth={2.5} />
                    ) : (
                      s.num
                    )}
                  </div>
                  <span
                    className={cn(
                      "hidden text-[11px] font-medium transition-colors duration-200 lg:inline",
                      step >= s.num ? "text-[#7C3AED]" : "text-[#6B7280]"
                    )}
                  >
                    {s.label}
                  </span>
                  <span
                    className={cn(
                      "text-[11px] font-medium transition-colors duration-200 lg:hidden",
                      step >= s.num ? "text-[#7C3AED]" : "text-[#6B7280]"
                    )}
                  >
                    {s.short}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "mx-1.5 h-px w-4 transition-colors duration-200 sm:mx-2 sm:w-6",
                      step > s.num ? "bg-[#7C3AED]/35" : "bg-[#ECECF5]"
                    )}
                    aria-hidden
                  />
                )}
              </div>
            ))}
          </nav>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-10 w-10 items-center justify-center rounded-[10px] text-[#6B7280] transition-colors duration-200 hover:bg-[#FAFBFF] hover:text-[#111827] sm:h-auto sm:w-auto sm:p-1.5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
