"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Plus,
  Trash2,
} from "lucide-react";
import { createInvoiceFromCheckIn } from "@/actions/billing";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/currency";
import { PAYMENT_LABELS } from "@/components/sales/types";
import type { QueueInvoiceEntry, ServiceOption } from "./types";

const TAX_RATE = 0.08;

type LineItemDraft = {
  key: string;
  description: string;
  quantity: number;
  unitPrice: number;
  serviceId: string;
};

type Step = "services" | "payment" | "success";

const PAYMENT_OPTIONS = ["cash", "card", "upi", "wallet"] as const;

function calcTotals(lineItems: { quantity: number; unitPrice: number }[]) {
  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;
  return { subtotal, tax, total };
}

function entryToLineItems(entry: QueueInvoiceEntry): LineItemDraft[] {
  return entry.services.map((qs, i) => ({
    key: `svc-${qs.service.id}-${i}`,
    description: qs.service.name,
    quantity: 1,
    unitPrice: qs.service.price,
    serviceId: qs.service.id,
  }));
}

type QueueInvoiceDialogProps = {
  entry: QueueInvoiceEntry | null;
  services: ServiceOption[];
  isBasicPlan?: boolean;
  onClose: () => void;
  onSuccess: (invoiceId: string) => void;
};

export function QueueInvoiceDialog({
  entry,
  services,
  isBasicPlan = false,
  onClose,
  onSuccess,
}: QueueInvoiceDialogProps) {
  const [step, setStep] = useState<Step>("services");
  const [lineItems, setLineItems] = useState<LineItemDraft[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [invoiceId, setInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    if (!entry) return;
    setStep("services");
    setLineItems(entryToLineItems(entry));
    setPaymentMethod("cash");
    setError("");
    setInvoiceId(null);
    setLoading(false);
  }, [entry]);

  const totals = useMemo(() => calcTotals(lineItems), [lineItems]);

  function addLineItem() {
    setLineItems((items) => [
      ...items,
      {
        key: `new-${Date.now()}`,
        description: "",
        quantity: 1,
        unitPrice: 0,
        serviceId: "",
      },
    ]);
  }

  function updateLineItem(
    index: number,
    field: keyof LineItemDraft,
    value: string | number
  ) {
    setLineItems((items) => {
      const updated = [...items];
      updated[index] = { ...updated[index], [field]: value };
      if (field === "serviceId" && value) {
        const svc = services.find((s) => s.id === value);
        if (svc) {
          updated[index].description = svc.name;
          updated[index].unitPrice = svc.price;
        }
      }
      return updated;
    });
  }

  function removeLineItem(index: number) {
    setLineItems((items) => items.filter((_, i) => i !== index));
  }

  function handleClose() {
    if (loading) return;
    onClose();
  }

  function goToPayment() {
    if (lineItems.length === 0) {
      setError("Add at least one service");
      return;
    }
    if (lineItems.some((item) => !item.description.trim())) {
      setError("Each line item needs a description");
      return;
    }
    setError("");
    setStep("payment");
  }

  async function handleComplete() {
    if (!entry) return;
    setLoading(true);
    setError("");

    const result = await createInvoiceFromCheckIn(entry.id, {
      lineItems: lineItems.map(({ description, quantity, unitPrice, serviceId }) => ({
        description,
        quantity,
        unitPrice,
        serviceId: serviceId || undefined,
      })),
      paymentMethod,
    });

    setLoading(false);

    if (result.error && !result.id) {
      setError(result.error);
      return;
    }

    const id = result.id;
    if (!id) {
      setError("Failed to create invoice");
      return;
    }

    setInvoiceId(id);
    setStep("success");
    onSuccess(id);
  }

  const stepIndex = step === "services" ? 0 : step === "payment" ? 1 : 2;

  return (
    <Dialog open={!!entry} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg overflow-hidden rounded-2xl border-[#E8ECF4] p-0">
        <div className="border-b border-[#E8ECF4] bg-gradient-to-r from-[#6C3BFF]/5 to-[#FF2D6F]/5 px-6 py-5">
          <DialogHeader>
            <DialogTitle className="text-[#1C103D]">
              {step === "success" ? "Invoice complete" : "Create invoice"}
            </DialogTitle>
            {entry && step !== "success" && (
              <p className="text-sm text-[#6B7280]">
                {entry.customer.name}
                {!isBasicPlan && !entry.employeeId ? " · No stylist assigned" : ""}
              </p>
            )}
          </DialogHeader>

          {step !== "success" && (
            <div className="mt-4 flex items-center gap-2">
              {["Services", "Payment"].map((label, i) => (
                <div key={label} className="flex flex-1 items-center gap-2">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                      i <= stepIndex
                        ? "bg-[#6C3BFF] text-white"
                        : "bg-[#E8ECF4] text-[#9CA3AF]"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      i <= stepIndex ? "text-[#1C103D]" : "text-[#9CA3AF]"
                    }`}
                  >
                    {label}
                  </span>
                  {i === 0 && (
                    <div
                      className={`h-0.5 flex-1 rounded ${
                        stepIndex > 0 ? "bg-[#6C3BFF]" : "bg-[#E8ECF4]"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-5">
          <AnimatePresence mode="wait">
            {step === "services" && (
              <motion.div
                key="services"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <Label className="text-[#1C103D]">Services</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addLineItem}
                    className="rounded-lg border-[#6C3BFF]/30 text-[#6C3BFF] hover:bg-[#EDE9FE]"
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Add service
                  </Button>
                </div>

                <div className="max-h-[40vh] space-y-3 overflow-y-auto pr-1">
                  {lineItems.map((item, i) => (
                    <div
                      key={item.key}
                      className="rounded-xl border border-[#E8ECF4] bg-[#F7F8FC]/50 p-3"
                    >
                      <Select
                        value={item.serviceId || "custom"}
                        onValueChange={(v) =>
                          updateLineItem(i, "serviceId", v === "custom" ? "" : v)
                        }
                      >
                        <SelectTrigger className="mb-2 rounded-lg">
                          <SelectValue placeholder="Select service" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="custom">Custom item</SelectItem>
                          {services.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name} · {formatCurrency(s.price)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="grid grid-cols-[1fr_72px_96px_32px] gap-2">
                        <Input
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) =>
                            updateLineItem(i, "description", e.target.value)
                          }
                          className="rounded-lg"
                        />
                        <Input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            updateLineItem(i, "quantity", Number(e.target.value))
                          }
                          className="rounded-lg"
                          title="Quantity"
                        />
                        <Input
                          type="number"
                          min={0}
                          step={1}
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateLineItem(i, "unitPrice", Number(e.target.value))
                          }
                          className="rounded-lg"
                          title="Unit price"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          disabled={lineItems.length <= 1}
                          onClick={() => removeLineItem(i)}
                          className="h-9 w-9 shrink-0 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="mt-1.5 text-right text-xs text-[#6B7280]">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl bg-[#F7F8FC] p-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B7280]">Subtotal</span>
                    <span className="font-medium text-[#1C103D]">
                      {formatCurrency(totals.subtotal)}
                    </span>
                  </div>
                  <div className="mt-1 flex justify-between text-sm">
                    <span className="text-[#6B7280]">Tax (8%)</span>
                    <span className="font-medium text-[#1C103D]">
                      {formatCurrency(totals.tax)}
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-[#E8ECF4] pt-2">
                    <span className="font-semibold text-[#1C103D]">Total</span>
                    <span className="text-lg font-bold text-[#6C3BFF]">
                      {formatCurrency(totals.total)}
                    </span>
                  </div>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <Button
                  onClick={goToPayment}
                  disabled={!isBasicPlan && !entry?.employeeId}
                  className="w-full rounded-xl bg-[#6C3BFF] hover:bg-[#5B2FE0]"
                >
                  Continue to payment
                </Button>
                {!isBasicPlan && !entry?.employeeId && (
                  <p className="text-center text-xs text-amber-600">
                    Assign a stylist before creating an invoice
                  </p>
                )}
              </motion.div>
            )}

            {step === "payment" && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="rounded-xl border border-[#E8ECF4] bg-[#F7F8FC]/50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">
                    Amount due
                  </p>
                  <p className="mt-1 text-3xl font-bold text-[#1C103D]">
                    {formatCurrency(totals.total)}
                  </p>
                  <p className="mt-1 text-xs text-[#6B7280]">
                    {lineItems.length} item{lineItems.length !== 1 ? "s" : ""} ·
                    incl. {formatCurrency(totals.tax)} tax
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-[#1C103D]">Payment method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_OPTIONS.map((method) => (
                        <SelectItem key={method} value={method}>
                          {PAYMENT_LABELS[method] ?? method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_OPTIONS.map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                        paymentMethod === method
                          ? "border-[#6C3BFF] bg-[#EDE9FE] text-[#6C3BFF]"
                          : "border-[#E8ECF4] bg-white text-[#6B7280] hover:border-[#6C3BFF]/40"
                      }`}
                    >
                      {PAYMENT_LABELS[method]}
                    </button>
                  ))}
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep("services")}
                    disabled={loading}
                    className="flex-1 rounded-xl"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleComplete}
                    disabled={loading}
                    className="flex-1 rounded-xl bg-[#6C3BFF] hover:bg-[#5B2FE0]"
                  >
                    <CreditCard className="mr-1.5 h-4 w-4" />
                    {loading ? "Processing..." : "Save & complete"}
                  </Button>
                </div>
              </motion.div>
            )}

            {step === "success" && invoiceId && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                className="space-y-5 py-2 text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-[#1C103D]">
                    Payment recorded
                  </p>
                  <p className="mt-1 text-sm text-[#6B7280]">
                    {formatCurrency(totals.total)} via{" "}
                    {PAYMENT_LABELS[paymentMethod] ?? paymentMethod}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    asChild
                    className="w-full rounded-xl bg-[#6C3BFF] hover:bg-[#5B2FE0]"
                  >
                    <Link href={`/billing/${invoiceId}`}>
                      View invoice
                      <ExternalLink className="ml-1.5 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    className="w-full rounded-xl"
                  >
                    Close
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
