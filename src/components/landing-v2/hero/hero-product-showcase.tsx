"use client";

import { cn } from "@/lib/utils";
import { ProductMockupFrame } from "../ui/product-mockup-frame";
import { FloatingCards } from "./floating-cards";

type HeroProductShowcaseProps = {
  animate?: boolean;
  className?: string;
};

export function HeroProductShowcase({ animate = true, className }: HeroProductShowcaseProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-white/40 blur-2xl"
      />

      <FloatingCards animate={animate} />

      <ProductMockupFrame variant="dashboard" tilt className="relative z-10" />

      <div
        aria-hidden
        className="relative z-10 mx-auto mt-4 h-px w-2/3 max-w-xs bg-gradient-to-r from-transparent via-[#C9A25D]/50 to-transparent"
      />
    </div>
  );
}
