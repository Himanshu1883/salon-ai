"use client";

type HeaderAlertBadgeProps = {
  count: number;
};

/** Bell badge count — streamed after shell renders. */
export function HeaderAlertBadge({ count }: HeaderAlertBadgeProps) {
  if (count <= 0) return null;

  return (
    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-dashboard-danger px-1 text-[10px] font-semibold text-white">
      {count > 9 ? "9+" : count}
    </span>
  );
}
