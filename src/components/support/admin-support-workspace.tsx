"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Calendar,
  CheckCheck,
  FileText,
  Loader2,
  Paperclip,
  Send,
  Settings,
  Smile,
  Users,
  BarChart3,
  Package,
  MessageCircle,
  CreditCard,
  Code,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { salonPath } from "@/lib/salon-paths";
import type {
  SupportConversationDetail,
  SupportMessageDTO,
} from "@/actions/support-chat";

const QUICK_ACTIONS = [
  { key: "billing", label: "Billing", icon: CreditCard, path: "/settings/billing" },
  { key: "appointments", label: "Appointment", icon: Calendar, path: "/sales/appointments" },
  { key: "inventory", label: "Inventory", icon: Package, path: "/inventory" },
  { key: "whatsapp", label: "WhatsApp", icon: MessageCircle, path: "/settings/whatsapp" },
  { key: "staff", label: "Staff", icon: Users, path: "/team/members" },
  { key: "reports", label: "Reports", icon: BarChart3, path: "/reports" },
  { key: "settings", label: "Settings", icon: Settings, path: "/settings/salon" },
  { key: "api", label: "API", icon: Code, path: "/settings/salon" },
] as const;

const FOOTER_LINKS = [
  { label: "Knowledge Base", href: "https://docs.glowdesk.app" },
  { label: "Video Guides", href: "https://docs.glowdesk.app/guides" },
  { label: "System Status", href: "https://status.glowdesk.app" },
  { label: "Community", href: "https://community.glowdesk.app" },
];

function statusBadgeVariant(status: SupportConversationDetail["status"]) {
  switch (status) {
    case "OPEN":
      return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100";
    case "WAITING":
      return "bg-amber-100 text-amber-700 hover:bg-amber-100";
    case "CLOSED":
      return "bg-slate-100 text-slate-600 hover:bg-slate-100";
  }
}

function priorityLabel(priority: SupportConversationDetail["priority"]) {
  return priority.charAt(0) + priority.slice(1).toLowerCase();
}

type AdminSupportWorkspaceProps = {
  detail: SupportConversationDetail | null;
  loading: boolean;
  onSend: (body: string) => Promise<SupportMessageDTO>;
  onRefresh: () => Promise<SupportMessageDTO[]>;
};

export function AdminSupportWorkspace({
  detail,
  loading,
  onSend,
  onRefresh,
}: AdminSupportWorkspaceProps) {
  const [messages, setMessages] = useState<SupportMessageDTO[]>(detail?.messages ?? []);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(detail?.messages ?? []);
  }, [detail?.messages, detail?.conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const refreshMessages = useCallback(async () => {
    if (!detail) return;
    try {
      const next = await onRefresh();
      setMessages(next);
    } catch {
      // polling failures are non-fatal
    }
  }, [detail, onRefresh]);

  useEffect(() => {
    if (!detail) return;
    const interval = window.setInterval(() => {
      void refreshMessages();
    }, 4000);
    return () => window.clearInterval(interval);
  }, [detail, refreshMessages]);

  async function handleSend(event: React.FormEvent) {
    event.preventDefault();
    const body = draft.trim();
    if (!body || sending || !detail) return;

    setSending(true);
    setError(null);
    try {
      const message = await onSend(body);
      setDraft("");
      setMessages((current) => [...current, message]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  if (!detail && !loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashboard-border bg-white/95 p-8 text-center shadow-dashboard-card">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-dashboard-primary">
          <MessageCircle className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-dashboard-text">
          Select a conversation
        </h3>
        <p className="mt-1 max-w-sm text-sm text-dashboard-muted">
          Choose a salon thread from the list to view messages and reply.
        </p>
      </div>
    );
  }

  if (loading || !detail) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-dashboard-border bg-white/95 shadow-dashboard-card">
        <Loader2 className="h-6 w-6 animate-spin text-dashboard-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-dashboard-border bg-white/95 shadow-dashboard-card">
      <div className="border-b border-dashboard-border/60 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-dashboard-text">
                {detail.salonName}
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Online
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-dashboard-muted">
              <span>
                <span className="font-medium text-dashboard-text">Ticket ID:</span>{" "}
                {detail.ticketNumber ?? detail.conversationId.slice(0, 8)}
              </span>
              <span>
                <span className="font-medium text-dashboard-text">Priority:</span>{" "}
                {priorityLabel(detail.priority)}
              </span>
              <span>
                <span className="font-medium text-dashboard-text">Created:</span>{" "}
                {format(new Date(detail.createdAt), "MMM d, yyyy")}
              </span>
              <Badge className={cn("text-[10px]", statusBadgeVariant(detail.status))}>
                {detail.status.charAt(0) + detail.status.slice(1).toLowerCase()}
              </Badge>
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK_ACTIONS.map(({ key, label, icon: Icon, path }) => (
            <Link
              key={key}
              href={salonPath(detail.salonSlug, path)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50/80 px-3 py-1 text-xs font-medium text-dashboard-primary transition hover:border-violet-300 hover:bg-violet-100"
            >
              <Icon className="h-3 w-3" />
              {label}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-slate-50/50 to-white px-5 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full min-h-[200px] items-center justify-center text-sm text-dashboard-muted">
            No messages in this thread yet.
          </div>
        ) : (
          messages.map((message) => {
            const isAdmin = message.senderType === "ADMIN";

            return (
              <div
                key={message.id}
                className={cn("flex", isAdmin ? "justify-start" : "justify-end")}
              >
                <div
                  className={cn(
                    "max-w-[78%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                    isAdmin
                      ? "rounded-bl-md bg-violet-100 text-dashboard-text"
                      : "rounded-br-md bg-gradient-to-br from-violet-700 to-purple-800 text-white"
                  )}
                >
                  {!isAdmin && (
                    <p className="mb-1 text-[11px] font-semibold text-white/80">
                      {message.senderName}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap break-words">{message.body}</p>
                  <div
                    className={cn(
                      "mt-1.5 flex items-center gap-1.5 text-[10px]",
                      isAdmin ? "text-dashboard-muted" : "text-white/70"
                    )}
                  >
                    <span>{format(new Date(message.createdAt), "MMM d, h:mm a")}</span>
                    {isAdmin && <CheckCheck className="h-3 w-3" />}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="border-t border-dashboard-border/60 bg-slate-50/60 px-5 py-4"
      >
        {error && (
          <p className="mb-2 text-xs font-medium text-red-600">{error}</p>
        )}
        <div className="rounded-xl border border-dashboard-border bg-white p-2 shadow-sm">
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Type your reply..."
            rows={2}
            disabled={sending}
            className="min-h-[44px] resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void handleSend(event);
              }
            }}
          />
          <div className="flex items-center justify-between gap-2 px-1 pt-1">
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="rounded-lg p-2 text-dashboard-muted transition hover:bg-violet-50 hover:text-dashboard-primary"
                title="Emoji"
                aria-label="Insert emoji"
              >
                <Smile className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="rounded-lg p-2 text-dashboard-muted transition hover:bg-violet-50 hover:text-dashboard-primary"
                title="Attach file"
                aria-label="Attach file"
              >
                <Paperclip className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="rounded-lg p-2 text-dashboard-muted transition hover:bg-violet-50 hover:text-dashboard-primary"
                title="Insert template"
                aria-label="Insert template"
              >
                <FileText className="h-4 w-4" />
              </button>
            </div>
            <Button
              type="submit"
              disabled={sending || !draft.trim()}
              className="rounded-xl bg-dashboard-primary px-4 hover:bg-dashboard-primary-hover"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="mr-1.5 h-4 w-4" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-dashboard-muted">
          {FOOTER_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-dashboard-primary"
            >
              {link.label}
            </a>
          ))}
        </div>
      </form>
    </div>
  );
}
