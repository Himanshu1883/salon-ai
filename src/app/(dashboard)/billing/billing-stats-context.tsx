"use client";

import { createContext, useContext } from "react";
import type { BillingStats } from "@/components/billing/types";

type BillingStatsContextValue = {
  updateStats: (updater: (stats: BillingStats) => BillingStats) => void;
  openNewInvoice: () => void;
};

const BillingStatsContext = createContext<BillingStatsContextValue | null>(null);

export function BillingStatsProvider({
  children,
  updateStats,
  openNewInvoice,
}: {
  children: React.ReactNode;
  updateStats: (updater: (stats: BillingStats) => BillingStats) => void;
  openNewInvoice: () => void;
}) {
  return (
    <BillingStatsContext.Provider value={{ updateStats, openNewInvoice }}>
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
