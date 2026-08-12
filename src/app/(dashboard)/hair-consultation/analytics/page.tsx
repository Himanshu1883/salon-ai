import { requireSession } from "@/lib/auth";
import { getHairConsultationAnalytics } from "@/actions/hair-consultations";
import { canHairConsultation } from "@/lib/hair-consultation/permissions";
import { redirect } from "next/navigation";

export default async function HairConsultationAnalyticsPage() {
  const session = await requireSession();
  if (!canHairConsultation(session.user, "view_analytics")) {
    redirect("/hair-consultation");
  }

  const result = await getHairConsultationAnalytics();
  const analytics = result.analytics;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
      <h1 className="text-xl font-bold text-[#0F172A]">Hair Consultation Analytics</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[#ECECF5] bg-white p-5">
          <p className="text-sm text-[#64748B]">Total Consultations</p>
          <p className="text-3xl font-bold text-[#7C3AED]">
            {analytics?.totalConsultations ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-[#ECECF5] bg-white p-5">
          <p className="text-sm text-[#64748B]">Customer Approval Rate</p>
          <p className="text-3xl font-bold text-[#7C3AED]">
            {analytics?.approvalRate ?? 0}%
          </p>
        </div>
      </div>
      <section className="rounded-xl border border-[#ECECF5] bg-white p-5">
        <h2 className="font-semibold text-[#0F172A]">Top Hairstyles</h2>
        <ol className="mt-3 space-y-2">
          {(analytics?.topHairstyles ?? []).map((item, i) => (
            <li key={item.name} className="flex justify-between text-sm">
              <span>
                {i + 1}. {item.name}
              </span>
              <span className="text-[#64748B]">{item.count} tries</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
