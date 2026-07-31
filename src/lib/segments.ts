import {
  subDays,
  subMonths,
  addDays,
  isWithinInterval,
  startOfDay,
  endOfDay,
} from "date-fns";

export type StandardSegmentId =
  | "new-clients"
  | "recent-clients"
  | "first-visit"
  | "loyal-clients"
  | "lapsed-clients"
  | "high-spenders"
  | "upcoming-birthdays"
  | "no-show"
  | "regular-clients"
  | "vip"
  | "inactive-90-days";

export type SegmentIconKey =
  | "user-plus"
  | "calendar"
  | "sparkles"
  | "heart"
  | "clock"
  | "indian-rupee"
  | "cake"
  | "user-x"
  | "repeat"
  | "crown"
  | "moon";

export type StandardSegmentDefinition = {
  id: StandardSegmentId;
  name: string;
  description: string;
  iconKey: SegmentIconKey;
};

export const STANDARD_SEGMENTS: StandardSegmentDefinition[] = [
  {
    id: "new-clients",
    name: "New clients",
    description: "Clients added in the last 30 days",
    iconKey: "user-plus",
  },
  {
    id: "recent-clients",
    name: "Recent clients",
    description: "Clients with appointments in the last 30 days",
    iconKey: "calendar",
  },
  {
    id: "first-visit",
    name: "First visit",
    description: "No past appointments or check-ins, but has future appointments",
    iconKey: "sparkles",
  },
  {
    id: "loyal-clients",
    name: "Loyal clients",
    description: "2+ paid sales in the last 5 months",
    iconKey: "heart",
  },
  {
    id: "lapsed-clients",
    name: "Lapsed clients",
    description: "3+ sales in the last 12 months and no sales in the last 2 months",
    iconKey: "clock",
  },
  {
    id: "high-spenders",
    name: "High spenders",
    description: "More than ₹500 in paid sales in the last 12 months",
    iconKey: "indian-rupee",
  },
  {
    id: "upcoming-birthdays",
    name: "Upcoming birthdays",
    description: "Birthdays in the next 30 days",
    iconKey: "cake",
  },
  {
    id: "no-show",
    name: "No show",
    description: "Missed appointments — scheduled in the past but never completed",
    iconKey: "user-x",
  },
  {
    id: "regular-clients",
    name: "Regular clients",
    description: "3+ completed visits in the last 6 months",
    iconKey: "repeat",
  },
  {
    id: "vip",
    name: "VIP",
    description: "More than ₹5,000 in paid sales in the last 12 months",
    iconKey: "crown",
  },
  {
    id: "inactive-90-days",
    name: "Inactive 90 days",
    description: "No completed visits or paid sales in the last 90 days",
    iconKey: "moon",
  },
];

type CustomerRecord = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  birthday: Date | null;
  createdAt: Date;
};

type PaidInvoice = {
  customerId: string | null;
  customerPhone: string | null;
  customerName: string;
  total: number;
  paidAt: Date | null;
  createdAt: Date;
};

type CheckInRecord = {
  customerId: string;
  status: string;
  checkedInAt: Date;
  completedAt: Date | null;
};

type AppointmentRecord = {
  customerId: string;
  status: string;
  scheduledAt: Date;
};

export type SegmentDataContext = {
  customers: CustomerRecord[];
  paidInvoices: PaidInvoice[];
  checkIns: CheckInRecord[];
  appointments: AppointmentRecord[];
};

function invoiceMatchesCustomer(
  invoice: PaidInvoice,
  customer: CustomerRecord
): boolean {
  return (
    invoice.customerId === customer.id ||
    (!invoice.customerId &&
      !!customer.phone &&
      invoice.customerPhone === customer.phone) ||
    (!invoice.customerId &&
      !customer.phone &&
      invoice.customerName.toLowerCase() === customer.name.toLowerCase())
  );
}

function getPaidInvoicesForCustomer(
  customer: CustomerRecord,
  invoices: PaidInvoice[],
  since?: Date
): PaidInvoice[] {
  return invoices.filter((inv) => {
    if (!invoiceMatchesCustomer(inv, customer)) return false;
    if (!since) return true;
    const paidDate = inv.paidAt ?? inv.createdAt;
    return paidDate >= since;
  });
}

function getCompletedVisits(
  customerId: string,
  checkIns: CheckInRecord[],
  appointments: AppointmentRecord[],
  since?: Date
): Date[] {
  const visits: Date[] = [
    ...checkIns
      .filter((e) => e.customerId === customerId && e.status === "completed")
      .map((e) => e.completedAt ?? e.checkedInAt),
    ...appointments
      .filter((a) => a.customerId === customerId && a.status === "completed")
      .map((a) => a.scheduledAt),
  ];

  if (!since) return visits;
  return visits.filter((d) => d >= since);
}

function isBirthdayInNext30Days(birthday: Date, now = new Date()): boolean {
  const today = startOfDay(now);
  const windowEnd = endOfDay(addDays(today, 30));

  for (let year = today.getFullYear(); year <= today.getFullYear() + 1; year++) {
    const candidate = new Date(
      year,
      birthday.getMonth(),
      birthday.getDate()
    );
    if (isWithinInterval(candidate, { start: today, end: windowEnd })) {
      return true;
    }
  }
  return false;
}

export function customerMatchesSegment(
  segmentId: StandardSegmentId,
  customer: CustomerRecord,
  ctx: SegmentDataContext,
  now = new Date()
): boolean {
  const thirtyDaysAgo = subDays(now, 30);
  const twoMonthsAgo = subMonths(now, 2);
  const fiveMonthsAgo = subMonths(now, 5);
  const sixMonthsAgo = subMonths(now, 6);
  const twelveMonthsAgo = subMonths(now, 12);
  const ninetyDaysAgo = subDays(now, 90);

  const customerAppointments = ctx.appointments.filter(
    (a) => a.customerId === customer.id
  );
  const customerPaidInvoices = getPaidInvoicesForCustomer(
    customer,
    ctx.paidInvoices
  );

  switch (segmentId) {
    case "new-clients":
      return customer.createdAt >= thirtyDaysAgo;

    case "recent-clients":
      return customerAppointments.some(
        (a) =>
          a.scheduledAt >= thirtyDaysAgo &&
          a.status !== "cancelled"
      );

    case "first-visit": {
      const hasPastActivity =
        getCompletedVisits(customer.id, ctx.checkIns, ctx.appointments).length >
          0 ||
        customerAppointments.some(
          (a) => a.scheduledAt < now && a.status === "completed"
        ) ||
        ctx.checkIns.some(
          (e) =>
            e.customerId === customer.id &&
            e.status === "completed"
        );
      const hasFutureAppointment = customerAppointments.some(
        (a) => a.scheduledAt >= now && a.status === "scheduled"
      );
      return !hasPastActivity && hasFutureAppointment;
    }

    case "loyal-clients":
      return (
        getPaidInvoicesForCustomer(
          customer,
          ctx.paidInvoices,
          fiveMonthsAgo
        ).length >= 2
      );

    case "lapsed-clients": {
      const salesLast12 = getPaidInvoicesForCustomer(
        customer,
        ctx.paidInvoices,
        twelveMonthsAgo
      );
      const salesLast2 = getPaidInvoicesForCustomer(
        customer,
        ctx.paidInvoices,
        twoMonthsAgo
      );
      return salesLast12.length >= 3 && salesLast2.length === 0;
    }

    case "high-spenders": {
      const total = getPaidInvoicesForCustomer(
        customer,
        ctx.paidInvoices,
        twelveMonthsAgo
      ).reduce((sum, inv) => sum + inv.total, 0);
      return total > 500;
    }

    case "upcoming-birthdays":
      return !!customer.birthday && isBirthdayInNext30Days(customer.birthday, now);

    case "no-show":
      return customerAppointments.some(
        (a) => a.scheduledAt < now && a.status === "scheduled"
      );

    case "regular-clients":
      return (
        getCompletedVisits(
          customer.id,
          ctx.checkIns,
          ctx.appointments,
          sixMonthsAgo
        ).length >= 3
      );

    case "vip": {
      const total = getPaidInvoicesForCustomer(
        customer,
        ctx.paidInvoices,
        twelveMonthsAgo
      ).reduce((sum, inv) => sum + inv.total, 0);
      return total > 5000;
    }

    case "inactive-90-days": {
      const recentVisits = getCompletedVisits(
        customer.id,
        ctx.checkIns,
        ctx.appointments,
        ninetyDaysAgo
      );
      const recentSales = getPaidInvoicesForCustomer(
        customer,
        ctx.paidInvoices,
        ninetyDaysAgo
      );
      return recentVisits.length === 0 && recentSales.length === 0;
    }

    default:
      return false;
  }
}

export function getStandardSegmentById(id: string) {
  return STANDARD_SEGMENTS.find((s) => s.id === id);
}

export function isStandardSegmentId(id: string): id is StandardSegmentId {
  return STANDARD_SEGMENTS.some((s) => s.id === id);
}
