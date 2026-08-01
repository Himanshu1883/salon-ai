"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { cachedBySalon, revalidateSalonCache } from "@/lib/salon-cache";
import { bulkCreateServicesSchema, serviceSchema } from "@/lib/validations";

function revalidateServices(salonId: string) {
  revalidateSalonCache(salonId, "catalog", "check-in", "billing");
}

async function fetchServicesGroupedByCategory(salonId: string) {
  const categories = await prisma.serviceCategory.findMany({
    where: { salonId },
    include: {
      services: {
        include: { employees: { include: { employee: true } } },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  const uncategorized = await prisma.service.findMany({
    where: { salonId, categoryId: null },
    include: { employees: { include: { employee: true } } },
    orderBy: { sortOrder: "asc" },
  });

  return { categories, uncategorized };
}

const getCachedServicesGrouped = cachedBySalon(
  "catalog",
  fetchServicesGroupedByCategory,
  { revalidate: 60, key: "grouped" }
);

export async function getServiceOptions() {
  const session = await requireSession();
  return prisma.service.findMany({
    where: { salonId: session.user.salonId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function getServices() {
  const session = await requireSession();
  return prisma.service.findMany({
    where: { salonId: session.user.salonId },
    include: {
      category: true,
      employees: { include: { employee: true } },
    },
    orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function getServicesGroupedByCategory() {
  const session = await requireSession();
  return getCachedServicesGrouped(session.user.salonId);
}

export async function searchServices(query: string, categoryId?: string | null) {
  const session = await requireSession();
  const q = query.trim();
  return prisma.service.findMany({
    where: {
      salonId: session.user.salonId,
      ...(categoryId ? { categoryId } : {}),
      ...(q
        ? { name: { contains: q } }
        : {}),
    },
    include: {
      category: true,
      employees: { include: { employee: true } },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function createService(formData: FormData) {
  const session = await requireSession();
  const employeeIds = formData.getAll("employeeIds") as string[];

  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    duration: formData.get("duration") as string,
    price: formData.get("price") as string,
    categoryId: formData.get("categoryId") as string,
    employeeIds,
  };

  const parsed = serviceSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const category = await prisma.serviceCategory.findFirst({
    where: { id: parsed.data.categoryId, salonId: session.user.salonId },
  });
  if (!category) return { error: "Category not found" };

  const maxOrder = await prisma.service.aggregate({
    where: {
      salonId: session.user.salonId,
      categoryId: parsed.data.categoryId,
    },
    _max: { sortOrder: true },
  });

  const service = await prisma.service.create({
    data: {
      salonId: session.user.salonId,
      name: parsed.data.name,
      description: parsed.data.description,
      duration: parsed.data.duration,
      price: parsed.data.price,
      categoryId: parsed.data.categoryId,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      employees: parsed.data.employeeIds?.length
        ? {
            create: parsed.data.employeeIds.map((employeeId) => ({
              employeeId,
            })),
          }
        : undefined,
    },
    include: {
      employees: { include: { employee: { select: { id: true, name: true } } } },
    },
  });

  revalidateServices(session.user.salonId);
  return {
    success: true,
    service: {
      id: service.id,
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price,
      categoryId: service.categoryId,
      sortOrder: service.sortOrder,
      employees: service.employees,
    },
  };
}

export async function updateService(id: string, formData: FormData) {
  const session = await requireSession();
  const employeeIds = formData.getAll("employeeIds") as string[];

  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
    duration: formData.get("duration") as string,
    price: formData.get("price") as string,
    categoryId: formData.get("categoryId") as string,
    employeeIds,
  };

  const parsed = serviceSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const service = await prisma.service.findFirst({
    where: { id, salonId: session.user.salonId },
  });
  if (!service) return { error: "Service not found" };

  const category = await prisma.serviceCategory.findFirst({
    where: { id: parsed.data.categoryId, salonId: session.user.salonId },
  });
  if (!category) return { error: "Category not found" };

  await prisma.$transaction([
    prisma.employeeService.deleteMany({ where: { serviceId: id } }),
    prisma.service.update({
      where: { id },
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        duration: parsed.data.duration,
        price: parsed.data.price,
        categoryId: parsed.data.categoryId,
        employees: parsed.data.employeeIds?.length
          ? {
              create: parsed.data.employeeIds.map((employeeId) => ({
                employeeId,
              })),
            }
          : undefined,
      },
    }),
  ]);

  revalidateServices(session.user.salonId);
  return { success: true };
}

export async function deleteService(id: string) {
  const session = await requireSession();
  const service = await prisma.service.findFirst({
    where: { id, salonId: session.user.salonId },
  });
  if (!service) return { error: "Service not found" };

  await prisma.service.delete({ where: { id } });
  revalidateServices(session.user.salonId);
  return { success: true };
}

export async function duplicateService(id: string) {
  const session = await requireSession();
  const service = await prisma.service.findFirst({
    where: { id, salonId: session.user.salonId },
    include: { employees: true },
  });
  if (!service) return { error: "Service not found" };

  const maxOrder = await prisma.service.aggregate({
    where: {
      salonId: session.user.salonId,
      categoryId: service.categoryId,
    },
    _max: { sortOrder: true },
  });

  await prisma.service.create({
    data: {
      salonId: session.user.salonId,
      name: `${service.name} (copy)`,
      description: service.description,
      duration: service.duration,
      price: service.price,
      categoryId: service.categoryId,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      employees: service.employees.length
        ? {
            create: service.employees.map((e) => ({
              employeeId: e.employeeId,
            })),
          }
        : undefined,
    },
  });

  revalidateServices(session.user.salonId);
  return { success: true };
}

export async function bulkDeleteServices(ids: string[]) {
  const session = await requireSession();
  if (ids.length === 0) return { error: "No services selected" };

  const services = await prisma.service.findMany({
    where: { id: { in: ids }, salonId: session.user.salonId },
    select: { id: true },
  });

  if (services.length !== ids.length) {
    return { error: "Some services were not found" };
  }

  await prisma.service.deleteMany({
    where: { id: { in: ids }, salonId: session.user.salonId },
  });

  revalidateServices(session.user.salonId);
  return { success: true, deletedCount: ids.length };
}

export type BulkServiceInput = {
  name: string;
  description?: string;
  duration: number;
  price: number;
  categoryId: string;
};

export async function bulkCreateServices(services: BulkServiceInput[]) {
  const session = await requireSession();
  const parsed = bulkCreateServicesSchema.safeParse({ services });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const categoryIds = [...new Set(parsed.data.services.map((s) => s.categoryId))];
  const categories = await prisma.serviceCategory.findMany({
    where: { id: { in: categoryIds }, salonId: session.user.salonId },
    select: { id: true },
  });
  if (categories.length !== categoryIds.length) {
    return { error: "One or more categories were not found" };
  }

  const maxOrders = await prisma.service.groupBy({
    by: ["categoryId"],
    where: {
      salonId: session.user.salonId,
      categoryId: { in: categoryIds },
    },
    _max: { sortOrder: true },
  });
  const nextOrderByCategory = new Map(
    maxOrders.map((row) => [
      row.categoryId,
      (row._max.sortOrder ?? -1) + 1,
    ])
  );

  const created = await prisma.$transaction(
    parsed.data.services.map((item) => {
      const sortOrder = nextOrderByCategory.get(item.categoryId) ?? 0;
      nextOrderByCategory.set(item.categoryId, sortOrder + 1);
      return prisma.service.create({
        data: {
          salonId: session.user.salonId,
          name: item.name,
          description: item.description,
          duration: item.duration,
          price: item.price,
          categoryId: item.categoryId,
          sortOrder,
        },
        include: {
          employees: {
            include: { employee: { select: { id: true, name: true } } },
          },
        },
      });
    })
  );

  revalidateServices(session.user.salonId);
  return {
    success: true,
    services: created.map((service) => ({
      id: service.id,
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price,
      categoryId: service.categoryId,
      sortOrder: service.sortOrder,
      employees: service.employees,
    })),
  };
}

export async function reorderServices(categoryId: string, orderedIds: string[]) {
  const session = await requireSession();
  const services = await prisma.service.findMany({
    where: { salonId: session.user.salonId, categoryId },
    select: { id: true },
  });
  const validIds = new Set(services.map((s) => s.id));
  if (
    orderedIds.length !== services.length ||
    orderedIds.some((id) => !validIds.has(id))
  ) {
    return { error: "Invalid service order" };
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.service.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  );

  revalidateServices(session.user.salonId);
  return { success: true };
}
