"use client";

import { Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FilterDrawer } from "@/components/ui/filter-drawer";

type InventoryFilterBarProps = {
  /** Inline filter fields (selects, inputs) */
  children: React.ReactNode;
  /** Stacked fields for mobile drawer — defaults to children */
  mobileChildren?: React.ReactNode;
  onApply?: () => void;
  onReset?: () => void;
  triggerLabel?: string;
};

export function InventoryFilterBar({
  children,
  mobileChildren,
  onApply,
  onReset,
  triggerLabel = "Filters",
}: InventoryFilterBarProps) {
  const drawerFields = mobileChildren ?? children;

  return (
    <>
      <div className="hidden flex-wrap items-center gap-2 lg:flex">{children}</div>
      <div className="lg:hidden">
        <FilterDrawer
          triggerLabel={triggerLabel}
          onApply={onApply ?? (() => {})}
          onReset={onReset}
        >
          {drawerFields}
        </FilterDrawer>
      </div>
    </>
  );
}

export function InventoryFilterApplyButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      size="sm"
      onClick={onClick}
      className="hidden h-9 rounded-xl bg-[#6C3BFF] hover:bg-[#5A2FE0] lg:inline-flex"
    >
      <Filter className="h-3.5 w-3.5" />
      Apply
    </Button>
  );
}

export function InventoryFilterResetButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      className="hidden h-9 rounded-xl border-[#ECECEC] lg:inline-flex"
    >
      <RotateCcw className="h-3.5 w-3.5" />
      Reset
    </Button>
  );
}
