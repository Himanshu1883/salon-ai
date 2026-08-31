import { getAppointmentsInRange, getSalonOpeningHours } from "@/actions/appointments";
import { getServiceOptions } from "@/actions/services";
import { getActiveEmployees } from "@/actions/employees";
import { AppointmentsClient } from "@/app/(dashboard)/appointments/appointments-client";
import { appointmentDateKey } from "@/lib/appointments/datetime";
import { getBusinessDateKey } from "@/lib/attendance/business-day";
import { getDataScopeContext } from "@/lib/permissions/data-scope";
import {
  startOfWeek,
  endOfWeek,
  endOfDay,
  format,
  addDays,
  max,
} from "date-fns";
import type { Appointment } from "@/components/appointments/types";

function toClientAppointment(a: {
  id: string;
  customerId: string;
  serviceId: string;
  scheduledAt: Date;
  status: string;
  notes: string | null;
  customer: { name: string; phone: string | null };
  service: {
    id: string;
    name: string;
    duration: number;
    price?: number;
    category?: { id: string; name: string } | null;
  };
  employee: { id: string; name: string } | null;
  serviceItems?: Array<{
    id: string;
    serviceId: string;
    employeeId: string | null;
    price: number;
    duration: number;
    status: string;
    scheduledAt: Date;
    startedAt?: Date | null;
    completedAt?: Date | null;
    sortOrder?: number;
    service: {
      id: string;
      name: string;
      duration: number;
      price: number;
      category?: { id: string; name: string } | null;
    };
    employee: { id: string; name: string } | null;
  }>;
}): Appointment {
  return {
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
      price: a.service.price,
      category: a.service.category,
    },
    employee: a.employee
      ? { id: a.employee.id, name: a.employee.name }
      : null,
    serviceItems: a.serviceItems?.map((item) => ({
      id: item.id,
      serviceId: item.serviceId,
      employeeId: item.employeeId,
      price: item.price,
      duration: item.duration,
      status: item.status,
      scheduledAt: item.scheduledAt,
      startedAt: item.startedAt,
      completedAt: item.completedAt,
      sortOrder: item.sortOrder,
      service: {
        id: item.service.id,
        name: item.service.name,
        duration: item.service.duration,
        price: item.service.price,
        category: item.service.category,
      },
      employee: item.employee
        ? { id: item.employee.id, name: item.employee.name }
        : null,
    })),
  };
}

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

  const [allAppointments, services, employees, openingHours, scope] =
    await Promise.all([
      getAppointmentsInRange(weekStart, rangeEnd),
      getServiceOptions(),
      getActiveEmployees(),
      getSalonOpeningHours(),
      getDataScopeContext(),
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

  let scheduleEmployees = employees.map((employee) => ({
    id: employee.id,
    name: employee.name,
    role: employee.role,
    specialties: employee.specialties,
    serviceIds: employee.services?.map((link) => link.serviceId) ?? [],
  }));
  if (scope.dataScope === "own" && scope.employeeId) {
    scheduleEmployees = scheduleEmployees.filter(
      (employee) => employee.id === scope.employeeId
    );
    if (scheduleEmployees.length === 0) {
      scheduleEmployees = [
        {
          id: scope.employeeId,
          name: scope.employeeName ?? "Me",
          role: "Staff",
          specialties: "",
          serviceIds: [],
        },
      ];
    }
  }

  return (
    <AppointmentsClient
      weekAppointments={weekAppointments.map(toClientAppointment)}
      weekStartIso={format(weekStart, "yyyy-MM-dd")}
      todayAppointments={todayAppointments.map(toClientAppointment)}
      upcomingAppointments={upcomingAppointments.map(toClientAppointment)}
      services={services.map((s) => ({
        id: s.id,
        name: s.name,
        duration: s.duration,
      }))}
      employees={scheduleEmployees}
      openingHours={openingHours}
      prefilledCustomer={{
        customerId: params.customerId ?? "",
        name: params.name ?? "",
        phone: params.phone ?? "",
      }}
      autoOpenCreate={Boolean(params.customerId || params.name)}
      includeCheckedInOnSchedule={scope.dataScope === "own"}
      canAddService={scope.dataScope !== "own"}
    />
  );
}
