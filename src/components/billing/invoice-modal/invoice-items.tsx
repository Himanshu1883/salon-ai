"use client";

import { motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatDuration } from "@/lib/utils";
import type { BillingProduct, BillingService } from "../types";
import { SectionHeader } from "./section-header";
import { invoiceModalStyles } from "./styles";
import type { LineItem } from "./utils";
import { lineTotal } from "./utils";

type CatalogOption = {
  type: "SERVICE" | "PRODUCT";
  id: string;
  label: string;
  category: string;
  price: number;
  duration: number;
  taxRate: number;
};

type InvoiceItemsProps = {
  lineItems: LineItem[];
  services: BillingService[];
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

export function InvoiceItems({
  lineItems,
  services,
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
}: InvoiceItemsProps) {
  return (
    <section aria-labelledby="items-section">
      <SectionHeader id="items-section">Items</SectionHeader>
      <div className={cn(invoiceModalStyles.card, "p-5")}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-xs font-medium uppercase tracking-wide text-dashboard-muted">
                <th className="pb-4 pr-4">Service / Product</th>
                <th className="w-28 pb-4 pr-4">Price</th>
                <th className="w-36 pb-4 pr-4">Discount</th>
                <th className="w-28 pb-4 pr-4 text-right">Amount</th>
                <th className="w-10 pb-4" />
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, i) => {
                const catalogValue = item.serviceId
                  ? `SERVICE:${item.serviceId}`
                  : item.stockItemId
                    ? `PRODUCT:${item.stockItemId}`
                    : "";
                const selectedService = services.find(
                  (s) => s.id === item.serviceId
                );

                return (
                  <tr key={item.key} className="align-top">
                    <td className="py-2.5 pr-4">
                      <Select
                        value={catalogValue}
                        onValueChange={(v) => onSelectItem(i, v)}
                      >
                        <SelectTrigger className={invoiceModalStyles.selectTrigger}>
                          <SelectValue placeholder="Select item" />
                        </SelectTrigger>
                        <SelectContent className="max-h-72 rounded-2xl">
                          {Array.from(servicesByCategory.entries()).map(
                            ([category, items]) => (
                              <div key={category}>
                                <p className="px-2 py-1.5 text-xs font-semibold text-dashboard-muted">
                                  {category}
                                </p>
                                {items.map((s) => (
                                  <SelectItem
                                    key={s.id}
                                    value={`SERVICE:${s.id}`}
                                    className="py-2.5"
                                  >
                                    <div className="flex flex-col gap-0.5">
                                      <span className="font-medium">{s.name}</span>
                                      <span className="text-xs text-dashboard-muted">
                                        {category} · {formatDuration(s.duration)} · ₹
                                        {s.price}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </div>
                            )
                          )}
                          {products.length > 0 && (
                            <div>
                              <p className="px-2 py-1.5 text-xs font-semibold text-dashboard-muted">
                                Products
                              </p>
                              {products.map((p) => (
                                <SelectItem
                                  key={p.id}
                                  value={`PRODUCT:${p.id}`}
                                  className="py-2.5"
                                >
                                  <div className="flex flex-col gap-0.5">
                                    <span className="font-medium">{p.name}</span>
                                    <span className="text-xs text-dashboard-muted">
                                      {p.category} · ₹{p.retailPrice}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      {selectedService && (
                        <p className="mt-1.5 text-xs text-dashboard-muted">
                          {formatDuration(selectedService.duration)}
                        </p>
                      )}
                      {fieldErrors?.[i] && (
                        <p className="mt-1.5 text-xs text-red-600">
                          {fieldErrors[i]}
                        </p>
                      )}
                    </td>
                    <td className="py-2.5 pr-4">
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-dashboard-muted">
                          ₹
                        </span>
                        <Input
                          type="number"
                          min={0}
                          value={item.unitPrice || ""}
                          onChange={(e) =>
                            onUpdateItem(i, {
                              unitPrice: Number(e.target.value) || 0,
                            })
                          }
                          className={cn(invoiceModalStyles.input, "pl-8")}
                        />
                      </div>
                    </td>
                    <td className="py-2.5 pr-4">
                      <div className="flex gap-2">
                        <Select
                          value={item.discountType}
                          onValueChange={(v: "percent" | "fixed") =>
                            onUpdateItem(i, { discountType: v })
                          }
                        >
                          <SelectTrigger className={cn(invoiceModalStyles.selectTrigger, "w-16 px-2")}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                            <SelectItem value="percent">%</SelectItem>
                            <SelectItem value="fixed">₹</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          min={0}
                          value={item.discount || ""}
                          onChange={(e) =>
                            onUpdateItem(i, {
                              discount: Number(e.target.value) || 0,
                            })
                          }
                          className={cn(invoiceModalStyles.input, "flex-1")}
                        />
                      </div>
                    </td>
                    <td className="py-2.5 pr-4 text-right font-semibold text-dashboard-text">
                      ₹{Math.round(lineTotal(item, gstIncluded)).toFixed(2)}
                    </td>
                    <td className="py-2.5">
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onRemoveItem(i)}
                          className="rounded-xl p-2 text-dashboard-muted transition-colors hover:bg-red-50 hover:text-red-600"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {itemsError && (
          <p className="mt-3 text-xs text-red-600">{itemsError}</p>
        )}

        <div className="mt-5 flex justify-center border-t border-violet-100/60 pt-5">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAddItem}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-violet-50/50 px-5 py-2.5",
              "text-sm font-medium text-violet-600 shadow-sm shadow-violet-500/5 transition-colors hover:bg-violet-50 hover:border-violet-300"
            )}
          >
            <Plus className="h-4 w-4" />
            Add item
          </motion.button>
        </div>
      </div>
    </section>
  );
}
