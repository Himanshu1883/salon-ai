export type ReportCategory =
  | "sales"
  | "finance"
  | "appointments"
  | "team"
  | "clients"
  | "inventory";

export type ReportDefinition = {
  slug: string;
  category: ReportCategory;
  name: string;
  description: string;
  isPremium: boolean;
  route: string;
  createdBy: string;
};

export const REPORT_CATEGORIES: {
  id: ReportCategory | "all";
  label: string;
}[] = [
  { id: "all", label: "All reports" },
  { id: "sales", label: "Sales" },
  { id: "finance", label: "Finance" },
  { id: "appointments", label: "Appointments" },
  { id: "team", label: "Team" },
  { id: "clients", label: "Clients" },
  { id: "inventory", label: "Inventory" },
];

export const REPORTS_CATALOG: ReportDefinition[] = [
  // Sales
  {
    slug: "sales-summary",
    category: "sales",
    name: "Sales summary",
    description: "Overview of sales quantity and value across all categories.",
    isPremium: false,
    route: "/reports/sales/summary",
    createdBy: "Go Tix",
  },
  {
    slug: "sales-by-period",
    category: "sales",
    name: "Sales by time period",
    description: "Daily or weekly sales totals for a selected date range.",
    isPremium: true,
    route: "/reports/sales/by-period",
    createdBy: "Go Tix",
  },
  {
    slug: "sales-list",
    category: "sales",
    name: "Sales list",
    description: "All paid invoices with customer, amount, and payment method.",
    isPremium: false,
    route: "/reports/sales/list",
    createdBy: "Go Tix",
  },
  {
    slug: "sales-log",
    category: "sales",
    name: "Sales log detail",
    description: "Detailed line-item log of every sale transaction.",
    isPremium: false,
    route: "/reports/sales/log",
    createdBy: "Go Tix",
  },
  {
    slug: "gift-cards-period",
    category: "sales",
    name: "Gift card by time period",
    description: "Gift card sales aggregated by day or week.",
    isPremium: true,
    route: "/reports/sales/gift-cards-period",
    createdBy: "Go Tix",
  },
  {
    slug: "gift-cards-list",
    category: "sales",
    name: "Gift card list",
    description: "All gift card sales with customer and amount details.",
    isPremium: false,
    route: "/reports/sales/gift-cards",
    createdBy: "Go Tix",
  },
  {
    slug: "memberships-list",
    category: "sales",
    name: "Membership list",
    description: "Memberships sold with customer and revenue details.",
    isPremium: false,
    route: "/reports/sales/memberships",
    createdBy: "Go Tix",
  },
  {
    slug: "packages-list",
    category: "sales",
    name: "Packages list",
    description: "All package sales with customer and amount details.",
    isPremium: false,
    route: "/reports/sales/packages",
    createdBy: "Go Tix",
  },
  {
    slug: "packages-summary",
    category: "sales",
    name: "Packages summary",
    description: "Aggregated package sales quantity and revenue.",
    isPremium: false,
    route: "/reports/sales/packages-summary",
    createdBy: "Go Tix",
  },
  // Finance
  {
    slug: "revenue-summary",
    category: "finance",
    name: "Revenue summary",
    description: "Total revenue, tax, and invoice counts for a date range.",
    isPremium: false,
    route: "/reports/finance/revenue-summary",
    createdBy: "Go Tix",
  },
  {
    slug: "unpaid-invoices",
    category: "finance",
    name: "Unpaid invoices",
    description: "Outstanding invoices awaiting payment.",
    isPremium: false,
    route: "/reports/finance/unpaid-invoices",
    createdBy: "Go Tix",
  },
  {
    slug: "payment-methods",
    category: "finance",
    name: "Payment methods breakdown",
    description: "Revenue split by cash, card, UPI, and other methods.",
    isPremium: false,
    route: "/reports/finance/payment-methods",
    createdBy: "Go Tix",
  },
  // Appointments
  {
    slug: "appointments-by-period",
    category: "appointments",
    name: "Appointments by period",
    description: "Appointment counts grouped by day or week.",
    isPremium: false,
    route: "/reports/appointments/by-period",
    createdBy: "Go Tix",
  },
  {
    slug: "no-shows",
    category: "appointments",
    name: "No-shows",
    description: "Appointments marked as no-show in the selected period.",
    isPremium: false,
    route: "/reports/appointments/no-shows",
    createdBy: "Go Tix",
  },
  {
    slug: "completion-rate",
    category: "appointments",
    name: "Completion rate",
    description: "Percentage of appointments completed vs scheduled.",
    isPremium: false,
    route: "/reports/appointments/completion-rate",
    createdBy: "Go Tix",
  },
  // Team
  {
    slug: "employee-earnings",
    category: "team",
    name: "Employee earnings",
    description: "Revenue attributed to each team member.",
    isPremium: false,
    route: "/reports/team/earnings",
    createdBy: "Go Tix",
  },
  {
    slug: "shift-hours",
    category: "team",
    name: "Shift hours",
    description: "Scheduled working hours per team member.",
    isPremium: false,
    route: "/reports/team/shift-hours",
    createdBy: "Go Tix",
  },
  // Clients
  {
    slug: "new-clients",
    category: "clients",
    name: "New clients",
    description: "Clients added during the selected date range.",
    isPremium: false,
    route: "/reports/clients/new-clients",
    createdBy: "Go Tix",
  },
  {
    slug: "client-segments",
    category: "clients",
    name: "Client segments summary",
    description: "Overview of custom client segments and counts.",
    isPremium: false,
    route: "/reports/clients/segments",
    createdBy: "Go Tix",
  },
  {
    slug: "top-spenders",
    category: "clients",
    name: "Top spenders",
    description: "Clients ranked by total spend in the selected period.",
    isPremium: false,
    route: "/reports/clients/top-spenders",
    createdBy: "Go Tix",
  },
  // Inventory
  {
    slug: "stock-levels",
    category: "inventory",
    name: "Stock levels",
    description: "Current quantity on hand for all stock items.",
    isPremium: false,
    route: "/reports/inventory/stock-levels",
    createdBy: "Go Tix",
  },
  {
    slug: "low-stock",
    category: "inventory",
    name: "Low stock",
    description: "Items at or below their reorder level.",
    isPremium: false,
    route: "/reports/inventory/low-stock",
    createdBy: "Go Tix",
  },
  {
    slug: "purchase-history",
    category: "inventory",
    name: "Purchase history",
    description: "Stock purchase records with supplier and cost details.",
    isPremium: false,
    route: "/reports/inventory/purchase-history",
    createdBy: "Go Tix",
  },
];

export const DASHBOARD_REPORTS = [
  {
    slug: "sales-summary",
    title: "Sales summary",
    description: "Revenue and quantity overview",
    route: "/reports/sales/summary",
  },
  {
    slug: "daily-sales",
    title: "Daily sales",
    description: "Today's transaction breakdown",
    route: "/sales/daily",
  },
  {
    slug: "employee-earnings",
    title: "Team earnings",
    description: "Revenue by team member",
    route: "/reports/team/earnings",
  },
];

export function getReportBySlug(slug: string): ReportDefinition | undefined {
  return REPORTS_CATALOG.find((r) => r.slug === slug);
}

export function getReportCounts() {
  const total = REPORTS_CATALOG.length;
  const premium = REPORTS_CATALOG.filter((r) => r.isPremium).length;
  const standard = total - premium;
  return { total, premium, standard, custom: 0, dashboards: DASHBOARD_REPORTS.length };
}
