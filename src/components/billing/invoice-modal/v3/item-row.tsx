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
import { cn, formatCurrency } from "@/lib/utils";
import type { LineItem } from "../utils";
import { lineTotal } from "../utils";
import { GST_OPTIONS, v3 } from "./tokens";
import { ItemSelector, type CatalogOption } from "./item-selector";

type ItemRowProps = {
  index: number;
  item: LineItem;
  catalogValue: string;
  catalogOptions: CatalogOption[];
  servicesByCategory: Map<string, { id: string; name: string; duration: number; price: number }[]>;
  products: { id: string; name: string; category: string; retailPrice: number }[];
  gstIncluded: boolean;
  gstEnabled?: boolean;
  error?: string;
  canRemove: boolean;
  onSelect: (value: string) => void;
  onUpdate: (patch: Partial<LineItem>) => void;
  onRemove: () => void;
};

function DiscountField({
  item,
  onUpdate,
}: {
  item: LineItem;
  onUpdate: (patch: Partial<LineItem>) => void;
}) {
  return (
    <div className="flex min-w-0 items-center gap-1">
      <div className={v3.segmented}>
        <button
          type="button"
          onClick={() => onUpdate({ discountType: "percent" })}
          className={cn(
            v3.segmentedItem,
            item.discountType === "percent" && v3.segmentedItemActive
          )}
        >
          %
        </button>
        <button
          type="button"
          onClick={() => onUpdate({ discountType: "fixed" })}
          className={cn(
            v3.segmentedItem,
            item.discountType === "fixed" && v3.segmentedItemActive
          )}
        >
          ₹
        </button>
      </div>
      <Input
        type="number"
        min={0}
        aria-label="Discount"
        value={item.discount || ""}
        onChange={(e) => onUpdate({ discount: Number(e.target.value) || 0 })}
        className={cn(v3.input, "h-12 min-w-0 flex-1 px-2 tabular-nums sm:h-10 md:h-9")}
      />
    </div>
  );
}

function GstSelect({
  item,
  onUpdate,
}: {
  item: LineItem;
  onUpdate: (patch: Partial<LineItem>) => void;
}) {
  return (
    <Select
      value={String(item.taxRate)}
      onValueChange={(v) => onUpdate({ taxRate: Number(v) })}
    >
      <SelectTrigger className={cn(v3.selectTrigger, "h-12 px-2 sm:h-10 md:h-9")}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="rounded-[12px]">
        {GST_OPTIONS.map((opt) => (
          <SelectItem key={opt.label} value={String(opt.value)}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function ItemRow({
  index,
  item,
  catalogValue,
  catalogOptions,
  servicesByCategory,
  products,
  gstIncluded,
  gstEnabled = true,
  error,
  canRemove,
  onSelect,
  onUpdate,
  onRemove,
}: ItemRowProps) {
  const amount = lineTotal(item, gstIncluded, gstEnabled);

  return (
    <>
      {/* Mobile card layout */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: index * 0.02 }}
        className={cn(v3.itemCard, error && "bg-red-50/30")}
      >
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1 [&_input]:h-12 [&_input]:rounded-[12px] [&_input]:text-base [&_label]:hidden [&_.space-y-1\\.5]:space-y-0 sm:[&_input]:h-10 sm:[&_input]:text-[13px]">
            <ItemSelector
              value={catalogValue}
              options={catalogOptions}
              servicesByCategory={servicesByCategory}
              products={products}
              onSelect={onSelect}
              error={error}
            />
          </div>
          {canRemove ? (
            <button
              type="button"
              onClick={onRemove}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-[#6B7280] transition-colors hover:bg-red-50 hover:text-red-500"
              aria-label="Remove item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className={v3.label}>Qty</span>
            <Input
              type="number"
              min={1}
              aria-label="Quantity"
              value={item.quantity || ""}
              onChange={(e) =>
                onUpdate({ quantity: Math.max(1, Number(e.target.value) || 1) })
              }
              className={cn(v3.input, "h-12 px-2 text-center tabular-nums sm:h-10 md:h-9")}
            />
          </div>
          <div>
            <span className={v3.label}>Price</span>
            <div className="relative">
              <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-[#6B7280]">
                ₹
              </span>
              <Input
                type="number"
                min={0}
                aria-label="Price"
                value={item.unitPrice || ""}
                onChange={(e) =>
                  onUpdate({ unitPrice: Number(e.target.value) || 0 })
                }
                className={cn(v3.input, "h-12 pl-5 pr-1 tabular-nums sm:h-10 md:h-9")}
              />
            </div>
          </div>
          <div className="col-span-2">
            <span className={v3.label}>Discount</span>
            <DiscountField item={item} onUpdate={onUpdate} />
          </div>
          {gstEnabled ? (
            <div>
              <span className={v3.label}>GST</span>
              <GstSelect item={item} onUpdate={onUpdate} />
            </div>
          ) : null}
          <div className={cn(gstEnabled ? "" : "col-span-2", "flex flex-col justify-end")}>
            <span className={v3.label}>Amount</span>
            <p className="text-right text-[15px] font-semibold tabular-nums text-[#111827]">
              {formatCurrency(Math.round(amount))}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tablet+ table row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: index * 0.02 }}
        className={cn(
          v3.itemRow,
          !gstEnabled && v3.itemRowNoGst,
          error && "bg-red-50/30"
        )}
      >
        <div className="min-w-0 [&_input]:h-9 [&_input]:rounded-[12px] [&_input]:text-[13px] [&_label]:hidden [&_.space-y-1\\.5]:space-y-0">
          <ItemSelector
            value={catalogValue}
            options={catalogOptions}
            servicesByCategory={servicesByCategory}
            products={products}
            onSelect={onSelect}
            error={undefined}
          />
        </div>

        <Input
          type="number"
          min={1}
          aria-label="Quantity"
          value={item.quantity || ""}
          onChange={(e) =>
            onUpdate({ quantity: Math.max(1, Number(e.target.value) || 1) })
          }
          className={cn(v3.input, "h-9 px-2 text-center tabular-nums")}
        />

        <div className="relative">
          <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-[#6B7280]">
            ₹
          </span>
          <Input
            type="number"
            min={0}
            aria-label="Price"
            value={item.unitPrice || ""}
            onChange={(e) =>
              onUpdate({ unitPrice: Number(e.target.value) || 0 })
            }
            className={cn(v3.input, "h-9 pl-5 pr-1 tabular-nums")}
          />
        </div>

        <DiscountField item={item} onUpdate={onUpdate} />

        {gstEnabled ? <GstSelect item={item} onUpdate={onUpdate} /> : null}

        <span className="truncate text-right text-[13px] font-semibold tabular-nums text-[#111827]">
          ₹{Math.round(amount).toLocaleString("en-IN")}
        </span>

        {canRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="flex h-8 w-8 items-center justify-center rounded-[8px] text-[#6B7280] transition-colors hover:bg-red-50 hover:text-red-500 sm:h-7 sm:w-7"
            aria-label="Remove item"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        ) : (
          <span aria-hidden />
        )}
      </motion.div>
    </>
  );
}
