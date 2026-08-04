"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function InventoryMobileCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2.5 border-b border-[#ECECEC] p-4 last:border-b-0", className)}>
      {children}
    </div>
  );
}

export function InventoryMobileField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="text-xs text-[#9CA3AF]">{label}</p>
      <div className="text-sm font-medium text-[#1C103D]">{children}</div>
    </div>
  );
}

export function InventoryIconButton({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      size="icon"
      variant="ghost"
      className={cn(
        "h-10 w-10 min-h-[48px] min-w-[48px] rounded-lg sm:h-8 sm:w-8 sm:min-h-0 sm:min-w-0",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
