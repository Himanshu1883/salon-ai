"use client";

import { useEffect, useMemo, useState } from "react";
import { format, addDays, setHours, setMinutes, startOfDay } from "date-fns";
import { CalendarClock, Loader2, Sparkles, User } from "lucide-react";
import { createAppointment } from "@/actions/appointments";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CustomerAutocomplete } from "@/components/customers/customer-autocomplete";
import {
  BLOCKING_APPOINTMENT_STATUSES,
  getBusyEmployeeIds,
  hasEmployeeConflict,
  type AppointmentSlot,
} from "@/lib/appointments/conflicts";
import {
  findNextOpenDate,
  getDayHours,
  validateAppointmentAgainstSalonHours,
} from "@/lib/appointments/salon-hours";
import {
  getSequentialSlotStart,
  getTotalDuration,
} from "@/lib/appointments/visit-group";
import type { OpeningHours } from "@/lib/onboarding";
import { cn } from "@/lib/utils";
import type { Appointment, Employee, PrefilledCustomer, Service } from "./types";
import { IndianDateTimePicker } from "./indian-date-time-picker";
import {
  AppointmentServiceLines,
  createInitialServiceLine,
  type AppointmentServiceLine,
} from "./appointment-service-lines";

function toAppointmentSlots(appointments: Appointment[]): AppointmentSlot[] {
  return appointments
    .filter(
      (apt) =>
        apt.employee?.id &&
        BLOCKING_APPOINTMENT_STATUSES.includes(
          apt.status as (typeof BLOCKING_APPOINTMENT_STATUSES)[number]
        )
    )
    .map((apt) => ({
      employeeId: apt.employee!.id,
      scheduledAt: apt.scheduledAt,
      service: { duration: apt.service.duration },
    }));
}

function FormSection({
  icon: Icon,
  title,
  description,
  children,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-stone-100 bg-gradient-to-br from-white to-stone-50/80 p-4 shadow-sm",
        className
      )}
    >
      <div className="mb-3 flex items-start gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-stone-100">
          <Icon className="h-4 w-4 text-violet-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#1C103D]">{title}</h3>
          {description && (
            <p className="text-xs text-[#6B7280]">{description}</p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

export function AppointmentForm({
  services,
  employees,
  openingHours,
  existingAppointments = [],
  prefilledCustomer,
  defaultScheduledAt,
  onSuccess,
}: {
  services: Service[];
  employees: Employee[];
  openingHours: OpeningHours;
  existingAppointments?: Appointment[];
  prefilledCustomer?: PrefilledCustomer;
  defaultScheduledAt?: string;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [serviceLines, setServiceLines] = useState<AppointmentServiceLine[]>([
    createInitialServiceLine(),
  ]);
  const [scheduledAt, setScheduledAt] = useState(defaultScheduledAt ?? "");
  const [customerPhone, setCustomerPhone] = useState(
    prefilledCustomer?.phone ?? ""
  );
  const [timeMenuOpen, setTimeMenuOpen] = useState(false);

  useEffect(() => {
    if (defaultScheduledAt) {
      setScheduledAt(defaultScheduledAt);
    }
  }, [defaultScheduledAt]);

  const appointmentSlots = useMemo(
    () => toAppointmentSlots(existingAppointments),
    [existingAppointments]
  );

  const selectedServices = useMemo(
    () =>
      serviceLines
        .map((line) => services.find((service) => service.id === line.serviceId))
        .filter(Boolean) as Service[],
    [serviceLines, services]
  );

  const totalDuration = useMemo(
    () => getTotalDuration(selectedServices.map((service) => service.duration)),
    [selectedServices]
  );

  const busyEmployeeIdsByLine = useMemo(() => {
    const result: Record<string, Set<string>> = {};
    if (!scheduledAt) return result;

    const baseStart = new Date(scheduledAt);
    if (Number.isNaN(baseStart.getTime())) return result;

    let priorDurations: number[] = [];
    for (const line of serviceLines) {
      const service = services.find((item) => item.id === line.serviceId);
      if (!service) {
        priorDurations = [...priorDurations, 0];
        continue;
      }

      const slotStart = getSequentialSlotStart(baseStart, priorDurations);
      result[line.id] = getBusyEmployeeIds(
        slotStart,
        service.duration,
        employees.map((employee) => employee.id),
        appointmentSlots
      );
      priorDurations = [...priorDurations, service.duration];
    }

    return result;
  }, [serviceLines, scheduledAt, services, employees, appointmentSlots]);

  const salonHoursValidation = useMemo(() => {
    if (!scheduledAt || totalDuration <= 0) return null;
    const start = new Date(scheduledAt);
    if (Number.isNaN(start.getTime())) return null;
    return validateAppointmentAgainstSalonHours(
      openingHours,
      start,
      totalDuration
    );
  }, [scheduledAt, totalDuration, openingHours]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!customerPhone.trim() || customerPhone.trim().length < 10) {
      setLoading(false);
      setError("Phone number is required");
      return;
    }

    const validLines = serviceLines.filter((line) => line.serviceId);
    if (validLines.length === 0) {
      setLoading(false);
      setError("Add at least one service");
      return;
    }

    if (!scheduledAt) {
      setLoading(false);
      setError("Date and time required");
      return;
    }

    const baseStart = new Date(scheduledAt);
    if (Number.isNaN(baseStart.getTime())) {
      setLoading(false);
      setError("Enter a valid date and time");
      return;
    }

    let priorDurations: number[] = [];
    for (const line of validLines) {
      const service = services.find((item) => item.id === line.serviceId);
      if (!service) continue;
      const slotStart = getSequentialSlotStart(baseStart, priorDurations);

      if (line.employeeId) {
        const busy = busyEmployeeIdsByLine[line.id];
        if (busy?.has(line.employeeId)) {
          setLoading(false);
          setError(
            "One or more selected staff members are not available at this time."
          );
          return;
        }

        if (
          hasEmployeeConflict(
            line.employeeId,
            slotStart,
            service.duration,
            appointmentSlots
          )
        ) {
          setLoading(false);
          setError(
            "One or more selected staff members are not available at this time."
          );
          return;
        }
      }

      priorDurations = [...priorDurations, service.duration];
    }

    const hoursCheck = validateAppointmentAgainstSalonHours(
      openingHours,
      baseStart,
      totalDuration
    );
    if (!hoursCheck.ok) {
      setLoading(false);
      setError(hoursCheck.error);
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.set("customerPhone", customerPhone.trim());
    formData.set("scheduledAt", scheduledAt);
    formData.set(
      "serviceLines",
      JSON.stringify(
        validLines.map(({ serviceId, employeeId }) => ({
          serviceId,
          employeeId: employeeId || undefined,
        }))
      )
    );

    const result = await createAppointment(formData);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    onSuccess();
  }

  const salonHoursIssue =
    salonHoursValidation !== null && !salonHoursValidation.ok;

  function applyNextAvailableDate() {
    const reference = scheduledAt ? new Date(scheduledAt) : new Date();
    const nextDay = findNextOpenDate(
      openingHours,
      addDays(startOfDay(reference), 1)
    );
    const dayHours = getDayHours(openingHours, nextDay);
    const [openHour, openMinute = 0] = dayHours.open.split(":").map(Number);
    const nextSlot = setMinutes(setHours(nextDay, openHour), openMinute);
    setScheduledAt(format(nextSlot, "yyyy-MM-dd'T'HH:mm"));
    setError("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <div
        className={cn(
          "min-h-0 flex-1 space-y-4 overscroll-contain px-6 py-4 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-violet-200",
          timeMenuOpen ? "overflow-hidden" : "overflow-y-auto"
        )}
      >
        <FormSection
          icon={User}
          title="Customer details"
          description="Search existing clients or add a new one"
        >
          <CustomerAutocomplete
            defaultCustomerId={prefilledCustomer?.customerId}
            defaultName={prefilledCustomer?.name}
            defaultPhone={prefilledCustomer?.phone}
            phoneRequired
            onPhoneChange={setCustomerPhone}
          />
        </FormSection>

        <FormSection
          icon={Sparkles}
          title="Book services"
          description="Add multiple services and assign staff for each"
        >
          <AppointmentServiceLines
            services={services}
            employees={employees}
            lines={serviceLines}
            onChange={setServiceLines}
            busyEmployeeIdsByLine={busyEmployeeIdsByLine}
          />
        </FormSection>

        <FormSection
          icon={CalendarClock}
          title="Date & time"
          description="Indian format · AM/PM time slots"
          className="overflow-visible"
        >
          <IndianDateTimePicker
            id="scheduledAt"
            value={scheduledAt}
            onChange={setScheduledAt}
            required
            onTimeMenuOpenChange={setTimeMenuOpen}
          />
          {totalDuration > 0 && scheduledAt && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 ring-1 ring-violet-100">
              <Sparkles className="h-3.5 w-3.5" />
              Total visit: {totalDuration} min
              {serviceLines.length > 1 ? " · back-to-back" : ""}
            </div>
          )}
          {salonHoursIssue && (
            <div className="mt-3 space-y-2 rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-2.5">
              <p className="text-sm text-amber-900">
                {salonHoursValidation.error}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl border-amber-200 bg-white hover:bg-amber-50"
                onClick={applyNextAvailableDate}
              >
                Use next available date
              </Button>
            </div>
          )}
        </FormSection>

        <div className="space-y-2 pb-1">
          <Label htmlFor="notes" className="text-sm font-medium text-[#1C103D]">
            Notes
          </Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Allergies, preferences, special requests..."
            className="min-h-[72px] resize-none rounded-xl border-stone-200 bg-stone-50/50 focus:border-violet-300 focus:ring-violet-100"
          />
        </div>
      </div>

      <div className="shrink-0 border-t border-stone-100 bg-white/95 px-6 py-4 backdrop-blur-sm">
        {error && (
          <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600 ring-1 ring-red-100">
            {error}
          </p>
        )}
        <Button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded-xl border-0 bg-gradient-to-r from-[#6C3BFF] via-[#7C4DFF] to-[#8B5CF6] text-white shadow-lg shadow-violet-500/30 transition-all hover:from-[#5B2FE0] hover:via-[#6C3BFF] hover:to-[#7C4DFF] hover:shadow-violet-500/40 disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Scheduling...
            </>
          ) : (
            "Schedule appointment"
          )}
        </Button>
      </div>
    </form>
  );
}
