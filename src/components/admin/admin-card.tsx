import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function AdminCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[20px] border border-dashboard-border bg-dashboard-card shadow-dashboard-card",
        className
      )}
    >
      {children}
    </div>
  );
}

export function AdminCardHeader({
  title,
  description,
  icon: Icon,
  action,
  className,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 border-b border-dashboard-border/60 px-6 py-5",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-dashboard-primary/10 text-dashboard-primary">
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div>
          <h3 className="text-base font-semibold text-dashboard-text">{title}</h3>
          {description && (
            <p className="mt-0.5 text-sm text-dashboard-muted">{description}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

export function AdminCardContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("px-6 py-5", className)}>{children}</div>;
}
