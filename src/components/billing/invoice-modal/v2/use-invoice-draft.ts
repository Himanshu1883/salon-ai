"use client";

import { useCallback, useEffect, useRef } from "react";
import type { InvoiceCustomer } from "../customer-search";
import type { LineItem } from "../utils";

const DRAFT_KEY = "glowdesk-invoice-draft";

export type InvoiceDraft = {
  customer: InvoiceCustomer;
  dueDate: string;
  status: string;
  notes: string;
  employeeId: string;
  seatId: string;
  lineItems: LineItem[];
  savedAt: number;
};

export function loadInvoiceDraft(): InvoiceDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as InvoiceDraft;
    if (Date.now() - draft.savedAt > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(DRAFT_KEY);
      return null;
    }
    return draft;
  } catch {
    return null;
  }
}

export function clearInvoiceDraft() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DRAFT_KEY);
}

export function useInvoiceDraft(state: Omit<InvoiceDraft, "savedAt">, enabled: boolean) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const saveNow = useCallback(() => {
    if (!enabled || typeof window === "undefined") return;
    const draft: InvoiceDraft = { ...stateRef.current, savedAt: Date.now() };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(saveNow, 800);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state, enabled, saveNow]);

  return { saveNow, clearDraft: clearInvoiceDraft };
}
