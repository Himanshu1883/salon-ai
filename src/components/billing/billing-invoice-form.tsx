"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import { X } from "lucide-react";
import {
  createInvoice,
  markInvoicePaid,
} from "@/actions/billing";
import { getProducts } from "@/actions/inventory/products";
import { resolveLineItemLabel } from "@/lib/service-display";
import type { InvoiceCustomer } from "./invoice-modal/customer-search";
import {
  getBackendPaymentMethod,
  type PaymentMethodId,
} from "./invoice-modal/payment-selector";
import {
  formatInvoiceNumber,
  lineDiscount,
  lineNet,
  lineTax,
  lineTotal,
  newLineItem,
  type LineItem,
} from "./invoice-modal/utils";
import {
  ModalHeader,
  ModalFooter,
  CustomerSection,
  ItemsSection,
  SummaryPanel,
  MobileSummaryBar,
  NotesSection,
  PaymentStepContent,
  trackRecentItem,
  useInvoiceDraft,
  loadInvoiceDraft,
  clearInvoiceDraft,
} from "./invoice-modal/v3";
import type {
  BillingEmployee,
  BillingInvoice,
  BillingProduct,
  BillingSeat,
  BillingService,
} from "./types";
import {
  PaymentSuccessScreen,
  WhatsAppCommunicationDrawer,
  type WhatsAppInvoiceContext,
} from "./whatsapp-communication";
import { buildBillingWhatsAppMessage, openWhatsApp } from "@/lib/whatsapp";

const TAX_RATE = 0.08;
const NOTES_MAX = 300;
const PAYMENT_NOTES_MAX = 200;

type FieldErrors = {
  customer?: string;
  items?: string;
  employee?: string;
  lineItems?: Record<number, string>;
  payment?: string;
  split?: string;
  partial?: string;
};

type BillingInvoiceFormProps = {
  services: BillingService[];
  employees: BillingEmployee[];
  seats: BillingSeat[];
  prefilledCustomer?: { name: string; phone: string };
  isBasicPlan?: boolean;
  salonName?: string;
  gstEnabled?: boolean;
  whatsappSettings?: {
    billingMessageTemplate: string;
    autoOpenAfterPayment: boolean;
  };
  onSuccess: (invoice: BillingInvoice, options?: { close?: boolean }) => void;
  onCancel?: () => void;
};

function todayInputValue() {
  return format(new Date(), "yyyy-MM-dd");
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    draft: "Draft",
    sent: "Unpaid",
    paid: "Paid",
    partial: "Partially paid",
    cancelled: "Cancelled",
  };
  return map[status] ?? "Unpaid";
}

export function BillingInvoiceForm({
  services,
  employees,
  seats,
  prefilledCustomer,
  isBasicPlan = false,
  salonName = "Salon",
  gstEnabled = true,
  whatsappSettings,
  onSuccess,
  onCancel,
}: BillingInvoiceFormProps) {
  const draftRestored = useRef(false);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [customer, setCustomer] = useState<InvoiceCustomer>({
    name: prefilledCustomer?.name ?? "",
    phone: prefilledCustomer?.phone ?? "",
    email: "",
    loyaltyPoints: 0,
  });
  const [dueDate, setDueDate] = useState(todayInputValue);
  const [status, setStatus] = useState("sent");
  const [gstIncluded] = useState(true);
  const [notes, setNotes] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [seatId, setSeatId] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>(() => [
    newLineItem(employees[0]?.id ?? ""),
  ]);
  const [products, setProducts] = useState<BillingProduct[]>([]);

  const [createdInvoiceId, setCreatedInvoiceId] = useState<string | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodId>("cash");
  const [partialPaymentEnabled, setPartialPaymentEnabled] = useState(false);
  const [partialAmount, setPartialAmount] = useState("");
  const [splitRows, setSplitRows] = useState([
    { key: crypto.randomUUID(), method: "cash", amount: 0 },
  ]);
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const [successContext, setSuccessContext] = useState<WhatsAppInvoiceContext | null>(
    null
  );
  const [completedInvoice, setCompletedInvoice] = useState<BillingInvoice | null>(
    null
  );
  const autoWhatsAppOpened = useRef(false);

  const billingMessageTemplate = whatsappSettings?.billingMessageTemplate;

  useInvoiceDraft(
    {
      customer,
      dueDate,
      status,
      notes,
      employeeId,
      seatId,
      lineItems,
    },
    step === 1 && !createdInvoiceId
  );

  useEffect(() => {
    if (draftRestored.current || prefilledCustomer) return;
    const draft = loadInvoiceDraft();
    if (!draft) return;
    draftRestored.current = true;
    setCustomer(draft.customer);
    setDueDate(draft.dueDate);
    setStatus(draft.status);
    setNotes(draft.notes);
    setEmployeeId(draft.employeeId);
    setSeatId(draft.seatId);
    if (draft.lineItems.length > 0) {
      setLineItems(
        draft.lineItems.map((item) => ({
          ...item,
          employeeId: item.employeeId ?? employees[0]?.id ?? "",
        }))
      );
    }
  }, [prefilledCustomer, employees]);

  useEffect(() => {
    getProducts({ status: "active" })
      .then((items) =>
        setProducts(
          items
            .filter((p) => p.isRetail)
            .map((p) => ({
              id: p.id,
              name: p.name,
              retailPrice: p.retailPrice,
              category: p.category,
              gstRate: p.gstRate,
            }))
        )
      )
      .catch(() => setProducts([]));
  }, []);

  const servicesByCategory = useMemo(() => {
    const map = new Map<string, BillingService[]>();
    for (const service of services) {
      const cat = service.categoryName || "Other";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(service);
    }
    return map;
  }, [services]);

  const catalogOptions = useMemo(() => {
    const serviceOpts = services.map((s) => ({
      type: "SERVICE" as const,
      id: s.id,
      label: s.name,
      category: s.categoryName,
      price: s.price,
      duration: s.duration,
      taxRate: 0.18,
    }));
    const productOpts = products.map((p) => ({
      type: "PRODUCT" as const,
      id: p.id,
      label: p.name,
      category: p.category || "Products",
      price: p.retailPrice,
      duration: 0,
      taxRate: p.gstRate / 100,
    }));
    return [...serviceOpts, ...productOpts];
  }, [services, products]);

  const subtotal = lineItems.reduce((sum, item) => sum + lineNet(item), 0);
  const totalDiscount = lineItems.reduce((sum, item) => sum + lineDiscount(item), 0);
  const totalTax = gstEnabled
    ? lineItems.reduce((sum, item) => sum + lineTax(item, gstIncluded, gstEnabled), 0)
    : 0;
  const grandTotal = lineItems.reduce(
    (sum, item) => sum + lineTotal(item, gstIncluded, gstEnabled),
    0
  );

  const displaySubtotal = gstEnabled
    ? gstIncluded
      ? Math.round((subtotal - totalTax) * 100) / 100
      : subtotal
    : subtotal;
  const displayTax = gstEnabled
    ? gstIncluded
      ? totalTax
      : Math.round(subtotal * TAX_RATE * 100) / 100
    : 0;
  const displayTotal = gstEnabled
    ? gstIncluded
      ? grandTotal
      : Math.round((subtotal + displayTax) * 100) / 100
    : subtotal;
  const requiresEmployee = !isBasicPlan && employees.length > 0;

  const servicesSummary = useMemo(
    () =>
      lineItems
        .map((item) =>
          resolveLineItemLabel({
            serviceName: services.find((s) => s.id === item.serviceId)?.name,
            description: item.description,
          })
        )
        .filter(Boolean)
        .join(", "),
    [lineItems, services]
  );

  const assignedStaffSummary = useMemo(() => {
    const names = [
      ...new Set(
        lineItems
          .map((item) => employees.find((e) => e.id === item.employeeId)?.name)
          .filter(Boolean) as string[]
      ),
    ];
    return names.length > 0 ? names.join(", ") : "Staff";
  }, [lineItems, employees]);

  const buildWhatsAppContext = useCallback(
    (
      invoiceId: string,
      invNumber: string,
      paymentMethod: string,
      paidAt: Date
    ): WhatsAppInvoiceContext => ({
      invoiceId,
      invoiceNumber: invNumber,
      customerName: customer.name.trim(),
      customerPhone: customer.phone.trim(),
      customerEmail: customer.email,
      amount: displayTotal,
      paymentMethod,
      paidAt,
      staffName: assignedStaffSummary,
      salonName,
      loyaltyPoints: customer.loyaltyPoints,
      services: servicesSummary || "—",
    }),
    [assignedStaffSummary, customer, displayTotal, salonName, servicesSummary]
  );

  useEffect(() => {
    if (
      step !== 3 ||
      !successContext ||
      !whatsappSettings?.autoOpenAfterPayment ||
      !successContext.customerPhone ||
      !billingMessageTemplate ||
      autoWhatsAppOpened.current
    ) {
      return;
    }

    autoWhatsAppOpened.current = true;
    const invoiceUrl = `${window.location.origin}/billing/${successContext.invoiceId}`;
    const message = buildBillingWhatsAppMessage(
      billingMessageTemplate,
      successContext,
      invoiceUrl
    );
    openWhatsApp(successContext.customerPhone, message);
  }, [step, successContext, whatsappSettings, billingMessageTemplate]);

  const summaryItems = useMemo(
    () =>
      lineItems
        .filter(
          (item) =>
            item.serviceId || item.stockItemId || item.description.trim()
        )
        .map((item) => {
          const catalogValue = item.serviceId
            ? `SERVICE:${item.serviceId}`
            : item.stockItemId
              ? `PRODUCT:${item.stockItemId}`
              : null;
          const option = catalogValue
            ? catalogOptions.find((o) => `${o.type}:${o.id}` === catalogValue)
            : null;
          return {
            name: resolveLineItemLabel({
              serviceName: option?.label,
              description: item.description,
            }),
            amount: lineTotal(item, gstIncluded, gstEnabled),
          };
        }),
    [lineItems, catalogOptions, gstIncluded, gstEnabled]
  );

  const updateLineItem = useCallback((index: number, patch: Partial<LineItem>) => {
    setLineItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }, []);

  function selectCatalogItem(index: number, value: string) {
    trackRecentItem(value);
    const option = catalogOptions.find((o) => `${o.type}:${o.id}` === value);
    if (!option) return;

    if (option.type === "SERVICE") {
      const svc = services.find((s) => s.id === option.id);
      updateLineItem(index, {
        itemType: "SERVICE",
        serviceId: option.id,
        stockItemId: "",
        description: svc?.name || option.label,
        unitPrice: option.price,
        taxRate: gstEnabled ? option.taxRate : 0,
        employeeId: lineItems[index]?.employeeId || employees[0]?.id || "",
      });
    } else {
      updateLineItem(index, {
        itemType: "PRODUCT",
        serviceId: "",
        stockItemId: option.id,
        description: option.label,
        unitPrice: option.price,
        taxRate: gstEnabled ? option.taxRate : 0,
        employeeId: "",
      });
    }
  }

  function validateStep1(): boolean {
    const errors: FieldErrors = {};
    if (!customer.name.trim() || customer.name.trim().length < 2) {
      errors.customer = "Customer name is required";
    }
    if (lineItems.length === 0) {
      errors.items = "Add at least one item";
    }

    const lineErrors: Record<number, string> = {};
    lineItems.forEach((item, i) => {
      if (!item.serviceId && !item.stockItemId && !item.description.trim()) {
        lineErrors[i] = "Select a service or product";
      } else if (item.unitPrice < 0) {
        lineErrors[i] = "Price cannot be negative";
      } else if (
        requiresEmployee &&
        (item.itemType === "SERVICE" || item.serviceId) &&
        !item.employeeId
      ) {
        lineErrors[i] = "Select staff for this service";
      }
    });
    if (Object.keys(lineErrors).length > 0) errors.lineItems = lineErrors;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function validateStep2(): boolean {
    const errors: FieldErrors = {};
    if (selectedPayment === "split") {
      const splitTotal = splitRows.reduce((sum, row) => sum + (row.amount || 0), 0);
      if (partialPaymentEnabled) {
        if (splitTotal <= 0 || splitTotal >= displayTotal) {
          errors.split = "Split partial total must be greater than 0 and less than invoice total";
        }
      } else if (Math.abs(splitTotal - displayTotal) > 0.01) {
        errors.split = "Split payment total must equal invoice amount";
      }
    }
    if (selectedPayment === "pay_later") {
      errors.payment = "Select a payment method or use Save Draft for pay later";
    }
    if (partialPaymentEnabled && selectedPayment !== "split") {
      const amount = Number.parseFloat(partialAmount);
      if (!amount || amount <= 0) {
        errors.partial = "Enter the amount received";
      } else if (amount >= displayTotal) {
        errors.partial = "Partial amount must be less than the invoice total";
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  const paymentAmountNow = useMemo(() => {
    if (!partialPaymentEnabled) return displayTotal;
    if (selectedPayment === "split") {
      return splitRows.reduce((sum, row) => sum + (row.amount || 0), 0);
    }
    return Number.parseFloat(partialAmount) || 0;
  }, [partialPaymentEnabled, partialAmount, selectedPayment, splitRows, displayTotal]);

  const outstandingBalance = useMemo(
    () => Math.max(0, displayTotal - paymentAmountNow),
    [displayTotal, paymentAmountNow]
  );

  const step2ProceedLabel = partialPaymentEnabled
    ? outstandingBalance > 0
      ? "Record Partial Payment"
      : "Receive Payment & Complete"
    : "Receive Payment & Complete";

  async function handleProceedToPayment() {
    if (!validateStep1()) return;
    setError("");
    setSplitRows([{ key: crypto.randomUUID(), method: "cash", amount: displayTotal }]);
    setStep(2);
  }

  function buildInvoiceFormData(invoiceStatus: string, payment?: {
    method: string;
    amount?: number;
  }) {
    const formData = new FormData();
    formData.set("customerName", customer.name.trim());
    formData.set("customerPhone", customer.phone.trim());
    if (customer.id) formData.set("customerId", customer.id);
    formData.set("notes", notes.trim());
    formData.set("dueDate", dueDate);
    formData.set("status", invoiceStatus);
    formData.set("gstEnabled", gstEnabled ? "1" : "0");
    formData.set("activeEmployeeCount", String(employees.length));
    const primaryEmployeeId =
      lineItems.find((item) => item.employeeId)?.employeeId ?? employeeId;
    if (primaryEmployeeId) formData.set("employeeId", primaryEmployeeId);
    if (seatId && !isBasicPlan) formData.set("seatId", seatId);
    if (payment?.method) {
      formData.set("paymentMethod", payment.method);
      if (payment.amount != null) {
        formData.set("amount", String(payment.amount));
      }
    }
    formData.set(
      "lineItems",
      JSON.stringify(
        lineItems.map((item) => ({
          description: item.description.trim(),
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          serviceId: item.serviceId || undefined,
          stockItemId: item.stockItemId || undefined,
          itemType: item.itemType,
          employeeId: item.employeeId || undefined,
        }))
      )
    );
    return formData;
  }

  async function handleCreateInvoice() {
    await handleProceedToPayment();
  }

  function buildInvoiceForCallback(
    invoiceId: string,
    invoiceStatus: string,
    paymentMethod: string | null
  ): BillingInvoice {
    const primaryEmployeeId =
      lineItems.find((item) => item.employeeId)?.employeeId ?? employeeId;
    const emp = employees.find((e) => e.id === primaryEmployeeId);
    const seat = seats.find((s) => s.id === seatId);

    return {
      id: invoiceId,
      customerName: customer.name.trim(),
      customerPhone: customer.phone.trim() || null,
      status: invoiceStatus,
      subtotal: displaySubtotal,
      tax: displayTax,
      total: displayTotal,
      amountPaid: invoiceStatus === "partial" ? paymentAmountNow : invoiceStatus === "paid" ? displayTotal : 0,
      dueDate: dueDate ? new Date(dueDate) : null,
      paidAt: invoiceStatus === "paid" || invoiceStatus === "partial" ? new Date() : null,
      paymentMethod,
      createdAt: new Date(),
      lineItems: lineItems.map((item, i) => ({
        id: `new-${i}`,
        description: resolveLineItemLabel({
          serviceName: services.find((s) => s.id === item.serviceId)?.name,
          description: item.description,
        }),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: lineTotal(item, gstIncluded, gstEnabled),
        service: item.serviceId
          ? {
              name:
                services.find((s) => s.id === item.serviceId)?.name ??
                resolveLineItemLabel({ description: item.description }),
            }
          : null,
      })),
      appointment: null,
      checkIn: null,
      employee: emp ? { id: emp.id, name: emp.name } : null,
      seat: seat ? { id: seat.id, number: seat.number } : null,
    };
  }

  async function handleSaveDraft() {
    setLoading(true);
    setError("");

    const formData = buildInvoiceFormData("draft");
    const result = await createInvoice(formData);
    if ("error" in result && result.error) {
      setLoading(false);
      setError(result.error);
      return;
    }
    if (!("id" in result) || !result.id) {
      setLoading(false);
      setError("Invoice was saved but the response was incomplete.");
      return;
    }

    setLoading(false);
    clearInvoiceDraft();
    onSuccess(buildInvoiceForCallback(result.id, "draft", null), { close: true });
  }

  async function handleReceivePayment() {
    if (!validateStep2()) return;

    if (selectedPayment === "pay_later") return;

    setLoading(true);
    setError("");

    const backendMethod = getBackendPaymentMethod(selectedPayment);

    if (createdInvoiceId) {
      const paidForm = new FormData();
      paidForm.set("invoiceId", createdInvoiceId);
      paidForm.set("paymentMethod", backendMethod);
      if (partialPaymentEnabled) {
        paidForm.set("amount", String(paymentAmountNow));
      }

      const result = await markInvoicePaid(paidForm);
      if ("error" in result && result.error) {
        setLoading(false);
        setError(result.error);
        return;
      }

      setLoading(false);
      const paidAt = new Date();
      const invoiceStatus =
        "status" in result && result.status === "partial" ? "partial" : "paid";
      const invoice = buildInvoiceForCallback(
        createdInvoiceId,
        invoiceStatus,
        backendMethod
      );
      setCompletedInvoice(invoice);
      setSuccessContext({
        ...buildWhatsAppContext(
          createdInvoiceId,
          invoiceNumber,
          backendMethod,
          paidAt
        ),
        amount: paymentAmountNow,
        isPartial: invoiceStatus === "partial",
        balanceDue: outstandingBalance,
        invoiceTotal: displayTotal,
      });
      clearInvoiceDraft();
      setStep(3);
      notifyPaymentSuccess(invoice, { close: false });
      return;
    }

    const formData = buildInvoiceFormData("sent", {
      method: backendMethod,
      amount: partialPaymentEnabled ? paymentAmountNow : undefined,
    });

    const result = await createInvoice(formData);
    if ("error" in result && result.error) {
      setLoading(false);
      setError(result.error);
      return;
    }
    if (!("id" in result) || !result.id) {
      setLoading(false);
      setError("Payment was recorded but the response was incomplete.");
      return;
    }

    const invoiceId = result.id;
    setCreatedInvoiceId(invoiceId);
    setInvoiceNumber(formatInvoiceNumber(invoiceId));

    setLoading(false);
    const paidAt = new Date();
    const invoiceStatus =
      "status" in result && result.status === "partial" ? "partial" : "paid";
    const invoice = buildInvoiceForCallback(
      invoiceId,
      invoiceStatus,
      backendMethod
    );
    setCompletedInvoice(invoice);
    setSuccessContext({
      ...buildWhatsAppContext(invoiceId, formatInvoiceNumber(invoiceId), backendMethod, paidAt),
      amount: paymentAmountNow,
      isPartial: invoiceStatus === "partial",
      balanceDue: outstandingBalance,
      invoiceTotal: displayTotal,
    });
    clearInvoiceDraft();
    setStep(3);
    notifyPaymentSuccess(invoice, { close: false });
  }

  function openWhatsAppDrawerFromStep2() {
    if (!createdInvoiceId) return;
    setSuccessContext(
      buildWhatsAppContext(createdInvoiceId, invoiceNumber, "pending", new Date())
    );
    setWhatsappOpen(true);
  }

  function notifyPaymentSuccess(
    invoice: BillingInvoice,
    options?: { close?: boolean }
  ) {
    onSuccess(invoice, options);
  }

  function handleFinishNewInvoice() {
    if (completedInvoice) {
      notifyPaymentSuccess(completedInvoice, { close: true });
    }
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onCancel?.();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (step === 1) void handleCreateInvoice();
        else if (step === 2) void handleReceivePayment();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [step, onCancel]);

  if (step === 3 && successContext) {
    return (
      <>
        <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-none bg-white sm:rounded-[20px]">
          <button
            type="button"
            onClick={() => handleFinishNewInvoice()}
            className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-xl text-[#6B7280] hover:bg-[#FAFBFF] sm:right-4 sm:top-4 sm:h-auto sm:w-auto sm:p-2"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <PaymentSuccessScreen
            context={successContext}
            onSendWhatsApp={() => setWhatsappOpen(true)}
            onNewInvoice={handleFinishNewInvoice}
          />
        </div>
        <WhatsAppCommunicationDrawer
          open={whatsappOpen}
          onClose={() => setWhatsappOpen(false)}
          context={successContext}
          billingMessageTemplate={billingMessageTemplate}
        />
      </>
    );
  }

  const currentStep = step === 1 ? 1 : 2;
  const paymentStatusLabel =
    step === 2
      ? partialPaymentEnabled && outstandingBalance > 0
        ? "Partial payment"
        : "Pending Payment"
      : statusLabel(status);

  return (
    <>
      <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#FAFBFF]">
        <ModalHeader
          step={currentStep}
          onClose={onCancel}
          onBack={step === 2 ? () => setStep(1) : undefined}
        />

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:px-4 sm:py-4 lg:px-5 lg:py-4">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <CustomerSection
                    customer={customer}
                    onChange={setCustomer}
                    error={fieldErrors.customer}
                    autoFocus
                    dueDate={dueDate}
                    onDueDateChange={setDueDate}
                    status={status}
                    onStatusChange={setStatus}
                    employeeId={employeeId}
                    onEmployeeChange={setEmployeeId}
                    employees={employees}
                    requiresEmployee={false}
                    employeeError={fieldErrors.employee}
                  />

                  <ItemsSection
                    lineItems={lineItems}
                    products={products}
                    servicesByCategory={servicesByCategory}
                    catalogOptions={catalogOptions}
                    employees={employees}
                    showStaffColumn={requiresEmployee}
                    gstIncluded={gstIncluded}
                    gstEnabled={gstEnabled}
                    fieldErrors={fieldErrors.lineItems}
                    itemsError={fieldErrors.items}
                    onSelectItem={selectCatalogItem}
                    onUpdateItem={updateLineItem}
                    onRemoveItem={(index) =>
                      setLineItems((prev) => prev.filter((_, i) => i !== index))
                    }
                    onAddItem={() =>
                      setLineItems((prev) => [
                        ...prev,
                        newLineItem(employees[0]?.id ?? ""),
                      ])
                    }
                  />

                  <NotesSection
                    id="invoice-notes"
                    value={notes}
                    onChange={setNotes}
                    maxLength={NOTES_MAX}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.2 }}
                >
                  <PaymentStepContent
                    invoiceNumber={invoiceNumber}
                    customer={customer}
                    dueDate={dueDate}
                    displayTotal={displayTotal}
                    selectedPayment={selectedPayment}
                    onSelectPayment={setSelectedPayment}
                    splitRows={splitRows}
                    onSplitRowsChange={setSplitRows}
                    paymentNotes={paymentNotes}
                    onPaymentNotesChange={setPaymentNotes}
                    splitError={fieldErrors.split}
                    paymentError={fieldErrors.payment}
                    partialPaymentEnabled={partialPaymentEnabled}
                    onPartialPaymentEnabledChange={setPartialPaymentEnabled}
                    partialAmount={partialAmount}
                    onPartialAmountChange={setPartialAmount}
                    partialError={fieldErrors.partial}
                    onSendWhatsApp={openWhatsAppDrawerFromStep2}
                    notesMaxLength={PAYMENT_NOTES_MAX}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <p className="mt-3 rounded-[12px] border border-red-100 bg-red-50 px-3 py-2 text-[12px] text-red-600">
                {error}
              </p>
            )}
          </div>

          <aside className="hidden min-h-0 w-[320px] shrink-0 flex-col overflow-hidden border-l border-[#ECECF5] bg-white px-4 py-4 lg:flex">
            <SummaryPanel
              step={currentStep}
              items={summaryItems}
              subtotal={displaySubtotal}
              discount={totalDiscount}
              tax={displayTax}
              total={displayTotal}
              gstEnabled={gstEnabled}
              customer={customer}
              paymentStatus={paymentStatusLabel}
              outstandingBalance={step === 2 ? outstandingBalance : 0}
              loading={loading}
              onProceed={
                step === 1
                  ? () => void handleCreateInvoice()
                  : () => void handleReceivePayment()
              }
              disableProceed={step === 2 && selectedPayment === "pay_later"}
              proceedLabel={
                step === 1 ? "Proceed to Payment" : step2ProceedLabel
              }
            />
          </aside>
        </div>

        <MobileSummaryBar
          step={currentStep}
          items={summaryItems}
          subtotal={displaySubtotal}
          discount={totalDiscount}
          tax={displayTax}
          total={displayTotal}
          gstEnabled={gstEnabled}
          customer={customer}
          paymentStatus={paymentStatusLabel}
          outstandingBalance={step === 2 ? outstandingBalance : 0}
          loading={loading}
          onProceed={
            step === 1
              ? () => void handleCreateInvoice()
              : () => void handleReceivePayment()
          }
          disableProceed={step === 2 && selectedPayment === "pay_later"}
          proceedLabel={step === 1 ? "Proceed to Payment" : step2ProceedLabel}
          onBack={step === 2 ? () => setStep(1) : undefined}
          onCancel={() => onCancel?.()}
          onSaveDraft={step === 2 ? () => void handleSaveDraft() : undefined}
          showSaveDraft={step === 2}
        />

        <div className="hidden shrink-0 lg:block">
          <ModalFooter
            step={currentStep}
            loading={loading}
            hidePrimary
            onCancel={() => onCancel?.()}
            onContinue={
              step === 1
                ? () => void handleCreateInvoice()
                : () => void handleReceivePayment()
            }
            onBack={() => setStep(1)}
            onSaveDraft={step === 2 ? () => void handleSaveDraft() : undefined}
            disableContinue={step === 2 && selectedPayment === "pay_later"}
            showSaveDraft={step === 2}
          />
        </div>
      </div>

      {successContext && (
        <WhatsAppCommunicationDrawer
          open={whatsappOpen}
          onClose={() => setWhatsappOpen(false)}
          context={successContext}
          billingMessageTemplate={billingMessageTemplate}
        />
      )}
    </>
  );
}
