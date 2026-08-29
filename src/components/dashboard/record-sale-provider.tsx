"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { getBillingInvoiceFormData } from "@/actions/billing";
import { BillingInvoiceDialog } from "@/components/billing/billing-invoice-dialog";
import type {
  BillingEmployee,
  BillingInvoice,
  BillingSeat,
  BillingService,
  InvoicePrefill,
  OpenRecordSaleOptions,
} from "@/components/billing/types";
import { markDashboardStale } from "@/lib/dashboard/stale-refresh";

type BillingFormData = {
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

type RecordSaleContextValue = {
  openRecordSale: (options?: OpenRecordSaleOptions) => void;
};

const RecordSaleContext = createContext<RecordSaleContextValue | null>(null);

export function useRecordSale() {
  const ctx = useContext(RecordSaleContext);
  if (!ctx) {
    throw new Error("useRecordSale must be used within RecordSaleProvider");
  }
  return ctx;
}

export function RecordSaleProvider({
  children,
  initialFormData = null,
}: {
  children: React.ReactNode;
  initialFormData?: BillingFormData | null;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<BillingFormData | null>(
    initialFormData
  );
  const [invoicePrefill, setInvoicePrefill] = useState<InvoicePrefill | null>(
    null
  );
  const successCallbackRef = useRef<
    ((invoice: BillingInvoice) => void) | null
  >(null);
  const prefetchStarted = useRef(Boolean(initialFormData));

  const loadFormData = useCallback(async () => {
    if (formData) return formData;
    setLoading(true);
    setError("");
    try {
      const result = await getBillingInvoiceFormData();
      setFormData(result);
      return result;
    } catch {
      setError("Could not load sale form");
      return null;
    } finally {
      setLoading(false);
    }
  }, [formData]);

  useEffect(() => {
    if (initialFormData) {
      setFormData(initialFormData);
      prefetchStarted.current = true;
    }
  }, [initialFormData]);

  const openRecordSale = useCallback(
    (options?: OpenRecordSaleOptions) => {
      setInvoicePrefill(options?.prefill ?? null);
      successCallbackRef.current = options?.onSuccess ?? null;
      setOpen(true);
      setError("");
      if (!formData) {
        void loadFormData();
      }
    },
    [formData, loadFormData]
  );

  function handleSuccess(invoice: BillingInvoice) {
    markDashboardStale();
    successCallbackRef.current?.(invoice);
    successCallbackRef.current = null;
    setInvoicePrefill(null);
    setOpen(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setInvoicePrefill(null);
      successCallbackRef.current = null;
    }
  }

  return (
    <RecordSaleContext.Provider value={{ openRecordSale }}>
      {children}
      <BillingInvoiceDialog
        key={
          invoicePrefill?.queueEntryId ??
          invoicePrefill?.appointmentId ??
          "record-sale"
        }
        open={open && Boolean(formData) && !loading}
        onOpenChange={handleOpenChange}
        services={formData?.services ?? []}
        employees={formData?.employees ?? []}
        seats={formData?.seats ?? []}
        isBasicPlan={formData?.isBasicPlan}
        salonName={formData?.salonName}
        gstEnabled={formData?.gstEnabled ?? true}
        whatsappSettings={formData?.whatsappSettings}
        invoicePrefill={invoicePrefill ?? undefined}
        onSuccess={handleSuccess}
      />
      {(loading || error) && open && !formData ? (
        <div
          role="status"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => {
            if (!loading) handleOpenChange(false);
          }}
        >
          <div
            className="rounded-2xl bg-white px-6 py-5 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {loading ? (
              <p className="text-sm text-dashboard-muted">Loading sale form…</p>
            ) : (
              <>
                <p className="text-sm text-red-600">{error}</p>
                <button
                  type="button"
                  className="mt-3 text-sm font-medium text-dashboard-primary"
                  onClick={() => handleOpenChange(false)}
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </RecordSaleContext.Provider>
  );
}
