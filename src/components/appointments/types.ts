export type Appointment = {
  id: string;
  customerId?: string;
  serviceId?: string;
  scheduledAt: Date | string;
  status: string;
  notes: string | null;
  customer: { name: string; phone: string | null };
  service: {
    id?: string;
    name: string;
    duration: number;
    price?: number;
    category?: { id: string; name: string } | null;
  };
  employee: { id: string; name: string } | null;
};

export type Service = { id: string; name: string; duration: number };
export type Employee = {
  id: string;
  name: string;
  role?: string;
  specialties?: string | null;
  serviceIds?: string[];
};

export type PrefilledCustomer = {
  customerId: string;
  name: string;
  phone: string;
};

export const CALENDAR_START_HOUR = 8;
export const CALENDAR_END_HOUR = 20;
export const SLOT_MINUTES = 30;
export const SLOT_HEIGHT_PX = 40;
