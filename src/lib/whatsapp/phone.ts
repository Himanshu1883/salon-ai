import { prepareWhatsAppMessage } from "./sanitize-message";

export function normalizeWhatsAppPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const waPhone = normalizeWhatsAppPhone(phone);
  const text = prepareWhatsAppMessage(message);
  return `https://wa.me/${waPhone}?text=${encodeURIComponent(text)}`;
}

export function openWhatsApp(phone: string, message: string): void {
  if (typeof window === "undefined") return;
  const text = prepareWhatsAppMessage(message);
  void navigator.clipboard?.writeText(text).catch(() => undefined);
  window.open(buildWhatsAppUrl(phone, message), "_blank", "noopener,noreferrer");
}
