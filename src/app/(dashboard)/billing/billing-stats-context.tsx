"use client";

import { createContext, useContext } from "react";

type BillingStatsContextValue = {
  openNewInvoice: () => void;
};

const BillingStatsContext = createContext<BillingStatsContextValue | null>(null);

export function BillingStatsProvider({
  children,
  openNewInvoice,
}: {
  children: React.ReactNode;
  openNewInvoice: () => void;
}) {
  return (
    <BillingStatsContext.Provider value={{ openNewInvoice }}>
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
