import type { ParsedPrice } from "./types";
import { collapseWhitespace } from "./sanitize";

const PRICE_LIKE =
  /(?:₹|rs\.?|inr)?\s*total[-:\s]*[₹rs.\s]*\d[\d,]*(?:\.\d+)?\s*(?:\+)?(?:\/-?)?(?:\s*only)?/i;

export function looksLikePriceToken(value: string): boolean {
  const text = collapseWhitespace(value);
  if (!text) return false;
  if (/^free[\s\-:]/i.test(text)) return false;
  if (/^total[-:\s]*\d/i.test(text)) return true;
  if (/^\d(?:\/-)?$/.test(text) && Number(text.replace(/\D/g, "")) < 10) return false;
  return /^(?:₹|rs\.?|inr)?\s*\d[\d,]*(?:\.\d+)?\s*(?:\+)?(?:\/-?)?(?:\s*only)?$/i.test(
    text
  );
}

export function parsePrice(raw: string | null | undefined): ParsedPrice {
  const original = collapseWhitespace(raw ?? "");
  if (!original) {
    return {
      amount: null,
      pricingType: "UNKNOWN",
      isStartingPrice: false,
      isFixedPrice: false,
      isPackageTotal: false,
      original,
    };
  }

  const collapsedDigits = original.replace(/(\d)\s+(\d)/g, "$1$2");
  const isPackageTotal = /\btotal\b/i.test(collapsedDigits);
  const isStartingPrice = /\d[\d,]*\s*\+/.test(collapsedDigits) || /\+$/.test(
    collapsedDigits.replace(/[^\d+]/g, "")
  );
  const isOnly = /\bonly\b/i.test(collapsedDigits) || /\/-/.test(collapsedDigits);

  const cleaned = collapsedDigits
    .replace(/₹/g, "")
    .replace(/\bRs\.?/gi, "")
    .replace(/\bINR\b/gi, "")
    .replace(/,/g, "")
    .replace(/\/-?/g, "")
    .replace(/\bonly\b/gi, "")
    .replace(/\btotal\b/gi, "")
    .replace(/[-:]+/g, " ")
    .trim();

  const match = cleaned.match(/(\d+(?:\.\d+)?)\s*\+?/);
  if (!match) {
    return {
      amount: null,
      pricingType: "UNKNOWN",
      isStartingPrice: false,
      isFixedPrice: false,
      isPackageTotal,
      original,
    };
  }

  const amount = Number(match[1]);
  if (!Number.isFinite(amount) || amount < 0) {
    return {
      amount: null,
      pricingType: "UNKNOWN",
      isStartingPrice: false,
      isFixedPrice: false,
      isPackageTotal,
      original,
    };
  }
  if (amount < 10 && !/\d{2,}/.test(original.replace(/\D/g, ""))) {
    return {
      amount: null,
      pricingType: "UNKNOWN",
      isStartingPrice: false,
      isFixedPrice: false,
      isPackageTotal,
      original,
    };
  }

  const starting = isStartingPrice && !isOnly;
  return {
    amount,
    pricingType: starting ? "STARTING_FROM" : "FIXED",
    isStartingPrice: starting,
    isFixedPrice: !starting,
    isPackageTotal,
    original,
  };
}

export function extractPriceTokens(text: string): string[] {
  const matches = collapseWhitespace(text).match(
    /(?:₹|rs\.?|inr)?\s*(?:total[-:\s]*)?\d[\d,]*(?:\.\d+)?\s*(?:\+)?(?:\/-?)?(?:\s*only)?/gi
  );
  return matches?.map((m) => m.trim()).filter(Boolean) ?? [];
}

export function isPriceLikeLine(text: string): boolean {
  return PRICE_LIKE.test(text) && looksLikePriceToken(text.replace(/\btotal\b/gi, "").trim() || text);
}
