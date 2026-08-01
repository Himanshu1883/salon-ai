"use client";

import { format } from "date-fns";
import {
  Bot,
  CheckCircle2,
  Circle,
  Clock,
  Monitor,
  Phone,
  ScreenShare,
  Sparkles,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SupportConversationDetail } from "@/actions/support-chat";

const AI_SUGGESTIONS = [
  "Summarize this ticket",
  "Draft a billing reply",
  "Check appointment conflicts",
  "Suggest inventory fix",
];

type TimelineStep = {
  label: string;
  at: string | null;
  done: boolean;
  active?: boolean;
};

function buildTimeline(detail: SupportConversationDetail): TimelineStep[] {
  const inProgress =
    detail.status === "OPEN" && detail.agentJoinedAt !== null;

  return [
    {
      label: "Created",
      at: detail.createdAt,
      done: true,
    },
    {
      label: "Agent Joined",
      at: detail.agentJoinedAt,
      done: detail.agentJoinedAt !== null,
    },
    {
      label: "In Progress",
      at: inProgress ? detail.agentJoinedAt : null,
      done: inProgress || detail.status === "CLOSED",
      active: inProgress,
    },
    {
      label: detail.status === "WAITING" ? "Waiting on Customer" : "Waiting",
      at: detail.status === "WAITING" ? detail.statusChangedAt : null,
      done: detail.status === "WAITING" || detail.status === "CLOSED",
      active: detail.status === "WAITING",
    },
    {
      label: "Closed",
      at: detail.status === "CLOSED" ? detail.statusChangedAt : null,
      done: detail.status === "CLOSED",
      active: detail.status === "CLOSED",
    },
  ];
}

type AdminSupportContextSidebarProps = {
  detail: SupportConversationDetail | null;
  onStatusChange?: (status: SupportConversationDetail["status"]) => void;
};

export function AdminSupportContextSidebar({
  detail,
  onStatusChange,
}: AdminSupportContextSidebarProps) {
  const metadata = detail?.metadata;
  const timeline = detail ? buildTimeline(detail) : [];

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto">
      <div className="rounded-2xl border border-dashboard-border bg-white/95 p-4 shadow-dashboard-card">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-dashboard-text">AI Assistant</p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-violet-600">
              Beta
            </p>
          </div>
          <Sparkles className="ml-auto h-4 w-4 text-violet-400" />
        </div>
        <p className="mt-3 text-xs text-dashboard-muted">
          Quick prompts to help you respond faster.
        </p>
        <div className="mt-3 space-y-2">
          {AI_SUGGESTIONS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled={!detail}
              className="w-full rounded-xl border border-violet-100 bg-violet-50/50 px-3 py-2 text-left text-xs font-medium text-dashboard-primary transition hover:border-violet-200 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50"
              title="Coming soon"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-dashboard-border bg-white/95 p-4 shadow-dashboard-card">
        <h3 className="text-sm font-semibold text-dashboard-text">Ticket Context</h3>
        {!detail ? (
          <p className="mt-3 text-xs text-dashboard-muted">
            Select a conversation to view context.
          </p>
        ) : (
          <dl className="mt-3 space-y-2.5 text-xs">
            <div className="flex items-start gap-2">
              <Monitor className="mt-0.5 h-3.5 w-3.5 shrink-0 text-dashboard-muted" />
              <div>
                <dt className="font-medium text-dashboard-text">Current Page</dt>
                <dd className="text-dashboard-muted">
                  {metadata?.currentPage ?? "Not captured"}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-dashboard-muted" />
              <div>
                <dt className="font-medium text-dashboard-text">Salon ID</dt>
                <dd className="break-all font-mono text-[11px] text-dashboard-muted">
                  {detail.salonId}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <User className="mt-0.5 h-3.5 w-3.5 shrink-0 text-dashboard-muted" />
              <div>
                <dt className="font-medium text-dashboard-text">User Name</dt>
                <dd className="text-dashboard-muted">
                  {metadata?.userName ?? "Unknown"}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Monitor className="mt-0.5 h-3.5 w-3.5 shrink-0 text-dashboard-muted" />
              <div>
                <dt className="font-medium text-dashboard-text">Browser</dt>
                <dd className="text-dashboard-muted">
                  {metadata?.browser ?? "Not tracked"}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Monitor className="mt-0.5 h-3.5 w-3.5 shrink-0 text-dashboard-muted" />
              <div>
                <dt className="font-medium text-dashboard-text">OS</dt>
                <dd className="text-dashboard-muted">{metadata?.os ?? "Not tracked"}</dd>
              </div>
            </div>
          </dl>
        )}
      </div>

      <div className="rounded-2xl border border-dashboard-border bg-white/95 p-4 shadow-dashboard-card">
        <h3 className="text-sm font-semibold text-dashboard-text">Ticket Timeline</h3>
        {!detail ? (
          <p className="mt-3 text-xs text-dashboard-muted">No timeline yet.</p>
        ) : (
          <ol className="mt-4 space-y-0">
            {timeline.map((step, index) => (
              <li key={step.label} className="relative flex gap-3 pb-4 last:pb-0">
                {index < timeline.length - 1 && (
                  <span
                    className={cn(
                      "absolute left-[7px] top-4 h-[calc(100%-4px)] w-px",
                      step.done ? "bg-violet-200" : "bg-slate-200"
                    )}
                  />
                )}
                {step.done ? (
                  <CheckCircle2
                    className={cn(
                      "relative z-10 h-4 w-4 shrink-0",
                      step.active ? "text-dashboard-primary" : "text-emerald-500"
                    )}
                  />
                ) : (
                  <Clock className="relative z-10 h-4 w-4 shrink-0 text-slate-300" />
                )}
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-xs font-medium",
                      step.done ? "text-dashboard-text" : "text-dashboard-muted"
                    )}
                  >
                    {step.label}
                  </p>
                  {step.at && (
                    <p className="text-[10px] text-dashboard-muted">
                      {format(new Date(step.at), "MMM d, yyyy · h:mm a")}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      {detail && onStatusChange && (
        <div className="rounded-2xl border border-dashboard-border bg-white/95 p-4 shadow-dashboard-card">
          <h3 className="text-sm font-semibold text-dashboard-text">Status</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {(["OPEN", "WAITING", "CLOSED"] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => onStatusChange(status)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition",
                  detail.status === status
                    ? "bg-dashboard-primary text-white"
                    : "border border-dashboard-border text-dashboard-muted hover:border-violet-200 hover:text-dashboard-primary"
                )}
              >
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-dashboard-border bg-white/95 p-4 shadow-dashboard-card">
        <h3 className="text-sm font-semibold text-dashboard-text">Actions</h3>
        <div className="mt-3 space-y-2">
          <Button
            type="button"
            variant="outline"
            disabled
            title="Coming soon"
            className="w-full justify-start gap-2 rounded-xl border-dashboard-border"
          >
            <Phone className="h-4 w-4" />
            Schedule Call
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled
            title="Coming soon"
            className="w-full justify-start gap-2 rounded-xl border-dashboard-border"
          >
            <ScreenShare className="h-4 w-4" />
            Share Screen
          </Button>
        </div>
      </div>
    </div>
  );
}
