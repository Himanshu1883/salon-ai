"use client";

import { Check, Receipt, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { v3 } from "./tokens";

const STEPS = [
  { num: 1 as const, label: "Invoice Details" },
  { num: 2 as const, label: "Payment" },
];

type ModalHeaderProps = {
  step: 1 | 2;
  onClose?: () => void;
};

export function ModalHeader({ step, onClose }: ModalHeaderProps) {
  return (
    <header className={v3.header}>
      <div className="flex w-full items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-[#7C3AED] shadow-[0_2px_8px_rgba(124,58,237,0.3)]">
            <Receipt className="h-4 w-4 text-white" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold leading-tight text-[#111827]">
              Create Invoice
            </h2>
            <p className="text-[11px] text-[#6B7280]">
              {step === 1 ? "Add customer & items" : "Collect payment"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <nav
            className="hidden items-center sm:flex"
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
                      "text-[11px] font-medium transition-colors duration-200",
                      step >= s.num ? "text-[#7C3AED]" : "text-[#6B7280]"
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "mx-2 h-px w-6 transition-colors duration-200",
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
            className="rounded-[10px] p-1.5 text-[#6B7280] transition-colors duration-200 hover:bg-[#FAFBFF] hover:text-[#111827]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
