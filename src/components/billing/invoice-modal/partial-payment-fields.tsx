"use client";

import { formatCurrency } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type PartialPaymentFieldsProps = {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  amount: string;
  onAmountChange: (value: string) => void;
  total: number;
  error?: string;
};

export function PartialPaymentFields({
  enabled,
  onEnabledChange,
  amount,
  onAmountChange,
  total,
  error,
}: PartialPaymentFieldsProps) {
  const paidAmount = Number.parseFloat(amount) || 0;
  const balanceDue = Math.max(0, total - paidAmount);

  return (
    <div className="rounded-[12px] border border-[#ECECF5] bg-white p-3">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onEnabledChange(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-[#D1D5DB] text-[#6C3BFF] focus:ring-[#6C3BFF]"
        />
        <div className="min-w-0 flex-1">
          <span className="text-sm font-semibold text-[#111827]">
            Partial payment
          </span>
          <p className="mt-0.5 text-[11px] text-[#6B7280]">
            Customer pays part now and the rest stays pending until collected.
          </p>
        </div>
      </label>

      {enabled && (
        <div className="mt-3 space-y-3 border-t border-[#F3F4F6] pt-3">
          <div className="space-y-1.5">
            <Label htmlFor="partial-amount" className="text-[11px] text-[#6B7280]">
              Amount received now
            </Label>
            <Input
              id="partial-amount"
              type="number"
              min={0.01}
              max={total}
              step="0.01"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              placeholder={`Max ${formatCurrency(total)}`}
              className="h-10 rounded-xl"
            />
            {error && <p className="text-[11px] text-red-500">{error}</p>}
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#FAFBFF] p-3 text-[12px]">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                Paid now
              </p>
              <p className="mt-0.5 font-semibold text-emerald-700">
                {formatCurrency(paidAmount)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                Pending
              </p>
              <p
                className={cn(
                  "mt-0.5 font-semibold",
                  balanceDue > 0 ? "text-amber-700" : "text-[#111827]"
                )}
              >
                {formatCurrency(balanceDue)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
