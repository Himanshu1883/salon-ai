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
    // Mobile: edge-to-edge full-screen takeover
    "fixed inset-0 z-50 flex h-[100dvh] max-h-[100dvh] w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none",
    "border-0 p-0",
    // Tablet+: centered dialog — single flex column, no outer scroll
    "sm:inset-auto sm:left-[50%] sm:top-[50%] sm:h-[88dvh] sm:max-h-[88dvh] sm:w-[min(95vw,100%)] sm:max-w-none sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-[18px] sm:border sm:border-[#ECECF5]",
    // Laptop / desktop width caps
    "lg:max-w-[1200px] xl:max-w-[1400px] 2xl:max-w-[1700px]",
    "bg-white",
    "shadow-[0_20px_60px_-12px_rgba(124,58,237,0.16),0_6px_24px_rgba(17,24,39,0.06)]"
  ),
  header: cn(
    "z-20 flex shrink-0 items-center border-b border-[#ECECF5] bg-white/95 backdrop-blur-md pt-safe",
    "h-14 px-3 sm:h-16 sm:px-4 lg:h-[68px] lg:px-5"
  ),
  footer: cn(
    "z-20 shrink-0 border-t border-[#ECECF5] bg-white/95 backdrop-blur-md",
    "px-3 py-2.5 sm:px-4 sm:py-3 lg:px-5",
    "pb-[max(0.625rem,env(safe-area-inset-bottom))]"
  ),
  section: "pb-3 sm:pb-4",
  sectionTitle:
    "mb-2 text-[12px] font-semibold tracking-tight text-[#111827] sm:mb-2.5 sm:text-[13px]",
  sectionDivider: "mb-3 border-b border-[#ECECF5] sm:mb-4",
  label: "mb-1 block text-[11px] font-medium text-[#6B7280]",
  input: cn(
    "h-12 rounded-[14px] border border-[#ECECF5] bg-white text-base text-[#111827] sm:h-10 sm:text-[13px] md:h-9",
    "transition-all duration-200 placeholder:text-[#6B7280]/50",
    "focus-visible:border-[#7C3AED]/40 focus-visible:shadow-[0_0_0_2px_rgba(124,58,237,0.1)]",
    "focus-visible:outline-none"
  ),
  selectTrigger: cn(
    "h-12 rounded-[14px] border border-[#ECECF5] bg-white text-base sm:h-10 sm:text-[13px] md:h-9",
    "transition-all duration-200",
    "focus:border-[#7C3AED]/40 focus:ring-2 focus:ring-[#7C3AED]/10"
  ),
  textarea: cn(
    "min-h-[88px] resize-none rounded-[14px] border border-[#ECECF5] bg-white px-3 py-2.5 text-base sm:min-h-[72px] sm:py-2 sm:text-[13px]",
    "transition-all duration-200 placeholder:text-[#6B7280]/50",
    "focus-visible:border-[#7C3AED]/40 focus-visible:shadow-[0_0_0_2px_rgba(124,58,237,0.1)]",
    "focus-visible:outline-none"
  ),
  primaryButton: cn(
    "inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[12px] px-4 sm:min-h-9",
    "bg-[#7C3AED] text-[13px] font-semibold text-white",
    "shadow-[0_2px_8px_rgba(124,58,237,0.28)] transition-all duration-200",
    "hover:bg-[#6D28D9] disabled:pointer-events-none disabled:opacity-50"
  ),
  outlineButton: cn(
    "inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[12px] border border-[#ECECF5] sm:min-h-9",
    "bg-white px-3.5 text-[13px] font-medium text-[#6B7280]",
    "transition-all duration-200 hover:border-[#7C3AED]/25 hover:bg-[#FAFBFF] hover:text-[#111827]"
  ),
  ghostButton: cn(
    "inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-[12px] px-3.5 sm:min-h-9",
    "text-[13px] font-medium text-[#6B7280] transition-all duration-200",
    "hover:bg-[#FAFBFF] hover:text-[#111827]"
  ),
  inputError: "border-red-300 focus-visible:shadow-[0_0_0_2px_rgba(239,68,68,0.1)]",
  segmented: cn(
    "inline-flex shrink-0 rounded-[8px] border border-[#ECECF5] bg-[#FAFBFF] p-0.5"
  ),
  segmentedItem: cn(
    "min-h-[36px] min-w-[36px] rounded-[6px] px-2 py-1 text-[11px] font-medium transition-all duration-200 sm:min-h-0 sm:min-w-0",
    "text-[#6B7280] hover:text-[#111827]"
  ),
  segmentedItemActive: "bg-white text-[#7C3AED] shadow-sm",
  itemRow: cn(
    "hidden items-center gap-2 border-b border-[#ECECF5]/80 px-1 md:grid md:h-14",
    "md:grid-cols-[minmax(140px,2fr)_56px_80px_minmax(100px,1fr)_72px_72px_32px]",
    "lg:grid-cols-[minmax(140px,2fr)_56px_80px_minmax(100px,1fr)_72px_72px_32px]",
    "transition-colors duration-200 hover:bg-[#FAFBFF]/60"
  ),
  itemRowNoGst: cn(
    "md:grid-cols-[minmax(140px,2fr)_56px_80px_minmax(100px,1fr)_72px_32px]",
    "lg:grid-cols-[minmax(140px,2fr)_56px_80px_minmax(100px,1fr)_72px_32px]"
  ),
  itemHeader: cn(
    "hidden gap-2 px-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#6B7280] lg:grid",
    "lg:grid-cols-[minmax(140px,2fr)_56px_80px_minmax(100px,1fr)_72px_72px_32px]"
  ),
  itemHeaderNoGst: cn(
    "lg:grid-cols-[minmax(140px,2fr)_56px_80px_minmax(100px,1fr)_72px_32px]"
  ),
  itemCard: cn(
    "space-y-3 border-b border-[#ECECF5]/80 p-3.5 md:hidden",
    "transition-colors duration-200"
  ),
  summaryPanel: "flex h-full min-h-0 flex-col",
  summaryScroll: "min-h-0 flex-1 overflow-y-auto overscroll-contain",
  summaryActions: "shrink-0 border-t border-[#ECECF5] bg-white pt-3",
} as const;

export const GST_OPTIONS = [
  { value: 0, label: "None" },
  { value: 0.05, label: "5%" },
  { value: 0.12, label: "12%" },
  { value: 0.18, label: "18%" },
  { value: 0.28, label: "28%" },
] as const;
