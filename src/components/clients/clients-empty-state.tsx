"use client";

import { motion } from "framer-motion";
import { Plus, Upload, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

type ClientsEmptyStateProps = {
  isLoading?: boolean;
  onAdd?: () => void;
  onImport?: () => void;
};

export function ClientsEmptyState({
  isLoading,
  onAdd,
  onImport,
}: ClientsEmptyStateProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#6C3BFF] border-t-transparent" />
        <p className="mt-4 text-sm text-[#6B7280]">Loading clients…</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center px-6 py-16 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EDE9FE]">
        <Users className="h-8 w-8 text-[#6C3BFF]" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-[#1C103D]">
        No clients found
      </h3>
      <p className="mt-1 max-w-sm text-sm text-[#6B7280]">
        Add your first client or import an existing list to get started.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {onAdd && (
          <Button
            className="rounded-xl bg-gradient-to-r from-[#6C3BFF] to-[#8B5CF6]"
            onClick={onAdd}
          >
            <Plus className="h-4 w-4" />
            Add Client
          </Button>
        )}
        {onImport && (
          <Button variant="outline" className="rounded-xl" onClick={onImport}>
            <Upload className="h-4 w-4" />
            Import Clients
          </Button>
        )}
      </div>
    </motion.div>
  );
}
