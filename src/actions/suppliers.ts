"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { supplierSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

const SUPPLIERS_PATH = "/inventory/suppliers";

export async function getSuppliers() {
  const session = await requireSession();
  return prisma.supplier.findMany({
    where: { salonId: session.user.salonId },
    orderBy: { name: "asc" },
  });
}

export async function createSupplier(formData: FormData) {
  const session = await requireSession();
  const raw = {
    name: formData.get("name") as string,
    phone: (formData.get("phone") as string) || undefined,
    email: (formData.get("email") as string) || undefined,
    address: (formData.get("address") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
  };

  const parsed = supplierSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await prisma.supplier.create({
    data: {
      salonId: session.user.salonId,
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      address: parsed.data.address,
      notes: parsed.data.notes,
    },
  });

  revalidatePath(SUPPLIERS_PATH);
  return { success: true };
}

export async function updateSupplier(id: string, formData: FormData) {
  const session = await requireSession();
  const raw = {
    name: formData.get("name") as string,
    phone: (formData.get("phone") as string) || undefined,
    email: (formData.get("email") as string) || undefined,
    address: (formData.get("address") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
  };

  const parsed = supplierSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const supplier = await prisma.supplier.findFirst({
    where: { id, salonId: session.user.salonId },
  });
  if (!supplier) return { error: "Supplier not found" };

  await prisma.supplier.update({
    where: { id },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      address: parsed.data.address,
      notes: parsed.data.notes,
    },
  });

  revalidatePath(SUPPLIERS_PATH);
  return { success: true };
}

export async function deleteSupplier(id: string) {
  const session = await requireSession();
  const supplier = await prisma.supplier.findFirst({
    where: { id, salonId: session.user.salonId },
  });
  if (!supplier) return { error: "Supplier not found" };

  await prisma.supplier.delete({ where: { id } });
  revalidatePath(SUPPLIERS_PATH);
  return { success: true };
}
