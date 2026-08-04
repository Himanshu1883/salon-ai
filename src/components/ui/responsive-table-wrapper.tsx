"use client";

import { cn } from "@/lib/utils";

type ResponsiveTableWrapperProps = {
  /** Desktop/tablet table view — hidden below `md` by default */
  table: React.ReactNode;
  /** Mobile card list — hidden from `md` upward by default */
  cards: React.ReactNode;
  /** Breakpoint at which table replaces cards (default: md = 768px) */
  breakpoint?: "md" | "lg";
  className?: string;
};

/**
 * Renders card rows on mobile and a scrollable table from tablet/desktop up.
 * Wrap table content in overflow-x-auto inside `table` when columns are wide.
 */
export function ResponsiveTableWrapper({
  table,
  cards,
  breakpoint = "md",
  className,
}: ResponsiveTableWrapperProps) {
  const hideCards = breakpoint === "lg" ? "lg:hidden" : "md:hidden";
  const hideTable = breakpoint === "lg" ? "hidden lg:block" : "hidden md:block";

  return (
    <div className={cn("min-w-0", className)}>
      <div className={hideCards}>{cards}</div>
      <div className={cn(hideTable, "min-w-0 overflow-x-auto")}>{table}</div>
    </div>
  );
}
