/** Internal seed marker — never show to users as a service name. */
export const MAKEUP_STUDIO_MARKER = "makeup-studio-catalog-v1";

export function isInternalServiceDescription(value?: string | null): boolean {
  if (!value?.trim()) return true;
  return value.trim() === MAKEUP_STUDIO_MARKER;
}

function looksLikePhoneNumber(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 13 && /^\d+$/.test(digits);
}

/** Returns the best user-facing label for an invoice/catalog line item. */
export function resolveLineItemLabel(options: {
  serviceName?: string | null;
  productName?: string | null;
  description?: string | null;
  fallback?: string;
}): string {
  const { serviceName, productName, description, fallback = "Service" } = options;

  if (serviceName?.trim()) return serviceName.trim();
  if (productName?.trim()) return productName.trim();

  const desc = description?.trim() ?? "";
  if (desc && !isInternalServiceDescription(desc) && !looksLikePhoneNumber(desc)) {
    return desc;
  }

  return fallback;
}
