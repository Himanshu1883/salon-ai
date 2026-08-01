export type WhatsAppTemplateId =
  | "invoice"
  | "payment_confirmation"
  | "thank_you"
  | "membership"
  | "package_balance"
  | "review_request"
  | "appointment_reminder";

export type SendMode = "now" | "schedule" | "draft";

export type TimelineStatus = "sent" | "delivered" | "read" | "pending" | "failed";

export type CommunicationTimelineItem = {
  id: string;
  label: string;
  status: TimelineStatus;
  time: string;
  date: string;
  staffName: string;
};

export type AiSuggestion = {
  id: string;
  title: string;
  description: string;
  action: string;
  tone: "purple" | "amber" | "emerald";
};

export type WhatsAppInvoiceContext = {
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  amount: number;
  paymentMethod: string;
  paidAt: Date;
  staffName: string;
  salonName: string;
  loyaltyPoints?: number;
  services?: string;
};

export type AttachmentKey = "pdf_invoice" | "payment_receipt" | "loyalty_points";
