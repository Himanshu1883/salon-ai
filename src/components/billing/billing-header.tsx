"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type BillingHeaderProps = {
  onNewInvoice: () => void;
  isBasicPlan?: boolean;
};

export function BillingHeader({ onNewInvoice, isBasicPlan }: BillingHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-[32px] font-bold leading-tight tracking-tight text-[#1C103D]">
          Billing
        </h1>
        <p className="mt-1 text-sm text-[#6B7280] sm:text-base">
          {isBasicPlan
            ? "Create bills, record payments, and track daily revenue."
            : "Invoices, staff assignments, payments, and revenue."}
        </p>
      </div>

      <Button
        onClick={onNewInvoice}
        className="rounded-xl bg-gradient-to-r from-[#6C3CF0] to-[#8B5CF6] px-5 shadow-md shadow-violet-200/50 transition-all duration-150 hover:from-[#5B2FE0] hover:to-[#7C4FE6] hover:shadow-lg"
      >
        <Plus className="h-4 w-4" />
        New invoice
      </Button>
    </div>
  );
}
