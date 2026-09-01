"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BillingEmployee, BillingProduct, BillingService } from "../../types";
import type { LineItem } from "../utils";
import { v3 } from "./tokens";
import { ItemRow } from "./item-row";
import type { CatalogOption } from "./item-selector";

type ItemsSectionProps = {
  lineItems: LineItem[];
  products: BillingProduct[];
  servicesByCategory: Map<string, BillingService[]>;
  catalogOptions: CatalogOption[];
  employees: BillingEmployee[];
  showStaffColumn: boolean;
  gstIncluded: boolean;
  gstEnabled?: boolean;
  fieldErrors?: Record<number, string>;
  itemsError?: string;
  onSelectItem: (index: number, value: string) => void;
  onUpdateItem: (index: number, patch: Partial<LineItem>) => void;
  onRemoveItem: (index: number) => void;
  onAddItem: () => void;
};

export function ItemsSection({
  lineItems,
  products,
  servicesByCategory,
  catalogOptions,
  employees,
  showStaffColumn,
  gstIncluded,
  gstEnabled = true,
  fieldErrors,
  itemsError,
  onSelectItem,
  onUpdateItem,
  onRemoveItem,
  onAddItem,
}: ItemsSectionProps) {
  const categoryMap = new Map<
    string,
    { id: string; name: string; duration: number; price: number }[]
  >();
  for (const [cat, items] of servicesByCategory.entries()) {
    categoryMap.set(
      cat,
      items.map((s) => ({
        id: s.id,
        name: s.name,
        duration: s.duration,
        price: s.price,
      }))
    );
  }

  const productList = products.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    retailPrice: p.retailPrice,
  }));

  return (
    <section aria-labelledby="v3-items-section" className={v3.section}>
      <h3 id="v3-items-section" className={v3.sectionTitle}>
        🛍 Services / Items
      </h3>

      {/* Desktop table header */}
      <div className="hidden lg:block">
        <div
          className={cn(
            showStaffColumn
              ? gstEnabled
                ? v3.itemHeaderWithStaff
                : v3.itemHeaderWithStaffNoGst
              : gstEnabled
                ? v3.itemHeader
                : v3.itemHeaderNoGst
          )}
        >
          <span>Services</span>
          {showStaffColumn ? <span>Staff</span> : null}
          <span>Qty</span>
          <span>Service charge</span>
          <span>Discount</span>
          {gstEnabled ? <span>GST</span> : null}
          <span className="text-right">Total</span>
          <span aria-hidden />
        </div>
      </div>

      {/* Mobile: card stack; Tablet+: horizontal scroll table */}
      <div className="overflow-hidden rounded-[12px] border border-[#ECECF5] bg-white md:overflow-x-auto lg:overflow-visible">
        <div className="max-md:min-w-0 md:min-w-[620px] lg:min-w-0">
          {lineItems.map((item, i) => {
            const catalogValue = item.serviceId
              ? `SERVICE:${item.serviceId}`
              : item.stockItemId
                ? `PRODUCT:${item.stockItemId}`
                : "";

            return (
              <ItemRow
                key={item.key}
                index={i}
                item={item}
                catalogValue={catalogValue}
                catalogOptions={catalogOptions}
                servicesByCategory={categoryMap}
                products={productList}
                employees={employees}
                showStaffColumn={showStaffColumn}
                gstIncluded={gstIncluded}
                gstEnabled={gstEnabled}
                error={fieldErrors?.[i]}
                canRemove={lineItems.length > 1}
                onSelect={(v) => onSelectItem(i, v)}
                onUpdate={(patch) => onUpdateItem(i, patch)}
                onRemove={() => onRemoveItem(i)}
              />
            );
          })}
        </div>
      </div>

      {itemsError && (
        <p className="mt-1.5 text-[11px] text-red-500">{itemsError}</p>
      )}

      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={onAddItem}
        className={cn(
          "mt-2 inline-flex min-h-[44px] items-center gap-1.5 rounded-[10px] px-3 sm:min-h-8",
          "text-[12px] font-medium text-[#7C3AED] transition-colors hover:bg-[#7C3AED]/5"
        )}
      >
        <Plus className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
        Add Item
      </motion.button>

      <div className={cn(v3.sectionDivider, "mt-3")} />
    </section>
  );
}
