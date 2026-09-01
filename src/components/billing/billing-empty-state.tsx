"use client";

import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type BillingEmptyStateProps = {
  onNewInvoice: () => void;
};

export function BillingEmptyState({ onNewInvoice }: BillingEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#ECECEC] bg-[#F8F9FC]/50 px-4 py-8 text-center sm:rounded-2xl sm:px-6 sm:py-16">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 sm:h-14 sm:w-14 sm:rounded-2xl">
        <FileText className="h-5 w-5 text-[#6C3CF0] sm:h-7 sm:w-7" />
      </div>
      <h3 className="mt-3 text-sm font-semibold text-[#1C103D] sm:mt-4 sm:text-lg">
        No invoices yet
      </h3>
      <p className="mt-1 max-w-sm text-xs text-[#6B7280] sm:text-sm">
        Create your first invoice to record a sale and track payments.
      </p>
      <Button
        onClick={onNewInvoice}
        className="mt-4 h-8 rounded-xl bg-gradient-to-r from-[#6C3CF0] to-[#8B5CF6] px-3 text-xs sm:mt-6 sm:h-10 sm:text-sm"
      >
        <Plus className="h-4 w-4" />
        Create invoice
      </Button>
    </div>
  );
}
