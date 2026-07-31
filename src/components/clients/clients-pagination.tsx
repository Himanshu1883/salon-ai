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
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#6B7280]">
      <p>
        Showing {start} to {end} of {totalCount} results
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1 || isPending}
          onClick={() => onPageChange(page - 1)}
          className="rounded-xl border-[#E8ECF4]"
        >
          Previous
        </Button>
        <span className="rounded-xl bg-[#F7F8FC] px-3 py-1.5 text-xs font-medium text-[#1C103D]">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages || isPending}
          onClick={() => onPageChange(page + 1)}
          className="rounded-xl border-[#E8ECF4]"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
