import { getAppointments, getAppointmentsForWeek } from "@/actions/appointments";
import { getServices } from "@/actions/services";
import { getActiveEmployees } from "@/actions/employees";
import { AppointmentsClient } from "@/app/(dashboard)/appointments/appointments-client";
import { startOfWeek, format } from "date-fns";

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
  const weekStart = params.weekStart
    ? startOfWeek(new Date(params.weekStart), { weekStartsOn: 1 })
    : startOfWeek(new Date(), { weekStartsOn: 1 });

  const [
    weekAppointments,
    todayAppointments,
    upcomingAppointments,
    services,
    employees,
  ] = await Promise.all([
    getAppointmentsForWeek(weekStart),
    getAppointments("today"),
    getAppointments("upcoming"),
    getServices(),
    getActiveEmployees(),
  ]);

  return (
    <AppointmentsClient
      weekAppointments={weekAppointments.map((a) => ({
        id: a.id,
        scheduledAt: a.scheduledAt,
        status: a.status,
        notes: a.notes,
        customer: { name: a.customer.name, phone: a.customer.phone },
        service: {
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
        scheduledAt: a.scheduledAt,
        status: a.status,
        notes: a.notes,
        customer: { name: a.customer.name, phone: a.customer.phone },
        service: { name: a.service.name, duration: a.service.duration },
        employee: a.employee
          ? { id: a.employee.id, name: a.employee.name }
          : null,
      }))}
      upcomingAppointments={upcomingAppointments.map((a) => ({
        id: a.id,
        scheduledAt: a.scheduledAt,
        status: a.status,
        notes: a.notes,
        customer: { name: a.customer.name, phone: a.customer.phone },
        service: { name: a.service.name, duration: a.service.duration },
        employee: a.employee
          ? { id: a.employee.id, name: a.employee.name }
          : null,
      }))}
      services={services.map((s) => ({
        id: s.id,
        name: s.name,
        duration: s.duration,
      }))}
      employees={employees.map((e) => ({ id: e.id, name: e.name }))}
      prefilledCustomer={{
        customerId: params.customerId ?? "",
        name: params.name ?? "",
        phone: params.phone ?? "",
      }}
      autoOpenCreate={Boolean(params.customerId || params.name)}
    />
  );
}
