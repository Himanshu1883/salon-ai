"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { BillingInvoiceForm } from "@/components/billing/billing-invoice-form";
import { v3 } from "@/components/billing/invoice-modal/v3";
import { cn } from "@/lib/utils";
import { getBillingInvoiceFormData } from "@/actions/billing";
import type {
  BillingEmployee,
  BillingInvoice,
  BillingSeat,
  BillingService,
  InvoicePrefill,
} from "@/components/billing/types";

type BillingInvoiceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefilledCustomer?: { name: string; phone: string };
  invoicePrefill?: InvoicePrefill;
  isBasicPlan?: boolean;
  salonName?: string;
  gstEnabled?: boolean;
  onSuccess: (invoice: BillingInvoice, options?: { close?: boolean }) => void;
  services?: BillingService[];
  employees?: BillingEmployee[];
  seats?: BillingSeat[];
  whatsappSettings?: {
    billingMessageTemplate: string;
    autoOpenAfterPayment: boolean;
  };
};

type LoadedFormData = {
  services: BillingService[];
  employees: BillingEmployee[];
  seats: BillingSeat[];
  isBasicPlan: boolean;
  salonName: string;
  gstEnabled: boolean;
  whatsappSettings: {
    billingMessageTemplate: string;
    autoOpenAfterPayment: boolean;
  };
};

export function BillingInvoiceDialog({
  open,
  onOpenChange,
  prefilledCustomer,
  invoicePrefill,
  isBasicPlan: isBasicPlanProp,
  salonName: salonNameProp = "Salon",
  gstEnabled: gstEnabledProp = true,
  onSuccess,
  services: servicesProp,
  employees: employeesProp,
  seats: seatsProp,
  whatsappSettings: whatsappSettingsProp,
}: BillingInvoiceDialogProps) {
  const hasPreloadedData =
    servicesProp !== undefined &&
    employeesProp !== undefined &&
    seatsProp !== undefined;

  const [formData, setFormData] = useState<LoadedFormData | null>(
    hasPreloadedData
      ? {
          services: servicesProp,
          employees: employeesProp,
          seats: seatsProp,
          isBasicPlan: isBasicPlanProp ?? false,
          salonName: salonNameProp,
          gstEnabled: gstEnabledProp,
          whatsappSettings: whatsappSettingsProp ?? {
            billingMessageTemplate: "",
            autoOpenAfterPayment: false,
          },
        }
      : null
  );
  const [loading, setLoading] = useState(false);
  const loadPromiseRef = useRef<Promise<LoadedFormData> | null>(null);

  useEffect(() => {
    if (hasPreloadedData) {
      setFormData({
        services: servicesProp,
        employees: employeesProp,
        seats: seatsProp,
        isBasicPlan: isBasicPlanProp ?? false,
        salonName: salonNameProp,
        gstEnabled: gstEnabledProp,
        whatsappSettings: whatsappSettingsProp ?? {
          billingMessageTemplate: "",
          autoOpenAfterPayment: false,
        },
      });
    }
  }, [
    hasPreloadedData,
    servicesProp,
    employeesProp,
    seatsProp,
    isBasicPlanProp,
    salonNameProp,
    gstEnabledProp,
    whatsappSettingsProp,
  ]);

  useEffect(() => {
    if (!open || hasPreloadedData || formData) return;

    if (!loadPromiseRef.current) {
      setLoading(true);
      loadPromiseRef.current = getBillingInvoiceFormData().then((data) => {
        setFormData(data);
        return data;
      });
      loadPromiseRef.current.finally(() => setLoading(false));
    }
  }, [open, hasPreloadedData, formData]);

  const resolvedBasicPlan = formData?.isBasicPlan ?? isBasicPlanProp ?? false;
  const salonName = formData?.salonName ?? salonNameProp;
  const gstEnabled = formData?.gstEnabled ?? gstEnabledProp;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          v3.modal,
          "!flex !flex-col !gap-0 !overflow-hidden !p-0",
          "[&>button]:hidden",
          "sm:!translate-x-[-50%] sm:!translate-y-[-50%]"
        )}
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        {loading || !formData ? (
          <div className="flex min-h-[320px] items-center justify-center p-8 text-sm text-[#9CA3AF]">
            Loading billing form…
          </div>
        ) : (
          <BillingInvoiceForm
            key={invoicePrefill?.queueEntryId ?? "new-invoice"}
            services={formData.services}
            employees={formData.employees}
            seats={formData.seats}
            prefilledCustomer={
              invoicePrefill?.customer
                ? {
                    name: invoicePrefill.customer.name,
                    phone: invoicePrefill.customer.phone,
                  }
                : prefilledCustomer
            }
            invoicePrefill={invoicePrefill}
            isBasicPlan={resolvedBasicPlan}
            salonName={salonName}
            gstEnabled={gstEnabled}
            whatsappSettings={formData.whatsappSettings}
            onSuccess={onSuccess}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
