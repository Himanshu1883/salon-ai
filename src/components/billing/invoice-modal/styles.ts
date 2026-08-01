import { cn } from "@/lib/utils";

/** Shared class tokens for the Record Sale / Create Invoice modal */
export const invoiceModalStyles = {
  /** Primary text */
  text: "text-dashboard-text",
  /** Muted secondary text */
  muted: "text-dashboard-muted",
  /** Section title — stronger hierarchy than legacy 11px uppercase */
  sectionTitle:
    "text-sm font-semibold tracking-tight text-dashboard-text",
  /** Field label */
  label: "text-sm font-medium text-dashboard-text",
  /** Modern soft input — borderless feel with subtle shadow */
  input: cn(
    "h-12 rounded-2xl border border-violet-100/80 bg-white text-sm shadow-sm shadow-violet-950/[0.03]",
    "transition-all placeholder:text-dashboard-muted/60",
    "focus-visible:border-violet-300 focus-visible:shadow-md focus-visible:shadow-violet-500/10",
    "focus-visible:ring-2 focus-visible:ring-violet-500/15 focus-visible:outline-none"
  ),
  /** Select trigger matching inputs */
  selectTrigger: cn(
    "h-12 rounded-2xl border border-violet-100/80 bg-white text-sm shadow-sm shadow-violet-950/[0.03]",
    "transition-all focus:ring-2 focus:ring-violet-500/15 focus:border-violet-300"
  ),
  /** Textarea matching inputs */
  textarea: cn(
    "min-h-[100px] resize-none rounded-2xl border border-violet-100/80 bg-white px-4 py-3.5 text-sm",
    "shadow-sm shadow-violet-950/[0.03] transition-all placeholder:text-dashboard-muted/60",
    "focus-visible:border-violet-300 focus-visible:shadow-md focus-visible:shadow-violet-500/10",
    "focus-visible:ring-2 focus-visible:ring-violet-500/15 focus-visible:outline-none"
  ),
  /** Light card surface (replaces heavy grey boxes) */
  card: cn(
    "rounded-2xl border border-violet-100/50 bg-white",
    "shadow-[0_4px_24px_rgba(109,40,217,0.05)] ring-1 ring-violet-50/80"
  ),
  /** Summary sidebar card */
  summaryCard: cn(
    "sticky top-4 rounded-2xl border border-violet-100/60 bg-white p-6",
    "shadow-[0_8px_32px_rgba(109,40,217,0.08)] ring-1 ring-violet-50"
  ),
  /** Primary CTA button */
  primaryButton: cn(
    "h-12 rounded-2xl bg-gradient-to-r from-violet-600 to-violet-500 px-6 text-white",
    "shadow-lg shadow-violet-500/25 transition-all hover:from-violet-700 hover:to-violet-600"
  ),
  /** Outline / secondary button */
  outlineButton: cn(
    "h-12 rounded-2xl border border-violet-100 bg-white px-6 text-dashboard-muted",
    "shadow-sm shadow-violet-950/[0.02] transition-all hover:border-violet-200 hover:bg-violet-50/50 hover:text-dashboard-text"
  ),
  /** Violet accent for totals and highlights */
  accent: "text-violet-600",
  /** Error state for inputs */
  inputError: "border-red-300 focus-visible:ring-red-200/50",
} as const;
