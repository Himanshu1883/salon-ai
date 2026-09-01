"use client";

import { ArrowRight, Loader2, Play, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CheckInActionBarProps = {
  loading: boolean;
  canSubmit: boolean;
  onCancel: () => void;
  onSaveDraft: () => void;
  onCheckInAndStart: () => void;
  formId?: string;
};

export function CheckInActionBar({
  loading,
  canSubmit,
  onCancel,
  onSaveDraft,
  onCheckInAndStart,
  formId,
}: CheckInActionBarProps) {
  return (
    <div
      className={cn(
        "z-30 border-t border-dashboard-border/60 bg-white/95 px-[var(--page-gutter)] py-3 shadow-[0_-8px_32px_rgba(91,33,182,0.08)] backdrop-blur-md lg:py-4",
        "fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] lg:sticky lg:bottom-0 lg:-mx-[var(--page-gutter)]"
      )}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="h-11 rounded-xl border-dashboard-border bg-white/80 px-3 text-sm backdrop-blur-sm hover:bg-violet-50/80 sm:px-4"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onSaveDraft}
            className="h-11 rounded-xl border-dashboard-border bg-white/80 px-3 text-sm backdrop-blur-sm hover:bg-violet-50/80 sm:px-4"
          >
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">Save Draft</span>
            <span className="sm:hidden">Draft</span>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <Button
            type="button"
            variant="outline"
            disabled={!canSubmit || loading}
            onClick={onCheckInAndStart}
            className="h-11 rounded-xl border-violet-300/60 bg-white/80 px-3 text-sm text-dashboard-primary backdrop-blur-sm hover:bg-violet-50/80 sm:px-4"
            title="Check in and start the service now"
          >
            <Play className="h-4 w-4" />
            <span className="hidden sm:inline">Check-in & Start</span>
            <span className="sm:hidden">Start</span>
          </Button>
          <Button
            type="submit"
            form={formId}
            disabled={loading || !canSubmit}
            className={cn(
              "h-11 rounded-xl border-0 bg-gradient-to-r from-dashboard-primary to-violet-500 px-3 text-sm text-white shadow-lg shadow-violet-500/30 sm:min-w-[160px] sm:px-5",
              "hover:from-dashboard-primary-hover hover:to-violet-600 disabled:opacity-50"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="truncate">Checking in...</span>
              </>
            ) : (
              <>
                <span className="truncate">Add to Queue</span>
                <span className="ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 sm:ml-2">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </>
            )}
          </Button>
        </div>
      </div>
      <p className="mt-2 hidden text-center text-[10px] text-dashboard-muted/70 lg:block">
        Press{" "}
        <kbd className="rounded-md bg-violet-50 px-1.5 py-0.5 font-mono text-dashboard-muted">
          ⌘
        </kbd>
        +
        <kbd className="rounded-md bg-violet-50 px-1.5 py-0.5 font-mono text-dashboard-muted">
          Enter
        </kbd>{" "}
        to add to queue
      </p>
    </div>
  );
}
