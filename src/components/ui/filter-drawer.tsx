"use client";

import { useEffect, useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FilterDrawerProps = {
  /** Form or filter controls rendered inside the drawer / inline panel */
  children: React.ReactNode;
  onApply?: () => void;
  onReset?: () => void;
  /** Label for the mobile trigger button */
  triggerLabel?: string;
  /** Show inline filters from this breakpoint up (default: lg) */
  inlineFrom?: "md" | "lg";
  className?: string;
  inlineClassName?: string;
};

export function FilterDrawer({
  children,
  onApply,
  onReset,
  triggerLabel = "Filters",
  inlineFrom = "lg",
  className,
  inlineClassName,
}: FilterDrawerProps) {
  const [open, setOpen] = useState(false);
  const inlineClass = inlineFrom === "md" ? "hidden md:flex" : "hidden lg:flex";

  useEffect(() => {
    if (!open) return;
    const prev = document.body.getAttribute("data-scroll-locked");
    document.body.setAttribute("data-scroll-locked", "true");
    return () => {
      if (prev === null) document.body.removeAttribute("data-scroll-locked");
      else document.body.setAttribute("data-scroll-locked", prev);
    };
  }, [open]);

  function handleApply() {
    onApply?.();
    setOpen(false);
  }

  function handleReset() {
    onReset?.();
    setOpen(false);
  }

  return (
    <>
      <div className={cn(inlineClass, "flex-wrap items-center gap-2", inlineClassName)}>
        {children}
      </div>

      <div className={cn(inlineFrom === "md" ? "md:hidden" : "lg:hidden", className)}>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          className="h-11 min-h-[48px] w-full rounded-xl border-[#ECECEC] sm:w-auto"
        >
          <Filter className="h-4 w-4" />
          {triggerLabel}
        </Button>

        {open && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-50 bg-black/40"
              onClick={() => setOpen(false)}
              aria-label="Close filters"
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label={triggerLabel}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-2xl border border-[#ECECEC] bg-white p-4 pb-safe shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-[#1C103D]">{triggerLabel}</h3>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-[#6B7280] hover:bg-[#F7F8FC]"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 [&_input]:w-full [&_button[type='submit']]:hidden">
                {children}
              </div>

              <div className="sticky bottom-0 mt-4 flex gap-2 border-t border-[#ECECEC] bg-white pt-4">
                {onReset && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 min-h-[48px] flex-1 rounded-xl"
                    onClick={handleReset}
                  >
                    Reset
                  </Button>
                )}
                {onApply ? (
                  <Button
                    type="button"
                    className="h-12 min-h-[48px] flex-1 rounded-xl bg-[#6C3CF0] hover:bg-[#5B2FE0]"
                    onClick={handleApply}
                  >
                    Apply filters
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className="h-12 min-h-[48px] flex-1 rounded-xl bg-[#6C3CF0] hover:bg-[#5B2FE0]"
                    onClick={() => setOpen(false)}
                  >
                    Done
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
