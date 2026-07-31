"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";
import { markInvoicePaid } from "@/actions/billing";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";

const PAYMENT_OPTIONS = [
  { value: "cash", label: "Cash", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  { value: "card", label: "Card", className: "border-blue-200 bg-blue-50 text-blue-700" },
  { value: "upi", label: "UPI", className: "border-violet-200 bg-violet-50 text-violet-700" },
  { value: "wallet", label: "Wallet", className: "border-orange-200 bg-orange-50 text-orange-700" },
  { value: "other", label: "Other", className: "border-slate-200 bg-slate-50 text-slate-700" },
];

type BillingMarkPaidDialogProps = {
  invoiceId: string;
  onSuccess: (method: string) => void;
};

export function BillingMarkPaidDialog({
  invoiceId,
  onSuccess,
}: BillingMarkPaidDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState("cash");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.set("invoiceId", invoiceId);
    formData.set("paymentMethod", method);
    await markInvoicePaid(formData);
    setLoading(false);
    setOpen(false);
    onSuccess(method);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="h-8 rounded-lg border-emerald-200 text-emerald-700 hover:bg-emerald-50"
        >
          <CreditCard className="h-3 w-3" />
          Mark paid
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#1C103D]">Record payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            {loading ? "Saving..." : "Confirm payment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
