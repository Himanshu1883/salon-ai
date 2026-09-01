"use client";

import { cn } from "@/lib/utils";
import type { QueueTab } from "./types";
import { QUEUE_TABS } from "./types";
import { getTabCount } from "./queue-utils";
import type {
  AppointmentSnapshot,
  CompletedEntry,
  QueueEntry,
} from "./types";

type QueueTabsProps = {
  activeTab: QueueTab;
  onTabChange: (tab: QueueTab) => void;
  tabCounts?: Record<QueueTab, number>;
  entries?: QueueEntry[];
  completedEntries?: CompletedEntry[];
  appointmentsToday?: AppointmentSnapshot[];
};

export function QueueTabs({
  activeTab,
  onTabChange,
  tabCounts,
  entries,
  completedEntries,
  appointmentsToday,
}: QueueTabsProps) {
  return (
    <div className="min-w-0 overflow-x-auto overscroll-x-contain border-b border-[#E8ECF4] pb-px">
      <div className="flex w-max min-w-full gap-0.5 px-1">
      {QUEUE_TABS.map((tab) => {
        const count =
          tabCounts?.[tab.id] ??
          getTabCount(
            tab.id,
            entries ?? [],
            completedEntries ?? [],
            appointmentsToday ?? []
          );
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative shrink-0 px-2.5 py-2 text-xs font-medium transition-colors sm:px-4 sm:py-3 sm:text-sm",
              active
                ? "text-[#6C3BFF]"
                : "text-[#6B7280] hover:text-[#1C103D]"
            )}
          >
            {tab.label}
            <span
              className={cn(
                "ml-1.5 rounded-full px-1.5 py-0.5 text-xs",
                active ? "bg-[#EDE9FE] text-[#6C3BFF]" : "bg-[#F7F8FC] text-[#9CA3AF]"
              )}
            >
              {count}
            </span>
            {active && (
              <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-[#6C3BFF]" />
            )}
          </button>
          );
      })}
      </div>
    </div>
  );
}
