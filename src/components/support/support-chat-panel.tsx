"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { SupportMessageDTO } from "@/actions/support-chat";

type SupportChatPanelProps = {
  messages: SupportMessageDTO[];
  viewer: "salon" | "admin";
  onSend: (body: string) => Promise<SupportMessageDTO>;
  onRefresh: () => Promise<SupportMessageDTO[]>;
  emptyHint?: string;
  disabled?: boolean;
  pollIntervalMs?: number;
};

export function SupportChatPanel({
  messages: initialMessages,
  viewer,
  onSend,
  onRefresh,
  emptyHint = "Send a message to start the conversation.",
  disabled = false,
  pollIntervalMs = 4000,
}: SupportChatPanelProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const refreshMessages = useCallback(async () => {
    try {
      const next = await onRefresh();
      setMessages(next);
    } catch {
      // Polling failures are non-fatal; keep showing the last loaded thread.
    }
  }, [onRefresh]);

  useEffect(() => {
    if (disabled) return;
    const interval = window.setInterval(() => {
      void refreshMessages();
    }, pollIntervalMs);
    return () => window.clearInterval(interval);
  }, [disabled, pollIntervalMs, refreshMessages]);

  async function handleSend(event: React.FormEvent) {
    event.preventDefault();
    const body = draft.trim();
    if (!body || sending || disabled) return;

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

  return (
    <div className="flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-dashboard-border bg-white shadow-sm">
      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-5"
      >
        {messages.length === 0 ? (
          <div className="flex h-full min-h-[280px] items-center justify-center px-6 text-center">
            <p className="text-sm text-dashboard-muted">{emptyHint}</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn =
              viewer === "salon"
                ? message.senderType === "SALON"
                : message.senderType === "ADMIN";

            return (
              <div
                key={message.id}
                className={cn("flex", isOwn ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                    isOwn
                      ? viewer === "salon"
                        ? "bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white"
                        : "bg-dashboard-primary text-white"
                      : "border border-dashboard-border bg-slate-50 text-dashboard-text"
                  )}
                >
                  {!isOwn && (
                    <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide opacity-70">
                      {message.senderName}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap break-words">{message.body}</p>
                  <p
                    className={cn(
                      "mt-1.5 text-[10px]",
                      isOwn ? "text-white/70" : "text-dashboard-muted"
                    )}
                  >
                    {format(new Date(message.createdAt), "MMM d, h:mm a")}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="border-t border-dashboard-border bg-slate-50/80 p-4"
      >
        {error && (
          <p className="mb-2 text-xs font-medium text-red-600">{error}</p>
        )}
        <div className="flex gap-2">
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Type your message…"
            rows={2}
            disabled={disabled || sending}
            className="min-h-[44px] resize-none rounded-xl border-dashboard-border bg-white"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void handleSend(event);
              }
            }}
          />
          <Button
            type="submit"
            disabled={disabled || sending || !draft.trim()}
            className={cn(
              "h-auto shrink-0 rounded-xl px-4",
              viewer === "salon"
                ? "bg-violet-600 hover:bg-violet-700"
                : "bg-dashboard-primary hover:bg-dashboard-primary-hover"
            )}
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="mt-2 text-[11px] text-dashboard-muted">
          Press Enter to send, Shift+Enter for a new line.
        </p>
      </form>
    </div>
  );
}
