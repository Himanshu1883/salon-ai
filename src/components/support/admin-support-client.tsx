"use client";

import { useCallback, useEffect, useState } from "react";
import { HeadphonesIcon } from "lucide-react";
import { AdminSupportConversationList } from "@/components/support/admin-support-conversation-list";
import { AdminSupportWorkspace } from "@/components/support/admin-support-workspace";
import { AdminSupportContextSidebar } from "@/components/support/admin-support-context-sidebar";
import {
  getAdminSupportConversations,
  getAdminSupportMessages,
  sendAdminSupportMessage,
  updateAdminSupportConversationStatus,
  type SupportConversationDetail,
  type SupportConversationStatus,
  type SupportConversationSummary,
  type SupportStatusCounts,
} from "@/actions/support-chat";

type AdminSupportClientProps = {
  initialConversations: SupportConversationSummary[];
  initialSelectedId: string | null;
  initialDetail: SupportConversationDetail | null;
  initialStatusCounts: SupportStatusCounts;
};

export function AdminSupportClient({
  initialConversations,
  initialSelectedId,
  initialDetail,
  initialStatusCounts,
}: AdminSupportClientProps) {
  const [conversations, setConversations] =
    useState(initialConversations);
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId);
  const [detail, setDetail] = useState<SupportConversationDetail | null>(
    initialDetail
  );
  const [statusCounts, setStatusCounts] = useState(initialStatusCounts);
  const [statusFilter, setStatusFilter] = useState<
    SupportConversationStatus | "ALL"
  >("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingThread, setLoadingThread] = useState(false);

  const refreshConversations = useCallback(
    async (filter: SupportConversationStatus | "ALL" = statusFilter) => {
      const next = await getAdminSupportConversations(
        filter === "ALL" ? undefined : filter
      );
      setConversations(next);
      return next;
    },
    [statusFilter]
  );

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
      setDetail(thread);
      await refreshConversations();
    } finally {
      setLoadingThread(false);
    }
  }

  async function handleStatusFilterChange(
    filter: SupportConversationStatus | "ALL"
  ) {
    setStatusFilter(filter);
    setLoadingThread(true);
    try {
      const next = await getAdminSupportConversations(
        filter === "ALL" ? undefined : filter
      );
      setConversations(next);

      if (selectedId && !next.some((item) => item.id === selectedId)) {
        const first = next[0] ?? null;
        if (first) {
          await selectConversation(first.id);
        } else {
          setSelectedId(null);
          setDetail(null);
        }
      }
    } finally {
      setLoadingThread(false);
    }
  }

  const refreshMessages = useCallback(async () => {
    if (!selectedId) return [];
    const thread = await getAdminSupportMessages(selectedId);
    setDetail(thread);
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

  async function handleStatusChange(status: SupportConversationStatus) {
    if (!selectedId || !detail) return;
    await updateAdminSupportConversationStatus(selectedId, status);
    const thread = await getAdminSupportMessages(selectedId);
    setDetail(thread);
    await refreshConversations();
    setStatusCounts((current) => {
      const prev = detail.status;
      if (prev === status) return current;
      const next = { ...current };
      if (prev === "OPEN") next.open -= 1;
      if (prev === "WAITING") next.waiting -= 1;
      if (prev === "CLOSED") next.closed -= 1;
      if (status === "OPEN") next.open += 1;
      if (status === "WAITING") next.waiting += 1;
      if (status === "CLOSED") next.closed += 1;
      return next;
    });
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <div className="mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-lg shadow-violet-500/25">
            <HeadphonesIcon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-dashboard-text sm:text-2xl">
              Chat Support
            </h1>
            <p className="text-sm text-dashboard-muted">
              Glow Desk customer support — manage salon conversations in one place.
            </p>
          </div>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[300px_minmax(0,1fr)_280px] xl:grid-cols-[320px_minmax(0,1fr)_300px]">
        <div className="min-h-[420px] lg:min-h-0">
          <AdminSupportConversationList
            conversations={conversations}
            selectedId={selectedId}
            statusFilter={statusFilter}
            statusCounts={statusCounts}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onStatusFilterChange={(filter) => void handleStatusFilterChange(filter)}
            onSelect={(id) => void selectConversation(id)}
          />
        </div>

        <div className="min-h-[480px] lg:min-h-0">
          <AdminSupportWorkspace
            detail={detail}
            loading={loadingThread}
            onSend={sendMessage}
            onRefresh={refreshMessages}
          />
        </div>

        <div className="min-h-[320px] lg:min-h-0 lg:max-h-none">
          <AdminSupportContextSidebar
            detail={detail}
            onStatusChange={(status) => void handleStatusChange(status)}
          />
        </div>
      </div>
    </div>
  );
}
