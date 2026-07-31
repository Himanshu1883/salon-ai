import "dotenv/config";
import { createPrismaClient } from "../src/lib/create-prisma-client";

const PRICE_BY_NAME: Record<string, number> = {
  "Women's Haircut": 800,
  "Men's Haircut": 400,
  "Full Color": 3500,
  Highlights: 2800,
  Blowout: 600,
  "Deep Conditioning": 900,
};

const prisma = createPrismaClient();

async function main() {
  const services = await prisma.service.findMany();
  let serviceUpdates = 0;

  for (const service of services) {
    const newPrice = PRICE_BY_NAME[service.name];
    if (newPrice === undefined) continue;
    if (service.price === newPrice) continue;
    await prisma.service.update({
      where: { id: service.id },
      data: { price: newPrice },
    });
    console.log(`Service: ${service.name} ${service.price} → ${newPrice}`);
    serviceUpdates++;
  }

  const lineItems = await prisma.invoiceLineItem.findMany({
    include: { service: true, invoice: true },
  });
  let lineItemUpdates = 0;
  const touchedInvoiceIds = new Set<string>();

  for (const item of lineItems) {
    const name = item.service?.name ?? item.description;
    const newUnit = PRICE_BY_NAME[name];
    if (newUnit === undefined) continue;
    const newTotal = newUnit * item.quantity;
    if (item.unitPrice === newUnit && item.total === newTotal) continue;
    await prisma.invoiceLineItem.update({
      where: { id: item.id },
      data: { unitPrice: newUnit, total: newTotal },
    });
    console.log(`Line item: ${name} ${item.unitPrice} → ${newUnit}`);
    lineItemUpdates++;
    touchedInvoiceIds.add(item.invoiceId);
  }

  let invoiceUpdates = 0;
  for (const invoiceId of touchedInvoiceIds) {
    const items = await prisma.invoiceLineItem.findMany({ where: { invoiceId } });
    const subtotal = items.reduce((sum, i) => sum + i.total, 0);
    const invoice = await prisma.invoice.findUniqueOrThrow({ where: { id: invoiceId } });
    const taxRate = invoice.subtotal > 0 ? invoice.tax / invoice.subtotal : 0.08;
    const tax = Math.round(subtotal * taxRate * 100) / 100;
    const total = subtotal + tax;
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { subtotal, tax, total },
    });
    console.log(`Invoice ${invoiceId}: subtotal=${subtotal}, tax=${tax}, total=${total}`);
    invoiceUpdates++;
  }

  console.log(
    `Done. Services: ${serviceUpdates}, line items: ${lineItemUpdates}, invoices: ${invoiceUpdates}`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
