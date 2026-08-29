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
    <div className="flex gap-1 overflow-x-auto border-b border-[#E8ECF4] pb-px">
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
              "relative shrink-0 px-4 py-3 text-sm font-medium transition-colors",
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
  );
}
