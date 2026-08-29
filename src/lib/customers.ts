import { prisma } from "@/lib/prisma";

type UpsertCustomerResult = Awaited<ReturnType<typeof prisma.customer.create>> & {
  isNew: boolean;
};

function normalizeCustomerName(name: string) {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

function namesMatch(left: string, right: string) {
  return normalizeCustomerName(left) === normalizeCustomerName(right);
}

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
    if (existing && namesMatch(existing.name, data.name)) {
      const customer = await prisma.customer.update({
        where: { id: existing.id },
        data: {
          phone: data.phone ?? existing.phone,
          email: data.email ?? existing.email,
        },
      });
      return { ...customer, isNew: false };
    }
  }

  if (data.phone) {
    const phoneMatches = await prisma.customer.findMany({
      where: { salonId, phone: data.phone },
      take: 20,
    });
    const byPhone = phoneMatches.find((customer) =>
      namesMatch(customer.name, data.name)
    );
    if (byPhone) {
      const customer = await prisma.customer.update({
        where: { id: byPhone.id },
        data: {
          email: data.email ?? byPhone.email,
        },
      });
      return { ...customer, isNew: false };
    }
  }

  const customer = await prisma.customer.create({
    data: {
      salonId,
      name: data.name.trim(),
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
