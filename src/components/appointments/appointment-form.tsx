"use client";

import { useEffect, useMemo, useState } from "react";
import { format, addDays, setHours, setMinutes, startOfDay } from "date-fns";
import { createAppointment } from "@/actions/appointments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomerAutocomplete } from "@/components/customers/customer-autocomplete";
import {
  BLOCKING_APPOINTMENT_STATUSES,
  getBusyEmployeeIds,
  type AppointmentSlot,
} from "@/lib/appointments/conflicts";
import {
  findNextOpenDate,
  getDayHours,
  validateAppointmentAgainstSalonHours,
} from "@/lib/appointments/salon-hours";
import type { OpeningHours } from "@/lib/onboarding";
import type { Appointment, Employee, PrefilledCustomer, Service } from "./types";

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
  const [serviceId, setServiceId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [scheduledAt, setScheduledAt] = useState(defaultScheduledAt ?? "");

  useEffect(() => {
    if (defaultScheduledAt) {
      setScheduledAt(defaultScheduledAt);
    }
  }, [defaultScheduledAt]);

  const selectedService = services.find((s) => s.id === serviceId);
  const appointmentSlots = useMemo(
    () => toAppointmentSlots(existingAppointments),
    [existingAppointments]
  );

  const busyEmployeeIds = useMemo(() => {
    if (!serviceId || !scheduledAt || !selectedService) {
      return new Set<string>();
    }
    const start = new Date(scheduledAt);
    if (Number.isNaN(start.getTime())) {
      return new Set<string>();
    }
    return getBusyEmployeeIds(
      start,
      selectedService.duration,
      employees.map((e) => e.id),
      appointmentSlots
    );
  }, [serviceId, scheduledAt, selectedService, employees, appointmentSlots]);

  const availableEmployees = useMemo(
    () => employees.filter((e) => !busyEmployeeIds.has(e.id)),
    [employees, busyEmployeeIds]
  );

  useEffect(() => {
    if (employeeId && busyEmployeeIds.has(employeeId)) {
      setEmployeeId("");
      setError(
        "Selected stylist is not available at this time. Please choose another stylist."
      );
    }
  }, [employeeId, busyEmployeeIds]);

  const salonHoursValidation = useMemo(() => {
    if (!scheduledAt || !selectedService) return null;
    const start = new Date(scheduledAt);
    if (Number.isNaN(start.getTime())) return null;
    return validateAppointmentAgainstSalonHours(
      openingHours,
      start,
      selectedService.duration
    );
  }, [scheduledAt, selectedService, openingHours]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (employeeId && busyEmployeeIds.has(employeeId)) {
      setLoading(false);
      setError(
        "Selected stylist is not available at this time. Please choose another stylist."
      );
      return;
    }

    if (selectedService && scheduledAt) {
      const start = new Date(scheduledAt);
      const hoursCheck = validateAppointmentAgainstSalonHours(
        openingHours,
        start,
        selectedService.duration
      );
      if (!hoursCheck.ok) {
        setLoading(false);
        setError(hoursCheck.error);
        return;
      }
    } else if (salonHoursValidation && !salonHoursValidation.ok) {
      setLoading(false);
      setError(salonHoursValidation.error);
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.set("serviceId", serviceId);
    formData.set("scheduledAt", scheduledAt);
    if (employeeId) formData.set("employeeId", employeeId);

    const result = await createAppointment(formData);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    onSuccess();
  }

  const showAvailabilityHint =
    Boolean(serviceId && scheduledAt) && employees.length > 0;

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <CustomerAutocomplete
        defaultCustomerId={prefilledCustomer?.customerId}
        defaultName={prefilledCustomer?.name}
        defaultPhone={prefilledCustomer?.phone}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="serviceId">Service</Label>
          <Select value={serviceId} onValueChange={setServiceId} required>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Select service" />
            </SelectTrigger>
            <SelectContent>
              {services.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} ({s.duration} min)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="employeeId">Stylist (optional)</Label>
          <Select value={employeeId} onValueChange={setEmployeeId}>
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="Any available" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any available</SelectItem>
              {employees.map((e) => {
                const busy = busyEmployeeIds.has(e.id);
                return (
                  <SelectItem key={e.id} value={e.id} disabled={busy}>
                    {busy ? `${e.name} (Unavailable at this time)` : e.name}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {showAvailabilityHint && (
            <p className="text-xs text-[#6B7280]">
              {availableEmployees.length > 0 ? (
                <>
                  Available:{" "}
                  {availableEmployees.map((e) => e.name).join(", ")}
                </>
              ) : (
                "No stylists are free at this time. Try another slot."
              )}
            </p>
          )}
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="scheduledAt">Date & time</Label>
          <Input
            id="scheduledAt"
            name="scheduledAt"
            type="datetime-local"
            required
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="rounded-xl"
          />
          {salonHoursIssue && (
            <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
              <p className="text-sm text-amber-900">
                {salonHoursValidation.error}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl bg-white"
                onClick={applyNextAvailableDate}
              >
                Use next available date
              </Button>
            </div>
          )}
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" className="rounded-xl" />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gradient-to-r from-[#6C3BFF] to-[#8B5CF6] hover:from-[#5B2FE0] hover:to-[#7C4DFF]"
      >
        {loading ? "Scheduling..." : "Schedule appointment"}
      </Button>
    </form>
  );
}
