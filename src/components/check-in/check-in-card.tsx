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
        "flex items-start justify-between gap-4 border-b border-dashboard-border/50 px-6 py-5",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-dashboard-primary">
            <Icon className="h-5 w-5" />
          </div>
        )}
        {step !== undefined && !Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-dashboard-primary to-violet-500 text-sm font-bold text-white shadow-md shadow-violet-500/25">
            {step}
          </div>
        )}
        <div>
          <h2 className="text-base font-semibold text-dashboard-text sm:text-lg">
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 text-sm text-dashboard-muted">{description}</p>
          )}
        </div>
      </div>
      {action}
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
  return <div className={cn("px-6 py-5", className)}>{children}</div>;
}
