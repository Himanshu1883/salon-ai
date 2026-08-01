/** Platform billing entity (Glow Desk subscription invoices). */
export const PLATFORM_BILLING_ENTITY = {
  legalName: "VSACHI TECH PRIVATE LIMITED",
  addressLine1: "FIRST FLOOR, 57, BLOCK A2A, Block A2A Park, Janakpuri",
  addressLine2: "New Delhi",
  gstin: "07AAKCV1678G1ZZ",
  stateName: "Delhi",
  stateCode: "07",
  brandName: "Glow Desk",
  supportEmail: "support@salon.ai",
  upiId: "salonai@upi",
  bankAccountName: "VSACHI TECH PRIVATE LIMITED",
  bankIfsc: "SBIN0001234",
  bankAccountNumber: "123456789012",
} as const;

export const PLATFORM_GST_RATE = 0.18;
export const PLATFORM_CGST_RATE = 0.09;
export const PLATFORM_SGST_RATE = 0.09;

/** @deprecated Use PLATFORM_GST_RATE */
export const PLATFORM_TAX_RATE = PLATFORM_GST_RATE;

export type PlatformInvoiceGstBreakdown = {
  baseAmount: number;
  cgst: number;
  sgst: number;
  tax: number;
  total: number;
  gstRatePercent: number;
  cgstRatePercent: number;
  sgstRatePercent: number;
};

export type PlatformSubscriptionLineItem = {
  description: string;
  amount: number;
};

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculatePlatformInvoiceGst(
  baseAmount: number
): PlatformInvoiceGstBreakdown {
  const cgst = roundMoney(baseAmount * PLATFORM_CGST_RATE);
  const sgst = roundMoney(baseAmount * PLATFORM_SGST_RATE);
  const tax = roundMoney(cgst + sgst);
  const total = roundMoney(baseAmount + tax);

  return {
    baseAmount: roundMoney(baseAmount),
    cgst,
    sgst,
    tax,
    total,
    gstRatePercent: PLATFORM_GST_RATE * 100,
    cgstRatePercent: PLATFORM_CGST_RATE * 100,
    sgstRatePercent: PLATFORM_SGST_RATE * 100,
  };
}

export function getPlatformSubscriptionLineItem(
  planName: string,
  baseAmount: number
): PlatformSubscriptionLineItem {
  const isTrial = baseAmount === 0;
  return {
    description: isTrial
      ? `Glow Desk ${planName} Plan — Free Trial`
      : `Glow Desk ${planName} Plan — Monthly Subscription`,
    amount: baseAmount,
  };
}

export function formatPlatformBillingAddress(): string {
  const { addressLine1, addressLine2, stateName, stateCode } = PLATFORM_BILLING_ENTITY;
  return `${addressLine1}, ${addressLine2}, ${stateName} (${stateCode})`;
}
