"use server";

import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { cachedBySalon, scheduleSalonCacheRevalidation } from "@/lib/salon-cache";
import { employeeSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

function scheduleEmployeePageRevalidation(salonId: string) {
  scheduleSalonCacheRevalidation(salonId, "team", "catalog");
  after(() => {
    revalidatePath("/employees");
    revalidatePath("/team/members");
    revalidatePath("/team/shifts");
    revalidatePath("/dashboard");
    revalidatePath("/catalog/services");
    revalidatePath("/projects");
  });
}

const getCachedEmployeeOptions = cachedBySalon(
  "team",
  async (salonId: string) =>
    prisma.employee.findMany({
      where: { salonId, status: { not: "inactive" } },
      select: { id: true, name: true, avatarUrl: true },
      orderBy: { name: "asc" },
    }),
  { revalidate: 60, key: "employee-options" }
);

export async function getEmployeeOptions() {
  const session = await requireSession();
  return getCachedEmployeeOptions(session.user.salonId!);
}

const getCachedActiveEmployees = cachedBySalon(
  "team",
  async (salonId: string) =>
    prisma.employee.findMany({
      where: { salonId, status: "active" },
      select: {
        id: true,
        name: true,
        role: true,
        specialties: true,
        avatarUrl: true,
        email: true,
        phone: true,
        status: true,
        services: { select: { serviceId: true } },
      },
      orderBy: { name: "asc" },
    }),
  { revalidate: 60, key: "active-employees" }
);

export async function getActiveEmployees() {
  const session = await requireSession();
  return getCachedActiveEmployees(session.user.salonId!);
}

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

  scheduleEmployeePageRevalidation(session.user.salonId!);
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
    select: {
      id: true,
      services: { select: { serviceId: true } },
    },
  });
  if (!employee) return { error: "Employee not found" };

  const nextServiceIds = parsed.data.serviceIds ?? [];
  const previousServiceIds = employee.services.map((row) => row.serviceId);
  const previousSet = new Set(previousServiceIds);
  const nextSet = new Set(nextServiceIds);
  const toAdd = nextServiceIds.filter((serviceId) => !previousSet.has(serviceId));
  const toRemove = previousServiceIds.filter(
    (serviceId) => !nextSet.has(serviceId)
  );

  await prisma.$transaction(async (tx) => {
    if (toRemove.length > 0) {
      await tx.employeeService.deleteMany({
        where: { employeeId: id, serviceId: { in: toRemove } },
      });
    }
    if (toAdd.length > 0) {
      await tx.employeeService.createMany({
        data: toAdd.map((serviceId) => ({ employeeId: id, serviceId })),
        skipDuplicates: true,
      });
    }
    await tx.employee.update({
      where: { id },
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
        email: parsed.data.email || null,
        role: parsed.data.role,
        specialties: parsed.data.specialties,
        status: parsed.data.status,
      },
    });
  });

  scheduleEmployeePageRevalidation(session.user.salonId!);
  return { success: true };
}

export async function deleteEmployee(id: string) {
  const session = await requireSession();
  const employee = await prisma.employee.findFirst({
    where: { id, salonId: session.user.salonId },
  });
  if (!employee) return { error: "Employee not found" };

  await prisma.employee.delete({ where: { id } });
  scheduleEmployeePageRevalidation(session.user.salonId!);
  return { success: true };
}
