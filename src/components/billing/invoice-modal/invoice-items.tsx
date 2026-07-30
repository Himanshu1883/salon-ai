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
      <h3
        id="items-section"
        className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]"
      >
        Items
      </h3>
      <div className="overflow-hidden rounded-[18px] border border-[#E5E7EB] bg-[#F8FAFC] p-4">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF]">
                <th className="pb-3 pr-3">Service / Product</th>
                <th className="pb-3 pr-3 w-28">Price</th>
                <th className="pb-3 pr-3 w-36">Discount</th>
                <th className="pb-3 pr-3 w-28 text-right">Amount</th>
                <th className="pb-3 w-10" />
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
                    <td className="py-2 pr-3">
                      <Select
                        value={catalogValue}
                        onValueChange={(v) => onSelectItem(i, v)}
                      >
                        <SelectTrigger className="h-12 rounded-[14px] border-[#E5E7EB] bg-white text-sm">
                          <SelectValue placeholder="Select item" />
                        </SelectTrigger>
                        <SelectContent className="max-h-72 rounded-[14px]">
                          {Array.from(servicesByCategory.entries()).map(
                            ([category, items]) => (
                              <div key={category}>
                                <p className="px-2 py-1.5 text-xs font-semibold text-[#9CA3AF]">
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
                                      <span className="text-xs text-[#9CA3AF]">
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
                              <p className="px-2 py-1.5 text-xs font-semibold text-[#9CA3AF]">
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
                                    <span className="text-xs text-[#9CA3AF]">
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
                        <p className="mt-1 text-[10px] text-[#9CA3AF]">
                          {formatDuration(selectedService.duration)}
                        </p>
                      )}
                      {fieldErrors?.[i] && (
                        <p className="mt-1 text-[10px] text-[#EF4444]">
                          {fieldErrors[i]}
                        </p>
                      )}
                    </td>
                    <td className="py-2 pr-3">
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#9CA3AF]">
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
                          className="h-12 rounded-[14px] border-[#E5E7EB] bg-white pl-7 text-sm"
                        />
                      </div>
                    </td>
                    <td className="py-2 pr-3">
                      <div className="flex gap-1">
                        <Select
                          value={item.discountType}
                          onValueChange={(v: "percent" | "fixed") =>
                            onUpdateItem(i, { discountType: v })
                          }
                        >
                          <SelectTrigger className="h-12 w-16 rounded-[14px] border-[#E5E7EB] bg-white px-2 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-[14px]">
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
                          className="h-12 flex-1 rounded-[14px] border-[#E5E7EB] bg-white text-sm"
                        />
                      </div>
                    </td>
                    <td className="py-2 pr-3 text-right font-semibold text-[#1C103D]">
                      ₹{Math.round(lineTotal(item, gstIncluded)).toFixed(2)}
                    </td>
                    <td className="py-2">
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onRemoveItem(i)}
                          className="rounded-lg p-2 text-[#9CA3AF] transition-colors hover:bg-red-50 hover:text-[#EF4444]"
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
          <p className="mt-2 text-xs text-[#EF4444]">{itemsError}</p>
        )}

        <div className="mt-4 flex justify-center">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAddItem}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border-2 border-[#6D5DF6]/30 px-5 py-2.5",
              "text-sm font-medium text-[#6D5DF6] transition-colors hover:bg-[#6D5DF6]/5"
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
