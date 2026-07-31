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
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-[#1C103D] sm:text-3xl">
            Clients
          </h1>
          <Badge className="border-[#EDE9FE] bg-[#EDE9FE] text-[#6C3BFF]">
            {totalCount}
          </Badge>
        </div>
        <p className="mt-1 max-w-2xl text-sm text-[#6B7280] sm:text-base">
          Manage customer profiles, appointments, memberships and lifetime
          value.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl border-[#E8ECF4]"
          onClick={onImport}
        >
          <Upload className="h-4 w-4" />
          Import Clients
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled
          className="rounded-xl border-[#E8ECF4]"
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled
          className="rounded-xl border-[#E8ECF4]"
        >
          <Sparkles className="h-4 w-4" />
          AI Insights
        </Button>
        <Button
          size="sm"
          className="rounded-xl bg-gradient-to-r from-[#6C3BFF] to-[#8B5CF6] text-white shadow-[0_4px_16px_rgba(108,59,255,0.35)] hover:opacity-90"
          onClick={onAdd}
        >
          <Plus className="h-4 w-4" />
          Add Client
        </Button>
      </div>
    </div>
  );
}
