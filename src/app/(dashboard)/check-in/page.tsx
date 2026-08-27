import { getServiceOptions } from "@/actions/services";
import {
  getQueueEntries,
  getEstimatedWaitMinutes,
  getRecentCompletedCheckIns,
} from "@/actions/queue";
import { getActiveEmployees } from "@/actions/employees";
import { getRecentCustomers } from "@/actions/customers";
import { getBillingStats } from "@/actions/billing";
import { CheckInClient } from "./check-in-client";

export default async function CheckInPage({
  searchParams,
}: {
  searchParams: Promise<{
    customerId?: string;
    name?: string;
    phone?: string;
    serviceIds?: string;
    employeeId?: string;
    fromAppointment?: string;
  }>;
}) {
  const params = await searchParams;
  const serviceIds = params.serviceIds
    ? params.serviceIds.split(",").map((id) => id.trim()).filter(Boolean)
    : [];

  const [
    services,
    queueEntries,
    estimatedWait,
    completedEntries,
    employees,
    recentCustomers,
    billingStats,
  ] = await Promise.all([
    getServiceOptions(),
    getQueueEntries(),
    getEstimatedWaitMinutes(),
    getRecentCompletedCheckIns(),
    getActiveEmployees(),
    getRecentCustomers(5),
    getBillingStats(),
  ]);

  return (
    <CheckInClient
      services={services.map((s) => ({
        id: s.id,
        name: s.name,
        duration: s.duration,
        price: s.price,
        category: s.category?.name ?? "Uncategorized",
      }))}
      queueEntries={queueEntries.map((e) => ({
        id: e.id,
        position: e.position,
        status: e.status,
        checkedInAt: e.checkedInAt,
        customer: {
          name: e.customer.name,
          phone: e.customer.phone,
        },
        employee: e.employee
          ? { id: e.employee.id, name: e.employee.name }
          : null,
        services: e.services.map((qs) => ({
          service: {
            name: qs.service.name,
            duration: qs.service.duration,
            price: qs.service.price,
          },
        })),
      }))}
      completedEntries={completedEntries.map((e) => ({
        id: e.id,
        completedAt: e.completedAt,
        customer: { name: e.customer.name },
        services: e.services.map((qs) => ({
          service: {
            name: qs.service.name,
            price: qs.service.price,
          },
        })),
      }))}
      estimatedWait={estimatedWait}
      employees={employees.map((e) => ({
        id: e.id,
        name: e.name,
        role: e.role,
        specialties: e.specialties,
      }))}
      recentCustomers={recentCustomers.map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        createdAt: c.createdAt,
      }))}
      billingStats={{
        revenueToday: billingStats.revenueToday,
      }}
      prefilledCustomer={{
        customerId: params.customerId ?? "",
        name: params.name ?? "",
        phone: params.phone ?? "",
        serviceIds,
        employeeId: params.employeeId ?? "",
        fromAppointmentId: params.fromAppointment ?? "",
      }}
    />
  );
}
