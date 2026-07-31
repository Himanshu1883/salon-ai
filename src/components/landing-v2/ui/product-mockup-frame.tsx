"use client";

import { cn } from "@/lib/utils";
import { HeroDashboardPreview } from "../hero/hero-dashboard-preview";
import { DashboardMockup } from "./dashboard-mockup";

type MockupVariant =
  | "dashboard"
  | "appointment"
  | "billing"
  | "crm"
  | "inventory"
  | "marketing"
  | "reports"
  | "analytics";

type ProductMockupFrameProps = {
  className?: string;
  variant?: MockupVariant;
  showChrome?: boolean;
  tilt?: boolean;
};

export function ProductMockupFrame({
  className,
  variant = "dashboard",
  showChrome = true,
  tilt = false,
}: ProductMockupFrameProps) {
  return (
    <div
      className={cn(
        "hero-product-panel relative overflow-hidden",
        "rounded-2xl border border-[#E4DDD1] bg-white/95 backdrop-blur-xl",
        "shadow-[0_4px_8px_rgba(27,23,20,0.04),0_32px_80px_-16px_rgba(27,23,20,0.18)]",
        "ring-1 ring-[#1B1714]/[0.05]",
        tilt && "md:[transform:perspective(1400px)_rotateY(-3deg)_rotateX(1.5deg)]",
        className
      )}
    >
      {showChrome && (
        <div className="flex items-center gap-3 border-b border-[#E4DDD1] bg-[#F7F3EC]/90 px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#7C3AED]/30" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#C9A25D]/40" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#2F6F5E]/30" />
          </div>
          <div className="mx-auto flex max-w-xs flex-1 items-center justify-center rounded-md border border-[#E4DDD1] bg-white px-3 py-1">
            <span className="truncate text-[10px] text-[#1B1714]/45 sm:text-[11px]">
              app.salonai.com/{variant === "dashboard" ? "dashboard" : variant}
            </span>
          </div>
          <span className="hidden rounded-full bg-[#2F6F5E]/12 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#2F6F5E] sm:inline">
            Live
          </span>
        </div>
      )}
      {variant === "dashboard" ? (
        <HeroDashboardPreview />
      ) : (
        <DashboardMockup variant={variant} />
      )}
    </div>
  );
}
