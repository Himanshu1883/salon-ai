"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getInventoryAccess, requireInventoryWrite } from "@/lib/inventory/permissions";
import { recordStockMovement } from "@/lib/inventory/ledger";
import { z } from "zod";

const PATH = "/inventory/transfers";

async function nextTransferNumber(salonId: string) {
  const count = await prisma.branchTransfer.count({ where: { salonId } });
  return `TR-${String(count + 1).padStart(5, "0")}`;
}

export async function getBranches() {
  const { session } = await getInventoryAccess();
  return prisma.branch.findMany({
    where: { salonId: session.user.salonId },
    orderBy: [{ isMain: "desc" }, { name: "asc" }],
  });
}

export async function ensureDefaultBranch() {
  const { session } = await getInventoryAccess();
  const salonId = session.user.salonId;
  const existing = await prisma.branch.findFirst({ where: { salonId } });
  if (existing) return existing;

  const salon = await prisma.salon.findUnique({ where: { id: salonId } });
  return prisma.branch.create({
    data: {
      salonId,
      name: salon?.name ?? "Main Branch",
      address: salon?.address,
      isMain: true,
    },
  });
}

export async function getTransfers() {
  const { session } = await getInventoryAccess();
  return prisma.branchTransfer.findMany({
    where: { salonId: session.user.salonId },
    include: {
      fromBranch: { select: { name: true } },
      toBranch: { select: { name: true } },
      lineItems: {
        include: { stockItem: { select: { name: true, unit: true } } },
      },
    },
    orderBy: { transferDate: "desc" },
  });
}

export async function createTransfer(formData: FormData) {
  const { session, canWrite } = await getInventoryAccess();
  if (!canWrite) return { error: "Forbidden" };

  const fromBranchId = formData.get("fromBranchId") as string;
  const toBranchId = formData.get("toBranchId") as string;
  const notes = (formData.get("notes") as string) || null;
  const linesJson = formData.get("lines") as string;

  if (fromBranchId === toBranchId) {
    return { error: "Source and destination branches must differ" };
  }

  let lines: Array<{ stockItemId: string; quantity: number }>;
  try {
    lines = JSON.parse(linesJson);
  } catch {
    return { error: "Invalid line items" };
  }
  if (!lines.length) return { error: "Add at least one line item" };

  const transferNumber = await nextTransferNumber(session.user.salonId);

  await prisma.$transaction(async (tx) => {
    const transfer = await tx.branchTransfer.create({
      data: {
        salonId: session.user.salonId,
        transferNumber,
        fromBranchId,
        toBranchId,
        status: "in_transit",
        notes,
        lineItems: {
          create: lines.map((l) => ({
            stockItemId: l.stockItemId,
            quantity: l.quantity,
          })),
        },
      },
    });

    for (const line of lines) {
      await recordStockMovement(tx, {
        salonId: session.user.salonId,
        stockItemId: line.stockItemId,
        movementType: "transfer_out",
        quantity: -line.quantity,
        referenceType: "transfer",
        referenceId: transfer.id,
        notes: `Transfer ${transferNumber} out`,
        createdById: session.user.id,
      });
    }
  });

  revalidatePath(PATH);
  revalidatePath("/inventory/ledger");
  return { success: true };
}

export async function receiveTransfer(id: string) {
  await requireInventoryWrite();
  const { session } = await getInventoryAccess();

  const transfer = await prisma.branchTransfer.findFirst({
    where: { id, salonId: session.user.salonId },
    include: { lineItems: true },
  });
  if (!transfer) return { error: "Transfer not found" };
  if (transfer.status === "received") return { error: "Already received" };

  await prisma.$transaction(async (tx) => {
    for (const line of transfer.lineItems) {
      await recordStockMovement(tx, {
        salonId: session.user.salonId,
        stockItemId: line.stockItemId,
        movementType: "transfer_in",
        quantity: line.quantity,
        referenceType: "transfer",
        referenceId: transfer.id,
        notes: `Transfer ${transfer.transferNumber} in`,
        createdById: session.user.id,
      });
    }

    await tx.branchTransfer.update({
      where: { id },
      data: { status: "received", receivedDate: new Date() },
    });
  });

  revalidatePath(PATH);
  revalidatePath("/inventory/ledger");
  return { success: true };
}

export async function createBranch(formData: FormData) {
  await requireInventoryWrite();
  const { session } = await getInventoryAccess();
  const name = (formData.get("name") as string)?.trim();
  const address = (formData.get("address") as string) || null;
  if (!name) return { error: "Branch name required" };

  await prisma.branch.create({
    data: { salonId: session.user.salonId, name, address },
  });
  revalidatePath(PATH);
  return { success: true };
}
