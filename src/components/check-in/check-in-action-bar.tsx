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
    <div className="sticky bottom-0 z-30 -mx-4 border-t border-[#E8ECF4] bg-white/95 px-4 py-4 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="h-11 rounded-2xl border-[#E5E7EB] px-4"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onSaveDraft}
            className="h-11 rounded-2xl border-[#E5E7EB] px-4"
          >
            <Save className="h-4 w-4" />
            Save Draft
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={!canSubmit || loading}
            onClick={onCheckInAndStart}
            className="h-11 rounded-2xl border-[#6C3BFF]/30 px-4 text-[#6C3BFF] hover:bg-[#EDE9FE]"
            title="Assign stylist after check-in from the queue page"
          >
            <Play className="h-4 w-4" />
            Check-in & Start
          </Button>
          <Button
            type="submit"
            disabled={loading || !canSubmit}
            className={cn(
              "h-11 min-w-[160px] rounded-2xl border-0 bg-gradient-to-r from-[#6C3BFF] to-[#8B5CF6] px-6 text-white shadow-lg shadow-[#6C3BFF]/30",
              "hover:from-[#5B2FE6] hover:to-[#7C4FE6] disabled:opacity-50"
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
      <p className="mt-2 hidden text-center text-[10px] text-[#9CA3AF] sm:block">
        Press <kbd className="rounded bg-[#F7F8FC] px-1.5 py-0.5 font-mono">⌘</kbd>+
        <kbd className="rounded bg-[#F7F8FC] px-1.5 py-0.5 font-mono">Enter</kbd> to
        add to queue
      </p>
    </div>
  );
}
