"use client";

import { cn } from "@/lib/utils";
import { DashboardMockup } from "./dashboard-mockup";

type VanityMirrorMockupProps = {
  className?: string;
  variant?: "dashboard" | "appointment" | "billing" | "crm" | "inventory" | "marketing" | "reports" | "analytics";
};

export function VanityMirrorMockup({ className, variant = "dashboard" }: VanityMirrorMockupProps) {
  return (
    <div className={cn("relative mx-auto w-full max-w-xl", className)}>
      {/* Warm ambient glow behind mirror */}
      <div
        aria-hidden
        className="hero-editorial__mirror-glow pointer-events-none absolute -inset-6 rounded-[3rem] blur-2xl md:-inset-10"
      />

      {/* Vanity mirror frame */}
      <div
        className={cn(
          "relative overflow-hidden",
          "rounded-t-[2.75rem] rounded-b-2xl md:rounded-t-[3.25rem] md:rounded-b-3xl",
          "border-[3px] border-[#C9A25D]",
          "bg-[#F7F3EC]",
          "p-2 md:p-2.5",
          "shadow-[0_24px_64px_-12px_rgba(27,23,20,0.18),0_8px_24px_-8px_rgba(124,58,237,0.12)]"
        )}
      >
        {/* Inner burgundy hairline */}
        <div
          className={cn(
            "overflow-hidden",
            "rounded-t-[2.25rem] rounded-b-xl md:rounded-t-[2.75rem] md:rounded-b-2xl",
            "border border-[#7C3AED]/25",
            "bg-white",
            "shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
          )}
        >
          <DashboardMockup variant={variant} />
        </div>
      </div>

      {/* Mirror shelf / base accent */}
      <div
        aria-hidden
        className="mx-auto mt-3 h-1.5 w-[55%] rounded-full bg-gradient-to-r from-transparent via-[#C9A25D]/60 to-transparent"
      />
    </div>
  );
}
