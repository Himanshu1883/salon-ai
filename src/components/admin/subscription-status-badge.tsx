import { type SubscriptionStatus } from "@/lib/subscription";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<
  SubscriptionStatus,
  { label: string; variant: "default" | "success" | "warning" | "destructive"; className?: string }
> = {
  trial: { label: "Trial", variant: "default", className: "bg-blue-100 text-blue-800 border-blue-200" },
  active: { label: "Active (Monthly)", variant: "success" },
  past_due: { label: "Past Due", variant: "warning" },
  suspended: { label: "Suspended", variant: "destructive" },
};

export function getSubscriptionStatusLabel(status: string) {
  return STATUS_CONFIG[status as SubscriptionStatus]?.label ?? status;
}

export function SubscriptionStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status as SubscriptionStatus] ?? {
    label: status,
    variant: "secondary" as const,
  };

  return (
    <Badge
      variant={config.variant === "default" ? "outline" : config.variant}
      className={cn(config.className)}
    >
      {config.label}
    </Badge>
  );
}

export function PlatformInvoiceStatusBadge({ status }: { status: string }) {
  const variant =
    status === "paid"
      ? "success"
      : status === "overdue"
        ? "destructive"
        : status === "sent"
          ? "warning"
          : "secondary";

  return (
    <Badge variant={variant}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
