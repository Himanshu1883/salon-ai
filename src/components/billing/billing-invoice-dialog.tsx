"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { BillingInvoiceForm } from "@/components/billing/billing-invoice-form";
import { v3 } from "@/components/billing/invoice-modal/v3";
import { cn } from "@/lib/utils";
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
  whatsappSettings?: {
    billingMessageTemplate: string;
    autoOpenAfterPayment: boolean;
  };
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
  whatsappSettings,
  onSuccess,
}: BillingInvoiceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          v3.modal,
          "[&>button]:hidden"
        )}
        onPointerDownOutside={(e) => {
          if (
            e.target instanceof Element &&
            e.target.closest("[data-invoice-item-dropdown]")
          ) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          if (
            e.target instanceof Element &&
            e.target.closest("[data-invoice-item-dropdown]")
          ) {
            e.preventDefault();
          }
        }}
      >
        <BillingInvoiceForm
          services={services}
          employees={employees}
          seats={seats}
          prefilledCustomer={prefilledCustomer}
          isBasicPlan={isBasicPlan}
          salonName={salonName}
          whatsappSettings={whatsappSettings}
          onSuccess={onSuccess}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
