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
import { formatCurrency } from "@/lib/utils";

const SPLIT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "card", label: "Card" },
  { value: "wallet", label: "Wallet" },
  { value: "other", label: "Other" },
];

type SplitRow = { key: string; method: string; amount: number };

type SplitPaymentProps = {
  rows: SplitRow[];
  onChange: (rows: SplitRow[]) => void;
  invoiceTotal: number;
  error?: string;
};

export function SplitPayment({
  rows,
  onChange,
  invoiceTotal,
  error,
}: SplitPaymentProps) {
  const splitTotal = rows.reduce((sum, row) => sum + (row.amount || 0), 0);
  const remaining = Math.round((invoiceTotal - splitTotal) * 100) / 100;

  function updateRow(index: number, patch: Partial<SplitRow>) {
    const next = [...rows];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  }

  function addRow() {
    onChange([
      ...rows,
      { key: crypto.randomUUID(), method: "cash", amount: 0 },
    ]);
  }

  function removeRow(index: number) {
    if (rows.length <= 1) return;
    onChange(rows.filter((_, i) => i !== index));
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="mt-4 overflow-hidden rounded-[18px] border border-[#E5E7EB] bg-[#F8FAFC] p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-[#1C103D]">Split payment details</p>
        <p className="text-xs text-[#6B7280]">
          Remaining:{" "}
          <span
            className={
              remaining === 0 ? "font-semibold text-[#22C55E]" : "font-semibold text-[#EF4444]"
            }
          >
            {formatCurrency(Math.abs(remaining))}
            {remaining < 0 ? " over" : remaining > 0 ? " due" : ""}
          </span>
        </p>
      </div>

      <div className="space-y-2">
        {rows.map((row, index) => (
          <div key={row.key} className="flex items-center gap-2">
            <Select
              value={row.method}
              onValueChange={(v) => updateRow(index, { method: v })}
            >
              <SelectTrigger className="h-12 w-36 rounded-[14px] border-[#E5E7EB] bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-[14px]">
                {SPLIT_METHODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#9CA3AF]">
                ₹
              </span>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={row.amount || ""}
                onChange={(e) =>
                  updateRow(index, { amount: Number(e.target.value) || 0 })
                }
                className="h-12 rounded-[14px] border-[#E5E7EB] bg-white pl-7"
              />
            </div>
            <button
              type="button"
              onClick={() => removeRow(index)}
              disabled={rows.length <= 1}
              className="rounded-lg p-2 text-[#9CA3AF] hover:bg-red-50 hover:text-[#EF4444] disabled:opacity-40"
              aria-label="Remove split row"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addRow}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#6D5DF6] hover:underline"
      >
        <Plus className="h-4 w-4" />
        Add payment row
      </button>

      {error && <p className="mt-2 text-xs text-[#EF4444]">{error}</p>}
    </motion.div>
  );
}
