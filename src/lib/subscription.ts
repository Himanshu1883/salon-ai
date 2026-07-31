export const SUBSCRIPTION_PLAN_NAME = "Salon AI Pro";
export const MONTHLY_AMOUNT_INR = 750;
export const TRIAL_DAYS = 14;
export const INVOICE_DUE_DAYS = 7;
export const PLATFORM_TAX_RATE = 0.18;

export const SUBSCRIPTION_STATUSES = [
  "active",
  "past_due",
  "suspended",
  "trial",
] as const;

export const PLATFORM_INVOICE_STATUSES = [
  "draft",
  "sent",
  "paid",
  "overdue",
  "cancelled",
] as const;

export const PAYMENT_METHODS = ["upi", "card", "bank_transfer"] as const;

export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];
export type PlatformInvoiceStatus = (typeof PLATFORM_INVOICE_STATUSES)[number];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const ALLOWED_PATHS_WHEN_BLOCKED = [
  "/invoice-due",
  "/settings/billing",
  "/settings/subscription",
] as const;

export function isAllowedPathWhenBlocked(pathname: string): boolean {
  return ALLOWED_PATHS_WHEN_BLOCKED.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export function getMonthPeriod(date = new Date()) {
  const periodStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const periodEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
  return { periodStart, periodEnd };
}

export function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
