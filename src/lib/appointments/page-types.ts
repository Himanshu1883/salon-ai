import type { Appointment, Employee, Service } from "@/components/appointments/types";
import type { OpeningHours } from "@/lib/onboarding";

export type AppointmentsPagePart = "bootstrap" | "week" | "upcoming";

export type AppointmentsPagePayload = {
  weekAppointments: Appointment[];
  todayAppointments: Appointment[];
  upcomingAppointments: Appointment[];
  calendarWeekAppointments: Appointment[];
  calendarTodayAppointments: Appointment[];
  calendarUpcomingAppointments: Appointment[];
  services: Service[];
  employees: Employee[];
  openingHours: OpeningHours;
  includeCheckedInOnSchedule: boolean;
  canAddService: boolean;
};
