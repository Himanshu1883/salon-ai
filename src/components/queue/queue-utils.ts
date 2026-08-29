import { differenceInMinutes, isToday, isYesterday } from "date-fns";
import type { InvoicePrefill } from "@/components/billing/types";
import type {
  AppointmentSnapshot,
  CompletedEntry,
  QueueDashboardStats,
  QueueEntry,
  QueueInvoiceEntry,
  QueueTab,
} from "./types";

export function queueEntryToInvoicePrefill(entry: QueueInvoiceEntry): InvoicePrefill {
  const employeeId = entry.employeeId ?? undefined;
  return {
    customer: {
      name: entry.customer.name,
      phone: entry.customer.phone ?? "",
    },
    employeeId,
    seatId: entry.seatId ?? undefined,
    queueEntryId: entry.id,
    lineItems: entry.services.map((qs) => ({
      serviceId: qs.service.id,
      description: qs.service.name,
      quantity: 1,
      unitPrice: qs.service.price,
      employeeId,
    })),
  };
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function formatPhone(phone: string | null): string {
  if (!phone) return "—";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  return phone;
}

export function getWaitMinutes(
  entry: Pick<QueueEntry, "checkedInAt" | "startedAt">,
  now: Date = new Date()
): number {
  const end = entry.startedAt ? new Date(entry.startedAt) : now;
  return Math.max(0, differenceInMinutes(end, new Date(entry.checkedInAt)));
}

export function formatWaitTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function getServiceDuration(entry: QueueEntry): number {
  return entry.services.reduce((sum, s) => sum + s.service.duration, 0);
}

export function getServiceTotal(entry: {
  services: { service: { price: number } }[];
}): number {
  return entry.services.reduce((sum, s) => sum + s.service.price, 0);
}

export function getServiceNames(entry: QueueEntry | CompletedEntry): string {
  return entry.services.map((s) => s.service.name).join(", ");
}

export const STATUS_STYLES: Record<
  string,
  { badge: string; dot: string; label: string }
> = {
  waiting: {
    badge: "bg-amber-50 text-amber-700 ring-amber-200/60",
    dot: "bg-amber-500",
    label: "Waiting",
  },
  assigned: {
    badge: "bg-purple-50 text-purple-700 ring-purple-200/60",
    dot: "bg-[#6C3BFF]",
    label: "Assigned",
  },
  in_progress: {
    badge: "bg-blue-50 text-blue-700 ring-blue-200/60",
    dot: "bg-blue-500",
    label: "In Progress",
  },
  completed: {
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200/60",
    dot: "bg-emerald-500",
    label: "Completed",
  },
  cancelled: {
    badge: "bg-red-50 text-red-700 ring-red-200/60",
    dot: "bg-red-500",
    label: "Cancelled",
  },
  no_show: {
    badge: "bg-stone-100 text-stone-600 ring-stone-200/60",
    dot: "bg-stone-400",
    label: "No Show",
  },
};

export function computeQueueStats(
  entries: QueueEntry[] = [],
  completedEntries: CompletedEntry[] = [],
  employees: { id: string }[] = [],
  appointmentsToday: AppointmentSnapshot[] = [],
  revenueToday: number = 0,
  estimatedWait: number = 0
): QueueDashboardStats {
  const active = entries ?? [];
  const completed = completedEntries ?? [];
  const staff = employees ?? [];
  const appointments = appointmentsToday ?? [];
  const waiting = active.filter((e) => e.status === "waiting").length;
  const assigned = active.filter((e) => e.status === "assigned").length;
  const inProgress = active.filter((e) => e.status === "in_progress").length;
  const inService = assigned + inProgress;

  const todayCompleted = completed.filter(
    (e) => e.completedAt && isToday(new Date(e.completedAt))
  );
  const yesterdayCompleted = completed.filter(
    (e) => e.completedAt && isYesterday(new Date(e.completedAt))
  );

  const busyEmployeeIds = new Set(
    active
      .filter((e) => e.status === "assigned" || e.status === "in_progress")
      .map((e) => e.employee?.id)
      .filter(Boolean) as string[]
  );

  const waitSamples = [
    ...active.filter((e) => e.startedAt).map((e) => getWaitMinutes(e)),
    ...todayCompleted
      .filter((e) => e.completedAt)
      .map((e) => {
        const entry = e as CompletedEntry & {
          checkedInAt?: Date;
          startedAt?: Date | null;
        };
        if (entry.startedAt && entry.checkedInAt) {
          return differenceInMinutes(
            new Date(entry.startedAt),
            new Date(entry.checkedInAt)
          );
        }
        return null;
      })
      .filter((v): v is number => v !== null && v >= 0),
  ];
  const avgWaitMinutes =
    waitSamples.length > 0
      ? Math.round(
          waitSamples.reduce((a, b) => a + b, 0) / waitSamples.length
        )
      : estimatedWait;

  const serviceSamples = todayCompleted
    .map((e) => {
      const entry = e as CompletedEntry & {
        startedAt?: Date | null;
        completedAt?: Date | null;
      };
      if (entry.startedAt && entry.completedAt) {
        return differenceInMinutes(
          new Date(entry.completedAt),
          new Date(entry.startedAt)
        );
      }
      const duration = e.services.reduce(
        (sum, s) =>
          sum + ((s.service as { duration?: number }).duration ?? 0),
        0
      );
      return duration > 0 ? duration : null;
    })
    .filter((v): v is number => v !== null && v > 0);

  const avgServiceMinutes =
    serviceSamples.length > 0
      ? Math.round(
          serviceSamples.reduce((a, b) => a + b, 0) / serviceSamples.length
        )
      : 0;

  const walkInsToday =
    waiting +
    inService +
    todayCompleted.length;

  const cancelledToday = appointments.filter(
    (a) => a.status === "cancelled"
  ).length;

  const noShowToday = appointments.filter(
    (a) => a.status === "no_show"
  ).length;

  return {
    waiting,
    inService,
    assigned,
    inProgress,
    completedToday: todayCompleted.length,
    completedYesterday: yesterdayCompleted.length,
    avgWaitMinutes,
    avgServiceMinutes,
    walkInsToday,
    appointmentsToday: appointments.filter((a) => a.status !== "cancelled")
      .length,
    cancelledToday,
    noShowToday,
    revenueToday,
    staffAvailable: Math.max(0, staff.length - busyEmployeeIds.size),
    staffBusy: busyEmployeeIds.size,
    estimatedWait,
    activeTotal: active.length,
  };
}

export function generateSparkline(
  value: number,
  points = 7
): { v: number }[] {
  const base = Math.max(value, 1);
  return Array.from({ length: points }, (_, i) => {
    const factor = 0.65 + (i / (points - 1)) * 0.35;
    const jitter = 0.9 + ((i * 17) % 20) / 100;
    return { v: Math.round(base * factor * jitter) };
  });
}

export function computeTrend(current: number, previous: number): number | undefined {
  if (previous === 0 && current === 0) return undefined;
  if (previous === 0) return 100;
  return Math.round(((current - previous) / previous) * 100);
}

export type QueueFilters = {
  search: string;
  status: string;
  stylist: string;
  service: string;
  branch: string;
  priority: string;
  arrivalTime: string;
  waitingTime: string;
};

export const DEFAULT_FILTERS: QueueFilters = {
  search: "",
  status: "all",
  stylist: "all",
  service: "all",
  branch: "all",
  priority: "all",
  arrivalTime: "all",
  waitingTime: "all",
};

export function filterActiveEntries(
  entries: QueueEntry[],
  filters: QueueFilters,
  now: Date = new Date()
): QueueEntry[] {
  return (entries ?? []).filter((entry) => {
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      const haystack = [
        entry.customer.name,
        entry.customer.phone ?? "",
        getServiceNames(entry),
        entry.employee?.name ?? "",
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    if (filters.status !== "all" && entry.status !== filters.status) {
      return false;
    }

    if (filters.stylist === "unassigned" && entry.employee) return false;
    if (
      filters.stylist !== "all" &&
      filters.stylist !== "unassigned" &&
      entry.employee?.id !== filters.stylist
    ) {
      return false;
    }

    if (filters.service !== "all") {
      const hasService = entry.services.some(
        (s) => s.service.id === filters.service
      );
      if (!hasService) return false;
    }

    if (filters.waitingTime !== "all") {
      const wait = getWaitMinutes(entry, now);
      if (filters.waitingTime === "under15" && wait >= 15) return false;
      if (filters.waitingTime === "15-30" && (wait < 15 || wait > 30))
        return false;
      if (filters.waitingTime === "over30" && wait <= 30) return false;
    }

    if (filters.arrivalTime !== "all") {
      const hour = new Date(entry.checkedInAt).getHours();
      if (filters.arrivalTime === "morning" && hour >= 12) return false;
      if (filters.arrivalTime === "afternoon" && (hour < 12 || hour >= 17))
        return false;
      if (filters.arrivalTime === "evening" && hour < 17) return false;
    }

    if (filters.priority === "long-wait") {
      if (getWaitMinutes(entry, now) < 20) return false;
    }

    return true;
  });
}

export function getTabEntries(
  tab: QueueTab,
  entries: QueueEntry[],
  completedEntries: CompletedEntry[],
  appointmentsToday: AppointmentSnapshot[]
): (QueueEntry | CompletedEntry | AppointmentSnapshot)[] {
  const active = entries ?? [];
  const completed = completedEntries ?? [];
  const appointments = appointmentsToday ?? [];
  switch (tab) {
    case "waiting":
      return active.filter((e) => e.status === "waiting");
    case "assigned":
      return active.filter((e) => e.status === "assigned");
    case "in_progress":
      return active.filter((e) => e.status === "in_progress");
    case "completed":
      return completed.filter(
        (e) => e.completedAt && isToday(new Date(e.completedAt))
      );
    case "cancelled":
      return appointments.filter((a) => a.status === "cancelled");
    case "no_show":
      return appointments.filter((a) => a.status === "no_show");
    default:
      return active;
  }
}

export function getTabCount(
  tab: QueueTab,
  entries: QueueEntry[],
  completedEntries: CompletedEntry[],
  appointmentsToday: AppointmentSnapshot[]
): number {
  return getTabEntries(tab, entries, completedEntries, appointmentsToday).length;
}

export function isQueueEntry(
  item: QueueEntry | CompletedEntry | AppointmentSnapshot
): item is QueueEntry {
  return "position" in item && "checkedInAt" in item;
}

export function isCompletedEntry(
  item: QueueEntry | CompletedEntry | AppointmentSnapshot
): item is CompletedEntry {
  return "invoices" in item;
}

export function isAppointmentSnapshot(
  item: QueueEntry | CompletedEntry | AppointmentSnapshot
): item is AppointmentSnapshot {
  return "scheduledAt" in item && !("position" in item);
}
