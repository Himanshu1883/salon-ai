import { type SubscriptionStatus } from "@/lib/subscription";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<
  SubscriptionStatus,
  { label: string; variant: "default" | "success" | "warning" | "destructive"; className?: string; dotClassName?: string }
> = {
  trial: {
    label: "Trial",
    variant: "default",
    className: "border-blue-200/80 bg-blue-50 text-blue-700",
    dotClassName: "bg-blue-500",
  },
  active: {
    label: "Active",
    variant: "success",
    className: "border-emerald-200/80 bg-emerald-50 text-emerald-700",
    dotClassName: "bg-emerald-500",
  },
  past_due: {
    label: "Past Due",
    variant: "warning",
    className: "border-amber-200/80 bg-amber-50 text-amber-700",
    dotClassName: "bg-amber-500",
  },
  suspended: {
    label: "Suspended",
    variant: "destructive",
    className: "border-red-200/80 bg-red-50 text-red-700",
    dotClassName: "bg-red-500",
  },
};

export function getSubscriptionStatusLabel(status: string) {
  return STATUS_CONFIG[status as SubscriptionStatus]?.label ?? status;
}

function StatusBadge({
  label,
  className,
  dotClassName,
  variant,
}: {
  label: string;
  className?: string;
  dotClassName?: string;
  variant: "default" | "success" | "warning" | "destructive" | "secondary" | "outline";
}) {
  return (
    <Badge
      variant={variant === "outline" || variant === "default" ? "outline" : variant}
      className={cn("gap-1.5 px-2.5 py-1 text-xs font-semibold shadow-sm", className)}
    >
      {dotClassName && (
        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotClassName)} />
      )}
      {label}
    </Badge>
  );
}

export function SubscriptionStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status as SubscriptionStatus] ?? {
    label: status,
    variant: "secondary" as const,
  };

  return (
    <StatusBadge
      label={config.label}
      variant={config.variant === "default" ? "outline" : config.variant}
      className={config.className}
      dotClassName={config.dotClassName}
    />
  );
}

export function PlatformInvoiceStatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "secondary"; className: string; dotClassName: string }> = {
    paid: {
      label: "Paid",
      variant: "success",
      className: "border-emerald-200/80 bg-emerald-50 text-emerald-700",
      dotClassName: "bg-emerald-500",
    },
    overdue: {
      label: "Overdue",
      variant: "destructive",
      className: "border-red-200/80 bg-red-50 text-red-700",
      dotClassName: "bg-red-500",
    },
    sent: {
      label: "Sent",
      variant: "warning",
      className: "border-amber-200/80 bg-amber-50 text-amber-700",
      dotClassName: "bg-amber-500",
    },
  };

  const config = configs[status] ?? {
    label: status.charAt(0).toUpperCase() + status.slice(1),
    variant: "secondary" as const,
    className: "border-slate-200 bg-slate-50 text-slate-600",
    dotClassName: "bg-slate-400",
  };

  return (
    <StatusBadge
      label={config.label}
      variant={config.variant}
      className={config.className}
      dotClassName={config.dotClassName}
    />
  );
}
