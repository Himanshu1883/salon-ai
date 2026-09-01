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
    <div className="flex min-w-0 items-start justify-between gap-2 sm:gap-4">
      <div className="min-w-0">
        <h1 className="text-lg font-bold tracking-tight text-[#1C103D] sm:text-[length:var(--page-title)]">
          Billing
        </h1>
        <p className="mt-0.5 hidden text-[11px] leading-snug text-[#6B7280] sm:mt-1 sm:block sm:text-base">
          Salon invoices and Go Tix subscription bills
        </p>
      </div>

      {showNewInvoice && (
        <Button
          onClick={onNewInvoice}
          className="h-8 shrink-0 rounded-xl bg-gradient-to-r from-[#6C3CF0] to-[#8B5CF6] px-2.5 text-xs shadow-md shadow-violet-200/50 hover:from-[#5B2FE0] hover:to-[#7C4FE6] sm:h-10 sm:px-5 sm:text-sm"
        >
          <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          New invoice
        </Button>
      )}
    </div>
  );
}
