export function normalizeWhatsAppPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const waPhone = normalizeWhatsAppPhone(phone);
  return `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;
}

export function openWhatsApp(phone: string, message: string): void {
  if (typeof window === "undefined") return;
  window.open(buildWhatsAppUrl(phone, message), "_blank", "noopener,noreferrer");
}
