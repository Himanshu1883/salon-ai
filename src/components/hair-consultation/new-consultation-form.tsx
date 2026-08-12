"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createHairConsultation } from "@/actions/hair-consultations";
import { Button } from "@/components/ui/button";

type Props = {
  customers: { id: string; name: string; phone: string | null }[];
  services: { id: string; name: string; price: number }[];
  employees: { id: string; name: string }[];
};

export function NewConsultationForm({ customers, services, employees }: Props) {
  const router = useRouter();
  const [customerId, setCustomerId] = useState("");
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [employeeId, setEmployeeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customerId) {
      setError("Select a customer");
      return;
    }
    setLoading(true);
    setError(null);
    const result = await createHairConsultation({
      customerId,
      serviceId: serviceId || undefined,
      employeeId: employeeId || undefined,
    });
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push(`/hair-consultation/${result.consultationId}`);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-[#0F172A]">Customer</span>
        <select
          required
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[#ECECF5] px-3 py-3 text-sm"
        >
          <option value="">Select customer…</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} {c.phone ? `· ${c.phone}` : ""}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-sm font-medium text-[#0F172A]">Service</span>
        <select
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[#ECECF5] px-3 py-3 text-sm"
        >
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} · ₹{s.price}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-sm font-medium text-[#0F172A]">Stylist</span>
        <select
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[#ECECF5] px-3 py-3 text-sm"
        >
          <option value="">Optional</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full bg-[#7C3AED]">
        {loading ? "Starting…" : "Start Consultation"}
      </Button>
    </form>
  );
}
