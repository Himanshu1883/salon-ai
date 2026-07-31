"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getInventoryAccess, requireInventoryWrite } from "@/lib/inventory/permissions";
import { z } from "zod";

const PATH = "/inventory/purchase-orders";

async function nextOrderNumber(salonId: string) {
  const count = await prisma.purchaseOrder.count({ where: { salonId } });
  return `PO-${String(count + 1).padStart(5, "0")}`;
}

export async function getPurchaseOrders() {
  const { session } = await getInventoryAccess();
  return prisma.purchaseOrder.findMany({
    where: { salonId: session.user.salonId },
    include: {
      supplier: { select: { id: true, name: true } },
      lines: {
        include: { stockItem: { select: { id: true, name: true, unit: true } } },
      },
      _count: { select: { goodsReceipts: true } },
    },
    orderBy: { orderDate: "desc" },
  });
}

export async function getPurchaseOrder(id: string) {
  const { session } = await getInventoryAccess();
  return prisma.purchaseOrder.findFirst({
    where: { id, salonId: session.user.salonId },
    include: {
      supplier: true,
      lines: { include: { stockItem: true } },
      goodsReceipts: { include: { lineItems: true } },
    },
  });
}

export async function createPurchaseOrder(formData: FormData) {
  const { session, canWrite } = await getInventoryAccess();
  if (!canWrite) return { error: "Forbidden" };

  const supplierId = (formData.get("supplierId") as string) || null;
  const notes = (formData.get("notes") as string) || null;
  const expectedDateStr = formData.get("expectedDate") as string;
  const linesJson = formData.get("lines") as string;

  let lines: Array<{ stockItemId: string; quantityOrdered: number; unitCost: number }>;
  try {
    lines = JSON.parse(linesJson);
  } catch {
    return { error: "Invalid line items" };
  }
  if (!lines.length) return { error: "Add at least one line item" };

  const orderNumber = await nextOrderNumber(session.user.salonId);

  const po = await prisma.purchaseOrder.create({
    data: {
      salonId: session.user.salonId,
      orderNumber,
      supplierId: supplierId || undefined,
      status: "ordered",
      expectedDate: expectedDateStr ? new Date(expectedDateStr) : undefined,
      notes,
      lines: {
        create: lines.map((l) => ({
          stockItemId: l.stockItemId,
          quantityOrdered: l.quantityOrdered,
          unitCost: l.unitCost,
        })),
      },
    },
  });

  revalidatePath(PATH);
  return { success: true, id: po.id };
}

export async function updatePurchaseOrderStatus(id: string, status: string) {
  await requireInventoryWrite();
  const { session } = await getInventoryAccess();

  const po = await prisma.purchaseOrder.findFirst({
    where: { id, salonId: session.user.salonId },
  });
  if (!po) return { error: "Purchase order not found" };

  await prisma.purchaseOrder.update({ where: { id }, data: { status } });
  revalidatePath(PATH);
  return { success: true };
}

export async function getProductsForSelect() {
  const { session } = await getInventoryAccess();
  return prisma.stockItem.findMany({
    where: { salonId: session.user.salonId, status: "active" },
    select: { id: true, name: true, unit: true, sku: true, costPrice: true },
    orderBy: { name: "asc" },
  });
}

export async function getVendorsForSelect() {
  const { session } = await getInventoryAccess();
  return prisma.supplier.findMany({
    where: { salonId: session.user.salonId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}
