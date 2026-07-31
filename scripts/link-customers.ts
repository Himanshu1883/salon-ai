import "dotenv/config";
import { createPrismaClient } from "../src/lib/create-prisma-client";
import { upsertCustomer, linkInvoiceToCustomer } from "../src/lib/customers";

const prisma = createPrismaClient();

async function main() {
  const salons = await prisma.salon.findMany({ select: { id: true } });

  for (const salon of salons) {
    const unlinked = await prisma.invoice.findMany({
      where: { salonId: salon.id, customerId: null },
    });

    for (const invoice of unlinked) {
      await linkInvoiceToCustomer(
        salon.id,
        invoice.id,
        invoice.customerName,
        invoice.customerPhone
      );
    }

    const invoicePhones = await prisma.invoice.findMany({
      where: { salonId: salon.id, customerPhone: { not: null } },
      select: { customerName: true, customerPhone: true },
      distinct: ["customerPhone"],
    });

    for (const row of invoicePhones) {
      if (!row.customerPhone) continue;
      await upsertCustomer(salon.id, {
        name: row.customerName,
        phone: row.customerPhone,
      });
    }
  }

  console.log("Linked existing invoices to customer records.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
