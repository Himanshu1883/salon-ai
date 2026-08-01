"use client";

import { Check, Receipt, X } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { num: 1 as const, label: "Invoice Details" },
  { num: 2 as const, label: "Payment" },
];

type InvoiceModalHeaderProps = {
  step: 1 | 2;
  onClose?: () => void;
};

export function InvoiceModalHeader({ step, onClose }: InvoiceModalHeaderProps) {
  const subtitle =
    step === 1
      ? "Create invoice for customer"
      : "Review invoice and collect payment";

  return (
    <div className="sticky top-0 z-10 shrink-0 border-b border-violet-100/60 bg-white/95 px-8 py-6 backdrop-blur-sm sm:px-10">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-violet-500 shadow-lg shadow-violet-500/30">
            <Receipt className="h-6 w-6 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold tracking-tight text-dashboard-text">
              Create Invoice
            </h2>
            <p className="mt-1 text-sm text-dashboard-muted">{subtitle}</p>
            {/* Compact step indicator on mobile */}
            <p className="mt-2 text-xs font-medium text-violet-600 sm:hidden">
              Step {step} of 2
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          {/* Visual stepper — desktop */}
          <div className="hidden items-center sm:flex" aria-label={`Step ${step} of 2`}>
            {STEPS.map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300",
                      step >= s.num
                        ? "bg-gradient-to-br from-violet-600 to-violet-500 text-white shadow-md shadow-violet-500/30"
                        : "border border-violet-200 bg-white text-violet-400"
                    )}
                    aria-current={step === s.num ? "step" : undefined}
                  >
                    {step > s.num ? (
                      <Check className="h-4 w-4" strokeWidth={2.5} />
                    ) : (
                      s.num
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium transition-colors",
                      step >= s.num ? "text-violet-700" : "text-dashboard-muted"
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "mx-4 h-0.5 w-10 rounded-full transition-colors duration-300",
                      step > s.num ? "bg-violet-400" : "bg-violet-100"
                    )}
                    aria-hidden
                  />
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-xl p-2 text-dashboard-muted transition-all hover:bg-violet-50 hover:text-dashboard-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
