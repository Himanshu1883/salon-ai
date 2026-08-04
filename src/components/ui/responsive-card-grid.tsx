import { cn } from "@/lib/utils";

type ResponsiveCardGridProps = {
  children: React.ReactNode;
  /** 1 col mobile, 2 tablet, 3 laptop, 4 desktop */
  cols?: "2-4" | "1-2-3-4" | "1-2-2-3";
  className?: string;
};

const COL_CLASSES = {
  "2-4": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  "1-2-3-4": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4",
  "1-2-2-3": "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3",
} as const;

export function ResponsiveCardGrid({
  children,
  cols = "1-2-3-4",
  className,
}: ResponsiveCardGridProps) {
  return (
    <div className={cn("grid gap-4", COL_CLASSES[cols], className)}>
      {children}
    </div>
  );
}
