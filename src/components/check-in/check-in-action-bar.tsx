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
};

export function CheckInActionBar({
  loading,
  canSubmit,
  onCancel,
  onSaveDraft,
  onCheckInAndStart,
}: CheckInActionBarProps) {
  return (
    <div className="sticky bottom-0 z-30 -mx-4 border-t border-dashboard-border/60 bg-white/90 px-4 py-4 shadow-[0_-8px_32px_rgba(91,33,182,0.08)] backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="h-11 rounded-xl border-dashboard-border bg-white/80 px-4 backdrop-blur-sm hover:bg-violet-50/80"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onSaveDraft}
            className="h-11 rounded-xl border-dashboard-border bg-white/80 px-4 backdrop-blur-sm hover:bg-violet-50/80"
          >
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">Save Draft</span>
            <span className="sm:hidden">Draft</span>
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={!canSubmit || loading}
            onClick={onCheckInAndStart}
            className="h-11 rounded-xl border-violet-300/60 bg-white/80 px-4 text-dashboard-primary backdrop-blur-sm hover:bg-violet-50/80"
            title="Assign stylist after check-in from the queue page"
          >
            <Play className="h-4 w-4" />
            <span className="hidden sm:inline">Check-in & Start</span>
            <span className="sm:hidden">Start</span>
          </Button>
          <Button
            type="submit"
            disabled={loading || !canSubmit}
            className={cn(
              "h-11 min-w-[140px] rounded-xl border-0 bg-gradient-to-r from-dashboard-primary to-violet-500 px-5 text-white shadow-lg shadow-violet-500/30 sm:min-w-[160px]",
              "hover:from-dashboard-primary-hover hover:to-violet-600 disabled:opacity-50"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking in...
              </>
            ) : (
              <>
                Add to Queue
                <span className="ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </>
            )}
          </Button>
        </div>
      </div>
      <p className="mt-2 hidden text-center text-[10px] text-dashboard-muted/70 sm:block">
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
