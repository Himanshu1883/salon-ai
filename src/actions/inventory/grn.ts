"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getInventoryAccess, requireInventoryWrite } from "@/lib/inventory/permissions";
import { recordStockMovement } from "@/lib/inventory/ledger";

const PATH = "/inventory/grn";

async function nextGrnNumber(salonId: string) {
  const count = await prisma.goodsReceipt.count({ where: { salonId } });
  return `GRN-${String(count + 1).padStart(5, "0")}`;
}

export async function getGoodsReceipts() {
  const { session } = await getInventoryAccess();
  return prisma.goodsReceipt.findMany({
    where: { salonId: session.user.salonId },
    include: {
      supplier: { select: { name: true } },
      purchaseOrder: { select: { orderNumber: true } },
      lineItems: {
        include: { stockItem: { select: { name: true, unit: true } } },
      },
    },
    orderBy: { receivedDate: "desc" },
  });
}

export async function receiveGoods(formData: FormData) {
  await requireInventoryWrite();
  const { session } = await getInventoryAccess();
  const salonId = session.user.salonId;

  const purchaseOrderId = (formData.get("purchaseOrderId") as string) || null;
  const supplierId = (formData.get("supplierId") as string) || null;
  const notes = (formData.get("notes") as string) || null;
  const linesJson = formData.get("lines") as string;

  let lines: Array<{
    stockItemId: string;
    quantity: number;
    unitCost: number;
    batchNumber?: string;
    expiryDate?: string;
  }>;
  try {
    lines = JSON.parse(linesJson);
  } catch {
    return { error: "Invalid line items" };
  }
  if (!lines.length) return { error: "Add at least one line item" };

  const grnNumber = await nextGrnNumber(salonId);

  await prisma.$transaction(async (tx) => {
    const grn = await tx.goodsReceipt.create({
      data: {
        salonId,
        grnNumber,
        purchaseOrderId: purchaseOrderId || undefined,
        supplierId: supplierId || undefined,
        notes,
        lineItems: {
          create: lines.map((l) => ({
            stockItemId: l.stockItemId,
            quantity: l.quantity,
            unitCost: l.unitCost,
            batchNumber: l.batchNumber,
            expiryDate: l.expiryDate ? new Date(l.expiryDate) : undefined,
          })),
        },
      },
    });

    for (const line of lines) {
      await recordStockMovement(tx, {
        salonId,
        stockItemId: line.stockItemId,
        movementType: "grn",
        quantity: line.quantity,
        unitCost: line.unitCost,
        referenceType: "grn",
        referenceId: grn.id,
        notes: `GRN ${grnNumber}`,
        createdById: session.user.id,
        updateAvgCost: true,
      });

      if (line.expiryDate || line.batchNumber) {
        await tx.stockItem.update({
          where: { id: line.stockItemId },
          data: {
            ...(line.expiryDate ? { expiryDate: new Date(line.expiryDate) } : {}),
            ...(line.batchNumber ? { batchNumber: line.batchNumber } : {}),
          },
        });
      }

      if (purchaseOrderId) {
        const poLine = await tx.purchaseOrderLine.findFirst({
          where: { purchaseOrderId, stockItemId: line.stockItemId },
        });
        if (poLine) {
          await tx.purchaseOrderLine.update({
            where: { id: poLine.id },
            data: { quantityReceived: poLine.quantityReceived + line.quantity },
          });
        }
      }
    }

    if (purchaseOrderId) {
      const poLines = await tx.purchaseOrderLine.findMany({
        where: { purchaseOrderId },
      });
      const allReceived = poLines.every((l) => l.quantityReceived >= l.quantityOrdered);
      const anyReceived = poLines.some((l) => l.quantityReceived > 0);
      await tx.purchaseOrder.update({
        where: { id: purchaseOrderId },
        data: {
          status: allReceived ? "received" : anyReceived ? "partial" : "ordered",
        },
      });
    }
  });

  revalidatePath(PATH);
  revalidatePath("/inventory/purchase-orders");
  revalidatePath("/inventory/products");
  revalidatePath("/inventory/ledger");
  return { success: true };
}

export async function getOpenPurchaseOrders() {
  const { session } = await getInventoryAccess();
  return prisma.purchaseOrder.findMany({
    where: {
      salonId: session.user.salonId,
      status: { in: ["ordered", "partial"] },
    },
    include: {
      lines: { include: { stockItem: { select: { id: true, name: true, unit: true } } } },
    },
    orderBy: { orderDate: "desc" },
  });
}
