import { cn } from "@/lib/utils";

/** V2 design tokens — premium ERP invoice modal */
export const v2 = {
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
    "flex h-[92vh] w-[92vw] max-w-[1700px] flex-col gap-0 overflow-hidden rounded-[20px]",
    "border border-[#ECECF5] bg-white p-0",
    "shadow-[0_24px_80px_-12px_rgba(124,58,237,0.18),0_8px_32px_rgba(17,24,39,0.08)]"
  ),
  header: cn(
    "sticky top-0 z-20 shrink-0 border-b border-[#ECECF5] bg-white/95 px-8 py-5 backdrop-blur-md"
  ),
  footer: cn(
    "sticky bottom-0 z-20 shrink-0 border-t border-[#ECECF5] bg-white/95 px-8 py-4 backdrop-blur-md"
  ),
  card: cn(
    "rounded-[18px] border border-[#ECECF5] bg-white p-6",
    "shadow-[0_2px_16px_rgba(124,58,237,0.04)] transition-shadow duration-200",
    "hover:shadow-[0_4px_24px_rgba(124,58,237,0.08)]"
  ),
  itemCard: cn(
    "rounded-[18px] border border-[#ECECF5] bg-white p-5",
    "transition-all duration-200 hover:border-[#7C3AED]/30 hover:shadow-[0_4px_20px_rgba(124,58,237,0.08)]"
  ),
  summaryCard: cn(
    "sticky top-0 rounded-[18px] border border-[#ECECF5] bg-white p-6",
    "shadow-[0_8px_32px_rgba(124,58,237,0.1)]"
  ),
  label: "text-sm font-medium text-[#111827]",
  sectionTitle: "text-[15px] font-semibold tracking-tight text-[#111827]",
  input: cn(
    "h-[52px] rounded-[14px] border border-[#ECECF5] bg-white text-sm text-[#111827]",
    "shadow-sm transition-all duration-200 placeholder:text-[#6B7280]/60",
    "focus-visible:border-[#7C3AED]/40 focus-visible:shadow-[0_0_0_3px_rgba(124,58,237,0.12)]",
    "focus-visible:outline-none"
  ),
  selectTrigger: cn(
    "h-[52px] rounded-[14px] border border-[#ECECF5] bg-white text-sm",
    "shadow-sm transition-all duration-200",
    "focus:border-[#7C3AED]/40 focus:ring-[3px] focus:ring-[#7C3AED]/12"
  ),
  textarea: cn(
    "min-h-[100px] resize-none rounded-[14px] border border-[#ECECF5] bg-white px-4 py-3.5 text-sm",
    "shadow-sm transition-all duration-200 placeholder:text-[#6B7280]/60",
    "focus-visible:border-[#7C3AED]/40 focus-visible:shadow-[0_0_0_3px_rgba(124,58,237,0.12)]",
    "focus-visible:outline-none"
  ),
  primaryButton: cn(
    "inline-flex h-[52px] items-center justify-center gap-2 rounded-[14px] px-6",
    "bg-[#7C3AED] text-sm font-semibold text-white",
    "shadow-[0_4px_14px_rgba(124,58,237,0.35)] transition-all duration-200",
    "hover:bg-[#6D28D9] hover:shadow-[0_6px_20px_rgba(124,58,237,0.4)]",
    "disabled:pointer-events-none disabled:opacity-50"
  ),
  outlineButton: cn(
    "inline-flex h-[52px] items-center justify-center gap-2 rounded-[14px] border border-[#ECECF5]",
    "bg-white px-5 text-sm font-medium text-[#6B7280]",
    "transition-all duration-200 hover:border-[#7C3AED]/30 hover:bg-[#FAFBFF] hover:text-[#111827]"
  ),
  ghostButton: cn(
    "inline-flex h-[52px] items-center justify-center gap-2 rounded-[14px] px-5",
    "text-sm font-medium text-[#6B7280] transition-all duration-200",
    "hover:bg-[#FAFBFF] hover:text-[#111827]"
  ),
  inputError: "border-red-300 focus-visible:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]",
  segmented: cn(
    "inline-flex rounded-[10px] border border-[#ECECF5] bg-[#FAFBFF] p-0.5"
  ),
  segmentedItem: cn(
    "rounded-[8px] px-2.5 py-1.5 text-xs font-medium transition-all duration-200",
    "text-[#6B7280] hover:text-[#111827]"
  ),
  segmentedItemActive: "bg-white text-[#7C3AED] shadow-sm",
} as const;

export const GST_OPTIONS = [
  { value: 0, label: "None" },
  { value: 0.05, label: "5%" },
  { value: 0.12, label: "12%" },
  { value: 0.18, label: "18%" },
  { value: 0.28, label: "28%" },
] as const;
