"use client";

import { Receipt, X } from "lucide-react";

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
    <div className="sticky top-0 z-10 flex shrink-0 items-start justify-between border-b border-[#E5E7EB] bg-white px-8 py-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6D5DF6] to-[#8B7CF8] shadow-lg shadow-[#6D5DF6]/25">
          <Receipt className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-[#1C103D]">
            Create Invoice
          </h2>
          <p className="mt-1 text-sm text-[#6B7280]">{subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-[#6D5DF6]/10 px-3 py-1 text-xs font-semibold text-[#6D5DF6]">
          Step {step} of 2
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="rounded-xl p-2 text-[#9CA3AF] transition-all hover:bg-[#F8FAFC] hover:text-[#1C103D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6D5DF6]/30"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
