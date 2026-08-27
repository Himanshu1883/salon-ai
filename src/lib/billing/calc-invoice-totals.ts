export const DEFAULT_INVOICE_TAX_RATE = 0.08;

export type InvoiceLineForTotals = {
  quantity: number;
  unitPrice: number;
  taxRate?: number;
};

export type InvoiceTotals = {
  subtotal: number;
  tax: number;
  total: number;
};

type CalcInvoiceTotalsOptions = {
  gstEnabled?: boolean;
  /** When false, GST is added on top of the service/product price (exclusive). */
  gstIncluded?: boolean;
  defaultTaxRate?: number;
};

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function extractIncludedTax(net: number, taxRate: number) {
  return net - net / (1 + taxRate);
}

export function calcInvoiceTotals(
  lineItems: InvoiceLineForTotals[],
  {
    gstEnabled = true,
    gstIncluded = true,
    defaultTaxRate = DEFAULT_INVOICE_TAX_RATE,
  }: CalcInvoiceTotalsOptions = {}
): InvoiceTotals {
  const grossTotal = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  if (!gstEnabled) {
    const total = roundMoney(grossTotal);
    return { subtotal: total, tax: 0, total };
  }

  if (gstIncluded) {
    const total = roundMoney(grossTotal);
    const tax = roundMoney(
      lineItems.reduce((sum, item) => {
        const net = item.quantity * item.unitPrice;
        const rate = item.taxRate ?? defaultTaxRate;
        return sum + extractIncludedTax(net, rate);
      }, 0)
    );
    const subtotal = roundMoney(total - tax);
    return { subtotal, tax, total };
  }

  const subtotal = roundMoney(grossTotal);
  const tax = roundMoney(
    lineItems.reduce((sum, item) => {
      const net = item.quantity * item.unitPrice;
      const rate = item.taxRate ?? defaultTaxRate;
      return sum + net * rate;
    }, 0)
  );
  const total = roundMoney(subtotal + tax);
  return { subtotal, tax, total };
}

export function applyMembershipDiscountToTotals(
  totals: InvoiceTotals,
  discountPercent: number,
  {
    gstEnabled = true,
    gstIncluded = true,
    defaultTaxRate = DEFAULT_INVOICE_TAX_RATE,
  }: CalcInvoiceTotalsOptions = {}
): InvoiceTotals & { discountAmount: number } {
  const discountAmount = roundMoney(totals.total * (discountPercent / 100));
  const discountedTotal = roundMoney(totals.total - discountAmount);

  if (!gstEnabled) {
    return {
      subtotal: discountedTotal,
      tax: 0,
      total: discountedTotal,
      discountAmount,
    };
  }

  if (gstIncluded) {
    const tax = roundMoney(
      extractIncludedTax(discountedTotal, defaultTaxRate)
    );
    const subtotal = roundMoney(discountedTotal - tax);
    return { subtotal, tax, total: discountedTotal, discountAmount };
  }

  const discountedSubtotal = roundMoney(totals.subtotal - discountAmount);
  const tax = roundMoney(discountedSubtotal * defaultTaxRate);
  const total = roundMoney(discountedSubtotal + tax);
  return {
    subtotal: discountedSubtotal,
    tax,
    total,
    discountAmount,
  };
}
