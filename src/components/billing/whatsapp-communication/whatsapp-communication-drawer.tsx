"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  Bot,
  Check,
  Clock,
  Loader2,
  Pencil,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  buildWhatsAppMessage,
  getDemoAiSuggestions,
  getDemoTimeline,
  WHATSAPP_TEMPLATES,
} from "./templates";
import type {
  AttachmentKey,
  SendMode,
  TimelineStatus,
  WhatsAppInvoiceContext,
  WhatsAppTemplateId,
} from "./types";

type WhatsAppCommunicationDrawerProps = {
  open: boolean;
  onClose: () => void;
  context: WhatsAppInvoiceContext;
  onSent?: () => void;
};

const ATTACHMENTS: { key: AttachmentKey; label: string }[] = [
  { key: "pdf_invoice", label: "PDF Invoice" },
  { key: "payment_receipt", label: "Payment Receipt" },
  { key: "loyalty_points", label: "Loyalty Points" },
];

const AUTO_TOGGLES = [
  { id: "auto_invoice", label: "Automatically send invoice after payment" },
  { id: "auto_receipt", label: "Automatically send receipt" },
  { id: "auto_loyalty", label: "Automatically send loyalty points" },
  { id: "auto_package", label: "Automatically send package balance" },
  { id: "auto_membership", label: "Automatically send membership renewal" },
  { id: "auto_review", label: "Automatically send review request after 2 hours" },
  { id: "auto_birthday", label: "Automatically send birthday wishes" },
  { id: "auto_reminder", label: "Automatically send appointment reminder" },
] as const;

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

function statusBadge(status: TimelineStatus) {
  const map: Record<TimelineStatus, string> = {
    sent: "bg-blue-50 text-blue-700",
    delivered: "bg-emerald-50 text-emerald-700",
    read: "bg-violet-50 text-violet-700",
    pending: "bg-amber-50 text-amber-700",
    failed: "bg-red-50 text-red-700",
  };
  return map[status];
}

export function WhatsAppCommunicationDrawer({
  open,
  onClose,
  context,
  onSent,
}: WhatsAppCommunicationDrawerProps) {
  const [phone, setPhone] = useState(context.customerPhone);
  const [editingPhone, setEditingPhone] = useState(false);
  const [templateId, setTemplateId] = useState<WhatsAppTemplateId>("invoice");
  const [sendMode, setSendMode] = useState<SendMode>("now");
  const [attachments, setAttachments] = useState<Record<AttachmentKey, boolean>>({
    pdf_invoice: true,
    payment_receipt: true,
    loyalty_points: true,
  });
  const [autoSettings, setAutoSettings] = useState<Record<string, boolean>>({
    auto_invoice: true,
    auto_receipt: true,
    auto_loyalty: false,
    auto_package: false,
    auto_membership: false,
    auto_review: true,
    auto_birthday: false,
    auto_reminder: true,
  });
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (open) {
      setPhone(context.customerPhone);
      setEditingPhone(false);
      setTemplateId("invoice");
      setSendMode("now");
    }
  }, [open, context.customerPhone]);

  const invoiceUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/billing/${context.invoiceId}`
      : `/billing/${context.invoiceId}`;

  const messagePreview = useMemo(
    () => buildWhatsAppMessage(templateId, { ...context, customerPhone: phone }, invoiceUrl),
    [templateId, context, phone, invoiceUrl]
  );

  const timeline = useMemo(() => getDemoTimeline(context.staffName), [context.staffName]);
  const suggestions = useMemo(() => getDemoAiSuggestions(), []);

  async function handleSend() {
    if (!phone.trim()) {
      setToast("Add a WhatsApp number to send");
      return;
    }
    if (sendMode === "draft") {
      setToast("Message saved as draft");
      return;
    }
    if (sendMode === "schedule") {
      setToast("Message scheduled successfully");
      return;
    }

    setSending(true);
    await new Promise((r) => setTimeout(r, 900));
    const waPhone = normalizePhone(phone);
    const url = `https://wa.me/${waPhone}?text=${encodeURIComponent(messagePreview)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setSending(false);
    setToast("Opening WhatsApp…");
    onSent?.();
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px]"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-[480px] flex-col border-l border-[#E5E7EB] bg-[#F8FAFC] shadow-[-12px_0_40px_rgba(15,23,42,0.12)]"
              role="dialog"
              aria-label="WhatsApp Communication"
            >
              <header className="flex shrink-0 items-center justify-between border-b border-[#E5E7EB] bg-white/90 px-5 py-4 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#25D366]/10">
                    <Send className="h-4 w-4 text-[#25D366]" />
                  </div>
                  <h2 className="text-base font-semibold text-[#111827]">
                    WhatsApp Communication
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl p-2 text-[#6B7280] transition-colors hover:bg-[#F3F4F6]"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto px-5 py-5">
                {/* Customer */}
                <section className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
                  {phone && !editingPhone ? (
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#A855F7] text-lg font-bold text-white">
                        {context.customerName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[#111827]">{context.customerName}</p>
                        <p className="text-sm text-[#6B7280]">{phone}</p>
                        <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                          <BadgeCheck className="h-3 w-3" />
                          Verified WhatsApp
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingPhone(true)}
                        className="rounded-lg p-2 text-[#6B7280] hover:bg-[#F3F4F6]"
                        aria-label="Edit phone"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {!phone && !editingPhone ? (
                        <div className="text-center py-2">
                          <p className="text-sm font-medium text-[#111827]">
                            No WhatsApp Number Found
                          </p>
                          <button
                            type="button"
                            onClick={() => setEditingPhone(true)}
                            className="mt-2 text-sm font-semibold text-[#7C3AED]"
                          >
                            Add Number
                          </button>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-[#111827]">Phone Number</p>
                          <Input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="9876543210"
                            className="h-11 rounded-xl"
                          />
                          <button
                            type="button"
                            onClick={() => setEditingPhone(false)}
                            className="text-sm font-semibold text-[#7C3AED]"
                          >
                            Save
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </section>

                {/* Template */}
                <section className="mt-4">
                  <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                    Message Template
                  </label>
                  <Select
                    value={templateId}
                    onValueChange={(v) => setTemplateId(v as WhatsAppTemplateId)}
                  >
                    <SelectTrigger className="h-11 rounded-xl border-[#E5E7EB] bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {WHATSAPP_TEMPLATES.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </section>

                {/* Preview */}
                <section className="mt-4">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                    Message Preview
                  </p>
                  <div className="rounded-2xl border border-[#E5E7EB] bg-[#ECE5DD] p-4 shadow-inner">
                    <div className="max-w-[92%] rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-sm leading-relaxed text-[#111827] shadow-sm whitespace-pre-wrap">
                      {messagePreview}
                    </div>
                    <p className="mt-2 text-right text-[10px] text-[#6B7280]">
                      {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </section>

                {/* Attachments */}
                <section className="mt-4 rounded-2xl border border-[#E5E7EB] bg-white p-4">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                    Attachments
                  </p>
                  <div className="space-y-2">
                    {ATTACHMENTS.map((att) => (
                      <label
                        key={att.key}
                        className="flex cursor-pointer items-center justify-between rounded-xl border border-[#E5E7EB] px-3 py-2.5 transition-colors hover:bg-[#F8FAFC]"
                      >
                        <span className="text-sm font-medium text-[#374151]">{att.label}</span>
                        <input
                          type="checkbox"
                          checked={attachments[att.key]}
                          onChange={(e) =>
                            setAttachments((prev) => ({
                              ...prev,
                              [att.key]: e.target.checked,
                            }))
                          }
                          className="h-4 w-4 rounded border-[#D1D5DB] text-[#7C3AED] focus:ring-[#7C3AED]"
                        />
                      </label>
                    ))}
                  </div>
                </section>

                {/* Send options */}
                <section className="mt-4">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                    Send Options
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { id: "now", label: "Send Now", icon: Send },
                        { id: "schedule", label: "Schedule", icon: Clock },
                        { id: "draft", label: "Save Draft", icon: Pencil },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSendMode(opt.id)}
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs font-semibold transition-all",
                          sendMode === opt.id
                            ? "border-[#7C3AED] bg-violet-50 text-[#7C3AED]"
                            : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#7C3AED]/30"
                        )}
                      >
                        <opt.icon className="h-4 w-4" />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Auto communication */}
                <section className="mt-4 rounded-2xl border border-[#E5E7EB] bg-white p-4">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                    Auto Communication
                  </p>
                  <div className="space-y-3">
                    {AUTO_TOGGLES.map((toggle) => (
                      <label
                        key={toggle.id}
                        className="flex cursor-pointer items-center justify-between gap-3"
                      >
                        <span className="text-sm text-[#374151]">{toggle.label}</span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={autoSettings[toggle.id]}
                          onClick={() =>
                            setAutoSettings((prev) => ({
                              ...prev,
                              [toggle.id]: !prev[toggle.id],
                            }))
                          }
                          className={cn(
                            "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                            autoSettings[toggle.id] ? "bg-[#7C3AED]" : "bg-[#E5E7EB]"
                          )}
                        >
                          <span
                            className={cn(
                              "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                              autoSettings[toggle.id] ? "left-[22px]" : "left-0.5"
                            )}
                          />
                        </button>
                      </label>
                    ))}
                  </div>
                </section>

                {/* Timeline */}
                <section className="mt-4 rounded-2xl border border-[#E5E7EB] bg-white p-4">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                    Communication Timeline
                  </p>
                  <div className="space-y-3">
                    {timeline.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between gap-2 border-b border-[#F3F4F6] pb-3 last:border-0 last:pb-0"
                      >
                        <div>
                          <p className="flex items-center gap-1.5 text-sm font-semibold text-[#111827]">
                            <Check className="h-3.5 w-3.5 text-[#10B981]" />
                            {item.label}
                          </p>
                          <p className="mt-0.5 text-xs text-[#9CA3AF]">
                            {item.staffName} · {item.date}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={cn(
                              "inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize",
                              statusBadge(item.status)
                            )}
                          >
                            {item.status}
                          </span>
                          <p className="mt-1 text-xs text-[#6B7280]">{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* AI suggestions */}
                <section className="mt-4 pb-2">
                  <p className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#9CA3AF]">
                    <Sparkles className="h-3.5 w-3.5 text-[#7C3AED]" />
                    Smart AI Suggestions
                  </p>
                  <div className="space-y-2">
                    {suggestions.map((s) => (
                      <div
                        key={s.id}
                        className="rounded-2xl border border-[#E5E7EB] bg-white p-3.5 shadow-sm"
                      >
                        <div className="flex items-start gap-2">
                          <Bot className="mt-0.5 h-4 w-4 shrink-0 text-[#7C3AED]" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-[#111827]">{s.title}</p>
                            <p className="mt-0.5 text-xs leading-relaxed text-[#6B7280]">
                              {s.description}
                            </p>
                            <button
                              type="button"
                              className="mt-2 text-xs font-semibold text-[#7C3AED] hover:underline"
                            >
                              {s.action}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <footer className="shrink-0 border-t border-[#E5E7EB] bg-white p-4">
                <button
                  type="button"
                  disabled={sending}
                  onClick={handleSend}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] text-sm font-semibold text-white transition-all hover:bg-[#1EBE5A] disabled:opacity-70"
                >
                  {sending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      {sendMode === "now"
                        ? "Send on WhatsApp"
                        : sendMode === "schedule"
                          ? "Schedule Message"
                          : "Save Draft"}
                    </>
                  )}
                </button>
                <p className="mt-2 text-center text-xs text-[#9CA3AF]">
                  Invoice {context.invoiceNumber} · {formatCurrency(context.amount)}
                </p>
              </footer>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 rounded-2xl bg-[#111827] px-5 py-3 text-sm font-medium text-white shadow-xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
