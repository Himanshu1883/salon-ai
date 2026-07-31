import { Suspense } from "react";
import {
  getQueueEntries,
  getEstimatedWaitMinutes,
  getRecentCompletedCheckIns,
} from "@/actions/queue";
import { getActiveEmployees } from "@/actions/employees";
import { getAvailableSeats } from "@/actions/seats";
import { getBillingStats } from "@/actions/billing";
import { getServices } from "@/actions/services";
import { getAppointmentsForWeek } from "@/actions/appointments";
import { endOfDay, isWithinInterval, startOfDay } from "date-fns";
import { QueueClient } from "./queue-client";
import { QueueLoadingSkeleton } from "@/components/dashboard/loading-skeletons";

async function QueuePageContent() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  const [
    entries,
    employees,
    seats,
    estimatedWait,
    completedEntries,
    billingStats,
    services,
    weekAppointments,
  ] = await Promise.all([
    getQueueEntries(),
    getActiveEmployees(),
    getAvailableSeats(),
    getEstimatedWaitMinutes(),
    getRecentCompletedCheckIns(),
    getBillingStats(),
    getServices(),
    getAppointmentsForWeek(now),
  ]);

  const appointmentsToday = weekAppointments
    .filter((a) =>
      isWithinInterval(new Date(a.scheduledAt), {
        start: todayStart,
        end: todayEnd,
      })
    )
    .map((a) => ({
      id: a.id,
      status: a.status,
      scheduledAt: a.scheduledAt,
      customer: { name: a.customer.name },
      service: { name: a.service.name },
      employee: a.employee
        ? { id: a.employee.id, name: a.employee.name }
        : null,
    }));

  return (
    <QueueClient
      entries={entries.map((e) => ({
        id: e.id,
        position: e.position,
        status: e.status,
        checkedInAt: e.checkedInAt,
        startedAt: e.startedAt,
        completedAt: e.completedAt,
        customerId: e.customerId,
        customer: {
          name: e.customer.name,
          phone: e.customer.phone,
        },
        employee: e.employee
          ? { id: e.employee.id, name: e.employee.name }
          : null,
        seat: e.seat ? { id: e.seat.id, number: e.seat.number } : null,
        services: e.services.map((qs) => ({
          service: {
            id: qs.service.id,
            name: qs.service.name,
            duration: qs.service.duration,
            price: qs.service.price,
          },
        })),
      }))}
      employees={employees.map((e) => ({
        id: e.id,
        name: e.name,
        role: e.role,
      }))}
      seats={seats.map((s) => ({ id: s.id, number: s.number }))}
      estimatedWait={estimatedWait}
      completedEntries={completedEntries.map((e) => ({
        id: e.id,
        completedAt: e.completedAt,
        employeeId: e.employeeId,
        seatId: e.seatId,
        customer: {
          name: e.customer.name,
          phone: e.customer.phone,
        },
        services: e.services.map((qs) => ({
          service: {
            id: qs.service.id,
            name: qs.service.name,
            price: qs.service.price,
          },
        })),
        invoices: e.invoices.map((inv) => ({
          id: inv.id,
          status: inv.status,
          paymentMethod: inv.paymentMethod,
          total: inv.total,
        })),
      }))}
      services={services.map((s) => ({ id: s.id, name: s.name, price: s.price }))}
      appointmentsToday={appointmentsToday}
      revenueToday={billingStats.revenueToday}
    />
  );
}

export default function QueuePage() {
  return (
    <Suspense fallback={<QueueLoadingSkeleton />}>
      <QueuePageContent />
    </Suspense>
  );
}
