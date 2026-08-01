import { parseSalonPrefixedPath } from "@/lib/salon-paths";

import {
  getPlanMonthlyAmount,
  getSubscriptionPlanName,
  normalizeSalonPlan,
  type SalonPlan,
} from "@/lib/plans";

/** @deprecated Use getSubscriptionPlanName(plan) */
export const SUBSCRIPTION_PLAN_NAME = "Enterprise";

/** @deprecated Use getPlanMonthlyAmount(plan) */
export const MONTHLY_AMOUNT_INR = getPlanMonthlyAmount("ENTERPRISE");

export function getSubscriptionBillingForPlan(plan: string | null | undefined): {
  plan: SalonPlan;
  planName: string;
  monthlyAmount: number;
} {
  const normalized = normalizeSalonPlan(plan);
  return {
    plan: normalized,
    planName: getSubscriptionPlanName(normalized),
    monthlyAmount: getPlanMonthlyAmount(normalized),
  };
}
export { PLATFORM_GST_RATE, PLATFORM_TAX_RATE } from "@/lib/platform-billing";

export const TRIAL_DAYS = 14;
export const INVOICE_DUE_DAYS = 7;

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
  "/support",
] as const;

function normalizeAppPath(pathname: string): string {
  const salonPath = parseSalonPrefixedPath(pathname);
  return salonPath?.innerPath ?? pathname;
}

export function isAllowedPathWhenBlocked(pathname: string): boolean {
  const path = normalizeAppPath(pathname);
  return ALLOWED_PATHS_WHEN_BLOCKED.some(
    (allowedPath) => path === allowedPath || path.startsWith(`${allowedPath}/`)
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
