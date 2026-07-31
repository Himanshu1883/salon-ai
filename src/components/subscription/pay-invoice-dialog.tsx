"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { payPlatformInvoice } from "@/actions/subscription";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { CreditCard, Smartphone, Building2, Zap } from "lucide-react";
import type { PaymentMethod } from "@/lib/subscription";

type InvoiceSummary = {
  id: string;
  invoiceNumber: string;
  total: number;
  dueDate: Date;
};

export function PayInvoiceDialog({
  invoice,
  open,
  onOpenChange,
}: {
  invoice: InvoiceSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  async function handlePay(method: PaymentMethod, simulate = false) {
    if (!invoice) return;
    setLoading(true);
    setMessage(null);

    const result = await payPlatformInvoice(invoice.id, method, { simulate });

    setLoading(false);

    if ("error" in result && result.error) {
      setMessage(result.error);
      return;
    }

    if ("message" in result && result.message) {
      setMessage(result.message);
      return;
    }

    onOpenChange(false);
    setSelectedMethod(null);
    router.refresh();
  }

  function resetAndClose(nextOpen: boolean) {
    if (!nextOpen) {
      setSelectedMethod(null);
      setMessage(null);
    }
    onOpenChange(nextOpen);
  }

  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pay Subscription Invoice</DialogTitle>
          <DialogDescription>
            {invoice.invoiceNumber} · {formatCurrency(invoice.total)} due{" "}
            {new Date(invoice.dueDate).toLocaleDateString("en-IN")}
          </DialogDescription>
        </DialogHeader>

        {message && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {message}
          </div>
        )}

        {!selectedMethod ? (
          <div className="space-y-2">
            <Button
              variant="outline"
              className="h-auto w-full justify-start gap-3 py-3"
              onClick={() => setSelectedMethod("upi")}
            >
              <Smartphone className="h-5 w-5 text-violet-600" />
              <div className="text-left">
                <p className="font-medium">UPI</p>
                <p className="text-xs text-stone-500">Pay via UPI app</p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto w-full justify-start gap-3 py-3"
              onClick={() => setSelectedMethod("bank_transfer")}
            >
              <Building2 className="h-5 w-5 text-violet-600" />
              <div className="text-left">
                <p className="font-medium">Bank transfer</p>
                <p className="text-xs text-stone-500">NEFT / IMPS / RTGS</p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto w-full justify-start gap-3 py-3"
              onClick={() => setSelectedMethod("card")}
            >
              <CreditCard className="h-5 w-5 text-violet-600" />
              <div className="text-left">
                <p className="font-medium">Card</p>
                <p className="text-xs text-stone-500">
                  {process.env.NEXT_PUBLIC_RAZORPAY_KEY
                    ? "Pay with Razorpay"
                    : "Gateway coming soon — use simulate below"}
                </p>
              </div>
            </Button>
          </div>
        ) : selectedMethod === "upi" ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-center">
              <p className="text-sm text-stone-500">Pay to Salon AI UPI ID</p>
              <p className="mt-1 font-mono text-lg font-semibold text-stone-900">
                salonai@upi
              </p>
              <p className="mt-2 text-sm text-stone-600">
                Amount: {formatCurrency(invoice.total)}
              </p>
            </div>
            <Button
              className="w-full"
              disabled={loading}
              onClick={() => handlePay("upi", true)}
            >
              I&apos;ve paid via UPI
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setSelectedMethod(null)}
            >
              Back
            </Button>
          </div>
        ) : selectedMethod === "bank_transfer" ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
              <p className="font-medium text-stone-900">Bank details</p>
              <p className="mt-2">Account: Salon AI Technologies</p>
              <p>IFSC: SBIN0001234</p>
              <p>Account no: 123456789012</p>
              <p className="mt-2">Reference: {invoice.invoiceNumber}</p>
            </div>
            <Button
              className="w-full"
              disabled={loading}
              onClick={() => handlePay("bank_transfer")}
            >
              I&apos;ve paid via bank transfer
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setSelectedMethod(null)}
            >
              Back
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-stone-600">
              Card payments via Razorpay will be available soon. Use simulate
              payment for demo access.
            </p>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setSelectedMethod(null)}
            >
              Back
            </Button>
          </div>
        )}

        <div className="border-t border-stone-200 pt-4">
          <Button
            variant="secondary"
            className="w-full gap-2"
            disabled={loading}
            onClick={() => handlePay("upi", true)}
          >
            <Zap className="h-4 w-4" />
            Simulate payment (demo)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function PayInvoiceButton({
  invoice,
  size = "default",
}: {
  invoice: InvoiceSummary;
  size?: "default" | "sm" | "lg";
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size={size} onClick={() => setOpen(true)}>
        Pay Now
      </Button>
      <PayInvoiceDialog
        invoice={invoice}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
