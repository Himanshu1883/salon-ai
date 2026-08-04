"use client";

import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { LineItem } from "../utils";
import { lineTotal } from "../utils";
import { GST_OPTIONS, v2 } from "./tokens";
import { ItemSelector, type CatalogOption } from "./item-selector";

type ItemRowProps = {
  index: number;
  item: LineItem;
  catalogValue: string;
  catalogOptions: CatalogOption[];
  servicesByCategory: Map<string, { id: string; name: string; duration: number; price: number }[]>;
  products: { id: string; name: string; category: string; retailPrice: number }[];
  gstIncluded: boolean;
  error?: string;
  canRemove: boolean;
  onSelect: (value: string) => void;
  onUpdate: (patch: Partial<LineItem>) => void;
  onRemove: () => void;
};

export function ItemRow({
  index,
  item,
  catalogValue,
  catalogOptions,
  servicesByCategory,
  products,
  gstIncluded,
  error,
  canRemove,
  onSelect,
  onUpdate,
  onRemove,
}: ItemRowProps) {
  const amount = lineTotal(item, gstIncluded);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      className={v2.itemCard}
    >
      <div className="mb-4">
        <ItemSelector
          value={catalogValue}
          options={catalogOptions}
          servicesByCategory={servicesByCategory}
          products={products}
          onSelect={onSelect}
          error={error}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:items-end">
        <div className="space-y-1.5 lg:col-span-1">
          <label className="text-xs font-medium text-[#6B7280]">Qty</label>
          <Input
            type="number"
            min={1}
            value={item.quantity || ""}
            onChange={(e) =>
              onUpdate({ quantity: Math.max(1, Number(e.target.value) || 1) })
            }
            className={cn(v2.input, "h-11")}
          />
        </div>

        <div className="space-y-1.5 lg:col-span-1">
          <label className="text-xs font-medium text-[#6B7280]">Price</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#6B7280]">
              ₹
            </span>
            <Input
              type="number"
              min={0}
              value={item.unitPrice || ""}
              onChange={(e) =>
                onUpdate({ unitPrice: Number(e.target.value) || 0 })
              }
              className={cn(v2.input, "h-11 pl-8")}
            />
          </div>
        </div>

        <div className="space-y-1.5 lg:col-span-2">
          <label className="text-xs font-medium text-[#6B7280]">Discount</label>
          <div className="flex gap-2">
            <div className={v2.segmented}>
              <button
                type="button"
                onClick={() => onUpdate({ discountType: "percent" })}
                className={cn(
                  v2.segmentedItem,
                  item.discountType === "percent" && v2.segmentedItemActive
                )}
              >
                %
              </button>
              <button
                type="button"
                onClick={() => onUpdate({ discountType: "fixed" })}
                className={cn(
                  v2.segmentedItem,
                  item.discountType === "fixed" && v2.segmentedItemActive
                )}
              >
                ₹
              </button>
            </div>
            <Input
              type="number"
              min={0}
              value={item.discount || ""}
              onChange={(e) =>
                onUpdate({ discount: Number(e.target.value) || 0 })
              }
              className={cn(v2.input, "h-11 flex-1")}
            />
          </div>
        </div>

        <div className="space-y-1.5 lg:col-span-1">
          <label className="text-xs font-medium text-[#6B7280]">GST</label>
          <Select
            value={String(item.taxRate)}
            onValueChange={(v) => onUpdate({ taxRate: Number(v) })}
          >
            <SelectTrigger className={cn(v2.selectTrigger, "h-11")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-[14px]">
              {GST_OPTIONS.map((opt) => (
                <SelectItem key={opt.label} value={String(opt.value)}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end justify-between gap-3 lg:col-span-1">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-[#6B7280]">Amount</p>
            <p className="text-lg font-bold tabular-nums text-[#111827]">
              ₹{Math.round(amount).toLocaleString("en-IN")}
            </p>
          </div>
          {canRemove && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRemove}
              className="rounded-[12px] p-2.5 text-[#6B7280] transition-colors hover:bg-red-50 hover:text-red-500"
              aria-label="Remove item"
            >
              <Trash2 className="h-4 w-4" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
