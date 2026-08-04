"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { getBillingInvoiceFormData } from "@/actions/billing";
import { BillingInvoiceDialog } from "@/components/billing/billing-invoice-dialog";
import type {
  BillingEmployee,
  BillingInvoice,
  BillingSeat,
  BillingService,
} from "@/components/billing/types";

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
  openRecordSale: () => void;
};

const RecordSaleContext = createContext<RecordSaleContextValue | null>(null);

export function useRecordSale() {
  const ctx = useContext(RecordSaleContext);
  if (!ctx) {
    throw new Error("useRecordSale must be used within RecordSaleProvider");
  }
  return ctx;
}

export function RecordSaleProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<BillingFormData | null>(null);

  const openRecordSale = useCallback(async () => {
    setOpen(true);
    setError("");

    if (formData) return;

    setLoading(true);
    try {
      const result = await getBillingInvoiceFormData();
      setFormData(result);
    } catch {
      setError("Could not load sale form");
    } finally {
      setLoading(false);
    }
  }, [formData]);

  function handleSuccess(_invoice: BillingInvoice) {
    setOpen(false);
    router.refresh();
  }

  return (
    <RecordSaleContext.Provider value={{ openRecordSale }}>
      {children}
      <BillingInvoiceDialog
        open={open && Boolean(formData) && !loading}
        onOpenChange={setOpen}
        services={formData?.services ?? []}
        employees={formData?.employees ?? []}
        seats={formData?.seats ?? []}
        isBasicPlan={formData?.isBasicPlan}
        salonName={formData?.salonName}
        gstEnabled={formData?.gstEnabled ?? true}
        whatsappSettings={formData?.whatsappSettings}
        onSuccess={handleSuccess}
      />
      {(loading || error) && open && !formData ? (
        <div
          role="status"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => {
            if (!loading) setOpen(false);
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
                  onClick={() => setOpen(false)}
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
