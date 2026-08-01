"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import { CalendarDays, X } from "lucide-react";
import {
  createInvoice,
  markInvoicePaid,
  updateInvoiceStatus,
} from "@/actions/billing";
import { getProducts } from "@/actions/inventory/products";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatCurrency } from "@/lib/utils";
import { resolveLineItemLabel } from "@/lib/service-display";
import {
  CustomerEmailField,
  CustomerSearch,
  PhoneSearch,
  type InvoiceCustomer,
} from "./invoice-modal/customer-search";
import { FooterActions } from "./invoice-modal/footer-actions";
import { InvoiceItems } from "./invoice-modal/invoice-items";
import { InvoiceModalHeader } from "./invoice-modal/invoice-modal-header";
import { InvoiceSummary } from "./invoice-modal/invoice-summary";
import { NotesSection } from "./invoice-modal/notes-section";
import {
  getBackendPaymentMethod,
  PaymentSelector,
  type PaymentMethodId,
} from "./invoice-modal/payment-selector";
import { SuccessBanner } from "./invoice-modal/success-banner";
import { SectionHeader } from "./invoice-modal/section-header";
import { invoiceModalStyles } from "./invoice-modal/styles";
import {
  formatInvoiceNumber,
  lineDiscount,
  lineNet,
  lineTax,
  lineTotal,
  newLineItem,
  type LineItem,
} from "./invoice-modal/utils";
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

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "paid", label: "Paid" },
  { value: "cancelled", label: "Cancelled" },
] as const;

type FieldErrors = {
  customer?: string;
  items?: string;
  employee?: string;
  lineItems?: Record<number, string>;
  payment?: string;
  split?: string;
};

type BillingInvoiceFormProps = {
  services: BillingService[];
  employees: BillingEmployee[];
  seats: BillingSeat[];
  prefilledCustomer?: { name: string; phone: string };
  isBasicPlan?: boolean;
  salonName?: string;
  whatsappSettings?: {
    billingMessageTemplate: string;
    autoOpenAfterPayment: boolean;
  };
  onSuccess: (invoice: BillingInvoice) => void;
  onCancel?: () => void;
};

function todayInputValue() {
  return format(new Date(), "yyyy-MM-dd");
}

export function BillingInvoiceForm({
  services,
  employees,
  seats,
  prefilledCustomer,
  isBasicPlan = false,
  salonName = "Salon",
  whatsappSettings,
  onSuccess,
  onCancel,
}: BillingInvoiceFormProps) {
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
  const [lineItems, setLineItems] = useState<LineItem[]>([newLineItem()]);
  const [products, setProducts] = useState<BillingProduct[]>([]);

  const [createdInvoiceId, setCreatedInvoiceId] = useState<string | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodId>("cash");
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

  useEffect(() => {
    if (!isBasicPlan && employees.length > 0 && !employeeId) {
      setEmployeeId(employees[0].id);
    }
  }, [employees, employeeId, isBasicPlan]);

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

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onCancel?.();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

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
  const totalTax = lineItems.reduce(
    (sum, item) => sum + lineTax(item, gstIncluded),
    0
  );
  const grandTotal = lineItems.reduce(
    (sum, item) => sum + lineTotal(item, gstIncluded),
    0
  );

  const displaySubtotal = gstIncluded
    ? Math.round((subtotal - totalTax) * 100) / 100
    : subtotal;
  const displayTax = gstIncluded
    ? totalTax
    : Math.round(subtotal * TAX_RATE * 100) / 100;
  const displayTotal = gstIncluded
    ? grandTotal
    : Math.round((subtotal + displayTax) * 100) / 100;
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
      staffName: employees.find((e) => e.id === employeeId)?.name ?? "Staff",
      salonName,
      loyaltyPoints: customer.loyaltyPoints,
      services: servicesSummary || "—",
    }),
    [customer, displayTotal, employeeId, employees, salonName, servicesSummary]
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
            amount: lineTotal(item, gstIncluded),
          };
        }),
    [lineItems, catalogOptions, gstIncluded]
  );

  const updateLineItem = useCallback((index: number, patch: Partial<LineItem>) => {
    setLineItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }, []);

  function selectCatalogItem(index: number, value: string) {
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
        taxRate: option.taxRate,
      });
    } else {
      updateLineItem(index, {
        itemType: "PRODUCT",
        serviceId: "",
        stockItemId: option.id,
        description: option.label,
        unitPrice: option.price,
        taxRate: option.taxRate,
      });
    }
  }

  function validateStep1(): boolean {
    const errors: FieldErrors = {};
    if (!customer.name.trim() || customer.name.trim().length < 2) {
      errors.customer = "Customer name is required";
    }
    if (requiresEmployee && !employeeId) {
      errors.employee = "Assigned stylist is required";
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
      if (Math.abs(splitTotal - displayTotal) > 0.01) {
        errors.split = "Split payment total must equal invoice amount";
      }
    }
    if (selectedPayment === "pay_later") {
      errors.payment = "Select a payment method or use Save Draft for pay later";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleCreateInvoice() {
    if (!validateStep1()) return;

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.set("customerName", customer.name.trim());
    formData.set("customerPhone", customer.phone.trim());
    formData.set("notes", notes.trim());
    formData.set("dueDate", dueDate);
    formData.set("status", status);
    if (employeeId) formData.set("employeeId", employeeId);
    if (seatId && !isBasicPlan) formData.set("seatId", seatId);
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
        }))
      )
    );

    const result = await createInvoice(formData);
    if ("error" in result && result.error) {
      setLoading(false);
      setError(result.error);
      return;
    }
    if (!("id" in result) || !result.id) {
      setLoading(false);
      setError("Invoice was created but the response was incomplete.");
      return;
    }

    setCreatedInvoiceId(result.id);
    setInvoiceNumber(formatInvoiceNumber(result.id));
    setSplitRows([{ key: crypto.randomUUID(), method: "cash", amount: displayTotal }]);
    setLoading(false);
    setStep(2);
  }

  function buildInvoiceForCallback(
    invoiceId: string,
    invoiceStatus: string,
    paymentMethod: string | null
  ): BillingInvoice {
    const emp = employees.find((e) => e.id === employeeId);
    const seat = seats.find((s) => s.id === seatId);

    return {
      id: invoiceId,
      customerName: customer.name.trim(),
      customerPhone: customer.phone.trim() || null,
      status: invoiceStatus,
      subtotal: displaySubtotal,
      tax: displayTax,
      total: displayTotal,
      dueDate: dueDate ? new Date(dueDate) : null,
      paidAt: invoiceStatus === "paid" ? new Date() : null,
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
        total: lineTotal(item, gstIncluded),
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
    if (!createdInvoiceId) return;
    setLoading(true);
    await updateInvoiceStatus(createdInvoiceId, "draft");
    setLoading(false);
    onSuccess(buildInvoiceForCallback(createdInvoiceId, "draft", null));
  }

  async function handleReceivePayment() {
    if (!createdInvoiceId || !validateStep2()) return;

    if (selectedPayment === "pay_later") return;

    setLoading(true);
    setError("");

    const backendMethod = getBackendPaymentMethod(selectedPayment);
    const paidForm = new FormData();
    paidForm.set("invoiceId", createdInvoiceId);
    paidForm.set("paymentMethod", backendMethod);

    const result = await markInvoicePaid(paidForm);
    if ("error" in result && result.error) {
      setLoading(false);
      setError(result.error);
      return;
    }

    setLoading(false);
    const paidAt = new Date();
    const invoice = buildInvoiceForCallback(
      createdInvoiceId,
      "paid",
      backendMethod
    );
    setCompletedInvoice(invoice);
    setSuccessContext(buildWhatsAppContext(createdInvoiceId, invoiceNumber, backendMethod, paidAt));
    setStep(3);
  }

  function openWhatsAppDrawerFromStep2() {
    if (!createdInvoiceId) return;
    setSuccessContext(
      buildWhatsAppContext(createdInvoiceId, invoiceNumber, "pending", new Date())
    );
    setWhatsappOpen(true);
  }

  function handleFinishNewInvoice() {
    if (completedInvoice) {
      onSuccess(completedInvoice);
    }
  }

  if (step === 3 && successContext) {
    return (
      <>
        <div className="relative flex h-full flex-col overflow-hidden rounded-[20px]">
          <button
            type="button"
            onClick={() => onCancel?.()}
            className="absolute right-4 top-4 z-10 rounded-xl p-2 text-[#6B7280] hover:bg-white/80"
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

  return (
    <>
    <div className="flex h-full flex-col bg-gradient-to-b from-white via-white to-violet-50/25">
      <InvoiceModalHeader step={step === 1 ? 1 : 2} onClose={onCancel} />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-8 py-8 sm:px-10">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="grid gap-8 lg:grid-cols-[1fr_320px]"
              >
                <div className="space-y-8">
                  <section aria-labelledby="customer-section">
                    <SectionHeader id="customer-section">
                      Customer Information
                    </SectionHeader>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <CustomerSearch
                        value={customer}
                        onChange={setCustomer}
                        error={fieldErrors.customer}
                        autoFocus
                      />
                      <PhoneSearch value={customer} onChange={setCustomer} />
                      <CustomerEmailField
                        value={customer.email}
                        onChange={(email) => setCustomer({ ...customer, email })}
                      />
                    </div>
                  </section>

                  <section aria-labelledby="details-section">
                    <SectionHeader id="details-section">
                      Invoice Details
                    </SectionHeader>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2.5">
                        <Label htmlFor="due-date" className={invoiceModalStyles.label}>
                          Due date
                        </Label>
                        <div className="relative">
                          <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dashboard-muted/70" />
                          <Input
                            id="due-date"
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className={cn(invoiceModalStyles.input, "pl-11")}
                          />
                        </div>
                      </div>
                      <div className="space-y-2.5">
                        <Label className={invoiceModalStyles.label}>
                          Invoice status
                        </Label>
                        <Select value={status} onValueChange={setStatus}>
                          <SelectTrigger className={invoiceModalStyles.selectTrigger}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl">
                            {STATUS_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {requiresEmployee && (
                        <div className="space-y-2.5 sm:col-span-2">
                          <Label className={invoiceModalStyles.label}>
                            Assigned stylist <span className="text-red-500">*</span>
                          </Label>
                          <Select value={employeeId} onValueChange={setEmployeeId}>
                            <SelectTrigger
                              className={cn(
                                invoiceModalStyles.selectTrigger,
                                fieldErrors.employee && invoiceModalStyles.inputError
                              )}
                            >
                              <SelectValue placeholder="Select stylist" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                              {employees.map((emp) => (
                                <SelectItem key={emp.id} value={emp.id}>
                                  {emp.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {fieldErrors.employee && (
                            <p className="text-xs text-[#EF4444]">
                              {fieldErrors.employee}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </section>

                  <InvoiceItems
                    lineItems={lineItems}
                    services={services}
                    products={products}
                    servicesByCategory={servicesByCategory}
                    catalogOptions={catalogOptions}
                    gstIncluded={gstIncluded}
                    fieldErrors={fieldErrors.lineItems}
                    itemsError={fieldErrors.items}
                    onSelectItem={selectCatalogItem}
                    onUpdateItem={updateLineItem}
                    onRemoveItem={(index) =>
                      setLineItems((prev) => prev.filter((_, i) => i !== index))
                    }
                    onAddItem={() =>
                      setLineItems((prev) => [...prev, newLineItem()])
                    }
                  />

                  <NotesSection
                    id="invoice-notes"
                    value={notes}
                    onChange={setNotes}
                    maxLength={NOTES_MAX}
                  />
                </div>

                <InvoiceSummary
                  items={summaryItems}
                  subtotal={displaySubtotal}
                  discount={totalDiscount}
                  tax={displayTax}
                  total={displayTotal}
                />
              </motion.div>
            ) : (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                className="grid gap-8 lg:grid-cols-[1fr_320px]"
              >
                <div className="space-y-8">
                  <SuccessBanner
                    invoiceNumber={invoiceNumber}
                    onSendWhatsApp={openWhatsAppDrawerFromStep2}
                  />

                  <section className={cn(invoiceModalStyles.card, "p-6")}>
                    <SectionHeader className="mb-4">Invoice Summary</SectionHeader>
                    <dl className="grid gap-4 text-sm sm:grid-cols-3">
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-dashboard-muted">
                          Customer
                        </dt>
                        <dd className="mt-1.5 font-medium text-dashboard-text">
                          {customer.name}
                          {customer.phone && (
                            <span className="mt-0.5 block text-xs font-normal text-dashboard-muted">
                              {customer.phone}
                            </span>
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-dashboard-muted">
                          Due Date
                        </dt>
                        <dd className="mt-1.5 font-medium text-dashboard-text">
                          {dueDate
                            ? format(new Date(dueDate), "d MMM yyyy")
                            : "—"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-dashboard-muted">
                          Total Amount
                        </dt>
                        <dd className="mt-1.5 text-lg font-bold text-violet-600">
                          {formatCurrency(displayTotal)}
                        </dd>
                      </div>
                    </dl>
                  </section>

                  <PaymentSelector
                    selected={selectedPayment}
                    onSelect={setSelectedPayment}
                    splitRows={splitRows}
                    onSplitRowsChange={setSplitRows}
                    invoiceTotal={displayTotal}
                    splitError={fieldErrors.split}
                  />

                  {fieldErrors.payment && (
                    <p className="text-sm text-[#EF4444]">{fieldErrors.payment}</p>
                  )}

                  <NotesSection
                    id="payment-notes"
                    label="Payment notes (optional)"
                    value={paymentNotes}
                    onChange={setPaymentNotes}
                    maxLength={PAYMENT_NOTES_MAX}
                    placeholder="Payment reference or notes..."
                  />
                </div>

                <InvoiceSummary
                  items={summaryItems}
                  subtotal={displaySubtotal}
                  discount={totalDiscount}
                  tax={displayTax}
                  total={displayTotal}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <p className="mt-4 rounded-2xl border border-red-100 bg-red-50/80 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>

        <FooterActions
          step={step === 1 ? 1 : 2}
          loading={loading}
          onCancel={() => onCancel?.()}
          onCreateInvoice={() => void handleCreateInvoice()}
          onBack={() => setStep(1)}
          onSaveDraft={() => void handleSaveDraft()}
          onReceivePayment={() => void handleReceivePayment()}
          disableReceive={selectedPayment === "pay_later"}
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
