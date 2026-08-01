"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Building2, MessageSquare } from "lucide-react";
import { SupportChatPanel } from "@/components/support/support-chat-panel";
import {
  getAdminSupportConversations,
  getAdminSupportMessages,
  sendAdminSupportMessage,
  type SupportConversationSummary,
  type SupportMessageDTO,
} from "@/actions/support-chat";
import { AdminCard, AdminCardContent, AdminCardHeader } from "@/components/admin/admin-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type AdminSupportClientProps = {
  initialConversations: SupportConversationSummary[];
  initialSelectedId: string | null;
  initialMessages: SupportMessageDTO[];
  initialSalonName: string | null;
};

export function AdminSupportClient({
  initialConversations,
  initialSelectedId,
  initialMessages,
  initialSalonName,
}: AdminSupportClientProps) {
  const [conversations, setConversations] =
    useState(initialConversations);
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId);
  const [messages, setMessages] = useState(initialMessages);
  const [salonName, setSalonName] = useState(initialSalonName);
  const [loadingThread, setLoadingThread] = useState(false);

  const refreshConversations = useCallback(async () => {
    const next = await getAdminSupportConversations();
    setConversations(next);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void refreshConversations();
    }, 5000);
    return () => window.clearInterval(interval);
  }, [refreshConversations]);

  async function selectConversation(conversationId: string) {
    setSelectedId(conversationId);
    setLoadingThread(true);
    try {
      const thread = await getAdminSupportMessages(conversationId);
      setMessages(thread.messages);
      setSalonName(thread.salonName);
      await refreshConversations();
    } finally {
      setLoadingThread(false);
    }
  }

  const refreshMessages = useCallback(async () => {
    if (!selectedId) return [];
    const thread = await getAdminSupportMessages(selectedId);
    setMessages(thread.messages);
    await refreshConversations();
    return thread.messages;
  }, [selectedId, refreshConversations]);

  const sendMessage = useCallback(
    async (body: string) => {
      if (!selectedId) throw new Error("Select a conversation first");
      const message = await sendAdminSupportMessage(selectedId, body);
      await refreshConversations();
      return message;
    },
    [selectedId, refreshConversations]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-dashboard-text sm:text-3xl">
          Customer Support
        </h1>
        <p className="mt-2 text-sm text-dashboard-muted">
          Reply to salon support requests from one inbox.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <AdminCard className="overflow-hidden">
          <AdminCardHeader
            title="Conversations"
            description={`${conversations.length} salon thread${conversations.length === 1 ? "" : "s"}`}
            icon={MessageSquare}
          />
          <AdminCardContent className="p-0">
            {conversations.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-dashboard-muted">
                No support conversations yet. They appear here when a salon sends a message.
              </div>
            ) : (
              <ul className="max-h-[560px] divide-y divide-dashboard-border overflow-y-auto">
                {conversations.map((conversation) => {
                  const active = conversation.id === selectedId;
                  return (
                    <li key={conversation.id}>
                      <button
                        type="button"
                        onClick={() => void selectConversation(conversation.id)}
                        className={cn(
                          "flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50",
                          active && "bg-dashboard-primary/5"
                        )}
                      >
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-dashboard-primary">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-semibold text-dashboard-text">
                              {conversation.salonName}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <Badge className="h-5 min-w-5 shrink-0 justify-center rounded-full bg-dashboard-primary px-1.5 text-[10px]">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <p className="truncate text-xs text-dashboard-muted">
                            {conversation.lastMessagePreview ?? "No messages yet"}
                          </p>
                          <p className="mt-1 text-[10px] text-dashboard-muted">
                            {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </AdminCardContent>
        </AdminCard>

        <AdminCard className="overflow-hidden">
          <AdminCardHeader
            title={salonName ?? "Select a conversation"}
            description={
              selectedId
                ? "Messages with this salon"
                : "Choose a salon from the list to view and reply"
            }
            icon={MessageSquare}
          />
          <AdminCardContent className="p-0">
            {!selectedId ? (
              <div className="flex min-h-[420px] items-center justify-center px-6 text-center text-sm text-dashboard-muted">
                Select a conversation to start chatting.
              </div>
            ) : loadingThread ? (
              <div className="flex min-h-[420px] items-center justify-center text-sm text-dashboard-muted">
                Loading messages…
              </div>
            ) : (
              <SupportChatPanel
                messages={messages}
                viewer="admin"
                onSend={sendMessage}
                onRefresh={refreshMessages}
                emptyHint="No messages in this thread yet."
              />
            )}
          </AdminCardContent>
        </AdminCard>
      </div>
    </div>
  );
}
