import { prisma } from "@/lib/prisma";

type UpsertCustomerResult = Awaited<ReturnType<typeof prisma.customer.create>> & {
  isNew: boolean;
};

export async function upsertCustomer(
  salonId: string,
  data: {
    name: string;
    phone?: string | null;
    email?: string | null;
    customerId?: string | null;
  }
): Promise<UpsertCustomerResult> {
  if (data.customerId) {
    const existing = await prisma.customer.findFirst({
      where: { id: data.customerId, salonId },
    });
    if (existing) {
      const customer = await prisma.customer.update({
        where: { id: existing.id },
        data: {
          name: data.name,
          phone: data.phone ?? existing.phone,
          email: data.email ?? existing.email,
        },
      });
      return { ...customer, isNew: false };
    }
  }

  if (data.phone) {
    const byPhone = await prisma.customer.findFirst({
      where: { salonId, phone: data.phone },
    });
    if (byPhone) {
      const customer = await prisma.customer.update({
        where: { id: byPhone.id },
        data: {
          name: data.name,
          email: data.email ?? byPhone.email,
        },
      });
      return { ...customer, isNew: false };
    }
  }

  const customer = await prisma.customer.create({
    data: {
      salonId,
      name: data.name,
      phone: data.phone,
      email: data.email,
    },
  });
  return { ...customer, isNew: true };
}

export async function linkInvoiceToCustomer(
  salonId: string,
  invoiceId: string,
  customerName: string,
  customerPhone?: string | null,
  customerId?: string | null
) {
  const customer = await upsertCustomer(salonId, {
    customerId,
    name: customerName,
    phone: customerPhone,
  });

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { customerId: customer.id },
  });

  return customer;
}
