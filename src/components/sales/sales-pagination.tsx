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
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#ECECEC] px-5 py-4 text-sm text-[#6B7280]">
      <p>
        Showing {start} to {end} of {totalCount} {itemLabel}
        {totalCount !== 1 ? "s" : ""}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="h-8 rounded-lg border-[#ECECEC] px-2.5 transition-all duration-150"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
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
                  "flex h-8 min-w-[32px] items-center justify-center rounded-lg px-2 text-sm font-medium transition-all duration-150",
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
          className="h-8 rounded-lg border-[#ECECEC] px-2.5 transition-all duration-150"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
