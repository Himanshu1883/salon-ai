"use client";

import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import { markInvoicePaid } from "@/actions/billing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatCurrency } from "@/lib/utils";
import { getInvoiceBalanceDue } from "@/lib/billing/invoice-balance";

const PAYMENT_OPTIONS = [
  { value: "cash", label: "Cash", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  { value: "card", label: "Card", className: "border-blue-200 bg-blue-50 text-blue-700" },
  { value: "upi", label: "UPI", className: "border-violet-200 bg-violet-50 text-violet-700" },
  { value: "wallet", label: "Wallet", className: "border-orange-200 bg-orange-50 text-orange-700" },
  { value: "other", label: "Other", className: "border-slate-200 bg-slate-50 text-slate-700" },
];

type BillingMarkPaidDialogProps = {
  invoiceId: string;
  total: number;
  amountPaid?: number;
  compact?: boolean;
  onSuccess: (method: string, amountPaid: number, status: string) => void;
};

export function BillingMarkPaidDialog({
  invoiceId,
  total,
  amountPaid = 0,
  compact = false,
  onSuccess,
}: BillingMarkPaidDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState("cash");
  const [amount, setAmount] = useState("");

  const balanceDue = getInvoiceBalanceDue({ total, amountPaid });
  const isPartialInvoice = amountPaid > 0 && balanceDue > 0;

  useEffect(() => {
    if (open) {
      setAmount(balanceDue.toFixed(2));
    }
  }, [open, balanceDue]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const paymentAmount = Number.parseFloat(amount);
    if (!paymentAmount || paymentAmount <= 0) {
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.set("invoiceId", invoiceId);
    formData.set("paymentMethod", method);
    formData.set("amount", String(paymentAmount));

    const result = await markInvoicePaid(formData);
    setLoading(false);

    if ("error" in result && result.error) {
      return;
    }

    setOpen(false);
    const newAmountPaid =
      "amountPaid" in result && typeof result.amountPaid === "number"
        ? result.amountPaid
        : amountPaid + paymentAmount;
    const status =
      "status" in result && typeof result.status === "string"
        ? result.status
        : "paid";
    onSuccess(method, newAmountPaid, status);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className={cn(
            "rounded-lg border-emerald-200 text-emerald-700 hover:bg-emerald-50",
            compact ? "h-7 px-2 text-[11px] font-medium" : "h-8"
          )}
        >
          <CreditCard className={compact ? "h-3 w-3" : "h-3 w-3"} />
          {isPartialInvoice
            ? compact
              ? "Collect"
              : "Collect balance"
            : compact
              ? "Pay"
              : "Mark paid"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] w-[calc(100%-1.5rem)] overflow-y-auto rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#1C103D]">
            {isPartialInvoice ? "Collect remaining payment" : "Record payment"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-xl bg-[#FAFBFF] p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[#6B7280]">Invoice total</span>
              <span className="font-semibold text-[#111827]">
                {formatCurrency(total)}
              </span>
            </div>
            {amountPaid > 0 && (
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[#6B7280]">Already paid</span>
                <span className="font-semibold text-emerald-700">
                  {formatCurrency(amountPaid)}
                </span>
              </div>
            )}
            <div className="mt-2 flex items-center justify-between border-t border-[#ECECF5] pt-2">
              <span className="font-medium text-[#111827]">Balance due</span>
              <span className="font-bold text-amber-700">
                {formatCurrency(balanceDue)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {PAYMENT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setMethod(opt.value)}
                className={cn(
                  "rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition-all",
                  opt.className,
                  method === opt.value && "ring-2 ring-[#6C3CF0] ring-offset-1"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Label className="text-[#6B7280]">Amount receiving</Label>
            <Input
              type="number"
              min={0.01}
              max={balanceDue}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="rounded-xl"
              required
            />
            <p className="text-xs text-[#6B7280]">
              Enter full balance ({formatCurrency(balanceDue)}) or a partial amount.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-[#6B7280]">Or select method</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {PAYMENT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#6C3CF0] hover:bg-[#5B2FE0]"
          >
            {loading
              ? "Saving..."
              : Number.parseFloat(amount) < balanceDue - 0.009
                ? "Record partial payment"
                : "Complete payment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
