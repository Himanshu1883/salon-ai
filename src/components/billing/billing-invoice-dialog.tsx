"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { BillingInvoiceForm } from "@/components/billing/billing-invoice-form";
import type {
  BillingEmployee,
  BillingInvoice,
  BillingSeat,
  BillingService,
} from "@/components/billing/types";

type BillingInvoiceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  services: BillingService[];
  employees: BillingEmployee[];
  seats: BillingSeat[];
  prefilledCustomer?: { name: string; phone: string };
  isBasicPlan?: boolean;
  salonName?: string;
  onSuccess: (invoice: BillingInvoice) => void;
};

export function BillingInvoiceDialog({
  open,
  onOpenChange,
  services,
  employees,
  seats,
  prefilledCustomer,
  isBasicPlan = false,
  salonName = "Salon",
  onSuccess,
}: BillingInvoiceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[800px] max-h-[calc(100vh-2rem)] w-[1200px] max-w-[calc(100vw-1.5rem)] flex-col gap-0 overflow-hidden rounded-[24px] border border-violet-100/50 bg-white p-0 shadow-[0_32px_64px_-12px_rgba(109,40,217,0.18),0_0_0_1px_rgba(109,40,217,0.04)] [&>button]:hidden">
        <BillingInvoiceForm
          services={services}
          employees={employees}
          seats={seats}
          prefilledCustomer={prefilledCustomer}
          isBasicPlan={isBasicPlan}
          salonName={salonName}
          onSuccess={onSuccess}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
