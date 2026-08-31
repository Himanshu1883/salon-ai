export type QueueServiceItem = {
  service: { id: string; name: string; duration: number; price: number };
  employeeId?: string | null;
  appointmentServiceItemId?: string;
};

export type QueueEntry = {
  id: string;
  position: number;
  status: string;
  checkedInAt: Date;
  startedAt: Date | null;
  completedAt: Date | null;
  customerId: string;
  customer: { name: string; phone: string | null };
  employee: { id: string; name: string } | null;
  seat: { id: string; number: number } | null;
  appointmentId?: string | null;
  services: QueueServiceItem[];
  waitMinutes?: number;
  serviceNames?: string;
  serviceDuration?: number;
  serviceTotal?: number;
};

export type CompletedEntry = {
  id: string;
  completedAt: Date | null;
  customer: { name: string; phone?: string | null };
  employeeId: string | null;
  seatId?: string | null;
  appointmentId?: string | null;
  services: {
    service: { id: string; name: string; price: number };
    employeeId?: string | null;
    appointmentServiceItemId?: string;
  }[];
  invoices: { id: string; status?: string; paymentMethod?: string | null; total?: number }[];
  serviceNames?: string;
  serviceTotal?: number;
};

export type QueueInvoiceEntry = Pick<
  CompletedEntry,
  | "id"
  | "customer"
  | "employeeId"
  | "seatId"
  | "appointmentId"
  | "services"
  | "invoices"
>;

export type Employee = { id: string; name: string; role?: string };
export type Seat = { id: string; number: number };
export type ServiceOption = { id: string; name: string; price: number };

export type AppointmentSnapshot = {
  id: string;
  status: string;
  scheduledAt: Date;
  customer: { name: string };
  service: { name: string };
  employee: { id: string; name: string } | null;
};

export type QueueDashboardStats = {
  waiting: number;
  inService: number;
  assigned: number;
  inProgress: number;
  completedToday: number;
  completedYesterday: number;
  avgWaitMinutes: number;
  avgServiceMinutes: number;
  walkInsToday: number;
  appointmentsToday: number;
  cancelledToday: number;
  noShowToday: number;
  revenueToday: number;
  staffAvailable: number;
  staffBusy: number;
  estimatedWait: number;
  activeTotal: number;
};

export type QueueTab =
  | "waiting"
  | "assigned"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";

export const QUEUE_TABS: { id: QueueTab; label: string }[] = [
  { id: "waiting", label: "Waiting" },
  { id: "assigned", label: "Assigned" },
  { id: "in_progress", label: "In Progress" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
  { id: "no_show", label: "No Show" },
];
