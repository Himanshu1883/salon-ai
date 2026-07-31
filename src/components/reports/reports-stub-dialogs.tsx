"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type StubDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "schedule" | "generate" | "export-pdf" | "export-excel";
};

export function ReportsStubDialog({ open, onOpenChange, type }: StubDialogProps) {
  const config = {
    schedule: {
      title: "Schedule Report",
      description:
        "Automated report scheduling is coming soon. For now, generate reports manually from the catalog.",
      action: null as string | null,
      actionLabel: "",
    },
    generate: {
      title: "Generate Report",
      description: "Choose a report from the catalog below, or jump to a popular report.",
      action: "/reports/sales/summary",
      actionLabel: "Open Sales Summary",
    },
    "export-pdf": {
      title: "Export PDF",
      description: "PDF export is coming soon. Use CSV export or open individual reports for now.",
      action: null,
      actionLabel: "",
    },
    "export-excel": {
      title: "Export Excel",
      description: "Excel export is coming soon. CSV export is available via the Export button.",
      action: null,
      actionLabel: "",
    },
  }[type];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{config.title}</DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {config.action && (
            <Button asChild className="bg-[#6C3BFF] hover:bg-[#5B2FE6]">
              <Link href={config.action}>{config.actionLabel}</Link>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
