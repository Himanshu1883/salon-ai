"use client";

import { createContext, useContext } from "react";
import type { BillingInvoice, BillingStats } from "@/components/billing/types";

type BillingStatsContextValue = {
  updateStats: (updater: (stats: BillingStats) => BillingStats) => void;
  openNewInvoice: () => void;
  prependInvoice: (invoice: BillingInvoice) => void;
  registerPrependInvoice: (fn: ((invoice: BillingInvoice) => void) | null) => void;
};

const BillingStatsContext = createContext<BillingStatsContextValue | null>(null);

export function BillingStatsProvider({
  children,
  updateStats,
  openNewInvoice,
  listPrependRef,
}: {
  children: React.ReactNode;
  updateStats: (updater: (stats: BillingStats) => BillingStats) => void;
  openNewInvoice: () => void;
  listPrependRef: React.MutableRefObject<
    ((invoice: BillingInvoice) => void) | null
  >;
}) {
  const value: BillingStatsContextValue = {
    updateStats,
    openNewInvoice,
    prependInvoice: (invoice) => listPrependRef.current?.(invoice),
    registerPrependInvoice: (fn) => {
      listPrependRef.current = fn;
    },
  };

  return (
    <BillingStatsContext.Provider value={value}>
      {children}
    </BillingStatsContext.Provider>
  );
}

export function useBillingStatsContext() {
  const context = useContext(BillingStatsContext);
  if (!context) {
    throw new Error("useBillingStatsContext must be used within BillingStatsProvider");
  }
  return context;
}
