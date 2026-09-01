export type CheckInService = {
  id: string;
  name: string;
  duration: number;
  price: number;
  category: string;
};

export type CheckInEmployee = {
  id: string;
  name: string;
  role?: string;
  specialties?: string | null;
};

export type QueueEntryItem = {
  id: string;
  position: number;
  status: string;
  checkedInAt: Date;
  customer: { name: string; phone: string | null };
  employee: { id: string; name: string } | null;
  services: { service: { name: string; duration: number; price?: number } }[];
};

export type CompletedEntryItem = {
  id: string;
  completedAt: Date | null;
  customer: { name: string };
  services: { service: { name: string; price?: number } }[];
};

export type RecentCustomerItem = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  createdAt: Date;
};

export type PrefilledCustomer = {
  customerId: string;
  name: string;
  phone: string;
};

export type CheckInPrefill = PrefilledCustomer & {
  serviceIds?: string[];
  employeeId?: string;
  staffByService?: Record<string, string>;
  fromAppointmentId?: string;
};

export type CustomerStats = {
  visitCount: number;
  totalPaid: number;
  customer: {
    name: string;
    email: string | null;
    phone: string | null;
    loyaltyPoints: number;
    birthday: Date | null;
    notes: string | null;
  };
  serviceHistory: {
    services: string;
    date: Date;
    status: string;
  }[];
};

export type BillingStatsSnapshot = {
  revenueToday: number;
};

export const SERVICE_CATEGORIES = [
  "All",
  "Hair",
  "Styling",
  "Color",
  "Facial",
  "Nails",
  "Spa",
  "Packages",
] as const;

export type ServiceCategoryFilter = (typeof SERVICE_CATEGORIES)[number];
