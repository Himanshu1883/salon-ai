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
      className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1C103D] sm:text-3xl">
          Live Queue
        </h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          Manage walk-in queue and track real-time status · {activeCount} active
          · Est. wait: {estimatedWait} min
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled
          title="Coming soon"
          className="h-10 rounded-xl border-[#E8ECF4] bg-white text-[#6B7280]"
        >
          <Settings className="mr-1.5 h-4 w-4" />
          Queue Settings
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRefresh?.()}
          disabled={refreshing}
          className="h-10 rounded-xl border-[#E8ECF4] bg-white text-[#1C103D] hover:bg-[#F7F8FC]"
        >
          <RefreshCw
            className={`mr-1.5 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh Queue
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled
          title="Coming soon"
          className="h-10 rounded-xl border-[#E8ECF4] bg-white text-[#6B7280]"
        >
          <Monitor className="mr-1.5 h-4 w-4" />
          Display Mode
        </Button>
        {isEnterprise && (
          <Button
            asChild
            size="sm"
            className="h-10 rounded-xl bg-gradient-to-r from-[#FF2D6F] to-[#FF6B6B] px-4 text-white shadow-md shadow-[#FF2D6F]/20 hover:opacity-95"
          >
            <Link href="/check-in">
              <UserPlus className="mr-1.5 h-4 w-4" />
              Add Walk-in
            </Link>
          </Button>
        )}
      </div>
    </motion.div>
  );
}
