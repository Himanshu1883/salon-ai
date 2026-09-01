"use client";

import { Sparkles, Download, Upload, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ClientsHeaderProps = {
  totalCount: number;
  onImport: () => void;
  onAdd: () => void;
};

export function ClientsHeader({
  totalCount,
  onImport,
  onAdd,
}: ClientsHeaderProps) {
  return (
    <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <h1 className="text-lg font-bold tracking-tight text-[#1C103D] sm:text-3xl">
            Clients
          </h1>
          <Badge className="h-5 border-[#EDE9FE] bg-[#EDE9FE] px-1.5 text-[10px] text-[#6C3BFF] sm:h-auto sm:px-2.5 sm:text-xs">
            {totalCount}
          </Badge>
        </div>
        <p className="mt-0.5 text-[11px] leading-snug text-[#6B7280] sm:mt-1 sm:max-w-2xl sm:text-base">
          Profiles, visits, memberships, and lifetime value
        </p>
      </div>

      <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 rounded-xl border-[#E8ECF4] px-2.5 text-xs sm:h-9 sm:px-3 sm:text-sm"
          onClick={onImport}
        >
          <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="sm:inline">Import</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled
          title="Export"
          className="h-8 w-8 rounded-xl border-[#E8ECF4] p-0 sm:h-9 sm:w-auto sm:px-3"
        >
          <Download className="h-3.5 w-3.5 sm:mr-1.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled
          title="AI Insights"
          className="h-8 w-8 rounded-xl border-[#E8ECF4] p-0 sm:h-9 sm:w-auto sm:px-3"
        >
          <Sparkles className="h-3.5 w-3.5 sm:mr-1.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">AI Insights</span>
        </Button>
        <Button
          size="sm"
          className="h-8 rounded-xl bg-gradient-to-r from-[#6C3BFF] to-[#8B5CF6] px-2.5 text-xs text-white shadow-[0_4px_16px_rgba(108,59,255,0.35)] hover:opacity-90 sm:h-9 sm:px-3 sm:text-sm"
          onClick={onAdd}
        >
          <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          Add
        </Button>
      </div>
    </div>
  );
}
