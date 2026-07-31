"use client";

import { useState } from "react";
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
import type { Employee, PrefilledCustomer, Service } from "./types";

export function AppointmentForm({
  services,
  employees,
  prefilledCustomer,
  defaultScheduledAt,
  onSuccess,
}: {
  services: Service[];
  employees: Employee[];
  prefilledCustomer?: PrefilledCustomer;
  defaultScheduledAt?: string;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [employeeId, setEmployeeId] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("serviceId", serviceId);
    if (employeeId) formData.set("employeeId", employeeId);

    const result = await createAppointment(formData);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    onSuccess();
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
              {employees.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="scheduledAt">Date & time</Label>
          <Input
            id="scheduledAt"
            name="scheduledAt"
            type="datetime-local"
            required
            defaultValue={defaultScheduledAt}
            key={defaultScheduledAt ?? "default"}
            className="rounded-xl"
          />
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
