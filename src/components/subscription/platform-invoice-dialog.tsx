"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PlatformInvoiceDetail,
  type PlatformInvoiceDetailData,
} from "@/components/subscription/platform-invoice-detail";

export function PlatformInvoiceDialog({
  invoice,
  open,
  onOpenChange,
}: {
  invoice: PlatformInvoiceDetailData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invoice {invoice.invoiceNumber}</DialogTitle>
        </DialogHeader>
        <PlatformInvoiceDetail invoice={invoice} showPrintButton />
      </DialogContent>
    </Dialog>
  );
}
