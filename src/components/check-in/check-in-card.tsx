import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function CheckInCard({
  children,
  className,
  glow = false,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[20px] border border-dashboard-border bg-dashboard-card/95 shadow-dashboard-card backdrop-blur-sm",
        glow && "ring-1 ring-violet-200/40",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CheckInCardHeader({
  title,
  description,
  icon: Icon,
  action,
  step,
  className,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  step?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-3 border-b border-dashboard-border/50 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-6 sm:py-5",
        className
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-dashboard-primary sm:h-10 sm:w-10">
            <Icon className="h-5 w-5" />
          </div>
        )}
        {step !== undefined && !Icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-dashboard-primary to-violet-500 text-sm font-bold text-white shadow-md shadow-violet-500/25 sm:h-10 sm:w-10">
            {step}
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-dashboard-text sm:text-lg">
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 text-xs text-dashboard-muted sm:text-sm">
              {description}
            </p>
          )}
        </div>
      </div>
      {action ? <div className="min-w-0 w-full sm:w-auto">{action}</div> : null}
    </div>
  );
}

export function CheckInCardContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("px-4 py-4 sm:px-6 sm:py-5", className)}>{children}</div>;
}
