import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createHairConsultation } from "@/actions/hair-consultations";
import { seedDefaultHairstylesForSalon } from "@/actions/hairstyles";
import { redirect } from "next/navigation";
import { NewConsultationForm } from "@/components/hair-consultation/new-consultation-form";

type Props = {
  searchParams: Promise<{ customerId?: string; serviceId?: string }>;
};

export default async function NewHairConsultationPage({ searchParams }: Props) {
  const session = await requireSession();
  const salonId = session.user.salonId!;
  const params = await searchParams;

  await seedDefaultHairstylesForSalon();

  if (params.customerId) {
    const hairServices = await prisma.service.findMany({
      where: {
        salonId,
        OR: [
          { name: { contains: "hair", mode: "insensitive" } },
          { name: { contains: "cut", mode: "insensitive" } },
        ],
      },
      take: 1,
    });
    const result = await createHairConsultation({
      customerId: params.customerId,
      serviceId: params.serviceId ?? hairServices[0]?.id,
    });
    if (result.consultationId) {
      redirect(`/hair-consultation/${result.consultationId}`);
    }
  }

  const [customers, services, employees] = await Promise.all([
    prisma.customer.findMany({
      where: { salonId },
      orderBy: { name: "asc" },
      take: 200,
    }),
    prisma.service.findMany({
      where: { salonId },
      orderBy: { name: "asc" },
    }),
    prisma.employee.findMany({
      where: { salonId, status: "active" },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-lg p-4 md:p-8">
      <h1 className="text-xl font-bold text-[#0F172A]">Start Hair Consultation</h1>
      <p className="mt-1 text-sm text-[#64748B]">Select customer and service to begin.</p>
      <NewConsultationForm
        customers={customers.map((c) => ({ id: c.id, name: c.name, phone: c.phone }))}
        services={services.map((s) => ({ id: s.id, name: s.name, price: s.price }))}
        employees={employees.map((e) => ({ id: e.id, name: e.name }))}
      />
    </div>
  );
}
