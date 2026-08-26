export function getInvoiceAmountPaid(invoice: {
  amountPaid?: number | null;
}): number {
  return invoice.amountPaid ?? 0;
}

export function getInvoiceBalanceDue(invoice: {
  total: number;
  amountPaid?: number | null;
}): number {
  return Math.max(0, invoice.total - getInvoiceAmountPaid(invoice));
}

export function isInvoiceFullyPaid(invoice: {
  total: number;
  amountPaid?: number | null;
}): boolean {
  return getInvoiceBalanceDue(invoice) <= 0.009;
}
