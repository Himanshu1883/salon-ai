"use client";

import { motion } from "framer-motion";
import { Plus, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BillingProduct, BillingService } from "../../types";
import type { LineItem } from "../utils";
import { v2 } from "./tokens";
import { ItemRow } from "./item-row";
import type { CatalogOption } from "./item-selector";

type ItemsSectionProps = {
  lineItems: LineItem[];
  products: BillingProduct[];
  servicesByCategory: Map<string, BillingService[]>;
  catalogOptions: CatalogOption[];
  gstIncluded: boolean;
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
  gstIncluded,
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
    <section aria-labelledby="v2-items-section">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#7C3AED]/10">
          <ShoppingBag className="h-4.5 w-4.5 text-[#7C3AED]" />
        </div>
        <h3 id="v2-items-section" className={v2.sectionTitle}>
          Items
        </h3>
      </div>

      <div className="space-y-4">
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
              gstIncluded={gstIncluded}
              error={fieldErrors?.[i]}
              canRemove={lineItems.length > 1}
              onSelect={(v) => onSelectItem(i, v)}
              onUpdate={(patch) => onUpdateItem(i, patch)}
              onRemove={() => onRemoveItem(i)}
            />
          );
        })}
      </div>

      {itemsError && (
        <p className="mt-3 text-sm text-red-500">{itemsError}</p>
      )}

      <div className="mt-6 flex justify-center">
        <motion.button
          type="button"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAddItem}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border border-[#ECECF5] bg-[#FAFBFF] px-6 py-3",
            "text-sm font-medium text-[#7C3AED] transition-colors hover:border-[#7C3AED]/30 hover:bg-white"
          )}
        >
          <Plus className="h-4 w-4" />
          Add Another Item
        </motion.button>
      </div>
    </section>
  );
}
