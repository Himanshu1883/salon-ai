import { formatCurrency } from "@/lib/utils";
import { PAYMENT_LABELS } from "../types";
import type { WhatsAppInvoiceContext, WhatsAppTemplateId } from "./types";

export const WHATSAPP_TEMPLATES: {
  id: WhatsAppTemplateId;
  label: string;
}[] = [
  { id: "invoice", label: "Invoice" },
  { id: "payment_confirmation", label: "Payment Confirmation" },
  { id: "thank_you", label: "Thank You" },
  { id: "membership", label: "Membership" },
  { id: "package_balance", label: "Package Balance" },
  { id: "review_request", label: "Review Request" },
  { id: "appointment_reminder", label: "Appointment Reminder" },
];

function paymentLabel(method: string) {
  return PAYMENT_LABELS[method] ?? method.replace(/_/g, " ").toUpperCase();
}

export function buildWhatsAppMessage(
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
      return `Hello ${firstName} 👋\n\nThank you for visiting ${ctx.salonName}.\n\nInvoice Number\n${ctx.invoiceNumber}\n\nAmount Paid\n${amount}\n\nPayment Method\n${method}\n\nDownload Invoice\n${invoiceUrl}\n\nWe hope to see you again ❤️${footer}`;
  }
}

export function getDemoTimeline(staffName: string): import("./types").CommunicationTimelineItem[] {
  return [
    {
      id: "1",
      label: "Invoice Sent",
      status: "delivered",
      time: "4:18 PM",
      date: "Today",
      staffName,
    },
    {
      id: "2",
      label: "Review Request",
      status: "read",
      time: "6:25 PM",
      date: "Today",
      staffName,
    },
    {
      id: "3",
      label: "Membership Reminder",
      status: "pending",
      time: "—",
      date: "Scheduled",
      staffName,
    },
  ];
}

export function getDemoAiSuggestions(): import("./types").AiSuggestion[] {
  return [
    {
      id: "1",
      title: "Re-engagement opportunity",
      description: "Customer hasn't visited for 45 days. Offer Hair Spa Discount.",
      action: "Send offer",
      tone: "purple",
    },
    {
      id: "2",
      title: "Loyalty upgrade",
      description: "Customer has enough loyalty points. Recommend Premium Membership.",
      action: "Suggest membership",
      tone: "emerald",
    },
    {
      id: "3",
      title: "Renewal due soon",
      description: "Membership expires in 7 days. Recommend Renewal.",
      action: "Send renewal",
      tone: "amber",
    },
    {
      id: "4",
      title: "Birthday coming up",
      description: "Customer birthday next week. Send Birthday Offer.",
      action: "Schedule wish",
      tone: "purple",
    },
  ];
}
