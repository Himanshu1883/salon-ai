"use client";

import { cn } from "@/lib/utils";
import { DashboardMockup } from "./dashboard-mockup";

type MacbookMockupProps = {
  className?: string;
  variant?: "dashboard" | "appointment" | "billing" | "crm" | "inventory" | "marketing" | "reports" | "analytics";
};

export function MacbookMockup({ className, variant = "dashboard" }: MacbookMockupProps) {
  return (
    <div className={cn("relative mx-auto w-full max-w-2xl", className)}>
      {/* Screen */}
      <div className="relative overflow-hidden rounded-t-xl border border-gray-700 bg-gray-900 p-[3%] shadow-2xl">
        <div className="mb-[2%] flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-red-500" />
          <div className="h-2 w-2 rounded-full bg-yellow-500" />
          <div className="h-2 w-2 rounded-full bg-green-500" />
        </div>
        <div className="overflow-hidden rounded-md bg-white">
          <DashboardMockup variant={variant} />
        </div>
      </div>
      {/* Base */}
      <div className="relative mx-auto h-3 w-[104%] -translate-x-[2%] rounded-b-lg bg-gradient-to-b from-gray-400 to-gray-500 shadow-lg" />
      <div className="mx-auto h-1 w-[18%] rounded-b-md bg-gray-400" />
    </div>
  );
}
