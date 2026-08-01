import {
  buildBillingWhatsAppMessage,
  buildPresetWhatsAppMessage,
  DEFAULT_BILLING_MESSAGE_TEMPLATE,
  WHATSAPP_TEMPLATE_VARIABLES,
} from "@/lib/whatsapp";
import type { WhatsAppTemplateId } from "@/lib/whatsapp";

export const WHATSAPP_TEMPLATES: {
  id: WhatsAppTemplateId;
  label: string;
}[] = [
  { id: "invoice", label: "Post-Billing (Custom)" },
  { id: "payment_confirmation", label: "Payment Confirmation" },
  { id: "thank_you", label: "Thank You" },
  { id: "membership", label: "Membership" },
  { id: "package_balance", label: "Package Balance" },
  { id: "review_request", label: "Review Request" },
  { id: "appointment_reminder", label: "Appointment Reminder" },
];

export {
  buildBillingWhatsAppMessage,
  buildPresetWhatsAppMessage,
  DEFAULT_BILLING_MESSAGE_TEMPLATE,
  WHATSAPP_TEMPLATE_VARIABLES,
};

export function buildWhatsAppMessage(
  templateId: WhatsAppTemplateId,
  ctx: import("./types").WhatsAppInvoiceContext,
  invoiceUrl: string,
  billingMessageTemplate?: string
): string {
  if (templateId === "invoice" && billingMessageTemplate) {
    return buildBillingWhatsAppMessage(billingMessageTemplate, ctx, invoiceUrl);
  }
  return buildPresetWhatsAppMessage(templateId, ctx, invoiceUrl);
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
