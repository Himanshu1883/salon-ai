"use client";

import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type BillingEmptyStateProps = {
  onNewInvoice: () => void;
};

export function BillingEmptyState({ onNewInvoice }: BillingEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#ECECEC] bg-[#F8F9FC]/50 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50">
        <FileText className="h-7 w-7 text-[#6C3CF0]" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-[#1C103D]">
        No invoices yet
      </h3>
      <p className="mt-1 max-w-sm text-sm text-[#6B7280]">
        Create your first invoice to record a sale and track payments.
      </p>
      <Button
        onClick={onNewInvoice}
        className="mt-6 rounded-xl bg-gradient-to-r from-[#6C3CF0] to-[#8B5CF6]"
      >
        <Plus className="h-4 w-4" />
        Create invoice
      </Button>
    </div>
  );
}
