import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { MovementType } from "./constants";

export type RecordMovementInput = {
  salonId: string;
  stockItemId: string;
  movementType: MovementType;
  quantity: number;
  unitCost?: number | null;
  referenceType?: string | null;
  referenceId?: string | null;
  appointmentId?: string | null;
  customerId?: string | null;
  employeeId?: string | null;
  invoiceId?: string | null;
  notes?: string | null;
  createdById?: string | null;
  updateAvgCost?: boolean;
};

function computeAvgCost(
  currentQty: number,
  currentAvg: number,
  incomingQty: number,
  incomingCost: number
) {
  if (incomingQty <= 0) return currentAvg;
  const totalValue = currentQty * currentAvg + incomingQty * incomingCost;
  const totalQty = currentQty + incomingQty;
  return totalQty > 0 ? totalValue / totalQty : incomingCost;
}

export async function recordStockMovement(
  tx: Prisma.TransactionClient,
  input: RecordMovementInput
) {
  const item = await tx.stockItem.findFirst({
    where: { id: input.stockItemId, salonId: input.salonId },
  });
  if (!item) throw new Error("Stock item not found");

  const newQty = item.quantityOnHand + input.quantity;
  if (newQty < 0) {
    throw new Error(`Insufficient stock for ${item.name}`);
  }

  let avgCost = item.avgCost;
  if (input.updateAvgCost && input.quantity > 0 && input.unitCost != null) {
    avgCost = computeAvgCost(
      item.quantityOnHand,
      item.avgCost,
      input.quantity,
      input.unitCost
    );
  }

  await tx.stockItem.update({
    where: { id: item.id },
    data: {
      quantityOnHand: newQty,
      avgCost,
      ...(input.unitCost != null && input.quantity > 0
        ? { costPrice: input.unitCost }
        : {}),
    },
  });

  const entry = await tx.stockLedgerEntry.create({
    data: {
      salonId: input.salonId,
      stockItemId: input.stockItemId,
      movementType: input.movementType,
      quantity: input.quantity,
      quantityAfter: newQty,
      unitCost: input.unitCost ?? item.avgCost,
      referenceType: input.referenceType,
      referenceId: input.referenceId,
      appointmentId: input.appointmentId,
      customerId: input.customerId,
      employeeId: input.employeeId,
      invoiceId: input.invoiceId,
      notes: input.notes,
      createdById: input.createdById,
    },
  });

  return { entry, quantityAfter: newQty, avgCost };
}

export async function consumeServiceRecipesForAppointment(
  salonId: string,
  appointmentId: string,
  serviceId: string,
  customerId?: string | null,
  employeeId?: string | null,
  createdById?: string | null
) {
  const recipes = await prisma.serviceRecipe.findMany({
    where: { salonId, serviceId },
    include: { stockItem: true },
  });

  if (recipes.length === 0) return { consumed: 0 };

  await prisma.$transaction(async (tx) => {
    for (const recipe of recipes) {
      const qty = Math.ceil(recipe.quantity);
      if (qty <= 0) continue;

      await recordStockMovement(tx, {
        salonId,
        stockItemId: recipe.stockItemId,
        movementType: "consumption",
        quantity: -qty,
        unitCost: recipe.stockItem.avgCost,
        referenceType: "appointment",
        referenceId: appointmentId,
        appointmentId,
        customerId,
        employeeId,
        notes: `Auto-consumed for service`,
        createdById,
      });
    }
  });

  return { consumed: recipes.length };
}

export async function deductRetailSale(
  tx: Prisma.TransactionClient,
  params: {
    salonId: string;
    stockItemId: string;
    quantity: number;
    invoiceId: string;
    customerId?: string | null;
    employeeId?: string | null;
    createdById?: string | null;
  }
) {
  return recordStockMovement(tx, {
    salonId: params.salonId,
    stockItemId: params.stockItemId,
    movementType: "sale",
    quantity: -params.quantity,
    referenceType: "invoice",
    referenceId: params.invoiceId,
    invoiceId: params.invoiceId,
    customerId: params.customerId,
    employeeId: params.employeeId,
    createdById: params.createdById,
  });
}
