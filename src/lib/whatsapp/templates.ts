import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { PAYMENT_LABELS } from "@/components/billing/types";
import type {
  WhatsAppInvoiceContext,
  WhatsAppTemplateId,
  WhatsAppTemplateVariables,
} from "./types";

export const DEFAULT_BILLING_MESSAGE_TEMPLATE = `Hello {customerName} 👋

Thank you for visiting {salonName}.

Invoice Number
{invoiceNumber}

Amount Paid
{invoiceTotal}

Payment Method
{paymentMethod}

Services
{services}

Download Invoice
{invoiceUrl}

We hope to see you again ❤️

Regards
{salonName}`;

export const WHATSAPP_TEMPLATE_VARIABLES: {
  key: keyof WhatsAppTemplateVariables;
  label: string;
  description: string;
}[] = [
  { key: "customerName", label: "Customer name", description: "First name or full name" },
  { key: "salonName", label: "Salon name", description: "Your salon business name" },
  { key: "invoiceTotal", label: "Invoice total", description: "Formatted amount paid" },
  { key: "invoiceNumber", label: "Invoice number", description: "e.g. INV-2026-000123" },
  { key: "date", label: "Date", description: "Invoice or payment date" },
  { key: "services", label: "Services", description: "Comma-separated line items" },
  { key: "paymentMethod", label: "Payment method", description: "Cash, UPI, card, etc." },
  { key: "invoiceUrl", label: "Invoice link", description: "Link to view/download invoice" },
  { key: "staffName", label: "Staff name", description: "Stylist or staff who served" },
];

function paymentLabel(method: string) {
  if (!method || method === "pending") return "Pending";
  return PAYMENT_LABELS[method] ?? method.replace(/_/g, " ").toUpperCase();
}

export function buildTemplateVariables(
  ctx: WhatsAppInvoiceContext,
  invoiceUrl: string
): WhatsAppTemplateVariables {
  const firstName = ctx.customerName.split(" ")[0] || ctx.customerName;
  return {
    customerName: firstName,
    salonName: ctx.salonName,
    invoiceTotal: formatCurrency(ctx.amount),
    invoiceNumber: ctx.invoiceNumber,
    date: format(ctx.paidAt, "d MMM yyyy, h:mm a"),
    services: ctx.services ?? "—",
    paymentMethod: paymentLabel(ctx.paymentMethod),
    invoiceUrl,
    staffName: ctx.staffName,
  };
}

export function renderWhatsAppTemplate(
  template: string,
  variables: WhatsAppTemplateVariables
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    if (key in variables) {
      return variables[key as keyof WhatsAppTemplateVariables] ?? match;
    }
    return match;
  });
}

export function buildBillingWhatsAppMessage(
  template: string,
  ctx: WhatsAppInvoiceContext,
  invoiceUrl: string
): string {
  const variables = buildTemplateVariables(ctx, invoiceUrl);
  return renderWhatsAppTemplate(template, variables);
}

export function buildPresetWhatsAppMessage(
  templateId: WhatsAppTemplateId,
  ctx: WhatsAppInvoiceContext,
  invoiceUrl: string
): string {
  const firstName = ctx.customerName.split(" ")[0] || ctx.customerName;
  const amount = formatCurrency(ctx.amount);
  const method = paymentLabel(ctx.paymentMethod);
  const footer = `\n\nRegards\n${ctx.salonName}`;

  switch (templateId) {
    case "payment_confirmation":
      return `Hello ${firstName} 👋\n\nYour payment of ${amount} via ${method} has been received successfully.\n\nInvoice Number\n${ctx.invoiceNumber}\n\nThank you for choosing ${ctx.salonName}!${footer}`;
    case "thank_you":
      return `Hello ${firstName} 👋\n\nThank you for visiting ${ctx.salonName} today. We hope you loved your experience!${footer}`;
    case "membership":
      return `Hello ${firstName} 👋\n\nYour membership at ${ctx.salonName} is active. Enjoy exclusive benefits on your next visit.\n\nInvoice: ${ctx.invoiceNumber}${footer}`;
    case "package_balance":
      return `Hello ${firstName} 👋\n\nYour package balance at ${ctx.salonName} has been updated.\n\nAmount: ${amount}\nInvoice: ${ctx.invoiceNumber}${footer}`;
    case "review_request":
      return `Hello ${firstName} 👋\n\nWe hope you enjoyed your visit! Would you mind leaving us a quick review? It helps us serve you better ⭐${footer}`;
    case "appointment_reminder":
      return `Hello ${firstName} 👋\n\nThis is a friendly reminder from ${ctx.salonName}. We look forward to seeing you at your upcoming appointment.${footer}`;
    case "invoice":
    default:
      return buildBillingWhatsAppMessage(DEFAULT_BILLING_MESSAGE_TEMPLATE, ctx, invoiceUrl);
  }
}
