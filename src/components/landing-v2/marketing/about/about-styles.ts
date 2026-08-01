import { cn } from "@/lib/utils";

export const ABOUT = {
  base: "#FAF9F7",
  ink: "#1B1714",
  purple: "#5B21B6",
  purpleDark: "#2E1065",
  purpleLight: "#C4B5FD",
  border: "#E8E4DE",
} as const;

export const ABOUT_CONTAINER =
  "mx-auto w-full max-w-[1200px] px-5 sm:px-6 lg:px-10";

export const aboutSectionPadding = "py-20 md:py-28 lg:py-32";

export const aboutBracketLabel = (className?: string) =>
  cn(
    "inline-flex items-center gap-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[#1B1714]/55",
    className
  );

export const aboutGradientButtonClass = (className?: string) =>
  cn(
    "inline-flex items-center justify-center gap-2 rounded-full",
    "bg-gradient-to-br from-[#6D28D9] to-[#4F46E5]",
    "font-semibold text-white",
    "shadow-[0_8px_28px_-6px_rgba(91,33,182,0.45)]",
    "transition-[transform,box-shadow,filter] duration-300 ease-[cubic-bezier(0.22,0.61,0.36,1)]",
    "hover:scale-[1.02] hover:shadow-[0_12px_36px_-6px_rgba(91,33,182,0.55)] hover:brightness-105",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6D28D9]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF9F7]",
    className
  );

export const aboutOutlineButtonClass = (className?: string) =>
  cn(
    "inline-flex items-center justify-center rounded-full border border-[#1B1714]/25 bg-transparent px-6 py-3",
    "text-sm font-semibold text-[#1B1714]",
    "transition-[transform,box-shadow,background-color,border-color] duration-200",
    "hover:-translate-y-0.5 hover:border-[#1B1714]/40 hover:bg-white",
    "hover:shadow-[0_4px_16px_-6px_rgba(27,23,20,0.1)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B21B6]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF9F7]",
    className
  );
