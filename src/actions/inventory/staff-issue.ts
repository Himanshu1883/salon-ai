"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getInventoryAccess, requireInventoryWrite } from "@/lib/inventory/permissions";
import { recordStockMovement } from "@/lib/inventory/ledger";
import { z } from "zod";

const PATH = "/inventory/staff-issue";

const issueSchema = z.object({
  employeeId: z.string().min(1),
  stockItemId: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
  notes: z.string().optional(),
});

const returnSchema = z.object({
  issueId: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
  notes: z.string().optional(),
});

export async function getStaffIssues() {
  const { session } = await getInventoryAccess();
  return prisma.staffProductIssue.findMany({
    where: { salonId: session.user.salonId },
    include: {
      employee: { select: { id: true, name: true } },
      stockItem: { select: { id: true, name: true, unit: true } },
      returns: true,
    },
    orderBy: { issueDate: "desc" },
    take: 100,
  });
}

export async function getEmployeesForIssue() {
  const { session } = await getInventoryAccess();
  return prisma.employee.findMany({
    where: { salonId: session.user.salonId, status: "active" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function issueProductToStaff(formData: FormData) {
  const { session, canWrite } = await getInventoryAccess();
  if (!canWrite) return { error: "Forbidden" };

  const parsed = issueSchema.safeParse({
    employeeId: formData.get("employeeId"),
    stockItemId: formData.get("stockItemId"),
    quantity: formData.get("quantity"),
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  await prisma.$transaction(async (tx) => {
    const issue = await tx.staffProductIssue.create({
      data: {
        salonId: session.user.salonId,
        employeeId: parsed.data.employeeId,
        stockItemId: parsed.data.stockItemId,
        quantity: parsed.data.quantity,
        notes: parsed.data.notes,
        status: "issued",
      },
    });

    await recordStockMovement(tx, {
      salonId: session.user.salonId,
      stockItemId: parsed.data.stockItemId,
      movementType: "issue",
      quantity: -parsed.data.quantity,
      referenceType: "staff_issue",
      referenceId: issue.id,
      employeeId: parsed.data.employeeId,
      notes: parsed.data.notes,
      createdById: session.user.id,
    });
  });

  revalidatePath(PATH);
  revalidatePath("/inventory/ledger");
  revalidatePath("/inventory/products");
  return { success: true };
}

export async function returnProductFromStaff(formData: FormData) {
  const { session, canWrite } = await getInventoryAccess();
  if (!canWrite) return { error: "Forbidden" };

  const parsed = returnSchema.safeParse({
    issueId: formData.get("issueId"),
    quantity: formData.get("quantity"),
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const issue = await prisma.staffProductIssue.findFirst({
    where: { id: parsed.data.issueId, salonId: session.user.salonId },
  });
  if (!issue) return { error: "Issue record not found" };

  const remaining = issue.quantity - issue.quantityReturned;
  if (parsed.data.quantity > remaining) {
    return { error: `Only ${remaining} units can be returned` };
  }

  await prisma.$transaction(async (tx) => {
    await tx.staffProductReturn.create({
      data: {
        issueId: parsed.data.issueId,
        quantity: parsed.data.quantity,
        notes: parsed.data.notes,
      },
    });

    const newReturned = issue.quantityReturned + parsed.data.quantity;
    await tx.staffProductIssue.update({
      where: { id: issue.id },
      data: {
        quantityReturned: newReturned,
        status: newReturned >= issue.quantity ? "returned" : "partial",
      },
    });

    await recordStockMovement(tx, {
      salonId: session.user.salonId,
      stockItemId: issue.stockItemId,
      movementType: "return",
      quantity: parsed.data.quantity,
      referenceType: "staff_return",
      referenceId: issue.id,
      employeeId: issue.employeeId,
      notes: parsed.data.notes,
      createdById: session.user.id,
    });
  });

  revalidatePath(PATH);
  revalidatePath("/inventory/ledger");
  return { success: true };
}
