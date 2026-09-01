import { prisma } from "@/lib/prisma";

export async function getPublicInvoice(id: string) {
  if (!id || id === "preview") return null;

  return prisma.invoice.findUnique({
    where: { id },
    select: {
      id: true,
      customerName: true,
      customerPhone: true,
      status: true,
      subtotal: true,
      tax: true,
      total: true,
      dueDate: true,
      paidAt: true,
      paymentMethod: true,
      notes: true,
      createdAt: true,
      salon: {
        select: {
          name: true,
          phone: true,
          address: true,
          logoUrl: true,
          businessEmail: true,
          businessPhone: true,
        },
      },
      employee: { select: { name: true } },
      seat: { select: { number: true } },
      lineItems: {
        select: {
          description: true,
          quantity: true,
          unitPrice: true,
          total: true,
          service: { select: { name: true } },
        },
      },
    },
  });
}
