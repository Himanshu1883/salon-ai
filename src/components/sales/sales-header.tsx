"use client";

import { useState } from "react";
import { Download, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportReportCsv } from "@/actions/reports";

type SalesHeaderProps = {
  dateFrom: string;
  dateTo: string;
};

export function SalesHeader({ dateFrom, dateTo }: SalesHeaderProps) {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const csv = await exportReportCsv(
        "sales-list",
        dateFrom || undefined,
        dateTo || undefined
      );
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sales-report-${dateFrom || "all"}-${dateTo || "all"}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-[32px] font-bold leading-tight tracking-tight text-[#1C103D]">
          Sales
        </h1>
        <p className="mt-1 text-sm text-[#6B7280] sm:text-base">
          Track and manage all paid transactions for your salon.
        </p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            disabled={exporting}
            className="rounded-xl border-[#ECECEC] bg-white px-4 shadow-sm transition-all duration-150 hover:border-[#6C3CF0]/30 hover:shadow-md"
          >
            <Download className="h-4 w-4 text-[#6C3CF0]" />
            {exporting ? "Exporting..." : "Download Report"}
            <ChevronDown className="h-4 w-4 text-[#9CA3AF]" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-xl">
          <DropdownMenuItem onClick={handleExport} disabled={exporting}>
            Export as CSV
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
