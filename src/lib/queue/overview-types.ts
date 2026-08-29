import type {
  AppointmentSnapshot,
  CompletedEntry,
  Employee,
  QueueDashboardStats,
  QueueEntry,
  QueueTab,
  Seat,
  ServiceOption,
} from "@/components/queue/types";

export type QueueKpiIconKey =
  | "waiting"
  | "inService"
  | "completed"
  | "avgWait"
  | "avgService"
  | "walkIns"
  | "appointments"
  | "cancelled"
  | "revenue"
  | "staffAvailable"
  | "staffBusy"
  | "active";

export type QueueKpiPayload = {
  key: string;
  label: string;
  value: string;
  sublabel?: string;
  trend?: number;
  sparkline: { v: number }[];
  sparkColor: string;
  gradient: string;
  icon: QueueKpiIconKey;
};

export type QueueSidebarPerson = {
  id: string;
  customerName: string;
  initials: string;
  serviceNames: string;
  checkedInAt: Date;
};

export type QueueSidebarCompleted = {
  id: string;
  customerName: string;
  initials: string;
  completedAt: Date | null;
  total: number;
};

export type QueueSidebarStaff = {
  id: string;
  name: string;
  initials: string;
  busy: boolean;
};

export type QueueSidebarPayload = {
  chartData: { name: string; value: number; color: string }[];
  totalToday: number;
  upcomingWaiting: QueueSidebarPerson[];
  recentDone: QueueSidebarCompleted[];
  staff: QueueSidebarStaff[];
  aiSuggestion: string;
};

export type QueueOverview = {
  generatedAt: string;
  entries: QueueEntry[];
  completedToday: CompletedEntry[];
  completedRecent: CompletedEntry[];
  cancelledToday: AppointmentSnapshot[];
  noShowToday: AppointmentSnapshot[];
  appointmentsToday: AppointmentSnapshot[];
  employees: Employee[];
  seats: Seat[];
  services: ServiceOption[];
  estimatedWait: number;
  revenueToday: number;
  stats: QueueDashboardStats;
  tabCounts: Record<QueueTab, number>;
  kpis: QueueKpiPayload[];
  sidebar: QueueSidebarPayload;
  insights: string[];
};

export const EMPTY_QUEUE_STATS: QueueDashboardStats = {
  waiting: 0,
  inService: 0,
  assigned: 0,
  inProgress: 0,
  completedToday: 0,
  completedYesterday: 0,
  avgWaitMinutes: 0,
  avgServiceMinutes: 0,
  walkInsToday: 0,
  appointmentsToday: 0,
  cancelledToday: 0,
  noShowToday: 0,
  revenueToday: 0,
  staffAvailable: 0,
  staffBusy: 0,
  estimatedWait: 0,
  activeTotal: 0,
};

export const EMPTY_QUEUE_OVERVIEW: QueueOverview = {
  generatedAt: "",
  entries: [],
  completedToday: [],
  completedRecent: [],
  cancelledToday: [],
  noShowToday: [],
  appointmentsToday: [],
  employees: [],
  seats: [],
  services: [],
  estimatedWait: 0,
  revenueToday: 0,
  stats: EMPTY_QUEUE_STATS,
  tabCounts: {
    waiting: 0,
    assigned: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0,
    no_show: 0,
  },
  kpis: [],
  sidebar: {
    chartData: [],
    totalToday: 0,
    upcomingWaiting: [],
    recentDone: [],
    staff: [],
    aiSuggestion: "Queue is flowing smoothly. Keep monitoring peak-hour staffing.",
  },
  insights: [
    "Queue operations look healthy. Monitor wait times during the next rush.",
  ],
};

export function normalizeQueueOverview(
  value: QueueOverview | null | undefined
): QueueOverview {
  if (!value) return EMPTY_QUEUE_OVERVIEW;
  return {
    ...EMPTY_QUEUE_OVERVIEW,
    ...value,
    entries: value.entries ?? [],
    completedToday: value.completedToday ?? [],
    completedRecent: value.completedRecent ?? [],
    cancelledToday: value.cancelledToday ?? [],
    noShowToday: value.noShowToday ?? [],
    appointmentsToday: value.appointmentsToday ?? [],
    employees: value.employees ?? [],
    seats: value.seats ?? [],
    services: value.services ?? [],
    estimatedWait: value.estimatedWait ?? 0,
    revenueToday: value.revenueToday ?? 0,
    stats: { ...EMPTY_QUEUE_STATS, ...value.stats },
    tabCounts: { ...EMPTY_QUEUE_OVERVIEW.tabCounts, ...value.tabCounts },
    kpis: value.kpis ?? [],
    sidebar: { ...EMPTY_QUEUE_OVERVIEW.sidebar, ...value.sidebar },
    insights: value.insights?.length
      ? value.insights
      : EMPTY_QUEUE_OVERVIEW.insights,
  };
}

export type CheckInDashboardPayload = {
  waiting: number;
  beingServed: number;
  completedToday: number;
  cancelledToday: number;
  estimatedWait: number;
  activeCount: number;
  nextCustomer: {
    id: string;
    name: string;
    initials: string;
    serviceNames: string;
    checkedInAt: Date;
  } | null;
  liveQueue: {
    id: string;
    position: number;
    status: string;
    customerName: string;
    serviceNames: string;
  }[];
  walkInsToday: number;
  revenueToday: number;
  revenueTodayLabel: string;
  avgBill: number;
  avgBillLabel: string;
  conversionLabel: string;
  conversionReal: boolean;
  staffUtilization: number;
  staffUtilizationLabel: string;
  staffUtilizationReal: boolean;
};

export type CheckInOverview = {
  generatedAt: string;
  services: {
    id: string;
    name: string;
    duration: number;
    price: number;
    category: string;
  }[];
  queueEntries: {
    id: string;
    position: number;
    status: string;
    checkedInAt: Date;
    customer: { name: string; phone: string | null };
    employee: { id: string; name: string } | null;
    services: { service: { name: string; duration: number; price?: number } }[];
  }[];
  completedEntries: {
    id: string;
    completedAt: Date | null;
    customer: { name: string };
    services: { service: { name: string; price?: number } }[];
  }[];
  estimatedWait: number;
  employees: {
    id: string;
    name: string;
    role?: string;
    specialties?: string | null;
  }[];
  recentCustomers: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    createdAt: Date;
  }[];
  billingStats: { revenueToday: number };
  dashboard: CheckInDashboardPayload;
};
