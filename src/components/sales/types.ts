export type Sale = {
  id: string;
  customerName: string;
  customerPhone: string | null;
  total: number;
  paidAt: Date | null;
  paymentMethod: string | null;
  lineItems: { description: string }[];
  employee: { name: string } | null;
};

export type SalesFilters = {
  dateFrom: string;
  dateTo: string;
  search: string;
};

export type SalesStats = {
  totalRevenue: number;
  transactionCount: number;
  revenueTrend: number;
  avgOrderValue: number;
  aovTrend: number;
  todayRevenue: number;
  todayCount: number;
  monthRevenue: number;
  revenueByDay: { label: string; revenue: number }[];
  paymentBreakdown: { method: string; label: string; count: number; total: number }[];
  topStylist: { name: string; revenue: number; count: number } | null;
  topService: { name: string; count: number; revenue: number } | null;
};

export const PAYMENT_LABELS: Record<string, string> = {
  cash: "Cash",
  card: "Card",
  upi: "UPI",
  wallet: "Wallet",
  other: "Other",
};

export const PAYMENT_BADGE_STYLES: Record<string, string> = {
  cash: "bg-emerald-50 text-emerald-700 border-emerald-200",
  card: "bg-sky-50 text-sky-700 border-sky-200",
  upi: "bg-violet-50 text-violet-700 border-violet-200",
  wallet: "bg-amber-50 text-amber-700 border-amber-200",
  other: "bg-stone-50 text-stone-600 border-stone-200",
};

export const PAGE_SIZE = 10;
