"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getInventoryAccess, requireInventoryWrite } from "@/lib/inventory/permissions";
import { recordStockMovement } from "@/lib/inventory/ledger";
import { z } from "zod";

const PATH = "/inventory/adjustments";

const adjustmentSchema = z.object({
  stockItemId: z.string().min(1),
  adjustmentType: z.enum(["increase", "decrease"]),
  quantity: z.coerce.number().int().positive(),
  reason: z.string().min(2),
  notes: z.string().optional(),
});

export async function getAdjustments() {
  const { session } = await getInventoryAccess();
  return prisma.stockAdjustment.findMany({
    where: { salonId: session.user.salonId },
    include: {
      stockItem: { select: { id: true, name: true, unit: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function createAdjustment(formData: FormData) {
  const { session, canWrite } = await getInventoryAccess();
  if (!canWrite) return { error: "Forbidden" };

  const parsed = adjustmentSchema.safeParse({
    stockItemId: formData.get("stockItemId"),
    adjustmentType: formData.get("adjustmentType"),
    quantity: formData.get("quantity"),
    reason: formData.get("reason"),
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const qtyDelta =
    parsed.data.adjustmentType === "increase"
      ? parsed.data.quantity
      : -parsed.data.quantity;

  await prisma.$transaction(async (tx) => {
    const adjustment = await tx.stockAdjustment.create({
      data: {
        salonId: session.user.salonId,
        stockItemId: parsed.data.stockItemId,
        adjustmentType: parsed.data.adjustmentType,
        quantity: parsed.data.quantity,
        reason: parsed.data.reason,
        notes: parsed.data.notes,
        status: "approved",
        createdById: session.user.id,
        approvedById: session.user.id,
      },
    });

    await recordStockMovement(tx, {
      salonId: session.user.salonId,
      stockItemId: parsed.data.stockItemId,
      movementType: "adjustment",
      quantity: qtyDelta,
      referenceType: "adjustment",
      referenceId: adjustment.id,
      notes: `${parsed.data.reason}: ${parsed.data.notes ?? ""}`.trim(),
      createdById: session.user.id,
    });
  });

  revalidatePath(PATH);
  revalidatePath("/inventory/ledger");
  revalidatePath("/inventory/products");
  return { success: true };
}
