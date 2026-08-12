"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { getCustomerHairConsultations } from "@/actions/hair-consultations";

type Props = {
  customerId: string;
};

export function CustomerHairConsultationTab({ customerId }: Props) {
  const [consultations, setConsultations] = useState<
    Awaited<ReturnType<typeof getCustomerHairConsultations>>["consultations"]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void getCustomerHairConsultations(customerId).then((r) => {
      if (r.success) setConsultations(r.consultations ?? []);
      setLoading(false);
    });
  }, [customerId]);

  if (loading) {
    return <p className="text-sm text-dashboard-muted">Loading…</p>;
  }

  return (
    <div className="space-y-4">
      <Link
        href={`/hair-consultation/new?customerId=${customerId}`}
        className="inline-flex items-center gap-2 rounded-xl bg-[#7C3AED] px-4 py-2.5 text-sm font-semibold text-white"
      >
        <Sparkles className="h-4 w-4" />
        Start AI Hair Consultation
      </Link>

      {consultations.length === 0 ? (
        <p className="rounded-xl border border-dashed border-dashboard-border p-6 text-sm text-dashboard-muted">
          No hair consultations yet. Try virtual hairstyles before the cut.
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {consultations.map((c) => (
            <li
              key={c.id}
              className="overflow-hidden rounded-xl border border-dashboard-border bg-white"
            >
              {c.photos[0]?.url && (
                <img
                  src={c.photos[0].url}
                  alt=""
                  className="aspect-video w-full object-cover"
                />
              )}
              <div className="p-4">
                <p className="text-sm font-medium text-dashboard-text">
                  {new Date(c.createdAt).toLocaleDateString()}
                </p>
                <p className="text-xs text-dashboard-muted">
                  {c.selectedHairstyle?.name ?? "In progress"}
                  {c.service ? ` · ${c.service.name}` : ""}
                </p>
                <Link
                  href={`/hair-consultation/${c.id}`}
                  className="mt-2 inline-block text-sm font-medium text-[#7C3AED]"
                >
                  View consultation →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
