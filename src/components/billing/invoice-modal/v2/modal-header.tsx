"use client";

import { Check, Receipt, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { v2 } from "./tokens";

const STEPS = [
  { num: 1 as const, label: "Invoice Details" },
  { num: 2 as const, label: "Payment" },
];

type ModalHeaderProps = {
  step: 1 | 2;
  onClose?: () => void;
};

export function ModalHeader({ step, onClose }: ModalHeaderProps) {
  const subtitle =
    step === 1
      ? "Create invoice for customer"
      : "Review invoice and collect payment";

  return (
    <header className={v2.header}>
      <div className="flex items-center justify-between gap-6">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#7C3AED] shadow-[0_4px_14px_rgba(124,58,237,0.35)]">
            <Receipt className="h-5 w-5 text-white" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight text-[#111827]">
              Create Invoice
            </h2>
            <p className="mt-0.5 text-sm text-[#6B7280]">{subtitle}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-5">
          <nav
            className="hidden items-center md:flex"
            aria-label={`Step ${step} of 2`}
          >
            {STEPS.map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all duration-200",
                      step >= s.num
                        ? "bg-[#7C3AED] text-white shadow-[0_2px_8px_rgba(124,58,237,0.3)]"
                        : "border border-[#ECECF5] bg-[#FAFBFF] text-[#6B7280]"
                    )}
                    aria-current={step === s.num ? "step" : undefined}
                  >
                    {step > s.num ? (
                      <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                    ) : (
                      <span>{s.num === 1 ? "①" : "②"}</span>
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium transition-colors duration-200",
                      step >= s.num ? "text-[#7C3AED]" : "text-[#6B7280]"
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "mx-3 h-px w-8 transition-colors duration-200",
                      step > s.num ? "bg-[#7C3AED]/40" : "bg-[#ECECF5]"
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
            className="rounded-[12px] p-2 text-[#6B7280] transition-colors duration-200 hover:bg-[#FAFBFF] hover:text-[#111827]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
