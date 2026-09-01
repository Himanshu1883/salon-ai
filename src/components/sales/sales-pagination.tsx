"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SalesPaginationProps = {
  start: number;
  end: number;
  totalCount: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
};

export function SalesPagination({
  start,
  end,
  totalCount,
  page,
  totalPages,
  onPageChange,
  itemLabel = "transaction",
}: SalesPaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visiblePages = pages.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 border-t border-[#ECECEC] px-2.5 py-2.5 text-[11px] text-[#6B7280] sm:gap-3 sm:px-5 sm:py-4 sm:text-sm">
      <p className="min-w-0">
        {start}–{end} of {totalCount}
        <span className="hidden sm:inline">
          {" "}
          {itemLabel}
          {totalCount !== 1 ? "s" : ""}
        </span>
      </p>
      <div className="flex items-center gap-0.5 sm:gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="h-7 rounded-lg border-[#ECECEC] px-2 text-xs sm:h-8 sm:px-2.5"
        >
          <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        {visiblePages.map((p, i) => {
          const prev = visiblePages[i - 1];
          const showEllipsis = prev !== undefined && p - prev > 1;
          return (
            <span key={p} className="flex items-center gap-1">
              {showEllipsis && (
                <span className="px-1 text-[#9CA3AF]">…</span>
              )}
              <button
                type="button"
                onClick={() => onPageChange(p)}
                className={cn(
                  "flex h-7 min-w-[28px] items-center justify-center rounded-lg px-1.5 text-xs font-medium transition-all duration-150 sm:h-8 sm:min-w-[32px] sm:px-2 sm:text-sm",
                  p === page
                    ? "bg-[#6C3CF0] text-white shadow-sm"
                    : "text-[#6B7280] hover:bg-[#F8F9FC]"
                )}
              >
                {p}
              </button>
            </span>
          );
        })}

        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="h-7 rounded-lg border-[#ECECEC] px-2 text-xs sm:h-8 sm:px-2.5"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
      </div>
    </div>
  );
}
