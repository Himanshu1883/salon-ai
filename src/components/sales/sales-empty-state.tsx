"use client";

import Link from "next/link";
import { Receipt, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SalesEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#EDE9FE]">
        <Receipt className="h-10 w-10 text-[#6C3CF0]" />
      </div>
      <h3 className="mt-6 text-lg font-semibold text-[#1C103D]">
        No Sales Yet
      </h3>
      <p className="mt-2 max-w-sm text-sm text-[#6B7280]">
        When you complete paid transactions, they&apos;ll appear here. Start by
        creating an appointment or recording a sale.
      </p>
      <Button
        asChild
        className="mt-6 rounded-xl bg-[#6C3CF0] px-6 text-white shadow-[0_4px_16px_rgba(108,60,240,0.3)] transition-all duration-150 hover:bg-[#5B2FD9]"
      >
        <Link href="/sales/appointments">
          <Plus className="h-4 w-4" />
          Create Appointment
        </Link>
      </Button>
    </div>
  );
}
