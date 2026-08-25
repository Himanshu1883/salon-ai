"use client";

import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type CatalogDialogContentProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  wide?: boolean;
  className?: string;
};

export function CatalogDialogContent({
  title,
  description,
  children,
  wide = false,
  className,
}: CatalogDialogContentProps) {
  return (
    <DialogContent
      className={cn(
        "flex max-h-[min(88dvh,920px)] w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-2xl border-dashboard-border bg-dashboard-card p-0 shadow-dashboard-card",
        "top-[50%] translate-y-[-50%]",
        "[&>button]:right-4 [&>button]:top-4 [&>button]:rounded-lg [&>button]:text-dashboard-muted [&>button]:opacity-100 [&>button]:ring-offset-dashboard-card hover:[&>button]:bg-violet-50 hover:[&>button]:text-dashboard-primary",
        wide ? "max-w-2xl" : "max-w-lg",
        className
      )}
    >
      <DialogHeader className="shrink-0 space-y-1.5 border-b border-dashboard-border/80 bg-gradient-to-br from-violet-600/[0.05] via-dashboard-card to-dashboard-card px-6 pb-4 pt-6 pr-12 text-left">
        <DialogTitle className="text-lg font-semibold tracking-tight text-dashboard-text">
          {title}
        </DialogTitle>
        {description ? (
          <p className="text-sm text-dashboard-muted">{description}</p>
        ) : null}
      </DialogHeader>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5 [scrollbar-gutter:stable]">
        {children}
      </div>
    </DialogContent>
  );
}

/** Sticky footer for long catalog forms — keeps Save visible while scrolling fields */
export const catalogFormFooterClassName =
  "sticky bottom-0 -mx-6 mt-6 border-t border-dashboard-border/80 bg-dashboard-card/95 px-6 py-4 backdrop-blur-sm";
