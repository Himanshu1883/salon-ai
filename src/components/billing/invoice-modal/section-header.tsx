"use client";

import { cn } from "@/lib/utils";
import { invoiceModalStyles } from "./styles";

type SectionHeaderProps = {
  id?: string;
  children: React.ReactNode;
  className?: string;
};

export function SectionHeader({ id, children, className }: SectionHeaderProps) {
  return (
    <div className={cn("mb-5 flex items-center gap-3", className)}>
      <div
        className="h-5 w-1 shrink-0 rounded-full bg-gradient-to-b from-violet-500 to-violet-400"
        aria-hidden
      />
      <h3 id={id} className={invoiceModalStyles.sectionTitle}>
        {children}
      </h3>
    </div>
  );
}
