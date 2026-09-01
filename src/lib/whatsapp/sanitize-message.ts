/**
 * Keep review / Maps URLs exactly as the salon pasted them.
 * WhatsApp cuts those links if we rewrite them to a short search URL.
 */
export function prepareWhatsAppMessage(message: string): string {
  // Variation selectors (e.g. ❤️) often render as in WhatsApp Desktop.
  return message.replace(/\uFE0F/g, "");
}
