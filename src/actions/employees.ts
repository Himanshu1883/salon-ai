"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { employeeSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function getEmployees(search?: string) {
  const session = await requireSession();
  return prisma.employee.findMany({
    where: {
      salonId: session.user.salonId,
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { email: { contains: search } },
              { role: { contains: search } },
            ],
          }
        : {}),
    },
    include: {
      services: { include: { service: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function createEmployee(formData: FormData) {
  const session = await requireSession();
  const serviceIds = formData.getAll("serviceIds") as string[];

  const raw = {
    name: formData.get("name") as string,
    phone: (formData.get("phone") as string) || undefined,
    email: (formData.get("email") as string) || undefined,
    role: formData.get("role") as string,
    specialties: (formData.get("specialties") as string) || undefined,
    status: formData.get("status") as string,
    serviceIds,
  };

  const parsed = employeeSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await prisma.employee.create({
    data: {
      salonId: session.user.salonId,
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      role: parsed.data.role,
      specialties: parsed.data.specialties,
      status: parsed.data.status,
      services: parsed.data.serviceIds?.length
        ? {
            create: parsed.data.serviceIds.map((serviceId) => ({
              serviceId,
            })),
          }
        : undefined,
    },
  });

  revalidatePath("/employees");
  revalidatePath("/team/members");
  revalidatePath("/team/shifts");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateEmployee(id: string, formData: FormData) {
  const session = await requireSession();
  const serviceIds = formData.getAll("serviceIds") as string[];

  const raw = {
    name: formData.get("name") as string,
    phone: (formData.get("phone") as string) || undefined,
    email: (formData.get("email") as string) || undefined,
    role: formData.get("role") as string,
    specialties: (formData.get("specialties") as string) || undefined,
    status: formData.get("status") as string,
    serviceIds,
  };

  const parsed = employeeSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const employee = await prisma.employee.findFirst({
    where: { id, salonId: session.user.salonId },
  });
  if (!employee) return { error: "Employee not found" };

  await prisma.$transaction([
    prisma.employeeService.deleteMany({ where: { employeeId: id } }),
    prisma.employee.update({
      where: { id },
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
        email: parsed.data.email || null,
        role: parsed.data.role,
        specialties: parsed.data.specialties,
        status: parsed.data.status,
        services: parsed.data.serviceIds?.length
          ? {
              create: parsed.data.serviceIds.map((serviceId) => ({
                serviceId,
              })),
            }
          : undefined,
      },
    }),
  ]);

  revalidatePath("/employees");
  revalidatePath("/team/members");
  revalidatePath("/team/shifts");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteEmployee(id: string) {
  const session = await requireSession();
  const employee = await prisma.employee.findFirst({
    where: { id, salonId: session.user.salonId },
  });
  if (!employee) return { error: "Employee not found" };

  await prisma.employee.delete({ where: { id } });
  revalidatePath("/employees");
  revalidatePath("/team/members");
  revalidatePath("/team/shifts");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getActiveEmployees() {
  const session = await requireSession();
  return prisma.employee.findMany({
    where: { salonId: session.user.salonId, status: "active" },
    orderBy: { name: "asc" },
  });
}
