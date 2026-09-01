"use client";

import { Button } from "@/components/ui/button";

type ClientsPaginationProps = {
  start: number;
  end: number;
  totalCount: number;
  page: number;
  totalPages: number;
  isPending: boolean;
  onPageChange: (page: number) => void;
};

export function ClientsPagination({
  start,
  end,
  totalCount,
  page,
  totalPages,
  isPending,
  onPageChange,
}: ClientsPaginationProps) {
  return (
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 text-[11px] text-[#6B7280] sm:gap-3 sm:text-sm">
      <p className="min-w-0">
        {start}–{end} of {totalCount}
      </p>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1 || isPending}
          onClick={() => onPageChange(page - 1)}
          className="h-8 rounded-xl border-[#E8ECF4] px-2.5 text-xs sm:h-9 sm:px-3"
        >
          Prev
        </Button>
        <span className="rounded-xl bg-[#F7F8FC] px-2 py-1 text-[10px] font-medium text-[#1C103D] sm:px-3 sm:py-1.5 sm:text-xs">
          {page}/{totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages || isPending}
          onClick={() => onPageChange(page + 1)}
          className="h-8 rounded-xl border-[#E8ECF4] px-2.5 text-xs sm:h-9 sm:px-3"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
