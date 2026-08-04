import { cn } from "@/lib/utils";
import { v2 } from "./v2/tokens";

/** Shared class tokens for the Record Sale / Create Invoice modal (v2 aligned) */
export const invoiceModalStyles = {
  text: "text-[#111827]",
  muted: "text-[#6B7280]",
  sectionTitle: "text-[15px] font-semibold tracking-tight text-[#111827]",
  label: v2.label,
  input: v2.input,
  selectTrigger: v2.selectTrigger,
  textarea: v2.textarea,
  card: v2.card,
  summaryCard: v2.summaryCard,
  primaryButton: v2.primaryButton,
  outlineButton: v2.outlineButton,
  accent: "text-[#7C3AED]",
  inputError: v2.inputError,
} as const;
