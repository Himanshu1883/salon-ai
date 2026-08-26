export type BillingLineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  service: { name: string } | null;
};

export type BillingInvoice = {
  id: string;
  customerName: string;
  customerPhone: string | null;
  status: string;
  subtotal: number;
  tax: number;
  total: number;
  amountPaid?: number;
  dueDate: Date | null;
  paidAt: Date | null;
  paymentMethod: string | null;
  createdAt: Date;
  lineItems: BillingLineItem[];
  appointment: { id: string; service: { name: string } } | null;
  checkIn: { id: string; customer: { name: string } } | null;
  employee: { id: string; name: string } | null;
  seat: { id: string; number: number } | null;
};

export type BillingService = {
  id: string;
  name: string;
  price: number;
  duration: number;
  categoryName: string;
  description?: string | null;
};

export type BillingProduct = {
  id: string;
  name: string;
  retailPrice: number;
  category: string;
  gstRate: number;
};
export type BillingEmployee = { id: string; name: string };
export type BillingSeat = { id: string; number: number };

export type BillingStats = {
  revenueToday: number;
  revenueMonth: number;
  unpaidCount: number;
};

export type BillingFilters = {
  status: string;
  dateFrom: string;
  dateTo: string;
  employeeId: string;
};

export const STATUS_STYLES: Record<
  string,
  { label: string; className: string }
> = {
  draft: {
    label: "Draft",
    className: "bg-slate-100 text-slate-700",
  },
  sent: {
    label: "Sent",
    className: "bg-blue-50 text-blue-700",
  },
  paid: {
    label: "Paid",
    className: "bg-emerald-50 text-emerald-700",
  },
  partial: {
    label: "Partial",
    className: "bg-orange-50 text-orange-700",
  },
  overdue: {
    label: "Overdue",
    className: "bg-amber-50 text-amber-700",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-50 text-red-600",
  },
};

export const PAYMENT_LABELS: Record<string, string> = {
  cash: "Cash",
  card: "Card",
  upi: "UPI",
  wallet: "Wallet",
  other: "Other",
};

export const PAYMENT_BADGE_STYLES: Record<string, string> = {
  cash: "bg-emerald-50 text-emerald-700",
  card: "bg-blue-50 text-blue-700",
  upi: "bg-violet-50 text-violet-700",
  wallet: "bg-orange-50 text-orange-700",
  other: "bg-slate-100 text-slate-600",
};
