"use client";

import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ClientsFiltersDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ClientsFiltersDialog({
  open,
  onOpenChange,
}: ClientsFiltersDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-[#6B7280]">
          Advanced filters (by segment, spend, last visit, membership, gender,
          branch, and stylist) are coming soon. Use search and sort above for
          now.
        </p>
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          className="rounded-xl"
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}
