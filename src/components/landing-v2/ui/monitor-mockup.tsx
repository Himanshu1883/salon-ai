"use client";

import { cn } from "@/lib/utils";
import { DashboardMockup } from "./dashboard-mockup";

type MonitorMockupProps = {
  className?: string;
  variant?: "dashboard" | "appointment" | "billing" | "crm" | "inventory" | "marketing" | "reports" | "analytics";
};

export function MonitorMockup({ className, variant = "dashboard" }: MonitorMockupProps) {
  return (
    <div className={cn("relative mx-auto w-full", className)}>
      <div className="overflow-hidden rounded-xl border-[6px] border-gray-800 bg-gray-900 shadow-2xl md:border-8">
        <div className="flex items-center gap-1.5 bg-gray-800 px-3 py-2">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
          <div className="ml-4 flex-1 rounded bg-gray-700 px-3 py-0.5 text-[10px] text-gray-400">
            app.Gotix.com/dashboard
          </div>
        </div>
        <div className="bg-white">
          <DashboardMockup variant={variant} />
        </div>
      </div>
      {/* Stand */}
      <div className="mx-auto mt-0 h-8 w-24 bg-gradient-to-b from-gray-600 to-gray-700 md:h-12 md:w-32" />
      <div className="mx-auto h-2 w-40 rounded-full bg-gray-600 md:w-56" />
    </div>
  );
}
