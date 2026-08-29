import { getAppointmentsInRange, getSalonOpeningHours } from "@/actions/appointments";
import { getServiceOptions } from "@/actions/services";
import { getActiveEmployees } from "@/actions/employees";
import { AppointmentsClient } from "@/app/(dashboard)/appointments/appointments-client";
import { appointmentDateKey } from "@/lib/appointments/datetime";
import { getBusinessDateKey } from "@/lib/attendance/business-day";
import {
  startOfWeek,
  endOfWeek,
  endOfDay,
  format,
  addDays,
  max,
} from "date-fns";

export default async function SalesAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    customerId?: string;
    name?: string;
    phone?: string;
    weekStart?: string;
  }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const weekStart = params.weekStart
    ? startOfWeek(new Date(params.weekStart), { weekStartsOn: 1 })
    : startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const upcomingEnd = endOfDay(addDays(now, 30));
  const rangeEnd = max([weekEnd, upcomingEnd]);

  const [allAppointments, services, employees, openingHours] = await Promise.all([
    getAppointmentsInRange(weekStart, rangeEnd),
    getServiceOptions(),
    getActiveEmployees(),
    getSalonOpeningHours(),
  ]);

  const todayKey = getBusinessDateKey(now);

  const weekAppointments = allAppointments.filter(
    (a) => appointmentDateKey(a.scheduledAt) <= format(weekEnd, "yyyy-MM-dd")
  );
  const todayAppointments = allAppointments.filter(
    (a) => appointmentDateKey(a.scheduledAt) === todayKey
  );
  const upcomingAppointments = allAppointments.filter(
    (a) => appointmentDateKey(a.scheduledAt) > todayKey
  );

  return (
    <AppointmentsClient
      weekAppointments={weekAppointments.map((a) => ({
        id: a.id,
        customerId: a.customerId,
        serviceId: a.serviceId,
        scheduledAt: a.scheduledAt,
        status: a.status,
        notes: a.notes,
        customer: { name: a.customer.name, phone: a.customer.phone },
        service: {
          id: a.service.id,
          name: a.service.name,
          duration: a.service.duration,
          category: a.service.category,
        },
        employee: a.employee
          ? { id: a.employee.id, name: a.employee.name }
          : null,
      }))}
      weekStartIso={format(weekStart, "yyyy-MM-dd")}
      todayAppointments={todayAppointments.map((a) => ({
        id: a.id,
        customerId: a.customerId,
        serviceId: a.serviceId,
        scheduledAt: a.scheduledAt,
        status: a.status,
        notes: a.notes,
        customer: { name: a.customer.name, phone: a.customer.phone },
        service: {
          id: a.service.id,
          name: a.service.name,
          duration: a.service.duration,
        },
        employee: a.employee
          ? { id: a.employee.id, name: a.employee.name }
          : null,
      }))}
      upcomingAppointments={upcomingAppointments.map((a) => ({
        id: a.id,
        customerId: a.customerId,
        serviceId: a.serviceId,
        scheduledAt: a.scheduledAt,
        status: a.status,
        notes: a.notes,
        customer: { name: a.customer.name, phone: a.customer.phone },
        service: {
          id: a.service.id,
          name: a.service.name,
          duration: a.service.duration,
        },
        employee: a.employee
          ? { id: a.employee.id, name: a.employee.name }
          : null,
      }))}
      services={services.map((s) => ({
        id: s.id,
        name: s.name,
        duration: s.duration,
      }))}
      employees={employees.map((e) => ({
        id: e.id,
        name: e.name,
        role: e.role,
        specialties: e.specialties,
        serviceIds: e.services?.map((link) => link.serviceId) ?? [],
      }))}
      openingHours={openingHours}
      prefilledCustomer={{
        customerId: params.customerId ?? "",
        name: params.name ?? "",
        phone: params.phone ?? "",
      }}
      autoOpenCreate={Boolean(params.customerId || params.name)}
    />
  );
}
