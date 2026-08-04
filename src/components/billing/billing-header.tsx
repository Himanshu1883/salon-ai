"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type BillingHeaderProps = {
  onNewInvoice: () => void;
  showNewInvoice?: boolean;
};

export function BillingHeader({
  onNewInvoice,
  showNewInvoice = true,
}: BillingHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="page-title text-[#1C103D]">
          Billing
        </h1>
        <p className="mt-1 text-sm text-[#6B7280] sm:text-base">
          Customer invoices for your salon, and Go Tix subscription invoices from the platform.
        </p>
      </div>

      {showNewInvoice && (
        <Button
          onClick={onNewInvoice}
          className="h-12 min-h-[var(--touch-target)] w-full rounded-xl bg-gradient-to-r from-[#6C3CF0] to-[#8B5CF6] px-5 shadow-md shadow-violet-200/50 transition-all duration-150 hover:from-[#5B2FE0] hover:to-[#7C4FE6] hover:shadow-lg sm:h-10 sm:min-h-0 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          New invoice
        </Button>
      )}
    </div>
  );
}
