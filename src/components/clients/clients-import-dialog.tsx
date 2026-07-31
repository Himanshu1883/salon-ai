"use client";

import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ClientsImportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ClientsImportDialog({
  open,
  onOpenChange,
}: ClientsImportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>Import clients</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-[#6B7280]">
            CSV import is coming soon. You&apos;ll be able to upload name, email,
            and phone columns to bulk-create clients. Excel, Google Contacts, and
            phone sync are also planned.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {["CSV", "Excel", "Google Contacts", "Phone"].map((source) => (
              <div
                key={source}
                className="flex items-center gap-2 rounded-xl border border-[#E8ECF4] bg-[#F7F8FC] px-3 py-2 text-sm text-[#6B7280]"
              >
                <Upload className="h-4 w-4 shrink-0" />
                {source}
                {source !== "CSV" && (
                  <span className="ml-auto text-xs text-[#9CA3AF]">Soon</span>
                )}
              </div>
            ))}
          </div>
          <Button className="w-full rounded-xl" disabled>
            Upload CSV (coming soon)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
