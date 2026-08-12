import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sparkles, BarChart3, Settings2, UserPlus } from "lucide-react";
import { canHairConsultation } from "@/lib/hair-consultation/permissions";

export default async function HairConsultationPage() {
  const session = await requireSession();
  const salonId = session.user.salonId!;

  const recent = await prisma.hairConsultation.findMany({
    where: { salonId },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      customer: true,
      selectedHairstyle: true,
      service: true,
    },
  });

  const canManage = canHairConsultation(session.user, "manage_styles");
  const canAnalytics = canHairConsultation(session.user, "view_analytics");

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#7C3AED]">Premium Module</p>
          <h1 className="text-2xl font-bold text-[#0F172A]">AI Hair Consultation</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Virtual try-on and face-shape recommendations for your customers.
          </p>
        </div>
        <Link
          href="/hair-consultation/new"
          className="inline-flex items-center gap-2 rounded-xl bg-[#7C3AED] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#7C3AED]/20"
        >
          <UserPlus className="h-4 w-4" />
          New Consultation
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {canAnalytics && (
          <Link
            href="/hair-consultation/analytics"
            className="flex items-center gap-3 rounded-xl border border-[#ECECF5] bg-white p-4 hover:border-[#7C3AED]/30"
          >
            <BarChart3 className="h-5 w-5 text-[#7C3AED]" />
            <span className="text-sm font-medium">Analytics</span>
          </Link>
        )}
        {canManage && (
          <Link
            href="/hair-consultation/admin"
            className="flex items-center gap-3 rounded-xl border border-[#ECECF5] bg-white p-4 hover:border-[#7C3AED]/30"
          >
            <Settings2 className="h-5 w-5 text-[#7C3AED]" />
            <span className="text-sm font-medium">Manage Hairstyles</span>
          </Link>
        )}
        <div className="flex items-center gap-3 rounded-xl border border-[#ECECF5] bg-[#F5F3FF] p-4">
          <Sparkles className="h-5 w-5 text-[#7C3AED]" />
          <span className="text-sm font-medium">{recent.length} recent sessions</span>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#64748B]">
          Recent Consultations
        </h2>
        {recent.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[#ECECF5] p-8 text-center text-sm text-[#64748B]">
            No consultations yet. Start from a customer profile or create a new session.
          </p>
        ) : (
          <ul className="space-y-2">
            {recent.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/hair-consultation/${c.id}`}
                  className="flex items-center justify-between rounded-xl border border-[#ECECF5] bg-white px-4 py-3 hover:border-[#7C3AED]/30"
                >
                  <div>
                    <p className="font-medium text-[#0F172A]">{c.customer.name}</p>
                    <p className="text-xs text-[#64748B]">
                      {c.selectedHairstyle?.name ?? "In progress"} ·{" "}
                      {c.service?.name ?? "Consultation"}
                    </p>
                  </div>
                  <span className="text-xs text-[#64748B]">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
