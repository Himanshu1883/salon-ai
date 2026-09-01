"use client";

import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { QueueEntry } from "./types";

type QueueRowActionsProps = {
  entry: QueueEntry;
  loading: boolean;
  onAssign: (entry: QueueEntry) => void;
  onStart: (id: string) => void;
  onComplete: (id: string) => void;
  onCancel: (id: string) => void;
  onViewDetails: (entry: QueueEntry) => void;
};

export function QueueRowActions({
  entry,
  loading,
  onAssign,
  onStart,
  onComplete,
  onCancel,
  onViewDetails,
}: QueueRowActionsProps) {
  return (
    <div
      className="flex flex-wrap items-center justify-start gap-1.5 sm:justify-end"
      onClick={(e) => e.stopPropagation()}
    >
      {entry.status === "waiting" && (
        <Button
          size="sm"
          onClick={() => onAssign(entry)}
          disabled={loading}
          className="h-8 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-3 text-xs text-white hover:opacity-90"
        >
          Assign
        </Button>
      )}
      {entry.status === "assigned" && (
        <Button
          size="sm"
          onClick={() => onStart(entry.id)}
          disabled={loading}
          className="h-8 rounded-lg bg-gradient-to-r from-[#FF2D6F] to-[#FF6B6B] px-3 text-xs text-white hover:opacity-90"
        >
          Start
        </Button>
      )}
      {entry.status === "in_progress" && (
        <Button
          size="sm"
          onClick={() => onComplete(entry.id)}
          disabled={loading}
          className="h-8 rounded-lg bg-[#6C3BFF] px-3 text-xs text-white hover:bg-[#5B2FE0]"
        >
          Complete
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 rounded-lg p-0 text-[#6B7280]"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-xl">
          <DropdownMenuItem onClick={() => onViewDetails(entry)}>
            View details
          </DropdownMenuItem>
          {entry.status !== "completed" && (
            <DropdownMenuItem
              onClick={() => onCancel(entry.id)}
              className="text-red-600"
            >
              Cancel entry
            </DropdownMenuItem>
          )}
          <DropdownMenuItem disabled title="Coming soon">
            Send reminder
          </DropdownMenuItem>
          <DropdownMenuItem disabled title="Coming soon">
            Reorder queue
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
