"use client";

import { createContext, useContext } from "react";
import { isBasicPlan, isEnterprisePlan, type SalonPlan } from "@/lib/plans";

type PlanContextValue = {
  plan: SalonPlan;
  isBasic: boolean;
  isEnterprise: boolean;
};

const PlanContext = createContext<PlanContextValue | null>(null);

export function PlanProvider({
  plan,
  children,
}: {
  plan: SalonPlan;
  children: React.ReactNode;
}) {
  return (
    <PlanContext.Provider
      value={{
        plan,
        isBasic: isBasicPlan(plan),
        isEnterprise: isEnterprisePlan(plan),
      }}
    >
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan(): PlanContextValue {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error("usePlan must be used within PlanProvider");
  }
  return context;
}
