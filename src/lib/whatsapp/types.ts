export type WhatsAppTemplateId =
  | "invoice"
  | "payment_confirmation"
  | "thank_you"
  | "membership"
  | "package_balance"
  | "review_request"
  | "appointment_reminder";

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

export type WhatsAppTemplateVariables = {
  customerName: string;
  salonName: string;
  invoiceTotal: string;
  invoiceNumber: string;
  date: string;
  services: string;
  paymentMethod: string;
  invoiceUrl: string;
  staffName: string;
};
