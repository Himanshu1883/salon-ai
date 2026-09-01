"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Monitor,
  RefreshCw,
  Settings,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlan } from "@/components/plans/plan-provider";

type QueueHeaderProps = {
  activeCount: number;
  estimatedWait: number;
  refreshing?: boolean;
  onRefresh?: () => void;
};

export function QueueHeader({
  activeCount,
  estimatedWait,
  refreshing,
  onRefresh,
}: QueueHeaderProps) {
  const { isEnterprise } = usePlan();

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
    >
      <div className="min-w-0 flex-1">
        <h1 className="text-lg font-bold tracking-tight text-[#1C103D] sm:text-3xl">
          Live Queue
        </h1>
        <p className="mt-0.5 text-[11px] leading-snug text-[#6B7280] sm:mt-1 sm:text-sm">
          {activeCount} active · Est. wait: {estimatedWait} min
          <span className="hidden sm:inline">
            {" "}
            · Manage walk-in queue and track real-time status
          </span>
        </p>
      </div>

      <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled
          title="Queue Settings"
          className="h-8 w-8 rounded-xl border-[#E8ECF4] bg-white p-0 text-[#6B7280] sm:h-10 sm:w-auto sm:px-3 sm:text-sm"
        >
          <Settings className="h-4 w-4 sm:mr-1.5" />
          <span className="hidden sm:inline">Settings</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRefresh?.()}
          disabled={refreshing}
          title="Refresh Queue"
          className="h-8 w-8 rounded-xl border-[#E8ECF4] bg-white p-0 text-[#1C103D] hover:bg-[#F7F8FC] sm:h-10 sm:w-auto sm:px-3 sm:text-sm"
        >
          <RefreshCw
            className={`h-4 w-4 sm:mr-1.5 ${refreshing ? "animate-spin" : ""}`}
          />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled
          title="Display Mode"
          className="h-8 w-8 rounded-xl border-[#E8ECF4] bg-white p-0 text-[#6B7280] sm:h-10 sm:w-auto sm:px-3 sm:text-sm"
        >
          <Monitor className="h-4 w-4 sm:mr-1.5" />
          <span className="hidden sm:inline">Display</span>
        </Button>
        {isEnterprise && (
          <Button
            asChild
            size="sm"
            className="h-8 rounded-xl bg-gradient-to-r from-[#FF2D6F] to-[#FF6B6B] px-2.5 text-xs text-white shadow-md shadow-[#FF2D6F]/20 hover:opacity-95 sm:h-10 sm:px-4 sm:text-sm"
          >
            <Link href="/check-in">
              <UserPlus className="h-3.5 w-3.5 sm:mr-1.5 sm:h-4 sm:w-4" />
              <span>Walk-in</span>
            </Link>
          </Button>
        )}
      </div>
    </motion.div>
  );
}
