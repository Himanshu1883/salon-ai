"use client";

import { formatDistanceToNow } from "date-fns";
import { Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type {
  SupportConversationStatus,
  SupportConversationSummary,
  SupportStatusCounts,
} from "@/actions/support-chat";

const STATUS_TABS: {
  key: SupportConversationStatus | "ALL";
  label: string;
  countKey: keyof SupportStatusCounts;
}[] = [
  { key: "ALL", label: "All", countKey: "all" },
  { key: "OPEN", label: "Open", countKey: "open" },
  { key: "WAITING", label: "Waiting", countKey: "waiting" },
  { key: "CLOSED", label: "Closed", countKey: "closed" },
];

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function statusDotColor(status: SupportConversationStatus) {
  switch (status) {
    case "OPEN":
      return "bg-emerald-500";
    case "WAITING":
      return "bg-amber-500";
    case "CLOSED":
      return "bg-slate-400";
  }
}

type AdminSupportConversationListProps = {
  conversations: SupportConversationSummary[];
  selectedId: string | null;
  statusFilter: SupportConversationStatus | "ALL";
  statusCounts: SupportStatusCounts;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onStatusFilterChange: (status: SupportConversationStatus | "ALL") => void;
  onSelect: (conversationId: string) => void;
};

export function AdminSupportConversationList({
  conversations,
  selectedId,
  statusFilter,
  statusCounts,
  searchQuery,
  onSearchChange,
  onStatusFilterChange,
  onSelect,
}: AdminSupportConversationListProps) {
  const filtered = conversations.filter((conversation) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      conversation.salonName.toLowerCase().includes(q) ||
      conversation.subject?.toLowerCase().includes(q) ||
      conversation.ticketNumber?.toLowerCase().includes(q) ||
      conversation.lastMessagePreview?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-dashboard-border bg-white/95 shadow-dashboard-card">
      <div className="border-b border-dashboard-border/60 px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-dashboard-text">Conversations</h2>
          <button
            type="button"
            className="rounded-lg p-1.5 text-dashboard-muted transition hover:bg-violet-50 hover:text-dashboard-primary"
            title="Filter conversations"
            aria-label="Filter conversations"
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dashboard-muted" />
          <Input
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search conversations..."
            className="h-9 rounded-xl border-dashboard-border bg-slate-50/80 pl-9 text-sm"
          />
        </div>
        <div className="mt-3 flex gap-1 overflow-x-auto pb-0.5">
          {STATUS_TABS.map((tab) => {
            const active = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => onStatusFilterChange(tab.key)}
                className={cn(
                  "shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium transition",
                  active
                    ? "bg-dashboard-primary text-white shadow-sm"
                    : "text-dashboard-muted hover:bg-violet-50 hover:text-dashboard-primary"
                )}
              >
                {tab.label}
                <span className={cn("ml-1", active ? "text-white/80" : "text-dashboard-muted")}>
                  {statusCounts[tab.countKey]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-dashboard-muted">
            {conversations.length === 0
              ? "No support conversations yet."
              : "No conversations match your search."}
          </div>
        ) : (
          <ul className="divide-y divide-dashboard-border/50">
            {filtered.map((conversation) => {
              const active = conversation.id === selectedId;
              const displayTitle =
                conversation.subject ?? conversation.salonName;

              return (
                <li key={conversation.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(conversation.id)}
                    className={cn(
                      "flex w-full items-start gap-3 px-4 py-3.5 text-left transition",
                      active
                        ? "bg-violet-50 ring-1 ring-inset ring-violet-200"
                        : "hover:bg-slate-50/80"
                    )}
                  >
                    <div className="relative shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 text-xs font-bold text-dashboard-primary">
                        {getInitials(conversation.salonName)}
                      </div>
                      <span
                        className={cn(
                          "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white",
                          statusDotColor(conversation.status)
                        )}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-dashboard-text">
                            {displayTitle}
                          </p>
                          <p className="truncate text-[11px] text-dashboard-muted">
                            {conversation.ticketNumber ?? conversation.id.slice(0, 8)}
                            {" · "}
                            {conversation.salonName}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <span className="text-[10px] text-dashboard-muted">
                            {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                              addSuffix: false,
                            })}
                          </span>
                          {conversation.unreadCount > 0 && (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-dashboard-primary px-1.5 text-[10px] font-semibold text-white">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-dashboard-muted">
                        {conversation.lastMessagePreview ?? "No messages yet"}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
