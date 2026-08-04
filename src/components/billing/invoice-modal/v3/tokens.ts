import { cn } from "@/lib/utils";

/** V3 compact design tokens — Stripe/Shopify density */
export const v3 = {
  colors: {
    primary: "#7C3AED",
    primaryHover: "#6D28D9",
    bg: "#FAFBFF",
    border: "#ECECF5",
    success: "#22C55E",
    text: "#111827",
    secondary: "#6B7280",
  },
  modal: cn(
    "flex h-[88vh] w-[95vw] max-w-[1700px] flex-col gap-0 overflow-hidden rounded-[18px]",
    "border border-[#ECECF5] bg-white p-0",
    "shadow-[0_20px_60px_-12px_rgba(124,58,237,0.16),0_6px_24px_rgba(17,24,39,0.06)]"
  ),
  header: cn(
    "sticky top-0 z-20 flex h-[72px] shrink-0 items-center border-b border-[#ECECF5] bg-white/95 px-5 backdrop-blur-md"
  ),
  footer: cn(
    "sticky bottom-0 z-20 shrink-0 border-t border-[#ECECF5] bg-white/95 px-5 py-3 backdrop-blur-md"
  ),
  section: "pb-4",
  sectionTitle: "mb-2.5 text-[13px] font-semibold tracking-tight text-[#111827]",
  sectionDivider: "mb-4 border-b border-[#ECECF5]",
  label: "mb-1 block text-[11px] font-medium text-[#6B7280]",
  input: cn(
    "h-9 rounded-[14px] border border-[#ECECF5] bg-white text-[13px] text-[#111827]",
    "transition-all duration-200 placeholder:text-[#6B7280]/50",
    "focus-visible:border-[#7C3AED]/40 focus-visible:shadow-[0_0_0_2px_rgba(124,58,237,0.1)]",
    "focus-visible:outline-none"
  ),
  selectTrigger: cn(
    "h-9 rounded-[14px] border border-[#ECECF5] bg-white text-[13px]",
    "transition-all duration-200",
    "focus:border-[#7C3AED]/40 focus:ring-2 focus:ring-[#7C3AED]/10"
  ),
  textarea: cn(
    "min-h-[72px] resize-none rounded-[14px] border border-[#ECECF5] bg-white px-3 py-2 text-[13px]",
    "transition-all duration-200 placeholder:text-[#6B7280]/50",
    "focus-visible:border-[#7C3AED]/40 focus-visible:shadow-[0_0_0_2px_rgba(124,58,237,0.1)]",
    "focus-visible:outline-none"
  ),
  primaryButton: cn(
    "inline-flex h-9 items-center justify-center gap-1.5 rounded-[12px] px-4",
    "bg-[#7C3AED] text-[13px] font-semibold text-white",
    "shadow-[0_2px_8px_rgba(124,58,237,0.28)] transition-all duration-200",
    "hover:bg-[#6D28D9] disabled:pointer-events-none disabled:opacity-50"
  ),
  outlineButton: cn(
    "inline-flex h-9 items-center justify-center gap-1.5 rounded-[12px] border border-[#ECECF5]",
    "bg-white px-3.5 text-[13px] font-medium text-[#6B7280]",
    "transition-all duration-200 hover:border-[#7C3AED]/25 hover:bg-[#FAFBFF] hover:text-[#111827]"
  ),
  ghostButton: cn(
    "inline-flex h-9 items-center justify-center gap-1.5 rounded-[12px] px-3.5",
    "text-[13px] font-medium text-[#6B7280] transition-all duration-200",
    "hover:bg-[#FAFBFF] hover:text-[#111827]"
  ),
  inputError: "border-red-300 focus-visible:shadow-[0_0_0_2px_rgba(239,68,68,0.1)]",
  segmented: cn(
    "inline-flex shrink-0 rounded-[8px] border border-[#ECECF5] bg-[#FAFBFF] p-0.5"
  ),
  segmentedItem: cn(
    "rounded-[6px] px-2 py-1 text-[11px] font-medium transition-all duration-200",
    "text-[#6B7280] hover:text-[#111827]"
  ),
  segmentedItemActive: "bg-white text-[#7C3AED] shadow-sm",
  itemRow: cn(
    "grid h-14 items-center gap-2 border-b border-[#ECECF5]/80 px-1",
    "grid-cols-[minmax(140px,2fr)_56px_80px_minmax(100px,1fr)_72px_72px_32px]",
    "transition-colors duration-200 hover:bg-[#FAFBFF]/60"
  ),
  itemHeader: cn(
    "grid gap-2 px-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#6B7280]",
    "grid-cols-[minmax(140px,2fr)_56px_80px_minmax(100px,1fr)_72px_72px_32px]"
  ),
  summaryPanel: "sticky top-0 flex flex-col",
} as const;

export const GST_OPTIONS = [
  { value: 0, label: "None" },
  { value: 0.05, label: "5%" },
  { value: 0.12, label: "12%" },
  { value: 0.18, label: "18%" },
  { value: 0.28, label: "28%" },
] as const;
